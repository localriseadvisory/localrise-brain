#!/usr/bin/env node
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const GEMINI_API_KEY = "AIzaSyBzeg6Ps900umSo5celYRdpsKs7qVzn9wQ";
const MODELS = ["gemini-2.0-flash", "gemini-2.5-flash"];

const today = new Date();
const DAYS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const MONTHS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const dayName = DAYS[today.getDay()];
const dateStr = `${today.getDate()} de ${MONTHS[today.getMonth()]} de ${today.getFullYear()}`;

const PROMPT = `Você é um curador de notícias de marketing digital e inteligência artificial para a LocalRise. Hoje é ${dayName}, ${dateStr}.

Use o Google Search para buscar as 10 notícias mais relevantes das últimas 48 horas sobre:
- Marketing digital, Meta Ads, Google Ads, performance marketing
- Inteligência artificial aplicada ao marketing (ChatGPT, Claude, Gemini, agentes de IA)
- Redes sociais: novidades de algoritmo e funcionalidades (Instagram, TikTok, YouTube, LinkedIn)
- SEO, automação de marketing, CRM, ferramentas de IA para negócios

Para cada notícia: título em português brasileiro, resumo de 2-3 frases em português, fonte e URL original.

Monte um email HTML completo com:
- Cabeçalho fundo #1a1a2e, texto branco, título "Marketing e IA — Notícias do Dia", data: ${dayName}, ${dateStr}
- Para cada notícia: card branco com borda esquerda #1a1a2e, título em negrito, resumo, link "Leia mais →" apontando para a URL real
- Rodapé: "Curadoria diária da LocalRise • localrise.com.br"

Retorne sua resposta EXATAMENTE neste formato (sem mais nada antes ou depois):
<SUBJECT>10 Notícias de Marketing e IA — ${dayName}, ${dateStr}</SUBJECT>
<HTML>
...HTML completo do email aqui...
</HTML>`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function callGemini(model, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
    });

    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        try {
          const text = JSON.parse(data).candidates[0].content.parts[0].text;
          resolve(text);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function callWithFallback(prompt) {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Tentativa ${attempt} com ${model}...`);
        return await callGemini(model, prompt);
      } catch (err) {
        const retryable = err.message.includes("503") || err.message.includes("429");
        console.warn(`  Falhou: ${err.message.slice(0, 100)}`);
        if (retryable && attempt < 3) {
          const wait = attempt * 15000;
          console.log(`  Aguardando ${wait / 1000}s...`);
          await sleep(wait);
        } else if (!retryable) {
          break;
        }
      }
    }
  }
  throw new Error("Todos os modelos e tentativas falharam.");
}

function extractParts(text) {
  const subjectMatch = text.match(/<SUBJECT>([\s\S]*?)<\/SUBJECT>/);
  const htmlMatch = text.match(/<HTML>([\s\S]*?)<\/HTML>/);
  if (!subjectMatch || !htmlMatch) {
    throw new Error(`Formato inválido na resposta:\n${text.slice(0, 400)}`);
  }
  return { subject: subjectMatch[1].trim(), html: htmlMatch[1].trim() };
}

async function main() {
  console.log(`[News Diário] ${dayName}, ${dateStr}`);

  const text = await callWithFallback(PROMPT);
  const { subject, html } = extractParts(text);

  const tmpDir = os.tmpdir();
  const subjectFile = path.join(tmpDir, "email_subject.txt");
  const bodyFile = path.join(tmpDir, "email_body.html");

  fs.writeFileSync(subjectFile, subject, "utf8");
  fs.writeFileSync(bodyFile, html, "utf8");
  console.log("Assunto:", subject);

  const sendScript = path.join(__dirname, "send_marketing_news.js");
  const out = execSync(`node "${sendScript}" "${subjectFile}" "${bodyFile}"`, { encoding: "utf8" });
  console.log(out.trim());
}

main().catch((err) => {
  console.error("ERRO FATAL:", err.message);
  process.exit(1);
});

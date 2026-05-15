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

const PROMPT = `Você é o diretor criativo da LocalRise gerando briefings diários para o designer.

Crie 5 ideias de post no formato editorial poster digital para o nicho de marketing, negócios, empreendedorismo e crescimento pessoal/profissional. Seja original e varie os temas.

Para cada ideia inclua: TEMA, HEADLINE (máx 6 palavras em maiúsculas), SUBTEXTO (máx 12 palavras), IMAGEM CONCEITUAL, PALETA (fundo escuro + cor de destaque), TIPOGRAFIA (posicionamento), PROMPT PARA IA em inglês para Midjourney/Leonardo.

Monte um email HTML completo com:
- Cabeçalho fundo #8B0000, texto branco, título "LocalRise x DZN | Briefing Diário", data: ${dayName}, ${dateStr}
- 5 cards usando este template para cada ideia:
<div style="background:#111;border-left:4px solid #cc0000;padding:20px;margin:16px 0;border-radius:0 8px 8px 0"><h3 style="color:#cc0000;margin:0 0 12px">IDEIA N — TEMA</h3><p><b style="color:#cc0000">HEADLINE:</b> <span style="color:#fff;font-size:18px;font-weight:bold">TEXTO</span></p><p><b style="color:#cc0000">Subtexto:</b> <span style="color:#ddd">TEXTO</span></p><p><b style="color:#cc0000">Imagem:</b> <span style="color:#ddd">DESCRIÇÃO</span></p><p><b style="color:#cc0000">Paleta:</b> <span style="color:#ddd">CORES</span></p><p><b style="color:#cc0000">Prompt IA:</b> <span style="color:#aaa;font-style:italic">PROMPT EM INGLÊS</span></p></div>
- Rodapé: "Briefing diário LocalRise • localrise.com.br"

Retorne sua resposta EXATAMENTE neste formato (sem mais nada antes ou depois):
<SUBJECT>Briefing de Posts — ${dayName}, ${dateStr}</SUBJECT>
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
      generationConfig: { temperature: 0.85, maxOutputTokens: 8192 }
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
  console.log(`[DZN Briefing] ${dayName}, ${dateStr}`);

  const text = await callWithFallback(PROMPT);
  const { subject, html } = extractParts(text);

  const tmpDir = os.tmpdir();
  const subjectFile = path.join(tmpDir, "dzn_subject.txt");
  const bodyFile = path.join(tmpDir, "dzn_body.html");

  fs.writeFileSync(subjectFile, subject, "utf8");
  fs.writeFileSync(bodyFile, html, "utf8");
  console.log("Assunto:", subject);

  const sendScript = path.join(__dirname, "send_dzn_brief.js");
  const out = execSync(`node "${sendScript}" "${subjectFile}" "${bodyFile}"`, { encoding: "utf8" });
  console.log(out.trim());
}

main().catch((err) => {
  console.error("ERRO FATAL:", err.message);
  process.exit(1);
});

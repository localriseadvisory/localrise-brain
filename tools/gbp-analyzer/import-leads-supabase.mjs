#!/usr/bin/env node
/**
 * Importa leads reais do crm-history.json para o Supabase (tabela leads)
 * Apaga os leads fictícios e insere os leads reais do Google Places
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const lines = readFileSync(resolve(__dir, "../../.env.local"), "utf8").split("\n");
    for (const line of lines) {
      const clean = line.trim();
      if (!clean || clean.startsWith("#")) continue;
      const eq = clean.indexOf("=");
      if (eq === -1) continue;
      process.env[clean.slice(0, eq).trim()] = clean.slice(eq + 1).trim();
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = "https://tfzjyttvymojsgvifxlk.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error("❌ SUPABASE KEY não encontrada em .env.local");
  process.exit(1);
}

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
    };
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        else resolve(data ? JSON.parse(data) : null);
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const NICHE_MAP = {
  "clínica veterinária": "Veterinária",
  "clínica de estética": "Estética",
  "fisioterapia": "Fisioterapia",
  "academia funcional": "Academia Funcional",
  "residencial geriátrico": "Geriátrica",
};

const SCRIPTS = {
  "Veterinária": `🐾 SCRIPT — VETERINÁRIA

ABERTURA:
"Olá, tudo bem? Meu nome é Nicolas, da LocalRise. Vi a [NOME DA CLÍNICA] no Google Maps — vocês têm um estabelecimento ativo aqui na região.

DOR:
Fiz uma busca no Google por 'veterinária em [CIDADE]' e vi que vocês não aparecem bem e não têm site. Quando o pet tá mal, o dono não abre Instagram — ele abre o Google e liga pra primeira clínica que aparece. Se não for vocês, vai pra concorrência.

SOLUÇÃO:
A gente resolve isso: site profissional + perfil no Google Maps otimizado por R$ 700. Cuidamos pra vocês aparecerem quando alguém busca veterinária na região.

FECHAMENTO:
Faz sentido? Posso mandar um exemplo no WhatsApp agora."

OBJEÇÕES:
- "Já temos clientes" → "Os de urgência te encontram no Google ou vão pra outra clínica?"
- "Tá caro" → "R$ 700 uma vez. Um cliente novo por mês já pagou."
- "Vou pensar" → "Posso mandar o exemplo no Whats agora pra facilitar?"`,

  "Geriátrica": `🏠 SCRIPT — RESIDENCIAL GERIÁTRICO

ABERTURA:
"Olá, tudo bem? Meu nome é Nicolas, da LocalRise. Vi o [NOME] no Google Maps — estabelecimento ativo aqui na região.

DOR:
Quando uma família procura um lugar para um familiar idoso, a primeira coisa que fazem é pesquisar no Google: 'residencial geriátrico em [CIDADE]'. Se vocês não aparecem — ou aparecem sem site, sem fotos — a família passa direto. Sem credibilidade digital, vocês perdem vaga.

SOLUÇÃO:
A gente cria o site e organiza o Google Maps de vocês por R$ 700. A família pesquisa, vocês aparecem com foto, endereço, horário — tudo que gera confiança.

FECHAMENTO:
Tem 5 minutinhos? Posso mandar um exemplo no WhatsApp agora."

OBJEÇÕES:
- "Temos lista de espera" → "E quando abre uma vaga, quem liga primeiro — Google ou só indicação?"
- "Não tenho tempo" → "A gente cuida de tudo. Vocês só aprovam."`,

  "Estética": `💅 SCRIPT — CLÍNICA DE ESTÉTICA

ABERTURA:
"Olá, tudo bem? Meu nome é Nicolas, da LocalRise. Vi a [NOME] no Google Maps — clínica ativa aqui na região.

DOR:
Antes de agendar numa clínica nova, a cliente pesquisa no Google pra confirmar se é confiável. Se não tem site ou o perfil do Google tá vazio, ela desiste — mesmo tendo gostado do que viu. Vocês perdem cliente na última etapa.

SOLUÇÃO:
Site simples + Google Maps otimizado por R$ 700. A cliente confirma no Google e agenda com confiança.

FECHAMENTO:
Posso mandar um exemplo no WhatsApp agora, em 2 minutos você vê como ficaria. Tem interesse?"

OBJEÇÕES:
- "Agenda cheia" → "Quando quiser crescer, quem vai te encontrar? Quem tá no Google."
- "R$ 700 pesado" → "Posso parcelar em 2x sem juros. Faz sentido?"`,

  "Fisioterapia": `🦴 SCRIPT — FISIOTERAPIA

ABERTURA:
"Olá, tudo bem? Meu nome é Nicolas, da LocalRise. Vi a [NOME] no Google Maps — clínica ativa aqui na região.

DOR:
Quando alguém tá com dor e pesquisa 'fisioterapia em [CIDADE]' no Google — se vocês não aparecem, o paciente liga pra outra clínica. Ele confirma tudo no Google antes: endereço, avaliações, site. Sem isso, vocês ficam invisíveis.

SOLUÇÃO:
Site profissional + Google Maps otimizado por R$ 700. Um investimento único que faz vocês aparecerem quando o paciente mais precisa.

FECHAMENTO:
Posso mandar um exemplo no WhatsApp pra você ver como ficaria."

OBJEÇÕES:
- "Já temos indicação" → "Indicação tem limite. No Google, vocês alcançam quem nunca te conheceu."
- "Vou pensar" → "Posso mandar o exemplo no Whats agora pra facilitar?"`,

  "Academia Funcional": `💪 SCRIPT — ACADEMIA FUNCIONAL

ABERTURA:
"Olá, tudo bem? Meu nome é Nicolas, da LocalRise. Vi a [NOME] no Google Maps — espaço bem ativo aqui na região.

DOR:
Quem pesquisa 'academia funcional em [CIDADE]' no Google e vocês não aparecem — vocês perdem exatamente quem quer o que vocês oferecem. Esse lead tá pronto pra fechar. Só vai pra quem aparece primeiro.

SOLUÇÃO:
Site + Google Maps otimizado por R$ 700. Quem pesquisa te encontra, vê as fotos, o endereço, os horários — e liga.

FECHAMENTO:
Posso mandar um exemplo no WhatsApp agora, 2 minutos pra você ter uma ideia."

OBJEÇÕES:
- "Já tenho alunos" → "Quantos você perde por mês pra quem aparece no Google antes de você?"
- "Tá caro" → "R$ 700 uma vez. Um aluno novo já paga em 1 semana."`,
};

function parseLocation(loc) {
  if (!loc) return { city: null, state: null };
  const parts = loc.trim().split(" ");
  const state = parts[parts.length - 1];
  const city = parts.slice(0, -1).join(" ");
  return { city, state };
}

async function main() {
  const raw = JSON.parse(readFileSync(resolve(__dir, "reports/crm-history.json"), "utf8"));
  const leads = raw.filter(l => !l.hasWebsite && l.name);
  console.log(`📋 Leads sem site: ${leads.length}`);

  const today = new Date().toISOString().split("T")[0];

  const rows = leads.map(l => {
    const niche = NICHE_MAP[l.searchCategory] || l.searchCategory;
    const { city, state } = parseLocation(l.location);
    const phone = l.phone ? l.phone.replace(/[^0-9]/g, "") || null : null;
    const gbpUrl = l.id ? `https://www.google.com/maps/place/?q=place_id:${l.id}` : null;
    const qualScore = Math.max(0, Math.min(100, 100 - (l.pct || 50)));
    return {
      source: "manual",
      business_name: l.name,
      niche,
      google_category: l.category || null,
      phone: phone || null,
      website: null,
      address: l.address || null,
      city: city || null,
      state: state || null,
      country: "Brasil",
      rating: l.rating || null,
      total_reviews: l.reviewCount || null,
      business_status: "OPERATIONAL",
      pipeline_stage: "novo",
      outreach_status: "new",
      qualification_score: qualScore,
      assigned_sdr: "117660cd-aad0-4f18-bf26-9b5e8564df83",
      owner_id: "b255c1b0-b718-4cf6-9558-afd314558ff7",
      call_scheduled_date: today,
      gbp_url: gbpUrl,
      daily_script: SCRIPTS[niche] || null,
    };
  });

  console.log();
  console.log("🔍 Verificando leads existentes no CRM...");
  let existingUrls = new Set();
  try {
    const existing = await supabaseRequest("GET", "leads?select=gbp_url&gbp_url=not.is.null", null);
    if (Array.isArray(existing)) existing.forEach(r => existingUrls.add(r.gbp_url));
    console.log(`   ${existingUrls.size} leads já existem no CRM`);
  } catch (e) {
    console.error("   Erro ao buscar existentes:", e.message.slice(0, 200));
  }

  const newRows = rows.filter(r => !r.gbp_url || !existingUrls.has(r.gbp_url));
  console.log(`   ${newRows.length} novos | ${rows.length - newRows.length} já existiam`);

  if (newRows.length === 0) {
    console.log("Nenhum lead novo hoje — CRM já está atualizado.");
    return;
  }

  console.log();
  console.log(`📤 Inserindo ${newRows.length} leads novos no CRM SDR...`);
  let inserted = 0;
  for (let i = 0; i < newRows.length; i += 20) {
    const batch = newRows.slice(i, i + 20);
    try {
      await supabaseRequest("POST", "leads", batch);
      inserted += batch.length;
      process.stdout.write(`   ${inserted}/${newRows.length} inseridos...`);
    } catch (e) {
      console.error(`   Erro no lote ${i}:`, e.message.slice(0, 300));
    }
  }

  console.log();
  console.log(`✅ ${inserted} leads novos inseridos no CRM SDR!`);

  const byNiche = {};
  for (const r of newRows) byNiche[r.niche] = (byNiche[r.niche] || 0) + 1;
  console.log("📊 Por nicho:");
  for (const [n, count] of Object.entries(byNiche)) console.log(`   ${n}: ${count}`);
}

main().catch(console.error);

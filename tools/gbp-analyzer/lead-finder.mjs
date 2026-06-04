#!/usr/bin/env node
/**
 * LocalRise GBP Lead Finder
 * Busca automaticamente negócios com GBP fraco para prospecção SDR.
 *
 * Uso:
 *   node tools/gbp-analyzer/lead-finder.mjs
 *   node tools/gbp-analyzer/lead-finder.mjs --location "Taguatinga Brasília"
 *   node tools/gbp-analyzer/lead-finder.mjs --category "mecânica" --location "Gama Brasília"
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import https from "https";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── ENV ──────────────────────────────────────────────────────────────────────
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

const API_KEY = process.env.OUTSCRAPER_API_KEY;
if (!API_KEY) {
  console.error("❌  OUTSCRAPER_API_KEY não encontrada em .env.local");
  process.exit(1);
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const config = JSON.parse(readFileSync(resolve(__dir, "config.json"), "utf8"));

// Argparse simples
function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--location") out.location = args[++i];
    if (args[i] === "--category") out.category = args[++i];
    if (args[i] === "--threshold") out.threshold = Number(args[++i]);
    if (args[i] === "--no-website") out.requireNoWebsite = true;
  }
  return out;
}

// ─── OUTSCRAPER API ───────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Proxy residencial (necessário em servidores cloud para o Outscraper funcionar)
let _fetchWithProxy = fetch;
const PROXY_URL = process.env.OUTSCRAPER_PROXY;
if (PROXY_URL) {
  try {
    const undiciPath = join(__dir, "../../node_modules/undici");
    const { ProxyAgent, fetch: undiciFetch } = _require(undiciPath);
    const dispatcher = new ProxyAgent(PROXY_URL);
    _fetchWithProxy = (url, opts = {}) => undiciFetch(url, { ...opts, dispatcher });
    console.log("   Proxy ativo:", PROXY_URL.replace(/:([^@]+)@/, ":***@"));
  } catch (e) {
    console.warn("   ⚠️  Proxy configurado mas undici não encontrado:", e.message);
  }
}

function normalizePlace(o) {
  const hoursArr = o.working_hours
    ? Object.entries(o.working_hours).map(([d, h]) => `${d}: ${h}`)
    : [];
  return {
    id: o.place_id || o.google_id || o.name,
    displayName: { text: o.name || "—" },
    formattedAddress: o.full_address || o.address || "—",
    rating: o.rating || 0,
    userRatingCount: o.reviews || o.reviews_count || 0,
    websiteUri: o.site || o.website || null,
    nationalPhoneNumber: o.phone || o.phone_1 || null,
    primaryTypeDisplayName: { text: o.type || o.subtypes || "—" },
    businessStatus: o.business_status === "CLOSED_PERMANENTLY" ? "CLOSED_PERMANENTLY" : "OPERATIONAL",
    regularOpeningHours: { weekdayDescriptions: hoursArr },
    photos: Array.from({ length: Math.min(o.photos_count || 0, 20) }),
    editorialSummary: { text: o.description || o.about?.summary || null },
  };
}

async function searchOutscraper(query) {
  const params = new URLSearchParams({
    query,
    limit: "20",
    language: "pt",
    region: "BR",
    dropDuplicates: "true",
    async: "false",
  });
  const res = await _fetchWithProxy(`https://api.app.outscraper.com/maps/search-v3?${params}`, {
    headers: { "X-API-KEY": API_KEY },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`outscraper ${res.status}: ${err}`);
  }
  const json = await res.json();

  // Se a resposta for async (task ID), aguardar e buscar resultado
  if (json.id && (!json.data || json.status === "Pending" || json.status === "Running")) {
    const taskId = json.id;
    for (let i = 0; i < 30; i++) {
      await sleep(3000);
      const poll = await _fetchWithProxy(`https://api.app.outscraper.com/requests/${taskId}`, {
        headers: { "X-API-KEY": API_KEY },
      });
      const result = await poll.json();
      if (result.status === "Success" || result.data?.length) {
        const raw = result.data?.[0] || [];
        return Array.isArray(raw) ? raw.map(normalizePlace) : [];
      }
    }
    throw new Error("outscraper timeout aguardando resultado async");
  }

  const raw = json.data?.[0] ?? [];
  return Array.isArray(raw) ? raw.map(normalizePlace) : [];
}

// ─── SCORING (mesmo da analyzer.mjs) ─────────────────────────────────────────
function scoreProfile(p) {
  const scores = {};
  const flags = [];

  const count = p.userRatingCount || 0;
  if (count >= 200) scores.reviewCount = 20;
  else if (count >= 100) scores.reviewCount = 16;
  else if (count >= 50) scores.reviewCount = 12;
  else if (count >= 20) scores.reviewCount = 8;
  else if (count >= 5) scores.reviewCount = 4;
  else { scores.reviewCount = 0; flags.push("Pouquíssimas avaliações (< 5)"); }

  const rating = p.rating || 0;
  if (rating >= 4.5) scores.rating = 15;
  else if (rating >= 4.0) scores.rating = 10;
  else if (rating >= 3.5) scores.rating = 5;
  else { scores.rating = 0; flags.push("Nota baixa (< 3.5)"); }

  if (p.websiteUri) scores.website = 15;
  else { scores.website = 0; flags.push("Sem site — alta prioridade"); }

  if (p.nationalPhoneNumber) scores.phone = 5;
  else { scores.phone = 0; flags.push("Sem telefone no perfil"); }

  const hasHours = p.regularOpeningHours?.weekdayDescriptions?.length > 0;
  if (hasHours) scores.hours = 10;
  else { scores.hours = 0; flags.push("Horário não cadastrado"); }

  const photoCount = p.photos?.length || 0;
  if (photoCount >= 10) scores.photos = 15;
  else if (photoCount >= 5) scores.photos = 10;
  else if (photoCount >= 1) scores.photos = 5;
  else scores.photos = 0;

  if (p.editorialSummary?.text) scores.description = 10;
  else { scores.description = 0; flags.push("Sem descrição"); }

  if (p.primaryTypeDisplayName?.text) scores.category = 5;
  else { scores.category = 0; flags.push("Categoria indefinida"); }

  if (p.businessStatus === "OPERATIONAL") scores.status = 5;
  else { scores.status = 0; flags.push(`Status: ${p.businessStatus || "desconhecido"}`); }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const pct = Math.round((total / 100) * 100);

  let grade;
  if (pct >= 80) grade = "Forte";
  else if (pct >= 60) grade = "Médio";
  else if (pct >= 40) grade = "Fraco";
  else grade = "Crítico";

  return { total, pct, grade, flags };
}

// ─── CALL SCRIPT GENERATOR ───────────────────────────────────────────────────
function generateCallScript(lead) {
  const city = lead.location?.replace(/ RS$| SC$/i, "").trim() || "sua cidade";
  const category = lead.searchCategory || "negócio";
  const rating = lead.rating?.toFixed(1) || "alta";
  const reviews = lead.reviewCount;
  const categoryLabel = category.replace("clínica de ", "").replace("clínica ", "");

  // Posicionamento como especialista no nicho
  const nichoLabel = {
    "fisioterapia": "clínicas de fisioterapia",
    "clínica de estética": "clínicas de estética",
    "clínica veterinária": "clínicas veterinárias",
  }[category] || `${categoryLabel}s`;

  const gaps = [];
  if (!lead.hasWebsite) gaps.push("sem site");
  if (lead.flags.some((f) => f.includes("Horário"))) gaps.push("horário não aparece no Google");
  if (lead.flags.some((f) => f.includes("descrição"))) gaps.push("descrição ausente");
  const gapLine = gaps.join(", ");

  return {
    objetivo: `Qualificar — não convencer. Confirmar decisor, abrir dor específica, agendar 20 min com o consultor ou descartar.\nNão vender. Não mencionar preço. Se não for o decisor → pedir contato direto ou encerrar educadamente.`,

    abertura: `"Bom dia, posso falar com o responsável pela ${lead.name}?"

[Se NÃO for o decisor]
"Entendido. Você consegue me passar direto para quem cuida dessa parte? Prefiro não tomar o seu tempo com algo fora da sua área."
→ [Se passar: continuar] [Se não passar: agradecer e encerrar — não insistir]

[Com o decisor confirmado]
"[Nome do SDR] da LocalRise. A gente é especialista em Google para ${nichoLabel} no Sul do Brasil. Tenho menos de 1 minuto com você — pode ser?"`,

    gancho: `[Após confirmação]
"Eu tava analisando ${categoryLabel}s em ${city} no Google e encontrei um problema específico na presença de vocês.

Vocês têm ${reviews} avaliações, nota ${rating} — isso é sólido. Mas tem um ponto que tá custando pacientes: ${gapLine}. Quando alguém busca ${categoryLabel} em ${city} agora, o Google mostra o concorrente antes de vocês por conta disso.

Tenho uma pergunta rápida pra você:"`,

    qualificacao: `"Hoje vocês sabem quantos pacientes novos chegam pelo Google por mês — têm esse número?"

[SILÊNCIO — não fale. Espere a resposta completa.]

[Não sabe / poucos] → "É exatamente esse ponto. Sem saber esse número, não dá pra saber se vocês estão ganhando ou perdendo pacientes no Google toda semana."
[Tem o número] → "Bom que você tem isso. Mas esse número poderia ser maior — e o problema que encontrei é o que tá segurando."
[Defensivo / "tá tudo bem"] → "Faz sentido. A pergunta é mais simples: essa clareza existe internamente? Porque o que eu vi no Google diz outra coisa — e posso te mostrar em 20 minutos."`,

    cta: `"Não ligo pra vender nada. O nosso consultor especialista em ${nichoLabel} consegue te mostrar exatamente onde vocês estão perdendo pacientes — em 20 minutos, de graça.

Se fizer sentido depois disso, a gente conversa. Se não fizer, eu mesmo te libero — sem pressão.

Você tem uma janela quarta ou quinta essa semana?"

[Confirmar dia e hora → registrar → passar para o closer]
[Se hesitar] → "Quanto tempo você precisa pra decidir sobre 20 minutos? O consultor agenda poucas vagas por semana."`,

    objecoes: [
      {
        q: `"Do que exatamente se trata?"`,
        r: `"Google — fazer ${categoryLabel}s aparecerem na frente de quem está buscando agora em ${city}. Os detalhes ficam com o nosso consultor, por isso quero os 20 minutos. Quarta ou quinta funciona?"`,
      },
      {
        q: `"Não tenho interesse"`,
        r: `"Respeito. Só me responde uma coisa antes: você sabe quantas pessoas buscaram ${categoryLabel} em ${city} esse mês e escolheram o concorrente? Esse número eu consigo te mostrar. Se for zero, perfeito — confirma que tá tudo certo. Vale os 20 minutos?"`,
      },
      {
        q: `"Já tenho alguém cuidando disso"`,
        r: `"Ótimo. Esse profissional já te passou quantos pacientes chegam pelo Google por mês? [Silêncio] Se você tem esse número, perfeito. Se não tem, é exatamente o que o nosso consultor mostra — em 20 minutos."`,
      },
      {
        q: `"Não tenho tempo agora"`,
        r: `"Entendo. Quando fica melhor — semana que vem? O consultor encaixa no horário de vocês. Segunda de manhã ou tarde?"`,
      },
      {
        q: `"Me manda por WhatsApp / email primeiro"`,
        r: `"Mando sim. Mas antes: se o consultor te mostrar onde vocês estão perdendo pacientes, você teria 20 minutos pra ver isso? [Se sim] Perfeito — te mando e já agendo. Qual o melhor dia?"`,
      },
    ],
  };
}

// ─── HTML REPORT ──────────────────────────────────────────────────────────────
function buildLeadReport(leads, filters, stats, pitches) {
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const gradeColor = { Crítico: "#ef4444", Fraco: "#f97316", Médio: "#f59e0b", Forte: "#22c55e" };

  const rows = leads
    .map(
      (l, i) => `
    <tr>
      <td style="color:#94a3b8;font-size:0.8rem;width:32px">${i + 1}</td>
      <td>
        <div style="font-weight:600;color:#e2e8f0">${l.name}</div>
        <div style="font-size:0.78rem;color:#64748b">${l.address}</div>
      </td>
      <td style="white-space:nowrap;color:#94a3b8">${l.category || "—"}</td>
      <td style="text-align:center">
        <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:0.78rem;font-weight:700;background:${gradeColor[l.grade]}22;color:${gradeColor[l.grade]};border:1px solid ${gradeColor[l.grade]}44">
          ${l.pct}/100 ${l.grade}
        </span>
      </td>
      <td style="text-align:center;color:#e2e8f0">${l.rating?.toFixed(1) || "—"} ⭐<br><span style="font-size:0.75rem;color:#64748b">${l.reviewCount} reviews</span></td>
      <td style="text-align:center">
        ${l.hasWebsite ? '<span style="color:#22c55e">✅</span>' : '<span style="color:#ef4444;font-weight:700">❌ SEM SITE</span>'}
      </td>
      <td style="color:#60a5fa">${l.phone || "—"}</td>
      <td style="font-size:0.78rem;color:#94a3b8;max-width:200px">${l.flags.slice(0, 2).join("<br>")}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LocalRise — Leads GBP Fraco</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 28px 40px; border-bottom: 1px solid #1e40af; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .header h1 { font-size: 1.4rem; color: #60a5fa; }
  .header p { font-size: 0.82rem; color: #94a3b8; margin-top: 4px; }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 18px; text-align: center; }
  .stat .num { font-size: 1.5rem; font-weight: 800; color: #60a5fa; }
  .stat .lbl { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .sdr-section { padding: 24px 20px 0; }
  .sdr-section h2 { font-size: 1rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
  .pitch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .pitch-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
  .pitch-card .lead-name { font-weight: 700; color: #e2e8f0; font-size: 0.92rem; }
  .pitch-card .lead-meta { font-size: 0.78rem; color: #64748b; }
  .pitch-card .pitch-text { background: #0f172a; border: 1px solid #1e40af33; border-radius: 6px; padding: 12px; font-size: 0.8rem; color: #cbd5e1; white-space: pre-wrap; line-height: 1.55; flex: 1; }
  .pitch-card .actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; }
  .btn-copy { background: #1e40af; color: #fff; }
  .btn-copy:hover { background: #2563eb; }
  .btn-call { background: #7c3aed; color: #fff; }
  .btn-call:hover { background: #6d28d9; }
  .btn-wa { background: #16a34a; color: #fff; }
  .btn-wa:hover { background: #15803d; }
  .btn-copy.copied { background: #22c55e; }
  .feedback-bar { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; }
  .fb-btn { flex:1; min-width:80px; padding:6px 8px; border:none; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer; opacity:0.5; transition:opacity 0.2s,transform 0.1s; }
  .fb-btn.active { opacity:1; transform:scale(1.04); }
  .fb-wait  { background:#1e40af; color:#bfdbfe; }
  .fb-try   { background:#92400e; color:#fde68a; }
  .fb-ok    { background:#14532d; color:#86efac; }
  .fb-no    { background:#7f1d1d; color:#fca5a5; }
  .fb-note  { display:none; margin-top:6px; }
  .fb-note input { width:100%; padding:6px 8px; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:4px; font-size:0.76rem; }
  .signal-pill { display:inline-block; padding:2px 8px; border-radius:10px; font-size:0.68rem; font-weight:700; margin-left:6px; }
  .script-block { margin-top: 10px; }
  .script-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 4px; }
  .script-text { background: #0f172a; border-left: 3px solid #1e40af; border-radius: 0 6px 6px 0; padding: 10px 12px; font-size: 0.8rem; color: #cbd5e1; white-space: pre-wrap; line-height: 1.6; }
  .script-text.objetivo { border-color: #ef4444; color: #fca5a5; font-weight: 600; }
  .script-text.gancho { border-color: #f59e0b; }
  .script-text.qualificacao { border-color: #a78bfa; }
  .script-text.cta { border-color: #22c55e; }
  .objection { background: #0f172a; border-radius: 6px; padding: 10px 12px; margin-top: 6px; font-size: 0.78rem; }
  .objection .q { color: #f87171; margin-bottom: 4px; }
  .objection .r { color: #86efac; }
  .container { padding: 24px 20px; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 800px; }
  th { background: #1e293b; padding: 10px 12px; text-align: left; color: #64748b; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; position: sticky; top: 0; }
  td { padding: 12px 12px; border-top: 1px solid #1e293b; vertical-align: middle; }
  tr:hover td { background: #1e293b55; }
  .filters { margin: 0 20px 16px; padding: 12px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; font-size: 0.82rem; color: #94a3b8; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>LocalRise — Leads GBP Fraco</h1>
    <p>Gerado em ${now} &nbsp;•&nbsp; Filtro: score ≤ ${filters.threshold} ou sem site</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="num">${stats.total}</div><div class="lbl">Analisados</div></div>
    <div class="stat"><div class="num" style="color:#ef4444">${leads.length}</div><div class="lbl">Leads</div></div>
    <div class="stat"><div class="num" style="color:#f97316">${leads.filter(l => !l.hasWebsite).length}</div><div class="lbl">Sem site</div></div>
    <div class="stat"><div class="num" style="color:#f59e0b">${leads.filter(l => l.grade === "Crítico").length}</div><div class="lbl">Críticos</div></div>
    <button onclick="exportCsv()" class="btn" style="background:#0f172a;border:1px solid #334155;color:#94a3b8;align-self:center">⬇️ Exportar Feedback</button>
  </div>
</div>
<div class="filters">
  📍 Locais: ${filters.locations.join(" • ")} &nbsp;|&nbsp;
  🏷️ Categorias: ${filters.categories.join(" • ")}
</div>

<div class="sdr-section">
  <h2>📞 Scripts de Ligação — ${pitches.length} Leads Coletados</h2>
  <div class="pitch-grid">
    ${pitches.map((p, i) => {
      const phoneClean = (p.lead.phone || "").replace(/\D/g, "");
      const callLink = phoneClean ? `tel:+55${phoneClean}` : null;
      const nichoLabel = { "fisioterapia": "clínicas de fisioterapia", "clínica de estética": "clínicas de estética", "clínica veterinária": "clínicas veterinárias" }[p.lead.searchCategory] || p.lead.searchCategory;
      const categoryLabel = (p.lead.searchCategory || "").replace("clínica de ", "").replace("clínica ", "");
      const city = (p.lead.location || "").replace(/ RS$| SC$/i, "").trim();
      const gaps = [];
      if (!p.lead.hasWebsite) gaps.push("sem site");
      if ((p.lead.flags || []).some(f => f.includes("Horário"))) gaps.push("horário não aparece no Google");
      if ((p.lead.flags || []).some(f => f.includes("descrição"))) gaps.push("descrição ausente");
      const waText = encodeURIComponent(`Olá! Vi a ${p.lead.name} no Google — vocês têm ${p.lead.reviewCount} avaliações, nota ${p.lead.rating?.toFixed(1)}. Encontrei um ponto que pode estar custando pacientes: ${gaps.join(", ")}. Sou da LocalRise, especialistas em Google para ${nichoLabel} no Sul do Brasil. Posso mostrar em 20 minutos onde vocês estão perdendo pacientes? Sem compromisso.`);
      const waLink = phoneClean ? `https://wa.me/55${phoneClean}?text=${waText}` : null;
      const priceSignal = p.lead.priceLevel >= 2 ? `<span class="signal-pill" style="background:#14532d;color:#86efac">💰 Nível ${p.lead.priceLevel}</span>` : "";
      const s = p.script;
      const objHtml = s.objecoes.map((o) => `
        <div class="objection">
          <div class="q">❓ ${o.q}</div>
          <div class="r">→ ${o.r}</div>
        </div>`).join("");
      return `
    <div class="pitch-card" id="card-${phoneClean}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div class="lead-name">${i + 1}. ${p.lead.name}${priceSignal}</div>
          <div class="lead-meta">${city} &nbsp;•&nbsp; ${p.lead.category || p.lead.searchCategory} &nbsp;•&nbsp; Score ${p.lead.pct}/100 &nbsp;•&nbsp; ${p.lead.reviewCount} reviews ${p.lead.rating?.toFixed(1)}⭐</div>
        </div>
        <div style="text-align:right;flex-shrink:0;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <div style="font-size:0.9rem;color:#60a5fa;font-weight:700">${p.lead.phone || "—"}</div>
          ${callLink ? `<a class="btn btn-call" href="${callLink}">📞 Ligar</a>` : ""}
          ${waLink ? `<a class="btn btn-wa" href="${waLink}" target="_blank">💬 WhatsApp</a>` : ""}
        </div>
      </div>
      <div class="script-block objetivo-block">
        <div class="script-label">🎯 Objetivo do SDR</div>
        <div class="script-text objetivo">${s.objetivo}</div>
      </div>
      <div class="script-block">
        <div class="script-label">1. Abertura + confirmar decisor</div>
        <div class="script-text">${s.abertura}</div>
      </div>
      <div class="script-block">
        <div class="script-label">2. Gancho — abrir a dor</div>
        <div class="script-text gancho">${s.gancho}</div>
      </div>
      <div class="script-block">
        <div class="script-label">3. Qualificação</div>
        <div class="script-text qualificacao">${s.qualificacao}</div>
      </div>
      <div class="script-block">
        <div class="script-label">4. CTA — agendar com o especialista</div>
        <div class="script-text cta">${s.cta}</div>
      </div>
      <div class="script-block">
        <div class="script-label">5. Objeções</div>
        ${objHtml}
      </div>
      <div class="script-block">
        <div class="script-label">📊 Status da Ligação</div>
        <div class="feedback-bar">
          <button class="fb-btn fb-wait" onclick="setFb('${phoneClean}','aguardando',this)">📞 Aguardando</button>
          <button class="fb-btn fb-try"  onclick="setFb('${phoneClean}','tentativa',this)">🔄 Tentativa</button>
          <button class="fb-btn fb-ok"   onclick="setFb('${phoneClean}','qualificado',this)">✅ Qualificado</button>
          <button class="fb-btn fb-no"   onclick="setFb('${phoneClean}','descartado',this)">❌ Descartado</button>
        </div>
        <div class="fb-note" id="fb-note-${phoneClean}">
          <input type="text" placeholder="Observação (opcional)..." id="fb-input-${phoneClean}" onkeydown="if(event.key==='Enter')saveFbNote('${phoneClean}')">
        </div>
      </div>
    </div>`;
    }).join("")}
  </div>
</div>

<div class="container">
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Negócio</th>
      <th>Categoria</th>
      <th style="text-align:center">Score GBP</th>
      <th style="text-align:center">Avaliações</th>
      <th style="text-align:center">Site</th>
      <th>Telefone</th>
      <th>Principais Gaps</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</div>
<script>
const FB_KEY = 'localrise_feedback';
let fbData = {};
try { fbData = JSON.parse(localStorage.getItem(FB_KEY) || '{}'); } catch(e) {}

function restoreFeedback() {
  Object.entries(fbData).forEach(([phone, d]) => {
    const card = document.getElementById('card-' + phone);
    if (!card) return;
    const btns = card.querySelectorAll('.fb-btn');
    btns.forEach(b => { b.classList.remove('active'); if (b.dataset.status === d.status) b.classList.add('active'); });
    const note = document.getElementById('fb-note-' + phone);
    if (note && d.note) { note.style.display = 'block'; const inp = document.getElementById('fb-input-' + phone); if(inp) inp.value = d.note; }
  });
}

function setFb(phone, status, btn) {
  const card = document.getElementById('card-' + phone);
  card.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('active'));
  btn.dataset.status = status;
  btn.classList.add('active');
  const note = document.getElementById('fb-note-' + phone);
  if (note) note.style.display = 'block';
  fbData[phone] = { ...(fbData[phone] || {}), status, updatedAt: new Date().toISOString() };
  saveFb(phone);
  fetch('http://localhost:3501/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone, ...fbData[phone] }) }).catch(()=>{});
}

function saveFbNote(phone) {
  const val = document.getElementById('fb-input-' + phone)?.value || '';
  fbData[phone] = { ...(fbData[phone] || {}), note: val };
  saveFb(phone);
  fetch('http://localhost:3501/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone, ...fbData[phone] }) }).catch(()=>{});
}

function saveFb(phone) { localStorage.setItem(FB_KEY, JSON.stringify(fbData)); }

function exportCsv() {
  const rows = [['Telefone','Status','Observação','Atualizado']];
  Object.entries(fbData).forEach(([phone,d]) => rows.push([phone, d.status||'', (d.note||'').replace(/,/g,''), d.updatedAt||'']));
  const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'feedback-sdr.csv'; a.click();
}

document.addEventListener('DOMContentLoaded', restoreFeedback);
</script>
</body>
</html>`;
}

// ─── EMAIL ───────────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = "LocalRise <noticias@noticias.localriseadvisory.com>";
const EMAIL_TO = ["contato@localriseadvisory.com"];

function sendEmail(subject, html, attachments = []) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ from: EMAIL_FROM, to: EMAIL_TO, subject, html, attachments });
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) resolve(JSON.parse(body));
          else reject(new Error(`Resend ${res.statusCode}: ${body}`));
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();

  const allLocations = args.location ? [args.location] : config.locations;
  const categories = args.category ? [args.category] : config.categories;
  const threshold = args.threshold ?? config.scoreThreshold;
  const requireNoWebsite = args.requireNoWebsite ?? config.requireNoWebsite;

  // Rotação diária: 4 locais/dia para ficar abaixo da cota de 100 req/dia (4×5=20 buscas)
  const LOTE_POR_DIA = 6;
  const dayIndex = Math.floor(Date.now() / 86400000);
  const startIdx = (dayIndex * LOTE_POR_DIA) % allLocations.length;
  const locations = args.location
    ? allLocations
    : [...allLocations, ...allLocations].slice(startIdx, startIdx + LOTE_POR_DIA);
  const loteNum = Math.floor(startIdx / LOTE_POR_DIA) + 1;
  const totalLotes = Math.ceil(allLocations.length / LOTE_POR_DIA);

  console.log(`\n🔍 LocalRise GBP Lead Finder`);
  console.log(`   Locais: ${locations.length}/${allLocations.length} (lote ${loteNum}/${totalLotes}) | Categorias: ${categories.length}`);
  console.log(`   Filtro: score ≤ ${threshold}${requireNoWebsite ? " + sem site" : ""}`);
  console.log(`   Total de buscas: ${locations.length * categories.length}\n`);

  const seen = new Set();
  const allLeads = [];
  let totalAnalyzed = 0;

  for (const location of locations) {
    for (const category of categories) {
      const query = `${category} ${location}`;
      process.stdout.write(`  → ${query}... `);

      try {
        const places = await searchOutscraper(query);
        process.stdout.write(`${places.length} encontrados\n`);

        for (const p of places) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);

          const reviewCount = p.userRatingCount || 0;
          const rating = p.rating || 0;
          const isEstablished = reviewCount >= 15 && rating >= 3.8 && p.businessStatus === "OPERATIONAL";
          if (!isEstablished) { totalAnalyzed++; continue; }

          const quickScore = scoreProfile(p);
          const noWebsite = !p.websiteUri;
          const isLead = noWebsite || (quickScore.pct <= threshold && reviewCount >= 15);

          if (!isLead) { totalAnalyzed++; continue; }

          // Outscraper já retorna dados completos — sem segunda chamada necessária
          const scoring = scoreProfile(p);
          totalAnalyzed++;

          allLeads.push({
            id: p.id,
            name: p.displayName?.text || "—",
            address: p.formattedAddress || "—",
            category: p.primaryTypeDisplayName?.text || category,
            rating: p.rating,
            reviewCount: p.userRatingCount || 0,
            hasWebsite: !!p.websiteUri,
            website: p.websiteUri || null,
            phone: p.nationalPhoneNumber || null,
            pct: scoring.pct,
            grade: scoring.grade,
            flags: scoring.flags,
            location,
            searchCategory: category,
          });
        }

        await sleep(500);
      } catch (err) {
        process.stdout.write(`\n  ⚠️  Erro em "${query}": ${err.message}\n`);
        await sleep(1000);
      }
    }
  }

  // Ordenar: sem site primeiro, depois por score crescente
  allLeads.sort((a, b) => {
    if (!a.hasWebsite && b.hasWebsite) return -1;
    if (a.hasWebsite && !b.hasWebsite) return 1;
    return a.pct - b.pct;
  });

  // Terminal summary
  console.log(`\n${"═".repeat(65)}`);
  console.log(`  RESULTADO: ${allLeads.length} leads de ${totalAnalyzed} negócios analisados`);
  console.log(`  Sem site: ${allLeads.filter(l => !l.hasWebsite).length} | Críticos: ${allLeads.filter(l => l.grade === "Crítico").length}`);
  console.log("═".repeat(65));

  const top20 = allLeads.slice(0, 20);
  top20.forEach((l, i) => {
    const siteIcon = l.hasWebsite ? "🌐" : "❌";
    console.log(`  ${String(i + 1).padStart(2)}. [${String(l.pct).padStart(3)}/100 ${l.grade.padEnd(7)}] ${siteIcon}  ${l.name}`);
    console.log(`      📞 ${l.phone || "—"}  |  ${l.address.slice(0, 60)}`);
    if (l.flags.length) console.log(`      ⚠️  ${l.flags.slice(0, 2).join(" • ")}`);
  });

  if (allLeads.length > 20) {
    console.log(`\n  ... + ${allLeads.length - 20} leads no relatório HTML`);
  }
  console.log("═".repeat(65));

  // HTML report
  const outDir = resolve(process.cwd(), config.outputDir);
  mkdirSync(outDir, { recursive: true });

  const dateStr = new Date().toISOString().slice(0, 10);
  const outPath = resolve(outDir, `leads-${dateStr}-${Date.now()}.html`);
  // Gerar script para todos os leads coletados
  const pitchLeads = allLeads;
  const pitches = pitchLeads.map((l) => ({ lead: l, script: generateCallScript(l) }));

  const html = buildLeadReport(allLeads, { locations, categories, threshold }, { total: totalAnalyzed }, pitches);
  const fileUrl = `file:///${outPath.replace(/\\/g, "/")}`;
  const linkBar = `<div style="background:#1e3a5f;border-bottom:2px solid #3b82f6;padding:14px 40px;text-align:center;">
  <span style="font-size:0.8rem;color:#94a3b8;display:block;margin-bottom:4px;">📎 Relatório interativo em anexo — baixe e abra no browser para usar os botões de feedback</span>
  <span style="font-size:0.75rem;color:#475569;">Arquivo local: ${outPath}</span>
</div>`;
  const htmlWithLink = html.replace("<body>", `<body>${linkBar}`);
  writeFileSync(outPath, htmlWithLink, "utf8");

  console.log(`\n📄 Relatório completo: ${outPath}`);

  // ── CRM: CSV export ──────────────────────────────────────────────────────
  const csvHeader = "Nome,Telefone,Cidade,Categoria,Score,Grade,Sem Site,Reviews,Nota,Status,Observações,Data\n";
  const csvRows = allLeads.map(l => [
    `"${(l.name || "").replace(/"/g, "'")}"`,
    l.phone || "",
    `"${(l.location || "").replace(/ RS$| SC$/i, "").trim()}"`,
    `"${l.searchCategory || ""}"`,
    l.pct,
    l.grade || "",
    l.hasWebsite ? "Não" : "Sim",
    l.reviewCount,
    l.rating?.toFixed(1) || "",
    "Novo",
    "",
    dateStr,
  ].join(",")).join("\n");
  const csvPath = resolve(outDir, `leads-${dateStr}.csv`);
  writeFileSync(csvPath, "﻿" + csvHeader + csvRows, "utf8");
  console.log(`📊 CRM CSV: ${csvPath}`);

  // ── CRM: histórico acumulado ──────────────────────────────────────────────
  const histPath = resolve(outDir, "crm-history.json");
  let history = [];
  if (existsSync(histPath)) { try { history = JSON.parse(readFileSync(histPath, "utf8")); } catch {} }
  const existingIds = new Set(history.map(l => l.id));
  const newLeads = allLeads
    .filter(l => !existingIds.has(l.id || l.phone))
    .map(l => ({ ...l, id: l.id || l.phone, foundAt: dateStr, status: "novo" }));
  history = [...history, ...newLeads];
  writeFileSync(histPath, JSON.stringify(history, null, 2), "utf8");
  console.log(`📚 Histórico: ${history.length} leads acumulados (${newLeads.length} novos hoje)`);

  // Enviar por email
  const dateStr2 = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const noSiteCount = allLeads.filter((l) => !l.hasWebsite).length;
  const subject = `🔥 Leads GBP Fraco — ${dateStr2} | ${allLeads.length} leads | ${noSiteCount} sem site`;

  process.stdout.write(`📧 Enviando para ${EMAIL_TO.join(", ")}... `);
  try {
    const attachment = Buffer.from(htmlWithLink).toString("base64");
    const filename = `localrise-leads-${dateStr}.html`;
    const result = await sendEmail(subject, htmlWithLink, [{ filename, content: attachment }]);
    console.log(`✅ Enviado! ID: ${result.id}`);
  } catch (err) {
    console.error(`\n⚠️  Falha no email: ${err.message}`);
  }
  console.log();
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});

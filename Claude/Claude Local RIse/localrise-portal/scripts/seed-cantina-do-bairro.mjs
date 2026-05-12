/**
 * Seed: Restaurante Cantina do Bairro (demo para prospecção)
 *
 * Popula o Supabase com:
 *  - Cliente "Restaurante Cantina do Bairro"
 *  - 6 meses de métricas (Nov 2025 – Abr 2026) com Abril = dados exatos do brief
 *  - Usuário demo@localriseadvisory.com vinculado ao cliente
 *
 * Como rodar:
 *   node scripts/seed-cantina-do-bairro.mjs
 *
 * Requisitos em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Após rodar, adicione (ou atualize) no .env.local:
 *   LOCALRISE_DASHBOARD_SOURCE=supabase
 *   LOCALRISE_DEMO_RESTAURANT_SLUG=restaurante-cantina-do-bairro
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

// ─── ENV ─────────────────────────────────────────────────────────────────────

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const sep = line.indexOf('=')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    const value = line.slice(sep + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnvFile(path.join(rootDir, '.env.local'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// ─── CONFIGURAÇÃO DO DEMO ─────────────────────────────────────────────────────

const DEMO_EMAIL = 'demo@localriseadvisory.com'
const DEMO_PASSWORD = 'Cantina@Demo2026'

const clientPayload = {
  name: 'Restaurante Cantina do Bairro',
  nicho: 'Restaurante italiano casual',
  cidade: 'Porto Alegre, RS',
  phone: '55 51 3333-4400',
  site: 'https://cantinadobairro.com.br',
  instagram: '@cantinadobairropoa',
  status: 'ativo',
  plano: 'profissional',
  valor_mensalidade: 1490,
  data_inicio: '2025-11-01',
}

// ─── MÉTRICAS MENSAIS ─────────────────────────────────────────────────────────
//
// Distribuição pensada para refletir o crescimento real esperado:
//   - Abril 2026 = dados exatos conforme brief do cliente
//   - Março 2026 = retrocomputado pelos deltas especificados (+23% GBP, +15% site, +31% ads, +8.7% instagram, +2 posições SEO)
//   - Jan–Mar 2026 = consistentes com o "Resumo do Ano 2026" (total invest R$2.670, 198 conversões, CPA R$13,48)
//   - Nov–Dez 2025 = crescimento orgânico pré-onboarding

const monthlyMetrics = [
  // ── Novembro 2025 ─────────────────────────────────────────────────────────
  {
    mes: 11, ano: 2025,
    gbp: { visualizacoes_maps: 838, visualizacoes_busca: 1397, cliques_ligar: 43, cliques_rota: 97, cliques_site: 87, nota: 4.5, total_reviews: 86, novos_reviews: 5 },
    site: { sessoes: 577, usuarios: 458, pageviews: 1335, taxa_rejeicao: 48.0, duracao_media_seg: 127, posicao_media: 13.4, cliques_organicos: 294, impressoes_organicas: 3908 },
    ads: { impressoes: 5614, cliques: 303, ctr: 4.61, cpc: 1.34, investimento: 397, conversoes: 26, custo_por_conversao: 15.27 },
    instagram: { seguidores: 1618, novos_seguidores: 89, posts: 7, alcance: 6637, impressoes: 8819, visitas_perfil: 347, curtidas: 857, comentarios: 94, salvamentos: 45, taxa_engajamento: 3.7 },
  },
  // ── Dezembro 2025 ─────────────────────────────────────────────────────────
  {
    mes: 12, ano: 2025,
    gbp: { visualizacoes_maps: 980, visualizacoes_busca: 1634, cliques_ligar: 50, cliques_rota: 113, cliques_site: 102, nota: 4.5, total_reviews: 92, novos_reviews: 6 },
    site: { sessoes: 674, usuarios: 535, pageviews: 1561, taxa_rejeicao: 46.0, duracao_media_seg: 134, posicao_media: 11.2, cliques_organicos: 344, impressoes_organicas: 4568 },
    ads: { impressoes: 6565, cliques: 354, ctr: 4.77, cpc: 1.31, investimento: 464, conversoes: 31, custo_por_conversao: 14.97 },
    instagram: { seguidores: 1722, novos_seguidores: 104, posts: 8, alcance: 7757, impressoes: 10311, visitas_perfil: 405, curtidas: 1001, comentarios: 110, salvamentos: 53, taxa_engajamento: 3.9 },
  },
  // ── Janeiro 2026 ──────────────────────────────────────────────────────────
  // invest=528, conversoes=38 → parte do total anual 2026: R$2.670 / 198 conversões / CPA R$13,48
  {
    mes: 1, ano: 2026,
    gbp: { visualizacoes_maps: 1147, visualizacoes_busca: 1911, cliques_ligar: 58, cliques_rota: 132, cliques_site: 119, nota: 4.6, total_reviews: 99, novos_reviews: 7 },
    site: { sessoes: 788, usuarios: 625, pageviews: 1825, taxa_rejeicao: 44.0, duracao_media_seg: 141, posicao_media: 9.1, cliques_organicos: 402, impressoes_organicas: 5342 },
    ads: { impressoes: 7676, cliques: 414, ctr: 4.92, cpc: 1.28, investimento: 528, conversoes: 38, custo_por_conversao: 13.89 },
    instagram: { seguidores: 1842, novos_seguidores: 120, posts: 9, alcance: 9071, impressoes: 12054, visitas_perfil: 473, curtidas: 1170, comentarios: 129, salvamentos: 62, taxa_engajamento: 4.1 },
  },
  // ── Fevereiro 2026 ────────────────────────────────────────────────────────
  // invest=610, conversoes=43
  {
    mes: 2, ano: 2026,
    gbp: { visualizacoes_maps: 1342, visualizacoes_busca: 2234, cliques_ligar: 68, cliques_rota: 155, cliques_site: 139, nota: 4.6, total_reviews: 107, novos_reviews: 8 },
    site: { sessoes: 921, usuarios: 732, pageviews: 2134, taxa_rejeicao: 42.0, duracao_media_seg: 148, posicao_media: 7.2, cliques_organicos: 470, impressoes_organicas: 6248 },
    ads: { impressoes: 8975, cliques: 484, ctr: 5.15, cpc: 1.26, investimento: 610, conversoes: 43, custo_por_conversao: 14.19 },
    instagram: { seguidores: 1982, novos_seguidores: 140, posts: 10, alcance: 10594, impressoes: 14086, visitas_perfil: 553, curtidas: 1368, comentarios: 150, salvamentos: 72, taxa_engajamento: 4.3 },
  },
  // ── Março 2026 ────────────────────────────────────────────────────────────
  // invest=642, conversoes=50
  // Retrocomputado para gerar os deltas de Abril:
  //   busca: 2610 (3210/1.23 = +23%), sessoes: 1079 (1240/1.15 = +15%),
  //   cliques ads: 567 (743/1.31 = +31%), seguidores: 2152 (2340/1.087 = +8.7%),
  //   posicao: 5.4 (3.4+2 posições de melhoria)
  {
    mes: 3, ano: 2026,
    gbp: { visualizacoes_maps: 1566, visualizacoes_busca: 2610, cliques_ligar: 80, cliques_rota: 181, cliques_site: 163, nota: 4.7, total_reviews: 116, novos_reviews: 9 },
    site: { sessoes: 1079, usuarios: 858, pageviews: 2497, taxa_rejeicao: 40.0, duracao_media_seg: 155, posicao_media: 5.4, cliques_organicos: 551, impressoes_organicas: 7321 },
    ads: { impressoes: 10508, cliques: 567, ctr: 5.39, cpc: 1.13, investimento: 642, conversoes: 50, custo_por_conversao: 12.84 },
    instagram: { seguidores: 2152, novos_seguidores: 162, posts: 11, alcance: 12348, impressoes: 16435, visitas_perfil: 646, curtidas: 1598, comentarios: 176, salvamentos: 84, taxa_engajamento: 4.5 },
  },
  // ── Abril 2026 ────────────────────────────────────────────────────────────
  // Dados EXATOS conforme brief — NÃO ALTERAR
  {
    mes: 4, ano: 2026,
    gbp: { visualizacoes_maps: 1847, visualizacoes_busca: 3210, cliques_ligar: 94, cliques_rota: 213, cliques_site: 187, nota: 4.8, total_reviews: 127, novos_reviews: 11 },
    site: { sessoes: 1240, usuarios: 987, pageviews: 2870, taxa_rejeicao: 38.0, duracao_media_seg: 163, posicao_media: 3.4, cliques_organicos: 634, impressoes_organicas: 8420 },
    ads: { impressoes: 12400, cliques: 743, ctr: 5.99, cpc: 1.20, investimento: 890, conversoes: 67, custo_por_conversao: 13.28 },
    instagram: { seguidores: 2340, novos_seguidores: 187, posts: 12, alcance: 14200, impressoes: 18900, visitas_perfil: 743, curtidas: 1840, comentarios: 203, salvamentos: 97, taxa_engajamento: 4.7 },
  },
]

// ─── CLIENTE ─────────────────────────────────────────────────────────────────

async function ensureClient() {
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('name', clientPayload.name)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase.from('clients').update(clientPayload).eq('id', existing.id)
    if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`)
    console.log(`✔  Cliente atualizado  id=${existing.id}`)
    return existing.id
  }

  const { data, error } = await supabase.from('clients').insert(clientPayload).select('id').single()
  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`)
  console.log(`✔  Cliente criado  id=${data.id}`)
  return data.id
}

// ─── MÉTRICAS ─────────────────────────────────────────────────────────────────

async function seedMetrics(clientId) {
  const base = monthlyMetrics.map((m) => ({ client_id: clientId, mes: m.mes, ano: m.ano }))

  const tables = [
    { table: 'metrics_gbp',       key: 'gbp' },
    { table: 'metrics_site',      key: 'site' },
    { table: 'metrics_ads',       key: 'ads' },
    { table: 'metrics_instagram', key: 'instagram' },
  ]

  for (const { table, key } of tables) {
    const rows = monthlyMetrics.map((m, i) => ({ ...base[i], ...m[key] }))
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'client_id,mes,ano' })
    if (error) throw new Error(`Erro em ${table}: ${error.message}`)
    console.log(`✔  ${table}  (${rows.length} meses)`)
  }
}

// ─── USUÁRIO DEMO ─────────────────────────────────────────────────────────────

async function ensureDemoUser(clientId) {
  // Verifica se o usuário já existe via Admin API
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw new Error(`Erro ao listar usuários: ${listError.message}`)

  const existing = listData.users.find((u) => u.email === DEMO_EMAIL)

  let userId
  if (existing) {
    // Atualiza senha caso já exista
    const { error } = await supabase.auth.admin.updateUserById(existing.id, { password: DEMO_PASSWORD })
    if (error) throw new Error(`Erro ao atualizar senha do usuário demo: ${error.message}`)
    userId = existing.id
    console.log(`✔  Usuário demo já existe, senha atualizada  id=${userId}`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      user_metadata: { full_name: 'Carlos Mendonça', role: 'client' },
      email_confirm: true,
    })
    if (error) throw new Error(`Erro ao criar usuário demo: ${error.message}`)
    userId = data.user.id
    console.log(`✔  Usuário demo criado  id=${userId}`)
  }

  // Vincula o usuário ao cliente via profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ client_id: clientId, full_name: 'Carlos Mendonça', role: 'client' })
    .eq('id', userId)

  if (profileError) throw new Error(`Erro ao vincular perfil: ${profileError.message}`)
  console.log(`✔  Perfil vinculado  user=${userId}  client=${clientId}`)

  return userId
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🍝  Seed: Restaurante Cantina do Bairro\n')

  const clientId = await ensureClient()
  await seedMetrics(clientId)
  await ensureDemoUser(clientId)

  console.log('\n✅  Seed concluído com sucesso!\n')
  console.log('─────────────────────────────────────────────────────')
  console.log('  PRÓXIMOS PASSOS — adicione ao .env.local:')
  console.log()
  console.log('  LOCALRISE_DASHBOARD_SOURCE=supabase')
  console.log('  LOCALRISE_DEMO_RESTAURANT_SLUG=restaurante-cantina-do-bairro')
  console.log()
  console.log('  Login demo:')
  console.log(`  Email:  ${DEMO_EMAIL}`)
  console.log(`  Senha:  ${DEMO_PASSWORD}`)
  console.log('─────────────────────────────────────────────────────\n')
}

run().catch((err) => {
  console.error('\n❌  Erro:', err.message)
  process.exit(1)
})

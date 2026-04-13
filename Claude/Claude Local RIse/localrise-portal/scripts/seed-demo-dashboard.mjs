import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
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

const clientPayload = {
  name: 'Don Aurelio Prime Grill',
  nicho: 'Restaurante premium',
  cidade: 'Porto Alegre, RS',
  phone: '55 51 3333-8800',
  site: 'https://donaurelioprimegrill.com.br',
  instagram: '@donaurelioprimegrill',
  status: 'ativo',
  plano: 'elite',
  valor_mensalidade: 6500,
  data_inicio: '2025-11-01',
}

const monthlyMetrics = [
  {
    mes: 11,
    ano: 2025,
    gbp: { visualizacoes_maps: 41200, visualizacoes_busca: 19800, cliques_ligar: 88, cliques_rota: 312, cliques_site: 426, nota: 4.6, total_reviews: 1098, novos_reviews: 46 },
    site: { sessoes: 10180, usuarios: 7420, pageviews: 25840, taxa_rejeicao: 41.8, duracao_media_seg: 138, posicao_media: 8.6, cliques_organicos: 3480, impressoes_organicas: 50200 },
    ads: { impressoes: 84200, cliques: 3280, ctr: 3.9, cpc: 2.86, investimento: 9380, conversoes: 38, custo_por_conversao: 246.84 },
    instagram: { seguidores: 9240, novos_seguidores: 182, posts: 18, alcance: 28100, impressoes: 46800, visitas_perfil: 1980, curtidas: 3420, comentarios: 128, salvamentos: 274, taxa_engajamento: 4.7 },
  },
  {
    mes: 12,
    ano: 2025,
    gbp: { visualizacoes_maps: 43800, visualizacoes_busca: 20540, cliques_ligar: 94, cliques_rota: 336, cliques_site: 462, nota: 4.6, total_reviews: 1146, novos_reviews: 48 },
    site: { sessoes: 10820, usuarios: 7840, pageviews: 27410, taxa_rejeicao: 40.9, duracao_media_seg: 142, posicao_media: 8.1, cliques_organicos: 3710, impressoes_organicas: 52840 },
    ads: { impressoes: 90100, cliques: 3520, ctr: 3.91, cpc: 2.91, investimento: 10240, conversoes: 42, custo_por_conversao: 243.81 },
    instagram: { seguidores: 9488, novos_seguidores: 248, posts: 20, alcance: 29650, impressoes: 48720, visitas_perfil: 2148, curtidas: 3652, comentarios: 136, salvamentos: 288, taxa_engajamento: 4.8 },
  },
  {
    mes: 1,
    ano: 2026,
    gbp: { visualizacoes_maps: 46240, visualizacoes_busca: 21960, cliques_ligar: 103, cliques_rota: 358, cliques_site: 501, nota: 4.7, total_reviews: 1204, novos_reviews: 58 },
    site: { sessoes: 11680, usuarios: 8320, pageviews: 29620, taxa_rejeicao: 39.4, duracao_media_seg: 149, posicao_media: 7.6, cliques_organicos: 4030, impressoes_organicas: 56600 },
    ads: { impressoes: 96350, cliques: 3810, ctr: 3.95, cpc: 3.02, investimento: 11510, conversoes: 49, custo_por_conversao: 234.9 },
    instagram: { seguidores: 9815, novos_seguidores: 327, posts: 17, alcance: 31880, impressoes: 51240, visitas_perfil: 2265, curtidas: 3894, comentarios: 152, salvamentos: 305, taxa_engajamento: 4.9 },
  },
  {
    mes: 2,
    ano: 2026,
    gbp: { visualizacoes_maps: 49780, visualizacoes_busca: 23420, cliques_ligar: 112, cliques_rota: 389, cliques_site: 546, nota: 4.7, total_reviews: 1268, novos_reviews: 64 },
    site: { sessoes: 12590, usuarios: 8910, pageviews: 32160, taxa_rejeicao: 38.6, duracao_media_seg: 154, posicao_media: 7.2, cliques_organicos: 4370, impressoes_organicas: 60480 },
    ads: { impressoes: 104800, cliques: 4190, ctr: 4.0, cpc: 3.08, investimento: 12910, conversoes: 56, custo_por_conversao: 230.54 },
    instagram: { seguidores: 10196, novos_seguidores: 381, posts: 21, alcance: 33640, impressoes: 54830, visitas_perfil: 2412, curtidas: 4218, comentarios: 166, salvamentos: 332, taxa_engajamento: 5.1 },
  },
  {
    mes: 3,
    ano: 2026,
    gbp: { visualizacoes_maps: 53620, visualizacoes_busca: 24880, cliques_ligar: 124, cliques_rota: 428, cliques_site: 589, nota: 4.8, total_reviews: 1351, novos_reviews: 83 },
    site: { sessoes: 13840, usuarios: 9640, pageviews: 35820, taxa_rejeicao: 37.1, duracao_media_seg: 162, posicao_media: 6.7, cliques_organicos: 4890, impressoes_organicas: 65820 },
    ads: { impressoes: 116200, cliques: 5180, ctr: 4.46, cpc: 3.14, investimento: 16260, conversoes: 71, custo_por_conversao: 229.01 },
    instagram: { seguidores: 10648, novos_seguidores: 452, posts: 22, alcance: 37120, impressoes: 60340, visitas_perfil: 2698, curtidas: 4688, comentarios: 184, salvamentos: 366, taxa_engajamento: 5.3 },
  },
  {
    mes: 4,
    ano: 2026,
    gbp: { visualizacoes_maps: 58400, visualizacoes_busca: 26120, cliques_ligar: 134, cliques_rota: 488, cliques_site: 642, nota: 4.8, total_reviews: 1444, novos_reviews: 93 },
    site: { sessoes: 14920, usuarios: 10380, pageviews: 39240, taxa_rejeicao: 35.8, duracao_media_seg: 171, posicao_media: 6.1, cliques_organicos: 5482, impressoes_organicas: 72100 },
    ads: { impressoes: 124000, cliques: 6200, ctr: 5.0, cpc: 3.05, investimento: 18910, conversoes: 88, custo_por_conversao: 214.89 },
    instagram: { seguidores: 11186, novos_seguidores: 538, posts: 24, alcance: 41860, impressoes: 68420, visitas_perfil: 2984, curtidas: 5260, comentarios: 214, salvamentos: 402, taxa_engajamento: 5.6 },
  },
]

async function ensureDemoClient() {
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('name', clientPayload.name)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase.from('clients').update(clientPayload).eq('id', existing.id)
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.from('clients').insert(clientPayload).select('id').single()
  if (error) throw error
  return data.id
}

async function run() {
  const clientId = await ensureDemoClient()

  const rows = monthlyMetrics.map((item) => ({
    client_id: clientId,
    mes: item.mes,
    ano: item.ano,
  }))

  const { error: gbpError } = await supabase.from('metrics_gbp').upsert(
    monthlyMetrics.map((item) => ({ ...rows.find((row) => row.mes === item.mes && row.ano === item.ano), ...item.gbp })),
    { onConflict: 'client_id,mes,ano' }
  )
  if (gbpError) throw gbpError

  const { error: siteError } = await supabase.from('metrics_site').upsert(
    monthlyMetrics.map((item) => ({ ...rows.find((row) => row.mes === item.mes && row.ano === item.ano), ...item.site })),
    { onConflict: 'client_id,mes,ano' }
  )
  if (siteError) throw siteError

  const { error: adsError } = await supabase.from('metrics_ads').upsert(
    monthlyMetrics.map((item) => ({ ...rows.find((row) => row.mes === item.mes && row.ano === item.ano), ...item.ads })),
    { onConflict: 'client_id,mes,ano' }
  )
  if (adsError) throw adsError

  const { error: instagramError } = await supabase.from('metrics_instagram').upsert(
    monthlyMetrics.map((item) => ({ ...rows.find((row) => row.mes === item.mes && row.ano === item.ano), ...item.instagram })),
    { onConflict: 'client_id,mes,ano' }
  )
  if (instagramError) throw instagramError

  console.log(`Seed concluida para ${clientPayload.name}`)
  console.log(`client_id=${clientId}`)
  console.log(`Meses atualizados=${monthlyMetrics.length}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

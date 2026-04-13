'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

type Tab = 'gbp' | 'instagram' | 'site' | 'ads'

const TABS: { key: Tab; label: string }[] = [
  { key: 'gbp', label: 'Google Business' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'site', label: 'Site' },
  { key: 'ads', label: 'Google Ads' },
]

export default function MetricasClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ resultados: Record<string, string>; erros: Record<string, string> } | null>(null)
  const [clientName, setClientName] = useState('')
  const [hasIntegration, setHasIntegration] = useState(false)
  const [tab, setTab] = useState<Tab>('gbp')
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())

  const [gbp, setGbp] = useState({ visualizacoes_maps: '', visualizacoes_busca: '', cliques_ligar: '', cliques_rota: '', cliques_site: '', nota: '', total_reviews: '', novos_reviews: '' })
  const [instagram, setInstagram] = useState({ seguidores: '', novos_seguidores: '', posts: '', alcance: '', impressoes: '', visitas_perfil: '', curtidas: '', comentarios: '', salvamentos: '', taxa_engajamento: '' })
  const [site, setSite] = useState({ sessoes: '', usuarios: '', pageviews: '', taxa_rejeicao: '', duracao_media_seg: '', posicao_media: '', cliques_organicos: '', impressoes_organicas: '' })
  const [ads, setAds] = useState({ impressoes: '', cliques: '', ctr: '', cpc: '', investimento: '', conversoes: '', custo_por_conversao: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: client } = await supabase.from('clients').select('name').eq('id', clientId).single()
      setClientName(client?.name ?? '')

      const { data: integ } = await supabase.from('client_integrations').select('id').eq('client_id', clientId).single()
      setHasIntegration(!!integ)

      const [{ data: gbpData }, { data: igData }, { data: siteData }, { data: adsData }] = await Promise.all([
        supabase.from('metrics_gbp').select('*').eq('client_id', clientId).eq('mes', mes).eq('ano', ano).single(),
        supabase.from('metrics_instagram').select('*').eq('client_id', clientId).eq('mes', mes).eq('ano', ano).single(),
        supabase.from('metrics_site').select('*').eq('client_id', clientId).eq('mes', mes).eq('ano', ano).single(),
        supabase.from('metrics_ads').select('*').eq('client_id', clientId).eq('mes', mes).eq('ano', ano).single(),
      ])

      if (gbpData) setGbp({ visualizacoes_maps: gbpData.visualizacoes_maps ?? '', visualizacoes_busca: gbpData.visualizacoes_busca ?? '', cliques_ligar: gbpData.cliques_ligar ?? '', cliques_rota: gbpData.cliques_rota ?? '', cliques_site: gbpData.cliques_site ?? '', nota: gbpData.nota ?? '', total_reviews: gbpData.total_reviews ?? '', novos_reviews: gbpData.novos_reviews ?? '' })
      if (igData) setInstagram({ seguidores: igData.seguidores ?? '', novos_seguidores: igData.novos_seguidores ?? '', posts: igData.posts ?? '', alcance: igData.alcance ?? '', impressoes: igData.impressoes ?? '', visitas_perfil: igData.visitas_perfil ?? '', curtidas: igData.curtidas ?? '', comentarios: igData.comentarios ?? '', salvamentos: igData.salvamentos ?? '', taxa_engajamento: igData.taxa_engajamento ?? '' })
      if (siteData) setSite({ sessoes: siteData.sessoes ?? '', usuarios: siteData.usuarios ?? '', pageviews: siteData.pageviews ?? '', taxa_rejeicao: siteData.taxa_rejeicao ?? '', duracao_media_seg: siteData.duracao_media_seg ?? '', posicao_media: siteData.posicao_media ?? '', cliques_organicos: siteData.cliques_organicos ?? '', impressoes_organicas: siteData.impressoes_organicas ?? '' })
      if (adsData) setAds({ impressoes: adsData.impressoes ?? '', cliques: adsData.cliques ?? '', ctr: adsData.ctr ?? '', cpc: adsData.cpc ?? '', investimento: adsData.investimento ?? '', conversoes: adsData.conversoes ?? '', custo_por_conversao: adsData.custo_por_conversao ?? '' })
      setLoading(false)
    }
    load()
  }, [clientId, mes, ano, supabase])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/sync/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, ano }),
      })
      const data = await res.json()
      setSyncResult(data)
      // Recarregar dados após sync
      window.location.reload()
    } catch {
      setSyncResult({ resultados: {}, erros: { geral: 'Erro de conexão ao sincronizar.' } })
      setSyncing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const base = { client_id: clientId, mes, ano }
    const toNum = (v: string) => v === '' ? null : Number(v)

    await Promise.all([
      supabase.from('metrics_gbp').upsert({ ...base, visualizacoes_maps: toNum(gbp.visualizacoes_maps), visualizacoes_busca: toNum(gbp.visualizacoes_busca), cliques_ligar: toNum(gbp.cliques_ligar), cliques_rota: toNum(gbp.cliques_rota), cliques_site: toNum(gbp.cliques_site), nota: toNum(gbp.nota), total_reviews: toNum(gbp.total_reviews), novos_reviews: toNum(gbp.novos_reviews) }, { onConflict: 'client_id,mes,ano' }),
      supabase.from('metrics_instagram').upsert({ ...base, seguidores: toNum(instagram.seguidores), novos_seguidores: toNum(instagram.novos_seguidores), posts: toNum(instagram.posts), alcance: toNum(instagram.alcance), impressoes: toNum(instagram.impressoes), visitas_perfil: toNum(instagram.visitas_perfil), curtidas: toNum(instagram.curtidas), comentarios: toNum(instagram.comentarios), salvamentos: toNum(instagram.salvamentos), taxa_engajamento: toNum(instagram.taxa_engajamento) }, { onConflict: 'client_id,mes,ano' }),
      supabase.from('metrics_site').upsert({ ...base, sessoes: toNum(site.sessoes), usuarios: toNum(site.usuarios), pageviews: toNum(site.pageviews), taxa_rejeicao: toNum(site.taxa_rejeicao), duracao_media_seg: toNum(site.duracao_media_seg), posicao_media: toNum(site.posicao_media), cliques_organicos: toNum(site.cliques_organicos), impressoes_organicas: toNum(site.impressoes_organicas) }, { onConflict: 'client_id,mes,ano' }),
      supabase.from('metrics_ads').upsert({ ...base, impressoes: toNum(ads.impressoes), cliques: toNum(ads.cliques), ctr: toNum(ads.ctr), cpc: toNum(ads.cpc), investimento: toNum(ads.investimento), conversoes: toNum(ads.conversoes), custo_por_conversao: toNum(ads.custo_por_conversao) }, { onConflict: 'client_id,mes,ano' }),
    ])

    setSaving(false)
    router.push('/admin/metricas')
  }

  const input = (val: string, onChange: (v: string) => void, placeholder = '0') => (
    <input value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} type="number" step="any"
      className="w-full px-3 py-2.5 rounded-xl border text-white text-sm outline-none transition-all"
      style={{ background: '#181818', borderColor: '#222' }}
      onFocus={e => (e.target.style.borderColor = '#E31B23')}
      onBlur={e => (e.target.style.borderColor = '#222')} />
  )

  const field = (label: string, val: string, onChange: (v: string) => void, placeholder?: string) => (
    <div key={label}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#555' }}>{label}</label>
      {input(val, onChange, placeholder)}
    </div>
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{clientName}</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>Inserir métricas mensais</p>
        </div>
        <Link href={`/admin/integracoes/${clientId}`}
          className="text-xs px-3 py-2 rounded-xl transition-opacity hover:opacity-80 flex items-center gap-1.5"
          style={{
            background: hasIntegration ? 'rgba(34,197,94,0.08)' : 'rgba(227,27,35,0.08)',
            color: hasIntegration ? '#22C55E' : '#E31B23',
            border: `1px solid ${hasIntegration ? 'rgba(34,197,94,0.15)' : 'rgba(227,27,35,0.15)'}`,
          }}>
          <span>{hasIntegration ? '✓' : '⚙'}</span>
          {hasIntegration ? 'Integrações configuradas' : 'Configurar integrações'}
        </Link>
      </div>

      {/* Seletor mês/ano + botão Sincronizar */}
      <div className="flex gap-3 mb-4">
        <select value={mes} onChange={e => setMes(Number(e.target.value))}
          className="px-4 py-2.5 rounded-xl border text-white text-sm outline-none"
          style={{ background: '#111111', borderColor: '#222' }}>
          {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={ano} onChange={e => setAno(Number(e.target.value))}
          className="px-4 py-2.5 rounded-xl border text-white text-sm outline-none"
          style={{ background: '#111111', borderColor: '#222' }}>
          {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {loading && <span className="text-sm self-center" style={{ color: '#555' }}>Carregando...</span>}
        {hasIntegration && (
          <button onClick={handleSync} disabled={syncing}
            className="ml-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1a3a1a, #1e3a1e)', border: '1px solid #22C55E' }}>
            {syncing ? (
              <>
                <span className="inline-block animate-spin">⟳</span> Sincronizando...
              </>
            ) : (
              <><span>⟳</span> Sincronizar dados</>
            )}
          </button>
        )}
      </div>

      {/* Resultado da sincronização */}
      {syncResult && (
        <div className="rounded-xl p-4 mb-4 border" style={{ background: '#0f0f0f', borderColor: '#1e1e1e' }}>
          {Object.keys(syncResult.resultados).length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold mb-1.5" style={{ color: '#22C55E' }}>Sincronizado com sucesso:</p>
              {Object.entries(syncResult.resultados).map(([k, v]) => (
                <p key={k} className="text-xs" style={{ color: '#888' }}>
                  <span className="font-semibold text-white capitalize">{k}</span>: {v}
                </p>
              ))}
            </div>
          )}
          {Object.keys(syncResult.erros).length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: '#EF4444' }}>Erros:</p>
              {Object.entries(syncResult.erros).map(([k, v]) => (
                <p key={k} className="text-xs" style={{ color: '#888' }}>
                  <span className="font-semibold text-white capitalize">{k}</span>: {v}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#111111', border: '1px solid #1e1e1e' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={tab === key ? { background: '#E31B23', color: 'white' } : { color: '#555' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6 border mb-6" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
        {tab === 'gbp' && (
          <div className="grid grid-cols-2 gap-4">
            {field('Visualizações no Maps', gbp.visualizacoes_maps, v => setGbp(g => ({ ...g, visualizacoes_maps: v })))}
            {field('Visualizações na Busca', gbp.visualizacoes_busca, v => setGbp(g => ({ ...g, visualizacoes_busca: v })))}
            {field('Cliques para Ligar', gbp.cliques_ligar, v => setGbp(g => ({ ...g, cliques_ligar: v })))}
            {field('Cliques em Rota', gbp.cliques_rota, v => setGbp(g => ({ ...g, cliques_rota: v })))}
            {field('Cliques no Site', gbp.cliques_site, v => setGbp(g => ({ ...g, cliques_site: v })))}
            {field('Nota Google', gbp.nota, v => setGbp(g => ({ ...g, nota: v })), '4.5')}
            {field('Total de Reviews', gbp.total_reviews, v => setGbp(g => ({ ...g, total_reviews: v })))}
            {field('Novos Reviews no Mês', gbp.novos_reviews, v => setGbp(g => ({ ...g, novos_reviews: v })))}
          </div>
        )}
        {tab === 'instagram' && (
          <div className="grid grid-cols-2 gap-4">
            {field('Total de Seguidores', instagram.seguidores, v => setInstagram(i => ({ ...i, seguidores: v })))}
            {field('Novos Seguidores no Mês', instagram.novos_seguidores, v => setInstagram(i => ({ ...i, novos_seguidores: v })))}
            {field('Posts no Mês', instagram.posts, v => setInstagram(i => ({ ...i, posts: v })))}
            {field('Alcance', instagram.alcance, v => setInstagram(i => ({ ...i, alcance: v })))}
            {field('Impressões', instagram.impressoes, v => setInstagram(i => ({ ...i, impressoes: v })))}
            {field('Visitas ao Perfil', instagram.visitas_perfil, v => setInstagram(i => ({ ...i, visitas_perfil: v })))}
            {field('Curtidas', instagram.curtidas, v => setInstagram(i => ({ ...i, curtidas: v })))}
            {field('Comentários', instagram.comentarios, v => setInstagram(i => ({ ...i, comentarios: v })))}
            {field('Salvamentos', instagram.salvamentos, v => setInstagram(i => ({ ...i, salvamentos: v })))}
            {field('Taxa de Engajamento (%)', instagram.taxa_engajamento, v => setInstagram(i => ({ ...i, taxa_engajamento: v })), '3.5')}
          </div>
        )}
        {tab === 'site' && (
          <div className="grid grid-cols-2 gap-4">
            {field('Sessões', site.sessoes, v => setSite(s => ({ ...s, sessoes: v })))}
            {field('Usuários Únicos', site.usuarios, v => setSite(s => ({ ...s, usuarios: v })))}
            {field('Pageviews', site.pageviews, v => setSite(s => ({ ...s, pageviews: v })))}
            {field('Taxa de Rejeição (%)', site.taxa_rejeicao, v => setSite(s => ({ ...s, taxa_rejeicao: v })), '45.0')}
            {field('Duração Média (seg)', site.duracao_media_seg, v => setSite(s => ({ ...s, duracao_media_seg: v })))}
            {field('Posição Média SEO', site.posicao_media, v => setSite(s => ({ ...s, posicao_media: v })), '12.5')}
            {field('Cliques Orgânicos', site.cliques_organicos, v => setSite(s => ({ ...s, cliques_organicos: v })))}
            {field('Impressões Orgânicas', site.impressoes_organicas, v => setSite(s => ({ ...s, impressoes_organicas: v })))}
          </div>
        )}
        {tab === 'ads' && (
          <div className="grid grid-cols-2 gap-4">
            {field('Impressões', ads.impressoes, v => setAds(a => ({ ...a, impressoes: v })))}
            {field('Cliques', ads.cliques, v => setAds(a => ({ ...a, cliques: v })))}
            {field('CTR (%)', ads.ctr, v => setAds(a => ({ ...a, ctr: v })), '3.5')}
            {field('CPC Médio (R$)', ads.cpc, v => setAds(a => ({ ...a, cpc: v })), '1.50')}
            {field('Investimento Total (R$)', ads.investimento, v => setAds(a => ({ ...a, investimento: v })))}
            {field('Conversões', ads.conversoes, v => setAds(a => ({ ...a, conversoes: v })))}
            {field('Custo por Conversão (R$)', ads.custo_por_conversao, v => setAds(a => ({ ...a, custo_por_conversao: v })))}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: '#E31B23' }}>
        {saving ? 'Salvando...' : `Salvar Métricas de ${MESES[mes - 1]} ${ano}`}
      </button>
    </div>
  )
}

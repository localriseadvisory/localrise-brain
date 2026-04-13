'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Integration = {
  provider: 'google' | 'instagram'
  access_token: string | null
  token_expires_at: string | null
  account_id: string | null
  account_name: string | null
  ga4_property_id: string | null
  ga4_property_name: string | null
  search_console_site: string | null
  ads_customer_id: string | null
  ads_developer_token: string | null
  is_active: boolean
  last_sync_at: string | null
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date(Date.now() + 60 * 60 * 1000) // dentro de 1h
}

// ── Card de uma integração ─────────────────────────────────────────────────
function IntegrationCard({
  title,
  subtitle,
  icon,
  accentColor,
  integration,
  connectHref,
  onDisconnect,
  onSync,
  syncing,
  disabled,
  disabledReason,
  extraFields,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  accentColor: string
  integration: Integration | null
  connectHref: string
  onDisconnect: () => void
  onSync: () => void
  syncing: boolean
  disabled?: boolean
  disabledReason?: string
  extraFields?: React.ReactNode
}) {
  const isConnected = !!integration?.access_token && integration.is_active
  const expired = isExpired(integration?.token_expires_at ?? null)

  return (
    <div
      className="rounded-2xl border p-6 transition-colors"
      style={{ background: '#111111', borderColor: isConnected ? 'rgba(34,197,94,0.2)' : '#1e1e1e' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{title}</span>
            {isConnected ? (
              expired ? (
                <span className="rounded-lg border px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.15)' }}>
                  Token expirando
                </span>
              ) : (
                <span className="rounded-lg border px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.12)' }}>
                  ✓ Conectado
                </span>
              )
            ) : (
              <span className="rounded-lg border px-2 py-0.5 text-xs font-semibold"
                style={{ background: '#181818', color: '#555', borderColor: '#252525' }}>
                Não conectado
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs" style={{ color: '#555' }}>{subtitle}</p>

          {isConnected && (
            <div className="mt-3 flex flex-col gap-1">
              {integration!.account_name && (
                <p className="text-xs" style={{ color: '#888' }}>
                  Conta: <span className="text-white">{integration!.account_name}</span>
                  {integration!.account_id && integration!.account_id !== integration!.account_name && (
                    <span style={{ color: '#555' }}> ({integration!.account_id})</span>
                  )}
                </p>
              )}
              {integration!.ga4_property_name && (
                <p className="text-xs" style={{ color: '#888' }}>
                  GA4: <span className="text-white">{integration!.ga4_property_name}</span>
                  <span style={{ color: '#555' }}> ({integration!.ga4_property_id})</span>
                </p>
              )}
              {integration!.search_console_site && (
                <p className="text-xs" style={{ color: '#888' }}>
                  Search Console: <span className="text-white">{integration!.search_console_site}</span>
                </p>
              )}
              {integration!.last_sync_at && (
                <p className="text-xs" style={{ color: '#555' }}>
                  Última sync: {fmt(integration!.last_sync_at)}
                </p>
              )}
              {integration!.token_expires_at && (
                <p className="text-xs" style={{ color: '#555' }}>
                  Token válido até: {fmt(integration!.token_expires_at)}
                </p>
              )}
            </div>
          )}

          {extraFields}
        </div>
      </div>

      {disabled && disabledReason ? (
        <div className="mt-4 rounded-xl border p-3 text-xs" style={{ background: '#0f0f0f', borderColor: '#1a1a1a', color: '#555' }}>
          ⓘ {disabledReason}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {isConnected ? (
            <>
              <button
                onClick={onSync}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ background: '#1a1a1a', border: '1px solid #252525' }}
              >
                {syncing ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    Sincronizando...
                  </>
                ) : '↻ Sincronizar Agora'}
              </button>
              <a
                href={connectHref}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888' }}
              >
                ↺ Reconectar
              </a>
              <button
                onClick={onDisconnect}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}
              >
                Desconectar
              </button>
            </>
          ) : (
            <a
              href={connectHref}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#E31B23' }}
            >
              <span>+</span> Conectar {title}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────
export default function ConexoesPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading]         = useState(true)
  const [clientName, setClientName]   = useState('')
  const [googleInteg, setGoogleInteg] = useState<Integration | null>(null)
  const [igInteg, setIgInteg]         = useState<Integration | null>(null)
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [syncingGoogle, setSyncingGoogle]   = useState(false)
  const [syncingInstagram, setSyncingInstagram] = useState(false)
  const [adsCustomerId, setAdsCustomerId]   = useState('')
  const [savingAds, setSavingAds]           = useState(false)

  // Lê mes/ano atual para passar ao sync
  const now  = new Date()
  const mes  = now.getMonth() + 1
  const ano  = now.getFullYear()

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: client }, { data: integrations }] = await Promise.all([
      supabase.from('clients').select('name').eq('id', clientId).single(),
      supabase.from('client_integrations').select('*').eq('client_id', clientId),
    ])

    setClientName(client?.name ?? '')

    const intList = (integrations ?? []) as Integration[]
    setGoogleInteg(intList.find(i => i.provider === 'google') ?? null)
    setIgInteg(intList.find(i => i.provider === 'instagram') ?? null)

    // Pré-preenche campo Ads se já tiver
    const goog = intList.find(i => i.provider === 'google')
    if (goog?.ads_customer_id) setAdsCustomerId(goog.ads_customer_id)

    setLoading(false)
  }, [clientId, supabase])

  useEffect(() => { loadData() }, [loadData])

  // Trata mensagens de sucesso/erro vindas do callback OAuth
  useEffect(() => {
    const sucesso = searchParams.get('sucesso')
    const erro    = searchParams.get('erro')
    if (sucesso) { showToast('success', sucesso); loadData() }
    if (erro)    { showToast('error', erro) }
  }, [searchParams, showToast, loadData])

  async function handleDisconnect(provider: 'google' | 'instagram') {
    await supabase
      .from('client_integrations')
      .update({ is_active: false, access_token: null, refresh_token: null })
      .eq('client_id', clientId)
      .eq('provider', provider)
    showToast('success', `${provider === 'google' ? 'Google' : 'Instagram'} desconectado.`)
    loadData()
  }

  async function handleSync(provider: 'google' | 'instagram') {
    const setSyncing = provider === 'google' ? setSyncingGoogle : setSyncingInstagram
    setSyncing(true)
    try {
      const res  = await fetch(`/api/sync/${clientId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mes, ano, provider }),
      })
      const data = await res.json()
      const msgs = Object.values(data.resultados ?? {}).join(' | ')
      const errs = Object.values(data.erros ?? {}).join(' | ')
      if (msgs) showToast('success', `Sincronizado: ${msgs}`)
      if (errs) showToast('error', `Erros: ${errs}`)
      loadData()
    } catch {
      showToast('error', 'Erro de conexão ao sincronizar.')
    } finally {
      setSyncing(false)
    }
  }

  async function handleSaveAdsCustomerId() {
    setSavingAds(true)
    await supabase
      .from('client_integrations')
      .update({ ads_customer_id: adsCustomerId.replace(/-/g, '') })
      .eq('client_id', clientId)
      .eq('provider', 'google')
    showToast('success', 'Customer ID salvo.')
    setSavingAds(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm" style={{ color: '#555' }}>Carregando...</span>
      </div>
    )
  }

  const googleConnectHref   = `/api/auth/connect/google?clientId=${clientId}`
  const instagramConnectHref = `/api/auth/connect/instagram?clientId=${clientId}`

  return (
    <div style={{ padding: '32px 40px', maxWidth: 820 }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
          style={{
            background:   toast.type === 'success' ? 'rgba(34,197,94,0.12)'  : 'rgba(239,68,68,0.12)',
            borderColor:  toast.type === 'success' ? 'rgba(34,197,94,0.25)'  : 'rgba(239,68,68,0.25)',
            color:        toast.type === 'success' ? '#22C55E'                : '#EF4444',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-3 block text-xs transition-opacity hover:opacity-70" style={{ color: '#555' }}>
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-white">{clientName}</h1>
        <p className="mt-1 text-sm" style={{ color: '#555' }}>
          Conexões OAuth — sincronização automática de métricas
        </p>
      </div>

      <div className="flex flex-col gap-4">

        {/* ── Google (GA4 + Search Console + Ads) ── */}
        <IntegrationCard
          title="Google Analytics & Search Console"
          subtitle="GA4 (sessões, usuários, pageviews) + SEO (posição, cliques orgânicos)"
          accentColor="#4285F4"
          connectHref={googleConnectHref}
          integration={googleInteg}
          onDisconnect={() => handleDisconnect('google')}
          onSync={() => handleSync('google')}
          syncing={syncingGoogle}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          }
        />

        {/* ── Google Ads ── */}
        <IntegrationCard
          title="Google Ads"
          subtitle="Impressões, cliques, CTR, CPC, investimento, conversões — usa a mesma conta Google acima"
          accentColor="#FBBC04"
          connectHref={googleConnectHref}
          integration={googleInteg}
          onDisconnect={() => handleDisconnect('google')}
          onSync={() => handleSync('google')}
          syncing={syncingGoogle}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2.428 17.01L8.61 6.55a3.32 3.32 0 015.76 0l6.183 10.46A3.32 3.32 0 0117.173 22H6.827a3.32 3.32 0 01-2.399-4.99z" fill="#FBBC04" />
              <circle cx="19" cy="7" r="3" fill="#4285F4" />
            </svg>
          }
          extraFields={
            googleInteg?.access_token ? (
              <div className="mt-4 flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#555' }}>
                    Customer ID da conta Ads (sem hifens)
                  </label>
                  <input
                    value={adsCustomerId}
                    onChange={e => setAdsCustomerId(e.target.value)}
                    placeholder="1234567890"
                    className="w-full rounded-xl border px-3 py-2 font-mono text-sm text-white outline-none"
                    style={{ background: '#181818', borderColor: '#252525' }}
                  />
                </div>
                <button
                  onClick={handleSaveAdsCustomerId}
                  disabled={savingAds || !adsCustomerId}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: '#252525', border: '1px solid #303030' }}
                >
                  {savingAds ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            ) : null
          }
        />

        {/* ── Instagram ── */}
        <IntegrationCard
          title="Instagram Analytics"
          subtitle="Seguidores, alcance, impressões, visitas ao perfil, engajamento"
          accentColor="#C084FC"
          connectHref={instagramConnectHref}
          integration={igInteg}
          onDisconnect={() => handleDisconnect('instagram')}
          onSync={() => handleSync('instagram')}
          syncing={syncingInstagram}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          }
        />

        {/* ── GBP — sem API ── */}
        <div className="rounded-2xl border p-5" style={{ background: '#0f0f0f', borderColor: '#1a1a1a' }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.12)' }}>
              📍
            </div>
            <div>
              <div className="mb-1 text-sm font-bold text-white">Google Business Profile</div>
              <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
                Visualizações no Maps, cliques em ligar/rota e avaliações.{' '}
                <span style={{ color: '#666' }}>
                  O Google não disponibiliza API pública para essas métricas operacionais do GBP —
                  continuam sendo inseridas manualmente na tela de métricas.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Nota sobre o Developer Token do Ads ── */}
        {googleInteg?.access_token && !googleInteg.ads_developer_token && (
          <div className="rounded-2xl border p-4 text-xs leading-relaxed" style={{ background: '#0f0f0f', borderColor: '#1a1a1a', color: '#666' }}>
            <span className="font-semibold text-yellow-500">⚠ Google Ads</span>{' '}
            Para sincronizar dados do Ads, o servidor precisa de um{' '}
            <strong className="text-white">Developer Token</strong> da plataforma LocalRise.
            Configure a variável <code className="rounded bg-white/5 px-1 py-0.5">GOOGLE_ADS_DEVELOPER_TOKEN</code> no servidor
            com o token obtido em <strong className="text-white">Google Ads → Ferramentas → API Center</strong>.
          </div>
        )}

      </div>
    </div>
  )
}

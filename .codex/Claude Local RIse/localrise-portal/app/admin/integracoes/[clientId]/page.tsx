'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FormState = {
  ga4_property_id: string
  ga4_access_token: string
  google_ads_customer_id: string
  google_ads_developer_token: string
  google_ads_refresh_token: string
  instagram_user_id: string
  instagram_access_token: string
}

function IntegrationField({
  label,
  value,
  placeholder,
  hint,
  textarea,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  hint?: string
  textarea?: boolean
  onChange: (value: string) => void
}) {
  const inputClass = 'w-full rounded-xl border px-3 py-2.5 font-mono text-sm text-white outline-none transition-all'
  const inputStyle = { background: '#181818', borderColor: '#222' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E31B23'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#222'
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#666' }}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {hint ? <p className="mt-1.5 text-xs" style={{ color: '#444' }}>{hint}</p> : null}
    </div>
  )
}

export default function IntegracoesClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clientName, setClientName] = useState('')
  const [form, setForm] = useState<FormState>({
    ga4_property_id: '',
    ga4_access_token: '',
    google_ads_customer_id: '',
    google_ads_developer_token: '',
    google_ads_refresh_token: '',
    instagram_user_id: '',
    instagram_access_token: '',
  })

  useEffect(() => {
    async function load() {
      const [{ data: client }, { data: integration }] = await Promise.all([
        supabase.from('clients').select('name').eq('id', clientId).single(),
        supabase.from('client_integrations').select('*').eq('client_id', clientId).single(),
      ])

      setClientName(client?.name ?? '')
      if (integration) {
        setForm({
          ga4_property_id: integration.ga4_property_id ?? '',
          ga4_access_token: integration.ga4_access_token ?? '',
          google_ads_customer_id: integration.google_ads_customer_id ?? '',
          google_ads_developer_token: integration.google_ads_developer_token ?? '',
          google_ads_refresh_token: integration.google_ads_refresh_token ?? '',
          instagram_user_id: integration.instagram_user_id ?? '',
          instagram_access_token: integration.instagram_access_token ?? '',
        })
      }

      setLoading(false)
    }

    load()
  }, [clientId, supabase])

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.from('client_integrations').upsert({ client_id: clientId, ...form }, { onConflict: 'client_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm" style={{ color: '#555' }}>Carregando...</span>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 780 }}>
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-3 block text-xs transition-opacity hover:opacity-70" style={{ color: '#555' }}>
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-white">{clientName}</h1>
        <p className="mt-1 text-sm" style={{ color: '#555' }}>
          Configure as integracoes para sincronizacao automatica de metricas
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Google Analytics 4</div>
              <div className="text-xs" style={{ color: '#555' }}>Sessoes, usuarios, pageviews, rejeicao, duracao</div>
            </div>
            {form.ga4_property_id ? (
              <span className="ml-auto rounded-lg border px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <IntegrationField
              label="Property ID"
              value={form.ga4_property_id}
              onChange={(value) => setField('ga4_property_id', value)}
              placeholder="123456789"
              hint="Google Analytics → Admin → Propriedade → ID da Propriedade"
            />
            <IntegrationField
              label="Access Token OAuth2"
              value={form.ga4_access_token}
              onChange={(value) => setField('ga4_access_token', value)}
              placeholder="ya29.a0AfH..."
              hint="Gere em developers.google.com/oauthplayground com escopo analytics.readonly"
              textarea
            />
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Instagram</div>
              <div className="text-xs" style={{ color: '#555' }}>Seguidores, alcance, impressoes, visitas ao perfil</div>
            </div>
            {form.instagram_access_token ? (
              <span className="ml-auto rounded-lg border px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <IntegrationField
              label="User ID"
              value={form.instagram_user_id}
              onChange={(value) => setField('instagram_user_id', value)}
              placeholder="17841400000000"
              hint="Meta for Developers → Graph API Explorer → GET /me?fields=id"
            />
            <IntegrationField
              label="Access Token (longa duracao)"
              value={form.instagram_access_token}
              onChange={(value) => setField('instagram_access_token', value)}
              placeholder="EAAxxxxxxxx..."
              hint="Permissoes instagram_basic e instagram_manage_insights"
              textarea
            />
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2.428 17.01L8.61 6.55a3.32 3.32 0 015.76 0l6.183 10.46A3.32 3.32 0 0117.173 22H6.827a3.32 3.32 0 01-2.399-4.99z" fill="#FBBC04" />
                <circle cx="19" cy="7" r="3" fill="#4285F4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Google Ads</div>
              <div className="text-xs" style={{ color: '#555' }}>Impressoes, cliques, CTR, CPC, investimento, conversoes</div>
            </div>
            {form.google_ads_customer_id && form.google_ads_developer_token ? (
              <span className="ml-auto rounded-lg border px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <IntegrationField
              label="Customer ID"
              value={form.google_ads_customer_id}
              onChange={(value) => setField('google_ads_customer_id', value)}
              placeholder="1234567890"
              hint="Google Ads → Configuracoes → ID da conta sem hifens"
            />
            <IntegrationField
              label="Developer Token"
              value={form.google_ads_developer_token}
              onChange={(value) => setField('google_ads_developer_token', value)}
              placeholder="ABcdEFghIJklMNop..."
              hint="Google Ads → Ferramentas → API Center"
            />
            <IntegrationField
              label="Refresh Token OAuth2"
              value={form.google_ads_refresh_token}
              onChange={(value) => setField('google_ads_refresh_token', value)}
              placeholder="1//0gxxxxxx..."
              hint="Gere via OAuth Playground com escopo adwords"
              textarea
            />
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: '#0f0f0f', borderColor: '#1a1a1a' }}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">i</span>
            <div>
              <div className="mb-1 text-sm font-semibold text-white">Google Business Profile</div>
              <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
                O Google nao disponibiliza API publica para visualizacoes, chamadas e rotas do GBP.
                Esses numeros continuam sendo preenchidos manualmente no painel de metricas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ color: '#555', borderColor: '#222' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#E31B23', flex: 2 }}
          >
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Integracoes'}
          </button>
        </div>
      </div>
    </div>
  )
}

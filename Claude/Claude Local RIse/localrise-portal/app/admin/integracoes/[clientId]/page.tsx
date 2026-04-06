'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function IntegracoesClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientName, setClientName] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
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
      const [{ data: client }, { data: integ }] = await Promise.all([
        supabase.from('clients').select('name').eq('id', clientId).single(),
        supabase.from('client_integrations').select('*').eq('client_id', clientId).single(),
      ])
      setClientName(client?.name ?? '')
      if (integ) {
        setForm({
          ga4_property_id: integ.ga4_property_id ?? '',
          ga4_access_token: integ.ga4_access_token ?? '',
          google_ads_customer_id: integ.google_ads_customer_id ?? '',
          google_ads_developer_token: integ.google_ads_developer_token ?? '',
          google_ads_refresh_token: integ.google_ads_refresh_token ?? '',
          instagram_user_id: integ.instagram_user_id ?? '',
          instagram_access_token: integ.instagram_access_token ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [clientId])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.from('client_integrations').upsert(
      { client_id: clientId, ...form },
      { onConflict: 'client_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border text-white text-sm outline-none transition-all font-mono"
  const inputStyle = { background: '#181818', borderColor: '#222' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#E31B23')
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#222')

  function Field({ label, field, placeholder, hint, textarea }: {
    label: string; field: string; placeholder: string; hint?: string; textarea?: boolean
  }) {
    const value = form[field as keyof typeof form]
    return (
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>{label}</label>
        {textarea ? (
          <textarea
            value={value}
            onChange={e => set(field, e.target.value)}
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
            onChange={e => set(field, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        )}
        {hint && <p className="text-xs mt-1.5" style={{ color: '#444' }}>{hint}</p>}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-sm" style={{ color: '#555' }}>Carregando...</span>
    </div>
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 780 }}>
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-xs mb-3 block transition-opacity hover:opacity-70" style={{ color: '#555' }}>
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-white">{clientName}</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>
          Configure as integrações para sincronização automática de métricas
        </p>
      </div>

      <div className="flex flex-col gap-5">

        {/* Google Analytics 4 */}
        <div className="rounded-2xl p-6 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Google Analytics 4</div>
              <div className="text-xs" style={{ color: '#555' }}>Sessões, usuários, pageviews, rejeição, duração</div>
            </div>
            {form.ga4_property_id && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Field
              label="Property ID"
              field="ga4_property_id"
              placeholder="123456789"
              hint="Google Analytics → Admin → Propriedade → ID da Propriedade"
            />
            <Field
              label="Access Token OAuth2"
              field="ga4_access_token"
              placeholder="ya29.a0AfH..."
              hint="Gere em: developers.google.com/oauthplayground → scope analytics.readonly → copie o access_token"
              textarea
            />
          </div>
        </div>

        {/* Instagram */}
        <div className="rounded-2xl p-6 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Instagram</div>
              <div className="text-xs" style={{ color: '#555' }}>Seguidores, alcance, impressões, visitas ao perfil</div>
            </div>
            {form.instagram_access_token && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Field
              label="User ID"
              field="instagram_user_id"
              placeholder="17841400000000"
              hint="Meta for Developers → Graph API Explorer → GET /me?fields=id → copie o id"
            />
            <Field
              label="Access Token (longa duração)"
              field="instagram_access_token"
              placeholder="EAAxxxxxxxx..."
              hint="Gere via Meta for Developers com permissões: instagram_basic, instagram_manage_insights. Token dura 60 dias."
              textarea
            />
          </div>
        </div>

        {/* Google Ads */}
        <div className="rounded-2xl p-6 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2.428 17.01L8.61 6.55a3.32 3.32 0 015.76 0l6.183 10.46A3.32 3.32 0 0117.173 22H6.827a3.32 3.32 0 01-2.399-4.99z" fill="#FBBC04"/>
                <circle cx="19" cy="7" r="3" fill="#4285F4"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Google Ads</div>
              <div className="text-xs" style={{ color: '#555' }}>Impressões, cliques, CTR, CPC, investimento, conversões</div>
            </div>
            {form.google_ads_customer_id && form.google_ads_developer_token && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.12)' }}>
                Configurado
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Field
              label="Customer ID"
              field="google_ads_customer_id"
              placeholder="1234567890"
              hint="Google Ads → Configurações → ID da conta (sem hífens)"
            />
            <Field
              label="Developer Token"
              field="google_ads_developer_token"
              placeholder="ABcdEFghIJklMNop..."
              hint="Google Ads → Ferramentas → API Center → Developer Token"
            />
            <Field
              label="Refresh Token OAuth2"
              field="google_ads_refresh_token"
              placeholder="1//0gxxxxxx..."
              hint="Gere via OAuth Playground com escopo: https://www.googleapis.com/auth/adwords"
              textarea
            />
          </div>
        </div>

        {/* Aviso GBP */}
        <div className="rounded-2xl p-5 border" style={{ background: '#0f0f0f', borderColor: '#1a1a1a' }}>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">ℹ️</span>
            <div>
              <div className="text-sm font-semibold text-white mb-1">Google Business Profile</div>
              <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
                O Google não disponibiliza API pública para dados de visualizações, chamadas e rotas do GBP.
                Esses números precisam ser inseridos manualmente no painel de métricas (leva menos de 2 minutos por cliente/mês).
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-white/5"
            style={{ color: '#555', borderColor: '#222' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-2 px-8 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#E31B23', flex: 2 }}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Integrações'}
          </button>
        </div>
      </div>
    </div>
  )
}

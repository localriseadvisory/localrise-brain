import { createClient } from '@/lib/supabase/server'
import { IconUsers, IconEye, IconActivity, IconStar, IconCheck, IconArrowRight } from '@/components/icons'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function InstagramIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

export default async function InstagramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('client_id').eq('id', user!.id).single()

  const clientId = profile?.client_id
  const anoAtual = new Date().getFullYear()

  const { data: historico } = await supabase
    .from('metrics_instagram')
    .select('*')
    .eq('client_id', clientId)
    .eq('ano', anoAtual)
    .order('mes', { ascending: true })

  const mesAtual = historico?.at(-1)
  const mesAnterior = historico?.at(-2)

  function delta(atual: number | null | undefined, anterior: number | null | undefined) {
    if (!atual || !anterior || anterior === 0) return null
    return (((atual - anterior) / anterior) * 100).toFixed(1)
  }

  function bar(value: number, max: number, color: string) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
    return (
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    )
  }

  function Delta({ d, invert = false }: { d: string | null; invert?: boolean }) {
    if (!d) return null
    const n = Number(d)
    const good = invert ? n <= 0 : n >= 0
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{
        background: good ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: good ? '#22C55E' : '#EF4444',
      }}>
        {n >= 0 ? '+' : ''}{d}%
      </span>
    )
  }

  const maxEngajamento = Math.max(
    mesAtual?.curtidas ?? 0,
    mesAtual?.comentarios ?? 0,
    mesAtual?.salvamentos ?? 0,
    1
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Instagram</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>Crescimento e engajamento do perfil — {anoAtual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { Icon: InstagramIcon, label: 'Seguidores', value: mesAtual?.seguidores, prev: mesAnterior?.seguidores, color: '#E1306C' },
          { Icon: Users2, label: 'Novos Seguidores', value: mesAtual?.novos_seguidores, prev: mesAnterior?.novos_seguidores, color: '#F59E0B' },
          { Icon: EyeIcon, label: 'Alcance', value: mesAtual?.alcance, prev: mesAnterior?.alcance, color: '#3B82F6' },
          { Icon: ActivityIcon, label: 'Taxa de Engajamento', value: mesAtual?.taxa_engajamento, prev: mesAnterior?.taxa_engajamento, color: '#22C55E', suffix: '%' },
        ].map(card => {
          const d = delta(card.value, card.prev)
          return (
            <div key={card.label} className="rounded-2xl p-5 border"
              style={{ background: '#111111', borderColor: '#1e1e1e', borderTop: `2px solid ${card.color}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: '#555' }}>{card.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                  <card.Icon size={13} color={card.color} />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {card.value != null ? card.value.toLocaleString('pt-BR') : '—'}
                {card.suffix && <span className="text-xl ml-0.5" style={{ color: card.color }}>{card.suffix}</span>}
              </div>
              <Delta d={d} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Engajamento */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-5">Engajamento do Mês</h2>
          <div className="flex flex-col gap-5">
            {[
              { label: 'Curtidas', value: mesAtual?.curtidas ?? 0, color: '#E1306C' },
              { label: 'Comentários', value: mesAtual?.comentarios ?? 0, color: '#F59E0B' },
              { label: 'Salvamentos', value: mesAtual?.salvamentos ?? 0, color: '#3B82F6' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span style={{ color: '#555' }}>{item.label}</span>
                  <span className="font-semibold text-white">{item.value.toLocaleString('pt-BR')}</span>
                </div>
                {bar(item.value, maxEngajamento, item.color)}
              </div>
            ))}
          </div>
        </div>

        {/* Alcance e visibilidade */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Visibilidade do Perfil</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Impressões', value: mesAtual?.impressoes?.toLocaleString('pt-BR') ?? '—' },
              { label: 'Alcance', value: mesAtual?.alcance?.toLocaleString('pt-BR') ?? '—' },
              { label: 'Visitas ao Perfil', value: mesAtual?.visitas_perfil?.toLocaleString('pt-BR') ?? '—' },
              { label: 'Posts no Mês', value: mesAtual?.posts?.toLocaleString('pt-BR') ?? '—' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-3 py-3 rounded-xl"
                style={{ background: '#181818' }}>
                <span className="text-sm" style={{ color: '#555' }}>{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico */}
      {historico && historico.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#1e1e1e' }}>
          <div className="px-5 py-4 border-b" style={{ background: '#181818', borderColor: '#1e1e1e' }}>
            <h2 className="text-sm font-semibold text-white">Histórico {anoAtual}</h2>
          </div>
          <table className="w-full text-sm" style={{ background: '#111111' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Mês', 'Seguidores', 'Novos', 'Posts', 'Alcance', 'Impressões', 'Curtidas', 'Engajamento'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((m, i) => {
                const prev = historico[i - 1]
                const d = delta(m.seguidores, prev?.seguidores)
                return (
                  <tr key={m.mes} style={{ borderBottom: '1px solid #181818' }} className="hover:bg-white/[0.015]">
                    <td className="px-4 py-3 font-semibold text-white">{MESES[m.mes - 1]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: '#E1306C' }}>{m.seguidores?.toLocaleString('pt-BR') ?? '—'}</span>
                        {d !== null && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{
                            background: Number(d) >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: Number(d) >= 0 ? '#22C55E' : '#EF4444',
                          }}>
                            {Number(d) >= 0 ? '+' : ''}{d}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#F59E0B' }}>
                      {m.novos_seguidores != null ? `+${m.novos_seguidores.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.posts ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.alcance?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.impressoes?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.curtidas?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#22C55E' }}>
                      {m.taxa_engajamento ? `${m.taxa_engajamento}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!historico || historico.length === 0) && (
        <div className="rounded-2xl p-16 border text-center" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#181818' }}>
            <InstagramIcon size={28} color="#333" />
          </div>
          <div className="text-white font-semibold mb-2">Nenhum dado ainda</div>
          <div className="text-sm" style={{ color: '#555' }}>A equipe LocalRise vai inserir seus dados em breve</div>
        </div>
      )}
    </div>
  )
}

// Inline icon helpers to avoid import issues with server component
function Users2({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
function EyeIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function ActivityIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}

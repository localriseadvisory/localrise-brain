import { createClient } from '@/lib/supabase/server'
import { IconMapPin, IconPhone, IconNavigation, IconGlobe, IconStar, IconEye } from '@/components/icons'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default async function GooglePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('client_id').eq('id', user!.id).single()

  const clientId = profile?.client_id
  const anoAtual = new Date().getFullYear()

  const { data: historico } = await supabase
    .from('metrics_gbp')
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

  const maxCliques = Math.max(mesAtual?.cliques_ligar ?? 0, mesAtual?.cliques_rota ?? 0, mesAtual?.cliques_site ?? 0, mesAtual?.novos_reviews ?? 0, 1)

  function Delta({ d }: { d: string | null }) {
    if (!d) return null
    const n = Number(d)
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{
        background: n >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: n >= 0 ? '#22C55E' : '#EF4444',
      }}>
        {n >= 0 ? '+' : ''}{d}%
      </span>
    )
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Google Business Profile</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>Visibilidade e interações no Google — {anoAtual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { Icon: IconEye, label: 'Visualizações Maps', value: mesAtual?.visualizacoes_maps, prev: mesAnterior?.visualizacoes_maps, color: '#E31B23' },
          { Icon: IconEye, label: 'Visualizações Busca', value: mesAtual?.visualizacoes_busca, prev: mesAnterior?.visualizacoes_busca, color: '#3B82F6' },
          { Icon: IconStar, label: 'Nota Google', value: mesAtual?.nota, prev: null, color: '#F59E0B', suffix: '★' },
          { Icon: IconStar, label: 'Total de Reviews', value: mesAtual?.total_reviews, prev: mesAnterior?.total_reviews, color: '#22C55E' },
        ].map(card => {
          const d = card.prev !== undefined ? delta(card.value, card.prev) : null
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
                {card.suffix && <span className="text-xl ml-1" style={{ color: card.color }}>{card.suffix}</span>}
              </div>
              <Delta d={d} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Interações */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-5">Interações do Mês</h2>
          <div className="flex flex-col gap-5">
            {[
              { Icon: IconPhone, label: 'Cliques para Ligar', value: mesAtual?.cliques_ligar ?? 0, color: '#E31B23' },
              { Icon: IconNavigation, label: 'Cliques em Rota', value: mesAtual?.cliques_rota ?? 0, color: '#3B82F6' },
              { Icon: IconGlobe, label: 'Cliques no Site', value: mesAtual?.cliques_site ?? 0, color: '#A855F7' },
              { Icon: IconStar, label: 'Novos Reviews', value: mesAtual?.novos_reviews ?? 0, color: '#F59E0B' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <item.Icon size={14} color={item.color} />
                    <span style={{ color: '#555' }}>{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value.toLocaleString('pt-BR')}</span>
                </div>
                {bar(item.value, maxCliques, item.color)}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-5">Avaliações Google</h2>
          {mesAtual?.nota ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-black" style={{ color: '#F59E0B' }}>
                  {mesAtual.nota.toFixed(1)}
                </div>
                <div>
                  <div style={{ color: '#F59E0B', fontSize: 20, letterSpacing: 2 }}>
                    {'★'.repeat(Math.round(mesAtual.nota))}{'☆'.repeat(5 - Math.round(mesAtual.nota))}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#555' }}>
                    {mesAtual.total_reviews} avaliações no total
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#181818' }}>
                <div className="text-xs mb-1" style={{ color: '#555' }}>Novos reviews este mês</div>
                <div className="text-2xl font-bold text-white">+{mesAtual.novos_reviews ?? 0}</div>
              </div>
            </>
          ) : (
            <div className="text-center py-10" style={{ color: '#555' }}>
              <div className="flex justify-center mb-3">
                <IconStar size={32} color="#333" />
              </div>
              <div className="text-sm">Dados não disponíveis</div>
            </div>
          )}
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
                {['Mês', 'Vis. Maps', 'Vis. Busca', 'Total Vis.', 'Ligar', 'Rota', 'Site', 'Nota', 'Reviews'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((m, i) => {
                const totalVis = (m.visualizacoes_maps ?? 0) + (m.visualizacoes_busca ?? 0)
                const prev = historico[i - 1]
                const prevTotal = prev ? (prev.visualizacoes_maps ?? 0) + (prev.visualizacoes_busca ?? 0) : null
                const d = delta(totalVis, prevTotal)
                return (
                  <tr key={m.mes} style={{ borderBottom: '1px solid #181818' }} className="hover:bg-white/[0.015]">
                    <td className="px-4 py-3 font-semibold text-white">{MESES[m.mes - 1]}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.visualizacoes_maps?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.visualizacoes_busca?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{totalVis.toLocaleString('pt-BR')}</span>
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
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cliques_ligar ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cliques_rota ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cliques_site ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#F59E0B' }}>{m.nota ? `${m.nota} ★` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.total_reviews ?? '—'}</td>
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
            <IconMapPin size={28} color="#333" />
          </div>
          <div className="text-white font-semibold mb-2">Nenhum dado ainda</div>
          <div className="text-sm" style={{ color: '#555' }}>A equipe LocalRise vai inserir seus dados em breve</div>
        </div>
      )}
    </div>
  )
}

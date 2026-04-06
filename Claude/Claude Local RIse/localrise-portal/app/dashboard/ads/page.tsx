import { createClient } from '@/lib/supabase/server'
import { IconTrendingUp, IconEye, IconActivity, IconCheck, IconDollarSign, IconTarget } from '@/components/icons'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default async function AdsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('client_id').eq('id', user!.id).single()

  const clientId = profile?.client_id
  const anoAtual = new Date().getFullYear()

  const { data: historico } = await supabase
    .from('metrics_ads')
    .select('*')
    .eq('client_id', clientId)
    .eq('ano', anoAtual)
    .order('mes', { ascending: true })

  const mesAtual = historico?.at(-1)
  const mesAnterior = historico?.at(-2)

  function delta(atual: number | null | undefined, anterior: number | null | undefined, invert = false) {
    if (!atual || !anterior || anterior === 0) return null
    const pct = (((atual - anterior) / anterior) * 100).toFixed(1)
    return { pct, isGood: invert ? Number(pct) <= 0 : Number(pct) >= 0 }
  }

  const totalInvestimento = historico?.reduce((s, m) => s + (m.investimento ?? 0), 0) ?? 0
  const totalConversoes = historico?.reduce((s, m) => s + (m.conversoes ?? 0), 0) ?? 0
  const cpaGeral = totalConversoes > 0 ? totalInvestimento / totalConversoes : 0

  function Delta({ d }: { d: ReturnType<typeof delta> }) {
    if (!d) return null
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{
        background: d.isGood ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: d.isGood ? '#22C55E' : '#EF4444',
      }}>
        {Number(d.pct) >= 0 ? '+' : ''}{d.pct}% vs mês anterior
      </span>
    )
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Google Ads</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>Performance das campanhas pagas — {anoAtual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { Icon: IconDollarSign, label: 'Investimento', value: mesAtual?.investimento ? `R$ ${mesAtual.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—', prev: mesAnterior?.investimento, cur: mesAtual?.investimento, color: '#A855F7', invert: false },
          { Icon: IconActivity, label: 'Cliques', value: mesAtual?.cliques?.toLocaleString('pt-BR') ?? '—', prev: mesAnterior?.cliques, cur: mesAtual?.cliques, color: '#3B82F6', invert: false },
          { Icon: IconCheck, label: 'Conversões', value: mesAtual?.conversoes?.toLocaleString('pt-BR') ?? '—', prev: mesAnterior?.conversoes, cur: mesAtual?.conversoes, color: '#22C55E', invert: false },
          { Icon: IconTarget, label: 'Custo por Conversão', value: mesAtual?.custo_por_conversao ? `R$ ${mesAtual.custo_por_conversao.toFixed(2)}` : '—', prev: mesAnterior?.custo_por_conversao, cur: mesAtual?.custo_por_conversao, color: '#E31B23', invert: true },
        ].map(card => {
          const d = delta(card.cur, card.prev, card.invert)
          return (
            <div key={card.label} className="rounded-2xl p-5 border"
              style={{ background: '#111111', borderColor: '#1e1e1e', borderTop: `2px solid ${card.color}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: '#555' }}>{card.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                  <card.Icon size={13} color={card.color} />
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-2">{card.value}</div>
              <Delta d={d} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Métricas de qualidade */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Qualidade da Campanha</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { Icon: IconEye, label: 'Impressões', value: mesAtual?.impressoes?.toLocaleString('pt-BR') ?? '—' },
              { Icon: IconActivity, label: 'CTR (Taxa de Clique)', value: mesAtual?.ctr ? `${mesAtual.ctr}%` : '—' },
              { Icon: IconDollarSign, label: 'CPC Médio', value: mesAtual?.cpc ? `R$ ${mesAtual.cpc.toFixed(2)}` : '—' },
              { Icon: IconCheck, label: 'Taxa de Conversão', value: mesAtual?.cliques && mesAtual?.conversoes ? `${((mesAtual.conversoes / mesAtual.cliques) * 100).toFixed(1)}%` : '—' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-3 py-3 rounded-xl"
                style={{ background: '#181818' }}>
                <div className="flex items-center gap-2.5">
                  <item.Icon size={14} color="#444" />
                  <span className="text-sm" style={{ color: '#555' }}>{item.label}</span>
                </div>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do ano */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Resumo do Ano {anoAtual}</h2>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl text-center" style={{ background: '#181818' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>Total Investido</div>
              <div className="text-3xl font-black" style={{ color: '#A855F7' }}>
                R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: '#181818' }}>
                <div className="text-xs mb-1" style={{ color: '#555' }}>Total Conversões</div>
                <div className="text-2xl font-bold" style={{ color: '#22C55E' }}>{totalConversoes}</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: '#181818' }}>
                <div className="text-xs mb-1" style={{ color: '#555' }}>CPA Médio Geral</div>
                <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                  {cpaGeral > 0 ? `R$ ${cpaGeral.toFixed(2)}` : '—'}
                </div>
              </div>
            </div>
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
                {['Mês', 'Investimento', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Conversões', 'CPA'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((m, i) => {
                const prev = historico[i - 1]
                const d = delta(m.conversoes, prev?.conversoes)
                return (
                  <tr key={m.mes} style={{ borderBottom: '1px solid #181818' }} className="hover:bg-white/[0.015]">
                    <td className="px-4 py-3 font-semibold text-white">{MESES[m.mes - 1]}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#A855F7' }}>
                      {m.investimento ? `R$ ${m.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.impressoes?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cliques?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.ctr ? `${m.ctr}%` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cpc ? `R$ ${m.cpc.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{ color: '#22C55E' }}>{m.conversoes ?? '—'}</span>
                        {d !== null && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{
                            background: d.isGood ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: d.isGood ? '#22C55E' : '#EF4444',
                          }}>
                            {Number(d.pct) >= 0 ? '+' : ''}{d.pct}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.custo_por_conversao ? `R$ ${m.custo_por_conversao.toFixed(2)}` : '—'}</td>
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
            <IconTrendingUp size={28} color="#333" />
          </div>
          <div className="text-white font-semibold mb-2">Nenhum dado ainda</div>
          <div className="text-sm" style={{ color: '#555' }}>A equipe LocalRise vai inserir seus dados em breve</div>
        </div>
      )}
    </div>
  )
}

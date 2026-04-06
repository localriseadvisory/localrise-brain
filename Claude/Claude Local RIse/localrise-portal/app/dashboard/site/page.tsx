import { createClient } from '@/lib/supabase/server'
import { IconGlobe, IconEye, IconActivity, IconSearch, IconTarget, IconZap } from '@/components/icons'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default async function SitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('client_id').eq('id', user!.id).single()

  const clientId = profile?.client_id
  const anoAtual = new Date().getFullYear()

  const { data: historico } = await supabase
    .from('metrics_site')
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

  function duracao(seg: number | null | undefined) {
    if (!seg) return '—'
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}m ${s}s`
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

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Desempenho do Site</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>Tráfego orgânico e comportamento dos visitantes — {anoAtual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { Icon: IconActivity, label: 'Sessões', value: mesAtual?.sessoes, prev: mesAnterior?.sessoes, color: '#3B82F6', invert: false },
          { Icon: IconEye, label: 'Usuários Únicos', value: mesAtual?.usuarios, prev: mesAnterior?.usuarios, color: '#22C55E', invert: false },
          { Icon: IconSearch, label: 'Cliques Orgânicos', value: mesAtual?.cliques_organicos, prev: mesAnterior?.cliques_organicos, color: '#F59E0B', invert: false },
          { Icon: IconTarget, label: 'Posição Média SEO', value: mesAtual?.posicao_media, prev: mesAnterior?.posicao_media, color: '#E31B23', invert: true },
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
              </div>
              <Delta d={d} invert={card.invert} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Comportamento */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Comportamento dos Visitantes</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { Icon: IconEye, label: 'Pageviews', value: mesAtual?.pageviews?.toLocaleString('pt-BR') ?? '—' },
              { Icon: IconZap, label: 'Duração Média', value: duracao(mesAtual?.duracao_media_seg) },
              { Icon: IconActivity, label: 'Taxa de Rejeição', value: mesAtual?.taxa_rejeicao ? `${mesAtual.taxa_rejeicao}%` : '—' },
              { Icon: IconTarget, label: 'Posição Média SEO', value: mesAtual?.posicao_media ? `#${mesAtual.posicao_media}` : '—' },
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

        {/* SEO */}
        <div className="rounded-2xl p-5 border" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <h2 className="text-sm font-semibold text-white mb-4">SEO Orgânico</h2>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl text-center" style={{ background: '#181818' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>Cliques na Busca Google</div>
              <div className="text-4xl font-black" style={{ color: '#3B82F6' }}>
                {mesAtual?.cliques_organicos?.toLocaleString('pt-BR') ?? '—'}
              </div>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: '#181818' }}>
              <div className="text-xs mb-1" style={{ color: '#555' }}>Impressões na Busca</div>
              <div className="text-4xl font-black" style={{ color: '#22C55E' }}>
                {mesAtual?.impressoes_organicas?.toLocaleString('pt-BR') ?? '—'}
              </div>
            </div>
            {mesAtual?.cliques_organicos && mesAtual?.impressoes_organicas && (
              <div className="p-3 rounded-xl" style={{ background: '#181818' }}>
                <div className="text-xs mb-1" style={{ color: '#555' }}>CTR Orgânico</div>
                <div className="text-xl font-bold text-white">
                  {((mesAtual.cliques_organicos / mesAtual.impressoes_organicas) * 100).toFixed(1)}%
                </div>
              </div>
            )}
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
                {['Mês', 'Sessões', 'Usuários', 'Pageviews', 'Rejeição', 'Duração', 'Posição SEO', 'Cliques Org.'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((m, i) => {
                const prev = historico[i - 1]
                const d = delta(m.sessoes, prev?.sessoes)
                return (
                  <tr key={m.mes} style={{ borderBottom: '1px solid #181818' }} className="hover:bg-white/[0.015]">
                    <td className="px-4 py-3 font-semibold text-white">{MESES[m.mes - 1]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{m.sessoes?.toLocaleString('pt-BR') ?? '—'}</span>
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
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.usuarios?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.pageviews?.toLocaleString('pt-BR') ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.taxa_rejeicao ? `${m.taxa_rejeicao}%` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{duracao(m.duracao_media_seg)}</td>
                    <td className="px-4 py-3" style={{ color: '#F59E0B' }}>{m.posicao_media ? `#${m.posicao_media}` : '—'}</td>
                    <td className="px-4 py-3" style={{ color: '#666' }}>{m.cliques_organicos?.toLocaleString('pt-BR') ?? '—'}</td>
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
            <IconGlobe size={28} color="#333" />
          </div>
          <div className="text-white font-semibold mb-2">Nenhum dado ainda</div>
          <div className="text-sm" style={{ color: '#555' }}>A equipe LocalRise vai inserir seus dados em breve</div>
        </div>
      )}
    </div>
  )
}

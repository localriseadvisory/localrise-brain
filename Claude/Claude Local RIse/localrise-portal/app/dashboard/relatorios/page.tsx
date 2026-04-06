import { createClient } from '@/lib/supabase/server'
import { IconFileText, IconDownload, IconCheck } from '@/components/icons'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('client_id').eq('id', user!.id).single()

  const { data: relatorios } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', profile?.client_id)
    .eq('publicado', true)
    .order('ano', { ascending: false })
    .order('mes', { ascending: false })

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Relatórios Mensais</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>
          Seus relatórios de desempenho elaborados pela equipe LocalRise
        </p>
      </div>

      {relatorios && relatorios.length > 0 ? (
        <div className="flex flex-col gap-3">
          {relatorios.map(r => (
            <div key={r.id} className="rounded-2xl p-6 border hover:border-white/10 transition-colors"
              style={{ background: '#111111', borderColor: '#1e1e1e' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(227,27,35,0.1)', color: '#E31B23', border: '1px solid rgba(227,27,35,0.15)' }}>
                      {MESES[r.mes - 1]} {r.ano}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-2">
                    {r.titulo || `Relatório ${MESES[r.mes - 1]} ${r.ano}`}
                  </h2>
                  {r.resumo && (
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: '#555' }}>{r.resumo}</p>
                  )}
                  {r.destaques && r.destaques.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {r.destaques.map((d: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="mt-0.5 flex-shrink-0">
                            <IconCheck size={13} color="#22C55E" />
                          </div>
                          <span style={{ color: '#666' }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {r.pdf_url && (
                  <a
                    href={r.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                    style={{ background: '#E31B23' }}
                  >
                    <IconDownload size={14} color="white" />
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl p-16 border text-center" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#181818' }}>
            <IconFileText size={28} color="#333" />
          </div>
          <div className="text-white font-semibold text-lg mb-2">Nenhum relatório ainda</div>
          <p className="text-sm max-w-xs mx-auto" style={{ color: '#555' }}>
            Seu primeiro relatório mensal será disponibilizado pela equipe LocalRise em breve.
          </p>
        </div>
      )}
    </div>
  )
}

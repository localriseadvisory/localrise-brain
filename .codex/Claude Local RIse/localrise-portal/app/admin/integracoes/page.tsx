import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function IntegracoesPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, nicho')
    .eq('status', 'ativo')
    .order('name', { ascending: true })

  const { data: integrations } = await supabase
    .from('client_integrations')
    .select('client_id, ga4_property_id, instagram_access_token, google_ads_customer_id, ultima_sincronizacao')

  const integMap = new Map(
    (integrations ?? []).map(i => [i.client_id, i])
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Integrações</h1>
        <p className="text-sm mt-1" style={{ color: '#555' }}>
          Configure as APIs de cada cliente para sincronização automática de métricas
        </p>
      </div>

      {/* Como funciona */}
      <div className="rounded-2xl p-5 border mb-6" style={{ background: '#0f0f0f', borderColor: '#1a1a1a' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#777' }}>COMO FUNCIONA</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '1', title: 'Configure uma vez', desc: 'Adicione o GA4 Property ID, token do Instagram e Ads ID do cliente' },
            { icon: '2', title: 'Clique em Sincronizar', desc: 'Na tela de métricas, selecione o mês e clique no botão verde' },
            { icon: '3', title: 'Dados preenchidos', desc: 'GA4, Instagram e Ads são preenchidos automaticamente. Só o GBP fica manual.' },
          ].map(item => (
            <div key={item.icon} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ background: '#E31B23' }}>
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-semibold text-white mb-1">{item.title}</div>
                <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {clients && clients.length > 0 ? (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#1e1e1e' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#181818', borderBottom: '1px solid #1e1e1e' }}>
                {['Cliente', 'GA4', 'Instagram', 'Google Ads', 'Última Sync', 'Ação'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const integ = integMap.get(client.id)
                const check = (val: string | null | undefined) => val
                  ? <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.12)' }}>✓</span>
                  : <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: '#181818', color: '#444', border: '1px solid #222' }}>—</span>

                const syncDate = integ?.ultima_sincronizacao
                  ? new Date(integ.ultima_sincronizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  : '—'

                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid #181818', background: '#111111' }}
                    className="hover:bg-white/[0.015] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{client.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#444' }}>{client.nicho ?? ''}</div>
                    </td>
                    <td className="px-4 py-3.5">{check(integ?.ga4_property_id)}</td>
                    <td className="px-4 py-3.5">{check(integ?.instagram_access_token)}</td>
                    <td className="px-4 py-3.5">{check(integ?.google_ads_customer_id)}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#555' }}>{syncDate}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/integracoes/${client.id}`}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                        style={{ background: '#181818', color: integ ? '#22C55E' : '#E31B23', border: '1px solid #1e1e1e' }}>
                        {integ ? '⚙ Editar' : '+ Configurar'}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl p-16 border text-center" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <p className="text-white font-semibold mb-2">Nenhum cliente ativo</p>
          <p className="text-sm" style={{ color: '#555' }}>Cadastre clientes primeiro em Clientes → Novo Cliente</p>
        </div>
      )}
    </div>
  )
}

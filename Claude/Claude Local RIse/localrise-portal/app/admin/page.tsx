import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { IconUsers, IconTrendingUp, IconCheck } from '@/components/icons'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  // Buscar quais clientes já têm integrações configuradas
  const { data: integrations } = await supabase
    .from('client_integrations')
    .select('client_id')
  const integrationSet = new Set((integrations ?? []).map((i: { client_id: string }) => i.client_id))

  const statusColor: Record<string, string> = {
    ativo: '#22C55E',
    pausado: '#F59E0B',
    cancelado: '#EF4444',
  }
  const planoColor: Record<string, string> = {
    essencial: '#666',
    profissional: '#3B82F6',
    elite: '#F59E0B',
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>
            {clients?.length ?? 0} cliente{(clients?.length ?? 0) !== 1 ? 's' : ''} cadastrado{(clients?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/clientes/novo"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#E31B23' }}>
          + Novo Cliente
        </Link>
      </div>

      {clients && clients.length > 0 ? (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#1e1e1e' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#181818', borderBottom: '1px solid #1e1e1e' }}>
                {['Nome', 'Nicho', 'Cidade', 'Plano', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#444' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ borderBottom: '1px solid #181818', background: '#111111' }}
                  className="hover:bg-white/[0.015] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{client.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#555' }}>{client.phone}</div>
                  </td>
                  <td className="px-4 py-3.5" style={{ color: '#555' }}>{client.nicho ?? '—'}</td>
                  <td className="px-4 py-3.5" style={{ color: '#555' }}>{client.cidade ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                      style={{
                        background: (planoColor[client.plano] ?? '#666') + '18',
                        color: planoColor[client.plano] ?? '#666',
                      }}>
                      {client.plano}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                      style={{
                        background: (statusColor[client.status] ?? '#666') + '18',
                        color: statusColor[client.status] ?? '#666',
                      }}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/metricas/${client.id}`}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                        style={{ background: '#181818', color: '#3B82F6', border: '1px solid #1e1e1e' }}>
                        <IconTrendingUp size={12} color="#3B82F6" />
                        Métricas
                      </Link>
                      <Link href={`/admin/integracoes/${client.id}`}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                        style={{
                          background: '#181818',
                          color: integrationSet.has(client.id) ? '#22C55E' : '#555',
                          border: '1px solid #1e1e1e',
                        }}>
                        <IconCheck size={12} color={integrationSet.has(client.id) ? '#22C55E' : '#555'} />
                        {integrationSet.has(client.id) ? 'Integrado' : 'Integrar'}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl p-16 border text-center" style={{ background: '#111111', borderColor: '#1e1e1e' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#181818' }}>
            <IconUsers size={28} color="#333" />
          </div>
          <div className="text-white font-semibold text-lg mb-2">Nenhum cliente ainda</div>
          <p className="text-sm mb-6" style={{ color: '#555' }}>Cadastre o primeiro cliente para começar</p>
          <Link href="/admin/clientes/novo"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#E31B23' }}>
            Cadastrar primeiro cliente
          </Link>
        </div>
      )}
    </div>
  )
}

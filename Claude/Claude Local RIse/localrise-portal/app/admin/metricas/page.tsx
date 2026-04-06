import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MetricasPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients').select('id, name, nicho, status').order('name')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Inserir Métricas</h1>
        <p className="text-sm mt-1" style={{ color: '#7a7a9a' }}>
          Selecione o cliente para inserir ou atualizar os dados do mês
        </p>
      </div>

      <div className="grid gap-3">
        {clients?.map(client => (
          <Link key={client.id} href={`/admin/metricas/${client.id}`}
            className="flex items-center justify-between p-4 rounded-2xl border transition-colors hover:border-purple-500/50"
            style={{ background: '#111118', borderColor: '#2a2a3a' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #6c63ff44, #00d4aa44)', border: '1px solid #2a2a3a' }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white">{client.name}</div>
                <div className="text-xs" style={{ color: '#7a7a9a' }}>{client.nicho ?? 'Sem nicho'}</div>
              </div>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#18181f', color: '#6c63ff' }}>
              Inserir dados →
            </span>
          </Link>
        ))}

        {(!clients || clients.length === 0) && (
          <div className="rounded-2xl p-16 border text-center" style={{ background: '#111118', borderColor: '#2a2a3a' }}>
            <div className="text-4xl mb-3">✏️</div>
            <div className="text-white font-semibold mb-2">Nenhum cliente cadastrado</div>
            <Link href="/admin/clientes/novo" className="text-sm underline" style={{ color: '#6c63ff' }}>
              Cadastrar primeiro cliente
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

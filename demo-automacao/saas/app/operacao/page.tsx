import { Factory, AlertTriangle, Clock, CheckCircle, Package } from 'lucide-react'
import { getOperations, getOrders, fmt, fmtDate } from '@/lib/api'
import PageHeader from '@/components/PageHeader'
import clsx from 'clsx'
import type { OperationItem, Order } from '@/lib/api'

const STAGES = [
  { key: 'queue',      label: 'Fila',       color: 'border-gray-300 bg-gray-50'     },
  { key: 'cutting',    label: 'Corte',      color: 'border-blue-300 bg-blue-50'     },
  { key: 'production', label: 'Produção',   color: 'border-purple-300 bg-purple-50' },
  { key: 'quality',    label: 'Qualidade',  color: 'border-yellow-300 bg-yellow-50' },
  { key: 'packing',    label: 'Embalagem',  color: 'border-orange-300 bg-orange-50' },
  { key: 'ready',      label: 'Pronto',     color: 'border-green-300 bg-green-50'   },
  { key: 'shipped',    label: 'Enviado',    color: 'border-teal-300 bg-teal-50'     },
]

function StageCount({ items, stage }: { items: OperationItem[]; stage: string }) {
  return items.filter(i => i.stage === stage).length
}

export default async function OperacaoPage() {
  const [ops_data, orders_data] = await Promise.all([getOperations(), getOrders()])

  const ops    = ops_data.items as OperationItem[]
  const orders = orders_data.items as Order[]

  const stuck    = ops.filter(o => o.is_stuck)
  const active   = ops.filter(o => !['shipped','delivered','cancelled'].includes(o.stage))
  const total_value = ops.reduce((s, o) => s + (o.order?.total_amount ?? 0), 0)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Operação & Produção"
        description="Kanban de pedidos, estágios e alertas operacionais"
        lastUpdated="ao vivo"
      />

      {/* ── Métricas operacionais ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Em produção',      value: active.length,         color: 'text-blue-700',  bg: 'bg-blue-50' },
          { label: 'Pedidos travados', value: stuck.length,          color: 'text-red-700',   bg: 'bg-red-50', warn: true },
          { label: 'Valor em aberto',  value: fmt(total_value),      color: 'text-gray-800',  bg: 'bg-gray-50' },
          { label: 'Total pedidos',    value: orders.length,         color: 'text-gray-800',  bg: 'bg-gray-50' },
        ].map(m => (
          <div key={m.label} className={clsx('card p-4 flex items-center gap-4', m.warn && stuck.length > 0 && 'border-red-200')}>
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', m.bg)}>
              {m.warn ? <AlertTriangle size={18} className="text-red-500" /> : <Factory size={18} className="text-gray-500" />}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{m.label}</p>
              <p className={clsx('text-xl font-bold', m.color)}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alerta de pedidos travados ──────────────────────────────── */}
      {stuck.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {stuck.length} pedido(s) travado(s) — sem atualização há mais de 48h
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {stuck.map(s => s.order?.shopify_order_id).join(', ')} — verificar com as equipes responsáveis
            </p>
          </div>
        </div>
      )}

      {/* ── Kanban por estágio ──────────────────────────────────────── */}
      <div className="card mb-5">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">Pipeline de Produção</h2>
        </div>
        <div className="card-body">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.map(stage => {
              const items = ops.filter(o => o.stage === stage.key)
              return (
                <div key={stage.key} className={clsx('flex-shrink-0 w-[180px] rounded-lg border-2 p-3', stage.color)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stage.label}</span>
                    <span className="bg-white text-gray-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map(op => (
                      <div
                        key={op.order_id}
                        className={clsx(
                          'bg-white rounded-lg p-2.5 shadow-sm border text-xs',
                          op.is_stuck ? 'border-red-300' : 'border-gray-200'
                        )}
                      >
                        {op.is_stuck && (
                          <div className="flex items-center gap-1 text-red-500 mb-1">
                            <AlertTriangle size={10} />
                            <span className="text-[10px] font-semibold">Travado {Math.round(op.hours_since_update)}h</span>
                          </div>
                        )}
                        <p className="font-semibold text-gray-800 truncate">{op.order?.shopify_order_id}</p>
                        <p className="text-gray-500 truncate mt-0.5">{op.order?.customer_name}</p>
                        <p className="text-gray-400 mt-1">{op.assigned_to || '—'}</p>
                        <p className="font-bold text-gray-700 mt-1.5">{fmt(op.order?.total_amount ?? 0)}</p>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-4 text-gray-300 text-xs">Vazio</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tabela detalhada ────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">Todos os pedidos</h2>
          <span className="text-xs text-gray-400">{orders.length} pedidos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Pedido', 'Cliente', 'Valor', 'Status', 'Pagamento', 'Data'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const op = ops.find(o => o.order_id === order.id)
                const STATUS_COLOR: Record<string,string> = {
                  pending:       'badge-warning',
                  in_production: 'badge-info',
                  shipped:       'badge-ok',
                  delivered:     'badge-ok',
                }
                const STATUS_LABEL: Record<string,string> = {
                  pending:       'Pendente',
                  in_production: 'Produção',
                  shipped:       'Enviado',
                  delivered:     'Entregue',
                }
                return (
                  <tr key={order.id} className="table-row-hover border-b border-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={13} className="text-gray-400" />
                        <span className="font-mono text-xs text-gray-700">{order.shopify_order_id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700 max-w-[140px] truncate">{order.customer_name}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-gray-800">{fmt(order.total_amount)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={STATUS_COLOR[order.status] || 'badge-info'}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                        {op?.is_stuck && <AlertTriangle size={11} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={order.payment_status === 'paid' ? 'badge-ok' : 'badge-warning'}>
                        {order.payment_status === 'paid' ? '✓ Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{fmtDate(order.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

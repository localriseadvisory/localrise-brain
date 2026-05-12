import { Truck, AlertTriangle, CheckCircle, Clock, MapPin, Package } from 'lucide-react'
import { getLogistics } from '@/lib/api'
import PageHeader from '@/components/PageHeader'
import clsx from 'clsx'
import type { LogisticsItem } from '@/lib/api'

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  posted:            { label: 'Postado',         cls: 'badge-info',     dot: 'bg-blue-400'   },
  in_transit:        { label: 'Em trânsito',      cls: 'badge-info',     dot: 'bg-blue-500'   },
  out_for_delivery:  { label: 'Saiu p/ entrega', cls: 'badge-warning',  dot: 'bg-amber-500'  },
  delivered:         { label: 'Entregue',         cls: 'badge-ok',       dot: 'bg-green-500'  },
  exception:         { label: 'Exceção',          cls: 'badge-critical', dot: 'bg-red-500'    },
  returned:          { label: 'Devolvido',        cls: 'badge-critical', dot: 'bg-red-400'    },
  waiting_production:{ label: 'Aguard. produção', cls: 'badge-info',     dot: 'bg-gray-400'   },
}

function EventDot({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status]
  return <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg?.dot || 'bg-gray-300')} />
}

export default async function LogisticaPage() {
  const data       = await getLogistics()
  const items      = data.items as LogisticsItem[]
  const exceptions = items.filter(i => i.is_exception)
  const in_transit = items.filter(i => !i.is_exception && i.latest_status !== 'delivered')
  const delivered  = items.filter(i => i.latest_status === 'delivered')

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Logística"
        description="Rastreamento em tempo real — Fontes Log"
        lastUpdated="ao vivo"
      />

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Em trânsito',  count: in_transit.length,  Icon: Truck,         color: 'text-blue-600',  bg: 'bg-blue-50'  },
          { label: 'Exceções',     count: exceptions.length,  Icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50',  warn: true },
          { label: 'Entregues',    count: delivered.length,   Icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50' },
        ].map(m => (
          <div key={m.label} className={clsx('card p-4 flex items-center gap-4', m.warn && m.count > 0 && 'border-red-200')}>
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', m.bg)}>
              <m.Icon size={18} className={m.color} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{m.label}</p>
              <p className={clsx('text-2xl font-bold', m.color)}>{m.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerta de exceções */}
      {exceptions.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">{exceptions.length} envio(s) em exceção</p>
            <p className="text-xs text-red-600 mt-0.5">
              {exceptions.map(e => e.tracking).join(', ')} — contatar transportadora imediatamente
            </p>
          </div>
        </div>
      )}

      {/* Cards de envios */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {items.map((item) => {
          const cfg     = STATUS_CONFIG[item.latest_status] || STATUS_CONFIG.in_transit
          const events  = item.events || []
          const lastEvt = events[events.length - 1]

          return (
            <div
              key={item.order_ref || item.tracking}
              className={clsx(
                'card',
                item.is_exception && 'border-red-200 ring-1 ring-red-200'
              )}
            >
              {/* Card header */}
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    item.is_exception ? 'bg-red-50' : 'bg-blue-50'
                  )}>
                    <Truck size={16} className={item.is_exception ? 'text-red-500' : 'text-blue-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.order_ref || '—'}</p>
                    <p className="text-xs text-gray-400">{item.customer}</p>
                  </div>
                </div>
                <span className={cfg.cls}>{cfg.label}</span>
              </div>

              {/* Card body */}
              <div className="card-body space-y-3">
                {/* Tracking + localização */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Package size={12} />
                    <span className="font-mono">{item.tracking || '—'}</span>
                  </div>
                  {item.latest_location && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={12} />
                      <span>{item.latest_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Truck size={12} />
                    <span className="capitalize">{item.carrier?.replace('_',' ')}</span>
                  </div>
                </div>

                {/* Linha do tempo de eventos */}
                {events.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Histórico</p>
                    {events.map((evt, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-0.5">
                          <EventDot status={evt.status} />
                          {i < events.length - 1 && (
                            <div className="w-px flex-1 bg-gray-200 my-1 min-h-[12px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {STATUS_CONFIG[evt.status]?.label || evt.status}
                            </span>
                            {evt.location && (
                              <span className="text-[11px] text-gray-400">· {evt.location}</span>
                            )}
                          </div>
                          {(evt as any).note && (
                            <p className="text-[11px] text-red-600 mt-0.5">{(evt as any).note}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(evt.timestamp).toLocaleString('pt-BR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exceção destacada */}
                {item.is_exception && lastEvt && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
                    <AlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-red-700">
                      <p className="font-semibold">Ação necessária</p>
                      <p className="mt-0.5">{(lastEvt as any).note || 'Verificar junto à transportadora'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

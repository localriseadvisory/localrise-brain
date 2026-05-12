'use client'

import { useState } from 'react'
import {
  Bell, AlertCircle, AlertTriangle, Info,
  CheckCheck, Filter, RefreshCw
} from 'lucide-react'
import { MOCK } from '@/lib/mock-data'
import clsx from 'clsx'

type Severity = 'all' | 'critical' | 'warning' | 'info'
type AlertType = 'all' | 'payment_due' | 'insufficient_balance' | 'overdue_receivable'
               | 'order_stuck' | 'cost_anomaly' | 'logistics_exception' | 'payment_mismatch'

const SEVERITY_CONFIG = {
  critical: { Icon: AlertCircle,   bg: 'bg-red-50',    border: 'border-red-200',   icon: 'text-red-500',  badge: 'badge-critical', label: 'Crítico' },
  warning:  { Icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200', icon: 'text-amber-500',badge: 'badge-warning',  label: 'Atenção'  },
  info:     { Icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',  icon: 'text-blue-400', badge: 'badge-info',    label: 'Info'     },
}

const TYPE_LABELS: Record<string, string> = {
  payment_due:           'Vencimento',
  insufficient_balance:  'Saldo insuficiente',
  overdue_receivable:    'Inadimplência',
  order_stuck:           'Pedido travado',
  cost_anomaly:          'Anomalia de custo',
  logistics_exception:   'Logística',
  payment_mismatch:      'Descasamento',
}

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  if (h < 1)  return 'Agora há pouco'
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h/24)}d atrás`
}

export default function AlertasPage() {
  const [severity, setSeverity] = useState<Severity>('all')
  const [type, setType]         = useState<AlertType>('all')
  const [acked, setAcked]       = useState<Set<string>>(new Set())

  const all_alerts = MOCK.alerts.items

  const filtered = all_alerts.filter(a => {
    if (acked.has(a.id)) return false
    if (severity !== 'all' && a.severity !== severity) return false
    if (type !== 'all' && a.type !== type) return false
    return true
  })

  const counts = {
    critical: all_alerts.filter(a => a.severity === 'critical' && !acked.has(a.id)).length,
    warning:  all_alerts.filter(a => a.severity === 'warning'  && !acked.has(a.id)).length,
    info:     all_alerts.filter(a => a.severity === 'info'     && !acked.has(a.id)).length,
  }

  function ack(id: string) { setAcked(prev => new Set([...prev, id])) }
  function ackAll()        { setAcked(new Set(all_alerts.map(a => a.id))) }

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Central de Alertas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitoramento inteligente — gerado automaticamente pela engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={ackAll}
            className="btn-ghost text-xs"
          >
            <CheckCheck size={13} /> Reconhecer todos
          </button>
          <button className="btn-ghost text-xs">
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['critical','warning','info'] as const).map(sev => {
          const c = SEVERITY_CONFIG[sev]
          return (
            <button
              key={sev}
              onClick={() => setSeverity(severity === sev ? 'all' : sev)}
              className={clsx(
                'card p-4 text-left transition-all',
                severity === sev ? `ring-2 ring-offset-1 ${sev === 'critical' ? 'ring-red-400' : sev === 'warning' ? 'ring-amber-400' : 'ring-blue-400'}` : '',
                counts[sev] === 0 ? 'opacity-50' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <c.Icon size={18} className={c.icon} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{counts[sev]}</p>
                  <p className="text-xs text-gray-400">{c.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filtros de tipo */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={13} className="text-gray-400" />
        {(['all', ...Object.keys(TYPE_LABELS)] as AlertType[]).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              type === t
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t === 'all' ? 'Todos' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center py-16 text-gray-400">
            <Bell size={32} className="mb-3 text-gray-200" />
            <p className="font-medium">Nenhum alerta para mostrar</p>
            <p className="text-xs mt-1">Tente ajustar os filtros</p>
          </div>
        ) : (
          filtered.map(alert => {
            const c = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info
            return (
              <div
                key={alert.id}
                className={clsx('rounded-xl border p-4 flex items-start gap-4 transition-all', c.bg, c.border)}
              >
                <c.Icon size={18} className={clsx('flex-shrink-0 mt-0.5', c.icon)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 flex-1">{alert.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={c.badge}>{c.label}</span>
                      <span className="badge-info">{TYPE_LABELS[alert.type] || alert.type}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] text-gray-400">{timeAgo(alert.triggered_at)}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">Engine automática</span>
                  </div>
                </div>
                <button
                  onClick={() => ack(alert.id)}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors flex items-center gap-1"
                  title="Reconhecer alerta"
                >
                  <CheckCheck size={13} /> OK
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Rodapé info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-400 flex items-center gap-2">
        <Bell size={12} />
        <span>
          Alertas gerados automaticamente pela engine de monitoramento. Execução a cada 30 min.
          Alertas críticos são enviados por WhatsApp e email imediatamente.
        </span>
      </div>
    </div>
  )
}

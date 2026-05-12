'use client'

import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import type { Alert } from '@/lib/api'

const ICON_MAP = {
  critical: { Icon: AlertCircle,   cls: 'text-red-500',  bg: 'bg-red-50',    border: 'border-red-100' },
  warning:  { Icon: AlertTriangle, cls: 'text-amber-500',bg: 'bg-amber-50',  border: 'border-amber-100' },
  info:     { Icon: Info,          cls: 'text-blue-400', bg: 'bg-blue-50',   border: 'border-blue-100' },
}

interface Props {
  alerts:    Alert[]
  compact?:  boolean
  onAck?:    (id: string) => void
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h    = Math.floor(diff / 3600000)
  if (h < 1)  return 'Agora'
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h/24)}d atrás`
}

export default function AlertsPanel({ alerts, compact = false, onAck }: Props) {
  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <CheckCircle size={32} className="mb-2 text-green-400" />
        <p className="text-sm font-medium">Nenhum alerta ativo</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map(alert => {
        const { Icon, cls, bg, border } = ICON_MAP[alert.severity] || ICON_MAP.info
        return (
          <div
            key={alert.id}
            className={clsx('flex items-start gap-3 p-3 rounded-lg border', bg, border)}
          >
            <Icon size={16} className={clsx('mt-0.5 flex-shrink-0', cls)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug">{alert.title}</p>
              {!compact && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.message}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">{timeAgo(alert.triggered_at)}</p>
            </div>
            {onAck && (
              <button
                onClick={() => onAck(alert.id)}
                className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                title="Reconhecer"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

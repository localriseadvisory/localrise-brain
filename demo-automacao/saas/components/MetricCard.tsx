import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label:      string
  value:      string
  sub?:       string
  icon:       LucideIcon
  trend?:     'up' | 'down' | 'neutral'
  trendText?: string
  variant?:   'default' | 'critical' | 'warning' | 'success'
}

const variants = {
  default:  { icon: 'bg-blue-50 text-blue-600',   border: '', label: 'text-gray-500', value: 'text-gray-900' },
  critical: { icon: 'bg-red-50 text-red-600',     border: 'border-red-200 bg-red-50/30', label: 'text-red-600', value: 'text-red-700' },
  warning:  { icon: 'bg-amber-50 text-amber-600', border: 'border-amber-200 bg-amber-50/30', label: 'text-amber-600', value: 'text-amber-700' },
  success:  { icon: 'bg-green-50 text-green-600', border: '', label: 'text-gray-500', value: 'text-gray-900' },
}

export default function MetricCard({
  label, value, sub, icon: Icon, trend, trendText, variant = 'default',
}: MetricCardProps) {
  const v = variants[variant]
  return (
    <div className={clsx('card p-5 flex items-start gap-4', v.border)}>
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', v.icon)}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-xs font-medium uppercase tracking-wide', v.label)}>{label}</p>
        <p className={clsx('text-2xl font-bold mt-0.5 leading-tight', v.value)}>{value}</p>
        {(sub || trendText) && (
          <p className={clsx(
            'text-xs mt-1',
            trend === 'up'   ? 'text-green-600' :
            trend === 'down' ? 'text-red-500'   : 'text-gray-400'
          )}>
            {trendText || sub}
          </p>
        )}
      </div>
    </div>
  )
}

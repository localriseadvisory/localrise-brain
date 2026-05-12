import { RefreshCw } from 'lucide-react'

interface Props {
  title:       string
  description: string
  lastUpdated?: string
  action?:     React.ReactNode
}

export default function PageHeader({ title, description, lastUpdated, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <RefreshCw size={11} />
            <span>Atualizado {lastUpdated}</span>
          </div>
        )}
        {action}
      </div>
    </div>
  )
}

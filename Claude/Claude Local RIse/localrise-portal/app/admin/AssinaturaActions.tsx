'use client'

import { useState } from 'react'

interface Props {
  clientId: string
  clientName: string
  statusAtual: string | null
}

export function AssinaturaActions({ clientId, clientName, statusAtual }: Props) {
  const [loading, setLoading] = useState<'ativar' | 'cancelar' | null>(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function handleAction(action: 'ativar' | 'cancelar') {
    const confirmText = action === 'cancelar'
      ? `Cancelar assinatura de "${clientName}"? Isso revogará o acesso imediatamente.`
      : `Ativar manualmente por 30 dias para "${clientName}"?`

    if (!confirm(confirmText)) return

    setLoading(action)
    setMsg('')
    setError('')

    try {
      const res = await fetch(`/api/admin/assinatura/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao executar ação.')
      } else {
        setMsg(data.message ?? 'Feito.')
        // Refresh da página para atualizar a tabela
        setTimeout(() => window.location.reload(), 1200)
      }
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {statusAtual !== 'ativa' && (
          <button
            onClick={() => handleAction('ativar')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            {loading === 'ativar' ? '...' : '✓ Ativar'}
          </button>
        )}

        {statusAtual !== 'cancelada' && (
          <button
            onClick={() => handleAction('cancelar')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            {loading === 'cancelar' ? '...' : '✕ Cancelar'}
          </button>
        )}
      </div>

      {msg && <p className="text-xs" style={{ color: '#22C55E' }}>{msg}</p>}
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  )
}

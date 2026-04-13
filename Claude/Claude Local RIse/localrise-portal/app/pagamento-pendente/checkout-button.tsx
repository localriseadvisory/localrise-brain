'use client'

import { useState } from 'react'

export function CheckoutButton({ clienteId }: { clienteId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Erro ao iniciar pagamento.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full max-w-xs rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: '#E31B23', padding: '15px 28px', letterSpacing: '-0.01em' }}
      >
        {loading ? 'Redirecionando...' : 'Renovar assinatura'}
      </button>

      {error && (
        <p className="text-xs text-center" style={{ color: '#EF4444' }}>{error}</p>
      )}
    </div>
  )
}

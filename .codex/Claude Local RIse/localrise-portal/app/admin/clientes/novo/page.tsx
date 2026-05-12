'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NovoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', nicho: '', cidade: '', phone: '', site: '', instagram: '',
    plano: 'essencial', valor_mensalidade: '', email_acesso: '', senha_acesso: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Criar cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: form.name,
          nicho: form.nicho || null,
          cidade: form.cidade || null,
          phone: form.phone || null,
          site: form.site || null,
          instagram: form.instagram || null,
          plano: form.plano,
          valor_mensalidade: form.valor_mensalidade ? parseFloat(form.valor_mensalidade) : null,
        })
        .select()
        .single()

      if (clientError) throw clientError

      // 2. Criar usuário de acesso via API route
      const res = await fetch('/api/admin/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email_acesso,
          password: form.senha_acesso,
          full_name: form.name,
          client_id: client.id,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro ao criar usuário')

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message ?? JSON.stringify(err)
      setError(msg || 'Erro inesperado')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border text-white text-sm outline-none transition-colors focus:border-purple-500"
  const inputStyle = { background: '#18181f', borderColor: '#2a2a3a' }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Cliente</h1>
        <p className="text-sm mt-1" style={{ color: '#7a7a9a' }}>
          Cadastre o cliente e crie o acesso ao portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Dados do negócio */}
        <div className="rounded-2xl p-6 border" style={{ background: '#111118', borderColor: '#2a2a3a' }}>
          <h2 className="text-sm font-semibold text-white mb-4">📋 Dados do Negócio</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Nome do Negócio *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                placeholder="Ex: Restaurante Sabor da Terra" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Nicho</label>
              <select value={form.nicho} onChange={e => set('nicho', e.target.value)}
                className={inputClass} style={inputStyle}>
                <option value="">Selecionar...</option>
                {['Restaurante', 'Clínica', 'Salão', 'Academia', 'Comércio', 'Serviço', 'Outro'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Cidade</label>
              <input value={form.cidade} onChange={e => set('cidade', e.target.value)}
                placeholder="Ex: São Paulo - SP" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Telefone / WhatsApp</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="11999998888" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Site</label>
              <input value={form.site} onChange={e => set('site', e.target.value)}
                placeholder="www.restaurante.com.br" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Instagram</label>
              <input value={form.instagram} onChange={e => set('instagram', e.target.value)}
                placeholder="@restaurante" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Plano</label>
              <select value={form.plano} onChange={e => set('plano', e.target.value)}
                className={inputClass} style={inputStyle}>
                <option value="essencial">Essencial</option>
                <option value="profissional">Profissional</option>
                <option value="elite">Elite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Mensalidade (R$)</label>
              <input type="number" value={form.valor_mensalidade} onChange={e => set('valor_mensalidade', e.target.value)}
                placeholder="1500" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Acesso ao portal */}
        <div className="rounded-2xl p-6 border" style={{ background: '#111118', borderColor: '#2a2a3a' }}>
          <h2 className="text-sm font-semibold text-white mb-1">🔑 Acesso ao Portal</h2>
          <p className="text-xs mb-4" style={{ color: '#7a7a9a' }}>
            Email e senha que o cliente usará para entrar
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Email de acesso *</label>
              <input type="email" value={form.email_acesso} onChange={e => set('email_acesso', e.target.value)}
                required placeholder="cliente@email.com" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a9a' }}>Senha inicial *</label>
              <input type="text" value={form.senha_acesso} onChange={e => set('senha_acesso', e.target.value)}
                required placeholder="Mínimo 8 caracteres" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: '#3a3a5a' }}>
            Envie estas credenciais ao cliente pelo WhatsApp após o cadastro
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-white/5"
            style={{ color: '#7a7a9a', borderColor: '#2a2a3a' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4aa)' }}>
            {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}

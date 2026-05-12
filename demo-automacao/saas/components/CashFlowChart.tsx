'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { CashFlowDay } from '@/lib/api'

interface Props {
  data: CashFlowDay[]
}

function fmtK(v: number) {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`
  return `R$${v}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = new Date(label + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-gray-700 mb-2">{d}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-semibold text-gray-800">
            {Number(p.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CashFlowChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:      d.date,
    Entradas:  d.income,
    Saídas:    d.expenses,
    'Saldo':   d.closing,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={v => new Date(v + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          tickLine={false} axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={fmtK}
          tickLine={false} axisLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
        <Bar dataKey="Entradas" fill="#22c55e" radius={[3,3,0,0]} maxBarSize={28} />
        <Bar dataKey="Saídas"   fill="#f87171" radius={[3,3,0,0]} maxBarSize={28} />
        <Line
          dataKey="Saldo" type="monotone" stroke="#2563eb"
          strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

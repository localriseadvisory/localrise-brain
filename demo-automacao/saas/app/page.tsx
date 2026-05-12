import {
  Wallet, TrendingUp, TrendingDown, Bell, ShoppingBag,
  ArrowRight, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import {
  getDashboard, getCashFlow, fmt, fmtDate, daysUntil, urgencyLabel
} from '@/lib/api'
import MetricCard    from '@/components/MetricCard'
import CashFlowChart from '@/components/CashFlowChart'
import AlertsPanel   from '@/components/AlertsPanel'
import PageHeader    from '@/components/PageHeader'
import type { CashFlowDay, AccountPayable } from '@/lib/api'

export default async function DashboardPage() {
  const [dash, cf] = await Promise.all([getDashboard(), getCashFlow(12)])

  const cashflow_days = (cf as any).projection as CashFlowDay[]
  const kpis          = dash.kpis as any
  const alerts        = (dash.alerts as any).items?.slice(0, 4) ?? []
  const payables      = (dash.upcoming_payments as AccountPayable[])?.slice(0, 5) ?? []
  const summary       = dash.orders_summary as any
  const balance       = dash.current_balance as number

  const hasRisk = cashflow_days.some((d: CashFlowDay) => d.closing < 10000)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        description="Visão geral em tempo real — Abril/2026"
        lastUpdated="hoje às 07:00"
      />

      {/* ── Métricas principais ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Saldo em Caixa"
          value={fmt(balance)}
          icon={Wallet}
          sub="Atualizado automaticamente"
          variant={balance < 10000 ? 'warning' : 'success'}
        />
        <MetricCard
          label="Receita Projetada"
          value={fmt(kpis?.total_revenue_projected ?? 0)}
          icon={TrendingUp}
          trendText={`${fmt(kpis?.total_revenue_received ?? 0)} recebido`}
          trend="up"
        />
        <MetricCard
          label="Despesas Pendentes"
          value={fmt(kpis?.total_expenses_projected ?? 0)}
          icon={TrendingDown}
          trendText={`${fmt(kpis?.total_expenses_paid ?? 0)} pago`}
          trend="down"
          variant="warning"
        />
        <MetricCard
          label="Alertas Ativos"
          value={String(kpis?.active_alerts ?? 0)}
          icon={Bell}
          trendText={`${kpis?.critical_alerts ?? 0} crítico(s)`}
          trend="down"
          variant={kpis?.critical_alerts > 0 ? 'critical' : 'default'}
        />
      </div>

      {/* ── Linha 2: Fluxo de Caixa + Alertas ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Gráfico de caixa */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Fluxo de Caixa — próximos dias</h2>
              <p className="text-xs text-gray-400 mt-0.5">Entradas, saídas e saldo projetado</p>
            </div>
            {hasRisk && (
              <span className="badge-warning">
                <AlertTriangle size={11} /> Atenção no período
              </span>
            )}
          </div>
          <div className="card-body">
            <CashFlowChart data={cashflow_days} />
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
              {[
                { label: 'Total entradas', value: fmt(cashflow_days.reduce((s,d)=>s+d.income,0)),   color: 'text-green-600' },
                { label: 'Total saídas',   value: fmt(cashflow_days.reduce((s,d)=>s+d.expenses,0)), color: 'text-red-500' },
                { label: 'Saldo final',    value: fmt(cashflow_days[cashflow_days.length-1]?.closing??0), color: 'text-blue-600 font-bold' },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-[11px] text-gray-400">{m.label}</p>
                  <p className={`text-sm font-semibold ${m.color}`}>{m.value}</p>
                </div>
              ))}
              <Link href="/financeiro" className="ml-auto btn-ghost text-xs">
                Ver completo <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Alertas recentes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Alertas recentes</h2>
            <Link href="/alertas" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="card-body">
            <AlertsPanel alerts={alerts} compact />
          </div>
        </div>
      </div>

      {/* ── Linha 3: Pedidos + Contas a Pagar ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Status de pedidos */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Pedidos — status</h2>
            <Link href="/operacao" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver operação <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Pendentes',    count: summary?.pending ?? 0,       color: 'bg-gray-100 text-gray-700' },
                { label: 'Em produção', count: summary?.in_production ?? 0, color: 'bg-blue-100 text-blue-700' },
                { label: 'Enviados',    count: summary?.shipped ?? 0,        color: 'bg-green-100 text-green-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                  <p className="text-2xl font-bold">{s.count}</p>
                  <p className="text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mini tabela de pedidos */}
            <div className="space-y-2">
              {[
                { ref: 'SHP-2026-4421', client: 'João Ferreira',          value: 1890.00,  stage: 'Produção',  ok: true  },
                { ref: 'SHP-2026-4410', client: 'Escola Jardim Flor',     value: 12600.00, stage: '⚠ Travado', ok: false },
                { ref: 'SHP-2026-4390', client: 'Hotel Imperial',          value: 8900.00,  stage: '⚠ Travado', ok: false },
              ].map(p => (
                <div key={p.ref} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <ShoppingBag size={14} className={p.ok ? 'text-blue-400' : 'text-red-400'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.client}</p>
                    <p className="text-[11px] text-gray-400">{p.ref}</p>
                  </div>
                  <span className={`text-xs font-medium ${p.ok ? 'text-blue-600' : 'text-red-600'}`}>
                    {p.stage}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">{fmt(p.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contas a pagar urgentes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Contas a pagar — próximos 7 dias</h2>
            <Link href="/financeiro" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-2.5">
              {payables.map((ap: AccountPayable) => {
                const days = daysUntil(ap.due_date)
                const urg  = urgencyLabel(days)
                return (
                  <div key={ap.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{ap.description}</p>
                      <p className="text-[11px] text-gray-400">{ap.supplier_name} · {fmtDate(ap.due_date)}</p>
                    </div>
                    <span className={urg.cls}>{urg.label}</span>
                    <span className="text-sm font-bold text-gray-800 flex-shrink-0">{fmt(ap.amount)}</span>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Total próximos 7 dias</span>
                <span className="text-sm font-bold text-red-600">
                  {fmt(payables.reduce((s: number, ap: AccountPayable) => s + ap.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

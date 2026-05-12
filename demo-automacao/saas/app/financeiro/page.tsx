import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react'
import {
  getFinancialSummary, getAccountsPayable, getAccountsReceivable,
  getCashFlow, fmt, fmtDate, daysUntil, urgencyLabel
} from '@/lib/api'
import CashFlowChart from '@/components/CashFlowChart'
import MetricCard    from '@/components/MetricCard'
import PageHeader    from '@/components/PageHeader'
import type { AccountPayable, AccountReceivable, CashFlowDay } from '@/lib/api'
import clsx from 'clsx'

const STATUS_AP: Record<string, { label: string; cls: string; Icon: any }> = {
  open:    { label: 'Em aberto', cls: 'badge-warning',  Icon: Clock         },
  overdue: { label: 'Vencido',   cls: 'badge-critical', Icon: AlertCircle   },
  paid:    { label: 'Pago',      cls: 'badge-ok',       Icon: CheckCircle   },
}

const STATUS_AR: Record<string, { label: string; cls: string }> = {
  open:     { label: 'Aguardando', cls: 'badge-warning'  },
  overdue:  { label: 'Vencido',    cls: 'badge-critical' },
  received: { label: 'Recebido',   cls: 'badge-ok'       },
}

export default async function FinanceiroPage() {
  const [summary, ap_data, ar_data, cf_data] = await Promise.all([
    getFinancialSummary(),
    getAccountsPayable(),
    getAccountsReceivable(),
    getCashFlow(30),
  ])

  const s           = summary as any
  const payables    = ap_data.items as AccountPayable[]
  const receivables = ar_data.items as AccountReceivable[]
  const cf_days     = (cf_data as any).projection as CashFlowDay[]
  const cf_summary  = (cf_data as any).summary as any

  const totalPayable    = payables.filter(a => a.status !== 'paid').reduce((s,a) => s + a.amount, 0)
  const totalReceivable = receivables.filter(a => a.status !== 'received').reduce((s,a) => s + a.amount, 0)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Financeiro"
        description="Fluxo de caixa, contas a pagar e a receber"
        lastUpdated="hoje às 07:00"
      />

      {/* ── Posição financeira ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Saldo atual"            value={fmt(s.current_balance)}       icon={Wallet}      variant={s.current_balance < 10000 ? 'warning' : 'success'} sub="Em conta" />
        <MetricCard label="A receber (aberto)"     value={fmt(totalReceivable)}          icon={TrendingUp}  trend="up"   trendText={`${ar_data.total} conta(s)`} />
        <MetricCard label="A pagar (pendente)"     value={fmt(totalPayable)}             icon={TrendingDown} trend="down" trendText={`${ap_data.total} conta(s)`} variant="warning" />
      </div>

      {/* ── Gráfico fluxo de caixa 30 dias ─────────────────────────── */}
      <div className="card mb-5">
        <div className="card-header">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Projeção de Fluxo de Caixa — 30 dias</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {cf_summary?.risk?.recommendation ?? 'Calculado com base em contas a pagar e receber'}
            </p>
          </div>
          <span className={clsx(
            cf_summary?.risk?.overall_status === 'critical' ? 'badge-critical' :
            cf_summary?.risk?.overall_status === 'warning'  ? 'badge-warning'  : 'badge-ok'
          )}>
            {cf_summary?.risk?.overall_status === 'critical' ? '⚠ Risco crítico' :
             cf_summary?.risk?.overall_status === 'warning'  ? '⚠ Atenção' : '✓ Saudável'}
          </span>
        </div>
        <div className="card-body">
          <CashFlowChart data={cf_days} />

          {/* Resumo da projeção */}
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            {[
              { label: 'Saldo abertura',      value: fmt(cf_summary?.balance?.opening ?? 0),     color: 'text-gray-700' },
              { label: 'Total entradas proj.', value: fmt(cf_summary?.totals?.income ?? 0),        color: 'text-green-600' },
              { label: 'Total saídas proj.',   value: fmt(cf_summary?.totals?.expenses ?? 0),      color: 'text-red-600' },
              { label: 'Saldo final proj.',    value: fmt(cf_summary?.balance?.closing ?? 0),      color: 'text-blue-700 font-bold' },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="text-[11px] text-gray-400">{m.label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Menor saldo projetado */}
          {cf_summary?.balance?.lowest_point && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              <span>
                Menor saldo projetado: <strong>{fmt(cf_summary.balance.lowest_point.value)}</strong> em{' '}
                <strong>{fmtDate(cf_summary.balance.lowest_point.date)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── AP + AR em duas colunas ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Contas a pagar */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Contas a Pagar</h2>
              <p className="text-xs text-gray-400">{ap_data.total} contas · total: {fmt(totalPayable)}</p>
            </div>
            <ArrowDownRight size={16} className="text-red-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrição</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Prazo</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {payables.map(ap => {
                  const days = daysUntil(ap.due_date)
                  const urg  = urgencyLabel(days)
                  const st   = STATUS_AP[ap.status] || STATUS_AP.open
                  return (
                    <tr key={ap.id} className="table-row-hover border-b border-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800 text-xs truncate max-w-[160px]">{ap.description}</p>
                        <p className="text-[11px] text-gray-400">{ap.supplier_name}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800 text-sm">{fmt(ap.amount)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={urg.cls}>{urg.label}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={st.cls}>{st.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-5 py-3 text-xs font-semibold text-gray-600" colSpan={1}>Total pendente</td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-red-600">{fmt(totalPayable)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Contas a receber */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Contas a Receber</h2>
              <p className="text-xs text-gray-400">{ar_data.total} contas · total: {fmt(totalReceivable)}</p>
            </div>
            <ArrowUpRight size={16} className="text-green-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vencimento</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {receivables.map(ar => {
                  const days = daysUntil(ar.due_date)
                  const urg  = urgencyLabel(days)
                  const st   = STATUS_AR[ar.status] || STATUS_AR.open
                  return (
                    <tr key={ar.id} className="table-row-hover border-b border-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800 text-xs truncate max-w-[160px]">{ar.customer_name}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{ar.description}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-green-700 text-sm">{fmt(ar.amount)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={urg.cls}>{urg.label}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={st.cls}>{st.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-5 py-3 text-xs font-semibold text-gray-600">Total a receber</td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-green-600">{fmt(totalReceivable)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  Target, CheckCircle, ArrowRight, Zap
} from 'lucide-react'
import { MOCK } from '@/lib/mock-data'
import { fmt, fmtDate } from '@/lib/api'
import PageHeader from '@/components/PageHeader'
import clsx from 'clsx'

// ── Engine de inteligência (lógica aplicada sobre mock) ──────────────────────

function buildInsights(data: typeof MOCK) {
  const insights: {
    id:         string
    type:       'action' | 'risk' | 'opportunity' | 'ok'
    priority:   'critical' | 'high' | 'medium' | 'low'
    icon:       any
    title:      string
    detail:     string
    cta?:       string
    cta_link?:  string
    value?:     string
  }[] = []

  const balance   = data.current_balance
  const ap        = data.accounts_payable.items
  const ar        = data.accounts_receivable.items
  const cf        = data.cash_flow.projection
  const ops       = data.operations.items
  const kpis      = data.monthly_kpis

  // ── 1. Saldo crítico em data específica ──────────────────────────────────
  const lowest = cf.reduce((min, d) => d.closing < min.closing ? d : min, cf[0])
  if (lowest.closing < 15000) {
    insights.push({
      id: 'ins-balance-low', type: 'risk', priority: 'high',
      icon: TrendingDown,
      title: `Saldo projetado cai para ${fmt(lowest.closing)} em ${fmtDate(lowest.date)}`,
      detail: `O dia ${fmtDate(lowest.date)} concentra saídas pesadas. Antes dessa data, garanta ao menos ${fmt(15000 - lowest.closing)} em recebimentos adicionais ou negocie prazo de algum pagamento.`,
      value:  fmt(lowest.closing),
      cta: 'Ver fluxo de caixa', cta_link: '/financeiro'
    })
  }

  // ── 2. Receita não recebida vs conta que vence antes ─────────────────────
  const overdue_ar = ar.filter(a => a.status === 'overdue')
  if (overdue_ar.length > 0) {
    const total_ov = overdue_ar.reduce((s, a) => s + a.amount, 0)
    insights.push({
      id: 'ins-overdue-ar', type: 'action', priority: 'critical',
      icon: AlertTriangle,
      title: `${fmt(total_ov)} em recebimentos vencidos — cobrar hoje`,
      detail: `${overdue_ar.map(a => a.customer_name).join(', ')} estão com parcelas vencidas. Esse valor pode cobrir contas urgentes. A cada dia de atraso aumenta o risco de inadimplência definitiva.`,
      value:  fmt(total_ov),
      cta: 'Ver contas a receber', cta_link: '/financeiro'
    })
  }

  // ── 3. Concentração de pagamentos num mesmo dia ───────────────────────────
  const payByDate: Record<string, number> = {}
  ap.filter(a => a.status === 'open').forEach(a => {
    payByDate[a.due_date] = (payByDate[a.due_date] || 0) + a.amount
  })
  const peak = Object.entries(payByDate).sort((a,b) => b[1]-a[1])[0]
  if (peak && peak[1] > 20000) {
    insights.push({
      id: 'ins-concentration', type: 'risk', priority: 'high',
      icon: AlertTriangle,
      title: `Concentração de ${fmt(peak[1])} em pagamentos no dia ${fmtDate(peak[0])}`,
      detail: `No dia ${fmtDate(peak[0])} há ${fmt(peak[1])} em saídas concentradas. Verifique se há recebimentos suficientes antes dessa data ou negocie antecipação de algum boleto a receber.`,
      value:  fmt(peak[1]),
      cta: 'Ver financeiro', cta_link: '/financeiro'
    })
  }

  // ── 4. Pedidos travados gerando risco de prazo ────────────────────────────
  const stuck = ops.filter(o => o.is_stuck)
  if (stuck.length > 0) {
    const stuck_val = stuck.reduce((s, o) => s + (o.order?.total_amount ?? 0), 0)
    insights.push({
      id: 'ins-stuck', type: 'action', priority: 'high',
      icon: AlertTriangle,
      title: `${stuck.length} pedido(s) travado(s) — ${fmt(stuck_val)} em risco`,
      detail: `${stuck.map(s => s.order?.shopify_order_id).join(', ')} estão sem atualização operacional por mais de 48h. Pedidos parados geram insatisfação do cliente, risco de cancelamento e impacto no recebimento.`,
      value:  fmt(stuck_val),
      cta: 'Ver operação', cta_link: '/operacao'
    })
  }

  // ── 5. Margem bruta abaixo do esperado ───────────────────────────────────
  if (kpis.gross_margin_pct < 40) {
    insights.push({
      id: 'ins-margin', type: 'risk', priority: 'medium',
      icon: TrendingDown,
      title: `Margem bruta de ${kpis.gross_margin_pct}% — abaixo do target de 40%`,
      detail: `A margem atual está ${(40 - kpis.gross_margin_pct).toFixed(1)}pp abaixo do benchmark. Revisar precificação, custo de matéria-prima e comissões pode recuperar essa margem nos próximos pedidos.`,
      cta: 'Ver financeiro', cta_link: '/financeiro'
    })
  }

  // ── 6. Custo fixo acima da média ─────────────────────────────────────────
  const energy_ap = ap.find(a => a.supplier_name === 'CEMIG')
  if (energy_ap && energy_ap.amount > 2300) {
    const excess = energy_ap.amount - 2300
    insights.push({
      id: 'ins-cost-energy', type: 'opportunity', priority: 'medium',
      icon: Lightbulb,
      title: `Energia elétrica ${((excess/2300)*100).toFixed(0)}% acima — investigar consumo`,
      detail: `A conta de energia veio ${fmt(excess)} acima da média histórica (${fmt(2300)}). Uma auditoria de consumo no galpão pode revelar equipamentos ineficientes ou uso indevido, gerando economia recorrente.`,
      cta: 'Ver alertas', cta_link: '/alertas'
    })
  }

  // ── 7. Ticket médio e receita por pedido ─────────────────────────────────
  if (kpis.average_ticket > 3000) {
    insights.push({
      id: 'ins-ticket', type: 'ok', priority: 'low',
      icon: TrendingUp,
      title: `Ticket médio saudável de ${fmt(kpis.average_ticket)}`,
      detail: `O ticket médio está acima de R$ 3.000, indicando uma boa concentração em clientes corporativos (B2B). Manter foco nesse segmento potencializa o retorno por operação.`,
    })
  }

  // ── 8. Receita projetada vs custos fixos ────────────────────────────────
  const fixed_monthly  = MOCK.monthly_kpis.total_expenses_projected
  const rec_proj       = kpis.total_revenue_projected
  const coverage       = (rec_proj / fixed_monthly * 100).toFixed(0)
  if (Number(coverage) > 100) {
    insights.push({
      id: 'ins-coverage', type: 'ok', priority: 'low',
      icon: CheckCircle,
      title: `Receita cobre ${coverage}% das despesas projetadas do mês`,
      detail: `A receita projetada de ${fmt(rec_proj)} supera as despesas de ${fmt(fixed_monthly)}. O risco é a velocidade de recebimento — se os boletos atrasarem, o caixa pode ficar comprimido antes das datas de pagamento.`,
    })
  }

  return insights.sort((a, b) => {
    const r = { critical: 0, high: 1, medium: 2, low: 3 }
    return r[a.priority] - r[b.priority]
  })
}

const PRIORITY_CONFIG = {
  critical: { cls: 'border-red-200 bg-red-50/40',       badge: 'badge-critical', dot: 'bg-red-500' },
  high:     { cls: 'border-amber-200 bg-amber-50/40',    badge: 'badge-warning',  dot: 'bg-amber-500' },
  medium:   { cls: 'border-blue-200 bg-blue-50/30',      badge: 'badge-info',     dot: 'bg-blue-400' },
  low:      { cls: 'border-green-200 bg-green-50/30',    badge: 'badge-ok',       dot: 'bg-green-400' },
}

const TYPE_ICON_COLOR = {
  action:      'text-red-500',
  risk:        'text-amber-500',
  opportunity: 'text-blue-500',
  ok:          'text-green-500',
}

export default function InsightsPage() {
  const insights = buildInsights(MOCK)

  const critical = insights.filter(i => i.priority === 'critical')
  const high     = insights.filter(i => i.priority === 'high')
  const medium   = insights.filter(i => i.priority === 'medium')
  const low      = insights.filter(i => i.priority === 'low')

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <PageHeader
        title="Insights & Inteligência"
        description="Recomendações automáticas baseadas nos dados do sistema"
        lastUpdated="hoje às 07:00"
      />

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Ações urgentes', count: critical.length + high.length, color: 'text-red-600',   bg: 'bg-red-50',   Icon: AlertTriangle },
          { label: 'Para investigar', count: medium.length,                color: 'text-blue-600',  bg: 'bg-blue-50',  Icon: Lightbulb    },
          { label: 'Positivos',       count: low.length,                   color: 'text-green-600', bg: 'bg-green-50', Icon: CheckCircle  },
          { label: 'Total insights',  count: insights.length,              color: 'text-gray-700',  bg: 'bg-gray-50',  Icon: Brain        },
        ].map(m => (
          <div key={m.label} className="card p-4 flex items-center gap-3">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', m.bg)}>
              <m.Icon size={16} className={m.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{m.count}</p>
              <p className="text-[11px] text-gray-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards de insights */}
      <div className="space-y-3">
        {insights.map(ins => {
          const pc   = PRIORITY_CONFIG[ins.priority]
          const Icon = ins.icon
          const tc   = TYPE_ICON_COLOR[ins.type]
          return (
            <div key={ins.id} className={clsx('rounded-xl border p-5', pc.cls)}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon size={16} className={tc} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 flex-1 leading-snug">{ins.title}</p>
                    <div className="flex items-center gap-1.5">
                      {ins.value && (
                        <span className="text-sm font-bold text-gray-700">{ins.value}</span>
                      )}
                      <span className={pc.badge}>
                        {ins.priority === 'critical' ? 'Urgente' :
                         ins.priority === 'high'     ? 'Alta'    :
                         ins.priority === 'medium'   ? 'Média'   : 'Positivo'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{ins.detail}</p>
                  {ins.cta && ins.cta_link && (
                    <a
                      href={ins.cta_link}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {ins.cta} <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer engine */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 text-xs text-gray-400">
        <Zap size={12} className="text-blue-400" />
        <span>
          Insights gerados automaticamente pela engine de inteligência. Base de cálculo: saldo atual, fluxo de caixa projetado,
          contas a pagar/receber, pedidos em produção e histórico de custos fixos.
        </span>
      </div>
    </div>
  )
}

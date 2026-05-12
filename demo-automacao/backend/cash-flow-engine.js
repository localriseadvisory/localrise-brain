/**
 * LOCALRISE — Engine de Projeção de Fluxo de Caixa
 *
 * Calcula projeção dia a dia para os próximos N dias com base em:
 * - Saldo atual
 * - Contas a receber (com datas de vencimento)
 * - Contas a pagar (com datas de vencimento)
 * - Custos fixos (gerados automaticamente por dia do mês)
 * - Pedidos com pagamento pendente
 */

class CashFlowEngine {
  /**
   * Constrói projeção dia a dia para os próximos `days` dias.
   *
   * @param {Object} state — estado do sistema
   * @param {number} days  — quantos dias projetar (default: 30)
   * @returns {Array}      — array de dias com detalhes de caixa
   */
  static buildProjection(state, days = 30) {
    const {
      current_balance    = 0,
      accounts_payable   = [],
      accounts_receivable = [],
      fixed_costs        = [],
      orders             = []
    } = state;

    const today      = new Date();
    today.setHours(0, 0, 0, 0);

    // ── Mapear eventos por data ──────────────────────────────────────────

    const events_by_date = {};

    // Inicializar todos os dias do período
    for (let i = 0; i <= days; i++) {
      const d    = new Date(today);
      d.setDate(d.getDate() + i);
      const key  = CashFlowEngine.dateKey(d);
      events_by_date[key] = { income: [], expenses: [] };
    }

    // ── Contas a receber abertas ─────────────────────────────────────────
    accounts_receivable
      .filter(ar => ['open', 'overdue'].includes(ar.status))
      .forEach(ar => {
        const key = ar.due_date;
        if (events_by_date[key]) {
          events_by_date[key].income.push({
            source:      'accounts_receivable',
            id:          ar.id,
            description: ar.description,
            customer:    ar.customer_name,
            amount:      ar.amount,
            confidence:  ar.status === 'overdue' ? 0.5 : 0.9
          });
        }
      });

    // ── Contas a pagar abertas ───────────────────────────────────────────
    accounts_payable
      .filter(ap => ['open', 'overdue'].includes(ap.status))
      .forEach(ap => {
        const key = ap.due_date;
        if (events_by_date[key]) {
          events_by_date[key].expenses.push({
            source:      'accounts_payable',
            id:          ap.id,
            description: ap.description,
            supplier:    ap.supplier_name,
            amount:      ap.amount,
            category:    ap.category,
            priority:    ap.priority || 'normal'
          });
        }
      });

    // ── Custos fixos: gerar para cada mês dentro do período ──────────────
    fixed_costs
      .filter(fc => fc.active !== false)
      .forEach(fc => {
        // Gerar vencimento para meses cobertos pelo período
        const months_covered = new Set();
        for (let i = 0; i <= days; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          months_covered.add(`${d.getFullYear()}-${d.getMonth()}`);
        }

        months_covered.forEach(month_key => {
          const [year, month] = month_key.split('-').map(Number);
          const due = new Date(year, month, fc.due_day);
          const key = CashFlowEngine.dateKey(due);

          if (events_by_date[key]) {
            // Evitar duplicação se já veio via accounts_payable
            const already = events_by_date[key].expenses.some(
              e => e.description?.toLowerCase().includes(fc.name.toLowerCase())
            );
            if (!already) {
              events_by_date[key].expenses.push({
                source:      'fixed_cost',
                id:          fc.id,
                description: fc.name,
                supplier:    fc.supplier_name,
                amount:      fc.monthly_amount,
                category:    fc.category,
                priority:    'normal'
              });
            }
          }
        });
      });

    // ── Pedidos com pagamento pendente (crédito/boleto) ──────────────────
    orders
      .filter(o => o.payment_status === 'pending' && o.status !== 'cancelled')
      .forEach(o => {
        // Estimar recebimento em 3 dias úteis
        const est_date = new Date(today);
        est_date.setDate(est_date.getDate() + 3);
        const key = CashFlowEngine.dateKey(est_date);

        if (events_by_date[key]) {
          events_by_date[key].income.push({
            source:      'pending_order',
            id:          o.id,
            description: `Pagamento pendente: ${o.shopify_order_id}`,
            customer:    o.customer_name,
            amount:      o.total_amount,
            confidence:  0.7
          });
        }
      });

    // ── Construir array de projeção ──────────────────────────────────────
    const projection = [];
    let running_balance = current_balance;

    const sorted_dates = Object.keys(events_by_date).sort();

    sorted_dates.forEach(date => {
      const day = events_by_date[date];

      const total_income   = day.income.reduce((s, e) => s + e.amount, 0);
      const total_expenses = day.expenses.reduce((s, e) => s + e.amount, 0);
      const opening        = running_balance;
      const closing        = opening + total_income - total_expenses;

      projection.push({
        date,
        opening:      parseFloat(opening.toFixed(2)),
        income:       parseFloat(total_income.toFixed(2)),
        expenses:     parseFloat(total_expenses.toFixed(2)),
        closing:      parseFloat(closing.toFixed(2)),
        is_negative:  closing < 0,
        balance_status: CashFlowEngine.balanceStatus(closing),
        income_detail:   day.income,
        expense_detail:  day.expenses
      });

      running_balance = closing;
    });

    return projection;
  }

  /**
   * Gera resumo executivo da projeção
   */
  static summarize(projection) {
    if (!projection || projection.length === 0) {
      return { error: 'Sem dados de projeção' };
    }

    const negative_days = projection.filter(d => d.is_negative);
    const lowest        = projection.reduce((min, d) => d.closing < min.closing ? d : min, projection[0]);
    const highest       = projection.reduce((max, d) => d.closing > max.closing ? d : max, projection[0]);

    const total_income   = projection.reduce((s, d) => s + d.income, 0);
    const total_expenses = projection.reduce((s, d) => s + d.expenses, 0);

    return {
      period: {
        start: projection[0].date,
        end:   projection[projection.length - 1].date,
        days:  projection.length
      },
      totals: {
        income:   parseFloat(total_income.toFixed(2)),
        expenses: parseFloat(total_expenses.toFixed(2)),
        net:      parseFloat((total_income - total_expenses).toFixed(2))
      },
      balance: {
        opening:       projection[0].opening,
        closing:       projection[projection.length - 1].closing,
        lowest_point:  { date: lowest.date,   value: lowest.closing },
        highest_point: { date: highest.date,  value: highest.closing }
      },
      risk: {
        negative_days:      negative_days.length,
        negative_dates:     negative_days.map(d => d.date),
        overall_status:     negative_days.length === 0 ? 'healthy' :
                            negative_days.length <= 3  ? 'warning'  : 'critical',
        recommendation:     CashFlowEngine.generateRecommendation(negative_days, total_income, total_expenses)
      }
    };
  }

  /**
   * Classifica o status do saldo
   */
  static balanceStatus(balance) {
    if (balance < 0)        return 'critical';
    if (balance < 5000)     return 'danger';
    if (balance < 10000)    return 'warning';
    if (balance < 20000)    return 'attention';
    return 'healthy';
  }

  /**
   * Gera recomendação textual com base nos riscos
   */
  static generateRecommendation(negative_days, total_income, total_expenses) {
    if (negative_days.length === 0) {
      if (total_expenses > total_income * 0.9) {
        return 'Caixa equilibrado mas margem estreita. Monitorar de perto.';
      }
      return 'Caixa saudável para o período projetado.';
    }

    const first_negative = negative_days[0]?.date;
    if (negative_days.length === 1) {
      return `Risco pontual em ${first_negative}. Considere antecipar um recebimento ou negociar prazo com fornecedor.`;
    }
    return `${negative_days.length} dias com saldo negativo projetados (primeiro em ${first_negative}). Necessário antecipar recebimentos ou renegociar pagamentos urgentemente.`;
  }

  /**
   * Formata data como YYYY-MM-DD
   */
  static dateKey(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Detecta concentrações de vencimentos em um único dia
   * Útil para identificar dias de alto risco antes de acontecerem
   */
  static detectConcentrationRisk(projection, threshold = 10000) {
    return projection
      .filter(d => d.expenses >= threshold)
      .map(d => ({
        date:          d.date,
        expenses:      d.expenses,
        income:        d.income,
        gap:           d.expenses - d.income,
        closing:       d.closing,
        risk_level:    d.closing < 0 ? 'critical' : d.closing < 5000 ? 'high' : 'medium',
        top_expenses:  d.expense_detail
          ?.sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
          .map(e => `${e.description}: R$ ${e.amount.toFixed(2)}`)
      }));
  }

  /**
   * Simula cenário "e se" — o que acontece se um recebimento atrasar N dias
   */
  static simulateDelay(state, receivable_id, delay_days = 7) {
    const modified_ar = state.accounts_receivable.map(ar => {
      if (ar.id !== receivable_id) return ar;
      const original = new Date(ar.due_date);
      original.setDate(original.getDate() + delay_days);
      return { ...ar, due_date: CashFlowEngine.dateKey(original), _delayed: true };
    });

    const modified_state = { ...state, accounts_receivable: modified_ar };
    const projection = CashFlowEngine.buildProjection(modified_state);
    const summary    = CashFlowEngine.summarize(projection);

    return {
      scenario:          `Atraso de ${delay_days} dias no recebimento ${receivable_id}`,
      projection,
      summary,
      impact_vs_base:    {
        additional_negative_days: summary.risk.negative_days,
        min_balance:              summary.balance.lowest_point
      }
    };
  }
}

module.exports = { CashFlowEngine };

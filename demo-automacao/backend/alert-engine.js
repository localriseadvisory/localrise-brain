/**
 * LOCALRISE — Motor de Alertas Inteligentes
 *
 * Responsável por detectar e gerar alertas com base em:
 * - Pagamentos próximos do vencimento
 * - Recebimentos vencidos
 * - Saldo insuficiente projetado
 * - Descasamento entre recebimento e pagamento
 * - Anomalias de custo
 * - Pedidos travados na operação
 * - Exceções logísticas
 */

class AlertEngine {
  /**
   * Executa todas as verificações de alerta.
   * @param {Object} state — estado atual do sistema (in-memory ou do banco)
   * @returns {{ new_alerts: Array, critical_count: number, warning_count: number }}
   */
  static run(state) {
    const new_alerts    = [];
    const today         = new Date();
    today.setHours(0, 0, 0, 0);

    // ── 1. Pagamentos próximos do vencimento ──────────────────────────────
    const ap_alerts = AlertEngine.checkUpcomingPayments(state.accounts_payable, today);
    new_alerts.push(...ap_alerts);

    // ── 2. Recebimentos vencidos ──────────────────────────────────────────
    const ar_alerts = AlertEngine.checkOverdueReceivables(state.accounts_receivable, today);
    new_alerts.push(...ar_alerts);

    // ── 3. Saldo insuficiente projetado ───────────────────────────────────
    const balance_alerts = AlertEngine.checkProjectedBalance(state.cash_flow, state.current_balance);
    new_alerts.push(...balance_alerts);

    // ── 4. Descasamento entre recebimento e pagamento ─────────────────────
    const mismatch_alerts = AlertEngine.checkCashMismatch(state.accounts_payable, state.accounts_receivable, today);
    new_alerts.push(...mismatch_alerts);

    // ── 5. Anomalias de custo (custo fixo acima da média) ─────────────────
    const cost_alerts = AlertEngine.checkCostAnomalies(state.accounts_payable, state.fixed_costs);
    new_alerts.push(...cost_alerts);

    // ── 6. Pedidos travados na operação ───────────────────────────────────
    const stuck_alerts = AlertEngine.checkStuckOrders(state.operations, state.orders);
    new_alerts.push(...stuck_alerts);

    // ── 7. Deduplicar alertas já existentes ───────────────────────────────
    const existing_signatures = new Set(
      (state.alerts || [])
        .filter(a => a.status === 'active')
        .map(a => a._signature)
        .filter(Boolean)
    );

    const deduplicated = new_alerts.filter(a => !existing_signatures.has(a._signature));

    return {
      new_alerts:     deduplicated,
      critical_count: deduplicated.filter(a => a.severity === 'critical').length,
      warning_count:  deduplicated.filter(a => a.severity === 'warning').length,
      info_count:     deduplicated.filter(a => a.severity === 'info').length,
      total_new:      deduplicated.length
    };
  }

  // ── VERIFICAÇÕES ─────────────────────────────────────────────────────────

  /**
   * Pagamentos com vencimento próximo ou vencidos
   */
  static checkUpcomingPayments(accounts_payable, today) {
    const alerts = [];

    accounts_payable
      .filter(ap => ap.status === 'open' || ap.status === 'overdue')
      .forEach(ap => {
        const due      = new Date(ap.due_date);
        const daysLeft = Math.round((due - today) / 86400000);

        let severity, type_label;

        if (daysLeft < 0) {
          severity   = 'critical';
          type_label = `VENCIDO há ${Math.abs(daysLeft)} dia(s)`;
        } else if (daysLeft === 0) {
          severity   = 'critical';
          type_label = 'VENCE HOJE';
        } else if (daysLeft <= 2) {
          severity   = 'critical';
          type_label = `Vence em ${daysLeft} dia(s)`;
        } else if (daysLeft <= 7) {
          severity   = 'warning';
          type_label = `Vence em ${daysLeft} dias`;
        } else {
          return; // Sem alerta para mais de 7 dias
        }

        alerts.push({
          id:          `alr-ap-${ap.id}-${today.toISOString().split('T')[0]}`,
          type:        'payment_due',
          severity,
          title:       `${type_label}: ${ap.description} — R$ ${ap.amount.toFixed(2)}`,
          message:     `Conta com ${ap.supplier_name || 'fornecedor'} (${ap.category}): R$ ${ap.amount.toFixed(2)} — vencimento: ${ap.due_date}. Status atual: ${ap.status}.`,
          reference_id:    ap.id,
          reference_table: 'accounts_payable',
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { ap_id: ap.id, due_date: ap.due_date, amount: ap.amount, days_left: daysLeft },
          _signature:  `payment_due__${ap.id}`
        });
      });

    return alerts;
  }

  /**
   * Recebimentos vencidos sem confirmação
   */
  static checkOverdueReceivables(accounts_receivable, today) {
    const alerts = [];

    accounts_receivable
      .filter(ar => ar.status === 'open')
      .forEach(ar => {
        const due      = new Date(ar.due_date);
        const daysOver = Math.round((today - due) / 86400000);
        if (daysOver <= 0) return;

        const severity = daysOver > 7 ? 'critical' : 'warning';

        alerts.push({
          id:          `alr-ar-${ar.id}-${today.toISOString().split('T')[0]}`,
          type:        'overdue_receivable',
          severity,
          title:       `Recebimento vencido há ${daysOver} dia(s): ${ar.customer_name} — R$ ${ar.amount.toFixed(2)}`,
          message:     `${ar.description} deveria ter sido recebido em ${ar.due_date}. Já ${daysOver} dia(s) de atraso. Entrar em contato com ${ar.customer_name} imediatamente.`,
          reference_id:    ar.id,
          reference_table: 'accounts_receivable',
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { ar_id: ar.id, due_date: ar.due_date, amount: ar.amount, days_over: daysOver },
          _signature:  `overdue_receivable__${ar.id}`
        });
      });

    return alerts;
  }

  /**
   * Saldo projetado insuficiente (abaixo de threshold ou negativo)
   */
  static checkProjectedBalance(cash_flow, current_balance) {
    const alerts         = [];
    const MIN_SAFE_BALANCE = 10000; // R$ 10k como saldo mínimo seguro

    (cash_flow || []).forEach(day => {
      const closing = day.closing ?? (day.opening + day.income - day.expenses);

      if (closing < 0) {
        alerts.push({
          id:          `alr-cf-neg-${day.date}`,
          type:        'insufficient_balance',
          severity:    'critical',
          title:       `Saldo NEGATIVO projetado em ${day.date}: R$ ${closing.toFixed(2)}`,
          message:     `A projeção indica saldo negativo de R$ ${Math.abs(closing).toFixed(2)} no dia ${day.date}. É necessário antecipar recebimentos ou negociar prazos de pagamento.`,
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { date: day.date, closing, income: day.income, expenses: day.expenses },
          _signature:  `insufficient_balance__negative__${day.date}`
        });
      } else if (closing < MIN_SAFE_BALANCE) {
        alerts.push({
          id:          `alr-cf-low-${day.date}`,
          type:        'insufficient_balance',
          severity:    'warning',
          title:       `Saldo baixo projetado em ${day.date}: R$ ${closing.toFixed(2)}`,
          message:     `O saldo projetado para ${day.date} é de apenas R$ ${closing.toFixed(2)}, abaixo do mínimo seguro de R$ ${MIN_SAFE_BALANCE.toFixed(2)}. Atenção ao caixa.`,
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { date: day.date, closing, threshold: MIN_SAFE_BALANCE },
          _signature:  `insufficient_balance__low__${day.date}`
        });
      }
    });

    // Verificar saldo atual imediato
    if (current_balance < MIN_SAFE_BALANCE) {
      alerts.push({
        id:          `alr-bal-now-${new Date().toISOString().split('T')[0]}`,
        type:        'insufficient_balance',
        severity:    current_balance < 0 ? 'critical' : 'warning',
        title:       `Saldo atual baixo: R$ ${current_balance.toFixed(2)}`,
        message:     `O saldo atual de caixa é R$ ${current_balance.toFixed(2)}, abaixo do nível seguro de R$ ${MIN_SAFE_BALANCE.toFixed(2)}.`,
        status:      'active',
        triggered_at: new Date().toISOString(),
        metadata:    { current_balance, threshold: MIN_SAFE_BALANCE },
        _signature:  `insufficient_balance__current`
      });
    }

    return alerts;
  }

  /**
   * Descasamento: pagamentos concentrados sem recebimento correspondente
   */
  static checkCashMismatch(accounts_payable, accounts_receivable, today) {
    const alerts = [];

    // Agrupar pagamentos por data
    const payables_by_date = {};
    accounts_payable
      .filter(ap => ap.status === 'open')
      .forEach(ap => {
        const key = ap.due_date;
        if (!payables_by_date[key]) payables_by_date[key] = 0;
        payables_by_date[key] += ap.amount;
      });

    // Agrupar recebimentos por data
    const receivables_by_date = {};
    accounts_receivable
      .filter(ar => ar.status === 'open')
      .forEach(ar => {
        const key = ar.due_date;
        if (!receivables_by_date[key]) receivables_by_date[key] = 0;
        receivables_by_date[key] += ar.amount;
      });

    // Verificar dias com gap grande
    Object.entries(payables_by_date).forEach(([date, pay_total]) => {
      const rec_total = receivables_by_date[date] || 0;
      const gap       = pay_total - rec_total;
      const days_out  = Math.round((new Date(date) - today) / 86400000);

      if (gap > 5000 && days_out >= 0 && days_out <= 14) {
        alerts.push({
          id:          `alr-mismatch-${date}`,
          type:        'payment_mismatch',
          severity:    gap > 15000 ? 'critical' : 'warning',
          title:       `Descasamento de caixa em ${date}: gap de R$ ${gap.toFixed(2)}`,
          message:     `Em ${date}: saídas previstas de R$ ${pay_total.toFixed(2)} contra entradas de R$ ${rec_total.toFixed(2)}. Gap de R$ ${gap.toFixed(2)} sem cobertura de recebimento.`,
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { date, pay_total, rec_total, gap },
          _signature:  `payment_mismatch__${date}`
        });
      }
    });

    return alerts;
  }

  /**
   * Custo fixo acima da média histórica (>= 15% de desvio)
   */
  static checkCostAnomalies(accounts_payable, fixed_costs) {
    const alerts = [];
    const ANOMALY_THRESHOLD = 0.15; // 15% acima da média

    // Mapear custos fixos esperados por nome/fornecedor
    const fixed_map = {};
    (fixed_costs || []).forEach(fc => {
      const key = fc.supplier_name?.toLowerCase() || fc.name.toLowerCase();
      fixed_map[key] = fc.monthly_amount;
    });

    accounts_payable
      .filter(ap => ap.status === 'open' || ap.status === 'overdue')
      .forEach(ap => {
        const key      = ap.supplier_name?.toLowerCase() || '';
        const expected = fixed_map[key];
        if (!expected) return;

        const deviation = (ap.amount - expected) / expected;
        if (deviation >= ANOMALY_THRESHOLD) {
          const excess_pct = (deviation * 100).toFixed(1);
          const excess_val = (ap.amount - expected).toFixed(2);

          alerts.push({
            id:          `alr-cost-${ap.id}`,
            type:        'cost_anomaly',
            severity:    deviation > 0.30 ? 'warning' : 'info',
            title:       `Custo acima do normal: ${ap.description} (+${excess_pct}%)`,
            message:     `${ap.supplier_name}: R$ ${ap.amount.toFixed(2)} cobrado vs R$ ${expected.toFixed(2)} esperado. Diferença de R$ ${excess_val} (+${excess_pct}%). Verificar se há causa justificada.`,
            reference_id:    ap.id,
            reference_table: 'accounts_payable',
            status:      'active',
            triggered_at: new Date().toISOString(),
            metadata:    { ap_id: ap.id, billed: ap.amount, expected, deviation_pct: parseFloat(excess_pct) },
            _signature:  `cost_anomaly__${ap.id}`
          });
        }
      });

    return alerts;
  }

  /**
   * Pedidos travados na operação (sem atualização > 48h)
   */
  static checkStuckOrders(operations, orders) {
    const alerts = [];
    const STUCK_THRESHOLD_HOURS = 48;

    (operations || []).forEach(op => {
      if (['shipped', 'delivered', 'cancelled'].includes(op.stage)) return;

      const lastUpdate   = new Date(op.updated_at);
      const hoursElapsed = (Date.now() - lastUpdate.getTime()) / 3600000;

      if (hoursElapsed < STUCK_THRESHOLD_HOURS) return;

      const order = (orders || []).find(o => o.id === op.order_id);
      const severity = hoursElapsed > 120 ? 'critical' : 'warning';

      alerts.push({
        id:          `alr-stuck-${op.order_id}`,
        type:        'order_stuck',
        severity,
        title:       `Pedido travado ${Math.round(hoursElapsed)}h: ${order?.shopify_order_id || op.order_id}`,
        message:     `O pedido de ${order?.customer_name || 'cliente'} (${order?.shopify_order_id}) está parado na fase "${op.stage}" há ${Math.round(hoursElapsed)} horas. Valor: R$ ${order?.total_amount?.toFixed(2) || 'N/A'}. Responsável: ${op.assigned_to || 'não atribuído'}.`,
        reference_id:    op.order_id,
        reference_table: 'operations',
        status:      'active',
        triggered_at: new Date().toISOString(),
        metadata:    {
          order_id: op.order_id,
          shopify_order_id: order?.shopify_order_id,
          stage:    op.stage,
          hours_stuck: Math.round(hoursElapsed),
          assigned_to: op.assigned_to
        },
        _signature:  `order_stuck__${op.order_id}`
      });
    });

    return alerts;
  }
}

module.exports = { AlertEngine };

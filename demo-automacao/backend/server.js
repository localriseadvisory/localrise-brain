/**
 * LOCALRISE ADVISORY — Backend API
 * Motor central da automação operacional + financeira
 *
 * Stack: Node.js + Express + PostgreSQL (ou mock JSON para demo)
 * Porta: 3001
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const { AlertEngine }      = require('./alert-engine');
const { CashFlowEngine }   = require('./cash-flow-engine');
const { startAutomation }  = require('./automation-runner');

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const app  = express();
const PORT = process.env.PORT || 3001;

// Para demo: usa mock JSON em vez de banco real
const DEMO_MODE = process.env.DEMO_MODE !== 'false';
const MOCK_DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../mock-data/mock-data.json'), 'utf-8')
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simples
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// ESTADO IN-MEMORY (demo — substituir por banco real)
// ============================================================

let state = {
  orders:              [...MOCK_DATA.orders],
  accounts_payable:    [...MOCK_DATA.accounts_payable],
  accounts_receivable: [...MOCK_DATA.accounts_receivable],
  fixed_costs:         [...MOCK_DATA.fixed_costs],
  alerts:              [...MOCK_DATA.active_alerts],
  cash_flow:           [...MOCK_DATA.cash_flow_projection],
  operations:          [...MOCK_DATA.operations],
  logistics:           [...MOCK_DATA.logistics_events],
  current_balance:     MOCK_DATA.current_balance.balance
};

// ============================================================
// ROTAS PÚBLICAS — Dashboard / Interface
// ============================================================

/**
 * GET /api/dashboard
 * Resumo geral para o dashboard principal
 */
app.get('/api/dashboard', (_req, res) => {
  const kpis = MOCK_DATA.monthly_kpis;

  const critical_alerts = state.alerts.filter(a => a.severity === 'critical' && a.status === 'active');
  const warning_alerts  = state.alerts.filter(a => a.severity === 'warning'  && a.status === 'active');

  // Próximos 7 dias de fluxo de caixa
  const cf_next7 = state.cash_flow.slice(0, 7).map(d => ({
    date:    d.date,
    closing: d.closing,
    status:  d.closing < 0 ? 'critical' : d.closing < 10000 ? 'warning' : 'ok'
  }));

  // Contas a pagar urgentes (próximos 7 dias)
  const upcoming_payments = state.accounts_payable
    .filter(ap => ap.status === 'open' || ap.status === 'overdue')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  res.json({
    current_balance:    state.current_balance,
    kpis,
    alerts: {
      critical: critical_alerts.length,
      warning:  warning_alerts.length,
      items:    state.alerts.filter(a => a.status === 'active').slice(0, 5)
    },
    cash_flow_preview:  cf_next7,
    upcoming_payments,
    orders_summary: {
      pending:       state.orders.filter(o => o.status === 'pending').length,
      in_production: state.orders.filter(o => o.status === 'in_production').length,
      shipped:       state.orders.filter(o => o.status === 'shipped').length,
      total:         state.orders.length
    }
  });
});

/**
 * GET /api/financial/cashflow
 * Projeção de fluxo de caixa
 */
app.get('/api/financial/cashflow', (req, res) => {
  const { days = 30 } = req.query;
  const projection = CashFlowEngine.buildProjection(state, parseInt(days));
  res.json({ projection, summary: CashFlowEngine.summarize(projection) });
});

/**
 * GET /api/financial/accounts-payable
 * Contas a pagar
 */
app.get('/api/financial/accounts-payable', (req, res) => {
  const { status, days } = req.query;
  let ap = [...state.accounts_payable];

  if (status) ap = ap.filter(a => a.status === status);
  if (days)   {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + parseInt(days));
    ap = ap.filter(a => new Date(a.due_date) <= cutoff);
  }

  ap.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  res.json({ total: ap.length, items: ap });
});

/**
 * GET /api/financial/accounts-receivable
 * Contas a receber
 */
app.get('/api/financial/accounts-receivable', (_req, res) => {
  const ar = [...state.accounts_receivable]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  res.json({ total: ar.length, items: ar });
});

/**
 * GET /api/financial/summary
 * Resumo financeiro do mês
 */
app.get('/api/financial/summary', (_req, res) => {
  const ap_total   = state.accounts_payable
    .filter(a => a.status === 'open' || a.status === 'overdue')
    .reduce((s, a) => s + a.amount, 0);

  const ar_total   = state.accounts_receivable
    .filter(a => a.status === 'open')
    .reduce((s, a) => s + a.amount, 0);

  const fixed_monthly = state.fixed_costs.reduce((s, c) => s + c.monthly_amount, 0);

  res.json({
    current_balance:       state.current_balance,
    total_payable:         ap_total,
    total_receivable:      ar_total,
    fixed_costs_monthly:   fixed_monthly,
    net_position:          state.current_balance + ar_total - ap_total,
    projected_balance_30d: state.cash_flow[state.cash_flow.length - 1]?.closing || state.current_balance
  });
});

/**
 * GET /api/orders
 * Lista de pedidos com status operacional
 */
app.get('/api/orders', (req, res) => {
  const { status, limit = 20 } = req.query;
  let orders = [...state.orders];
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ total: orders.length, items: orders.slice(0, parseInt(limit)) });
});

/**
 * GET /api/operations
 * Status operacional / produção
 */
app.get('/api/operations', (_req, res) => {
  const ops = state.operations.map(op => {
    const order = state.orders.find(o => o.id === op.order_id);
    const hoursSinceUpdate = (Date.now() - new Date(op.updated_at).getTime()) / 3600000;
    return {
      ...op,
      order,
      hours_since_update: Math.round(hoursSinceUpdate),
      is_stuck: hoursSinceUpdate > 48
    };
  });
  res.json({ items: ops });
});

/**
 * GET /api/alerts
 * Alertas ativos
 */
app.get('/api/alerts', (req, res) => {
  const { severity, type, status = 'active' } = req.query;
  let alerts = state.alerts.filter(a => a.status === status);
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  if (type)     alerts = alerts.filter(a => a.type === type);
  alerts.sort((a, b) => {
    const sev = { critical: 0, warning: 1, info: 2 };
    return sev[a.severity] - sev[b.severity];
  });
  res.json({ total: alerts.length, items: alerts });
});

/**
 * PATCH /api/alerts/:id/acknowledge
 * Reconhecer alerta
 */
app.patch('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = state.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' });
  alert.status = 'acknowledged';
  res.json({ success: true, alert });
});

/**
 * GET /api/logistics
 * Status logístico dos pedidos
 */
app.get('/api/logistics', (_req, res) => {
  const events = state.logistics.map(log => {
    const order = state.orders.find(o => o.id === log.order_id);
    const latestEvent = log.events?.[log.events.length - 1] || null;
    return {
      order_id:     log.order_id,
      order_ref:    order?.shopify_order_id,
      customer:     order?.customer_name,
      tracking:     log.tracking_code,
      carrier:      log.carrier,
      latest_status: latestEvent?.status || log.status,
      latest_location: latestEvent?.location,
      is_exception: latestEvent?.status === 'exception',
      events:       log.events || []
    };
  });
  res.json({ items: events });
});

// ============================================================
// ROTAS INTERNAS — chamadas pelo n8n
// ============================================================

/**
 * POST /api/internal/webhook/shopify
 * Simula recebimento de webhook do Shopify
 */
app.post('/api/internal/webhook/shopify', (req, res) => {
  const order = req.body;

  // Normalizar estrutura do Shopify
  const normalized = {
    id:               `ord-${Date.now()}`,
    shopify_order_id: `SHP-${order.id || Date.now()}`,
    status:           'pending',
    customer_name:    `${order.billing_address?.first_name || ''} ${order.billing_address?.last_name || ''}`.trim() || 'Cliente',
    customer_email:   order.email || '',
    total_amount:     parseFloat(order.total_price || 0),
    payment_status:   order.financial_status || 'pending',
    payment_method:   order.payment_gateway || 'unknown',
    line_items:       (order.line_items || []).map(i => ({
      sku:   i.sku,
      name:  i.name,
      qty:   i.quantity,
      price: parseFloat(i.price)
    })),
    created_at: new Date().toISOString()
  };

  // Adicionar ao estado
  state.orders.push(normalized);

  // Registrar receita
  const income_entry = {
    id:            `inc-${Date.now()}`,
    order_id:      normalized.id,
    description:   `Venda Shopify #${normalized.shopify_order_id}`,
    amount:        normalized.total_amount,
    category:      'vendas_shopify',
    status:        normalized.payment_status === 'paid' ? 'received' : 'projected',
    expected_date: new Date().toISOString().split('T')[0]
  };

  // Criar registro operacional
  state.operations.push({
    order_id:   normalized.id,
    stage:      'queue',
    priority:   5,
    updated_at: new Date().toISOString()
  });

  // Recalcular caixa se pagamento confirmado
  if (normalized.payment_status === 'paid') {
    state.current_balance += normalized.total_amount;
  }

  console.log(`[SHOPIFY] Novo pedido: ${normalized.shopify_order_id} — R$ ${normalized.total_amount}`);

  res.json({
    success: true,
    order_id: normalized.id,
    income_registered: true,
    operation_created: true
  });
});

/**
 * POST /api/internal/webhook/logistics
 * Simula recebimento de webhook da Fontes Log
 */
app.post('/api/internal/webhook/logistics', (req, res) => {
  const { tracking_code, order_id, status, location, note } = req.body;

  const event = {
    tracking_code,
    order_id,
    carrier:    'fontes_log',
    status,
    location:   location || '',
    note:       note || '',
    timestamp:  new Date().toISOString()
  };

  // Atualizar ou criar registro logístico
  const existing = state.logistics.find(l => l.order_id === order_id);
  if (existing) {
    if (!existing.events) existing.events = [];
    existing.events.push({ status, location, timestamp: event.timestamp, note });
    if (!existing.tracking_code) existing.tracking_code = tracking_code;
  } else {
    state.logistics.push({
      order_id,
      tracking_code,
      carrier: 'fontes_log',
      status,
      events: [{ status, location, timestamp: event.timestamp, note }]
    });
  }

  // Atualizar status do pedido
  const order = state.orders.find(o => o.id === order_id);
  if (order) {
    if (status === 'delivered') order.status = 'delivered';
    else if (status === 'posted' || status === 'in_transit') order.status = 'shipped';
  }

  // Gerar alerta se exceção
  if (status === 'exception') {
    state.alerts.push({
      id:          `alr-${Date.now()}`,
      type:        'logistics_exception',
      severity:    'warning',
      title:       `Exceção de entrega: ${tracking_code}`,
      message:     `Pedido em exceção em ${location}. ${note}`,
      status:      'active',
      triggered_at: new Date().toISOString()
    });
    console.log(`[ALERTA] Exceção logística: ${tracking_code}`);
  }

  res.json({ success: true, event });
});

/**
 * POST /api/internal/recalculate-cashflow
 * Recalcula projeção de fluxo de caixa
 */
app.post('/api/internal/recalculate-cashflow', (req, res) => {
  const { days_ahead = 30 } = req.body;
  const projection = CashFlowEngine.buildProjection(state, days_ahead);
  state.cash_flow = projection;

  const negative_days = projection.filter(d => d.closing < 0);
  if (negative_days.length > 0) {
    negative_days.forEach(d => {
      const exists = state.alerts.find(
        a => a.type === 'insufficient_balance' && a.metadata?.projection_date === d.date
      );
      if (!exists) {
        state.alerts.push({
          id:          `alr-${Date.now()}-${d.date}`,
          type:        'insufficient_balance',
          severity:    'critical',
          title:       `Saldo projetado negativo em ${d.date}`,
          message:     `Projeção aponta saldo de R$ ${d.closing.toFixed(2)} em ${d.date}. Revise pagamentos ou antecipe recebimentos.`,
          status:      'active',
          triggered_at: new Date().toISOString(),
          metadata:    { projection_date: d.date, closing_balance: d.closing }
        });
      }
    });
  }

  console.log(`[CAIXA] Projeção recalculada. Dias negativos: ${negative_days.length}`);
  res.json({ success: true, projection_days: projection.length, negative_days: negative_days.length });
});

/**
 * POST /api/internal/run-alert-engine
 * Executa o motor de alertas completo
 */
app.post('/api/internal/run-alert-engine', (_req, res) => {
  const result = AlertEngine.run(state);
  result.new_alerts.forEach(a => state.alerts.push(a));

  console.log(`[ALERTAS] Engine executada. Novos: ${result.new_alerts.length}, Críticos: ${result.critical_count}`);
  res.json(result);
});

/**
 * POST /api/internal/send-notifications
 * Simula envio de notificações (WhatsApp, email)
 */
app.post('/api/internal/send-notifications', (req, res) => {
  const { channels, severity, alerts } = req.body;
  const sent = (alerts || []).map(a => ({
    alert_id: a.id,
    channels,
    sent_at:  new Date().toISOString(),
    simulated: true
  }));
  console.log(`[NOTIFY] ${sent.length} notificações enviadas via: ${channels?.join(', ')}`);
  res.json({ success: true, sent });
});

// ============================================================
// ROTAS DE MUTAÇÃO (demo interativa)
// ============================================================

/**
 * POST /api/orders/:id/advance-stage
 * Avançar pedido para próximo estágio operacional
 */
app.post('/api/orders/:id/advance-stage', (req, res) => {
  const stages = ['queue', 'cutting', 'production', 'quality', 'packing', 'ready', 'shipped', 'delivered'];
  const op = state.operations.find(o => o.order_id === req.params.id);
  if (!op) return res.status(404).json({ error: 'Operação não encontrada' });

  const idx = stages.indexOf(op.stage);
  if (idx < stages.length - 1) {
    op.stage      = stages[idx + 1];
    op.updated_at = new Date().toISOString();
    if (op.stage === 'shipped') {
      const order = state.orders.find(o => o.id === req.params.id);
      if (order) order.status = 'shipped';
    }
  }

  res.json({ success: true, new_stage: op.stage });
});

/**
 * POST /api/financial/accounts-payable/:id/pay
 * Registrar pagamento de conta
 */
app.post('/api/financial/accounts-payable/:id/pay', (req, res) => {
  const ap = state.accounts_payable.find(a => a.id === req.params.id);
  if (!ap) return res.status(404).json({ error: 'Conta não encontrada' });

  ap.status    = 'paid';
  ap.paid_date = new Date().toISOString().split('T')[0];
  state.current_balance -= ap.amount;

  console.log(`[PAGO] ${ap.description} — R$ ${ap.amount}`);
  res.json({ success: true, paid: ap, new_balance: state.current_balance });
});

/**
 * POST /api/financial/accounts-receivable/:id/receive
 * Registrar recebimento
 */
app.post('/api/financial/accounts-receivable/:id/receive', (req, res) => {
  const ar = state.accounts_receivable.find(a => a.id === req.params.id);
  if (!ar) return res.status(404).json({ error: 'Conta não encontrada' });

  ar.status        = 'received';
  ar.received_date = new Date().toISOString().split('T')[0];
  state.current_balance += ar.amount;

  console.log(`[RECEBIDO] ${ar.description} — R$ ${ar.amount}`);
  res.json({ success: true, received: ar, new_balance: state.current_balance });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    demo_mode: DEMO_MODE,
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
    state_summary: {
      orders:              state.orders.length,
      active_alerts:       state.alerts.filter(a => a.status === 'active').length,
      accounts_payable:    state.accounts_payable.length,
      accounts_receivable: state.accounts_receivable.length,
      current_balance:     state.current_balance
    }
  });
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  LOCALRISE — Sistema de Automação          ║');
  console.log(`║  Porta: ${PORT}  |  Modo: ${DEMO_MODE ? 'DEMO' : 'PRODUÇÃO'}             ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Dashboard:  http://localhost:${PORT}/api/dashboard`);
  console.log(`  Fluxo:      http://localhost:${PORT}/api/financial/cashflow`);
  console.log(`  Alertas:    http://localhost:${PORT}/api/alerts`);
  console.log(`  Health:     http://localhost:${PORT}/health`);
  console.log('');

  // Iniciar motor de automação em background
  startAutomation(state);
});

module.exports = app;

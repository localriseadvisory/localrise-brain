// Dados mockados espelhando o backend (demo-automacao/mock-data/mock-data.json)
// Usados como fallback quando o backend (porta 3001) não está disponível

export const MOCK = {
  current_balance: 38420.50,

  monthly_kpis: {
    month:                  'Abril/2026',
    total_orders:           12,
    total_revenue_projected: 47890.00,
    total_revenue_received:  29140.00,
    total_expenses_projected: 44930.00,
    total_expenses_paid:     8200.00,
    gross_margin_pct:        38.5,
    average_ticket:          3990.83,
    orders_in_production:    3,
    orders_delivered:        7,
    active_alerts:           7,
    critical_alerts:         2,
  },

  alerts: {
    total: 7,
    items: [
      {
        id: 'alr-001', type: 'payment_due', severity: 'critical',
        title: 'Pagamento vence AMANHÃ: Têxtil Sul — R$ 4.200',
        message: 'AP-001 com Têxtil Sul Ltda vence em 2026-04-09. Saldo atual: R$ 38.420,50.',
        triggered_at: '2026-04-08T07:00:00Z', status: 'active',
      },
      {
        id: 'alr-002', type: 'payment_due', severity: 'critical',
        title: 'Aluguel VENCIDO há 3 dias — R$ 8.500',
        message: 'AP-003 (Aluguel Galpão) venceu em 2026-04-05. Risco de multa e juros.',
        triggered_at: '2026-04-05T23:59:00Z', status: 'active',
      },
      {
        id: 'alr-003', type: 'insufficient_balance', severity: 'warning',
        title: 'Saldo cai para R$ 16.490 no dia 10/04',
        message: 'Em 10/04 haverá saída de R$ 26.680 (Folha + Energia). Saldo projetado: R$ 16.490.',
        triggered_at: '2026-04-08T07:00:00Z', status: 'active',
      },
      {
        id: 'alr-004', type: 'overdue_receivable', severity: 'warning',
        title: 'Recebimento vencido: Escola Jardim Flor — R$ 4.200',
        message: 'Parcela 2/3 venceu hoje sem confirmação. Entrar em contato imediatamente.',
        triggered_at: '2026-04-08T07:00:00Z', status: 'active',
      },
      {
        id: 'alr-005', type: 'order_stuck', severity: 'warning',
        title: 'Pedido travado: Hotel Imperial — 9 dias sem atualização',
        message: 'SHP-2026-4390 na fase "cutting" há 9 dias. Verificar com Equipe C. Valor: R$ 8.900.',
        triggered_at: '2026-04-08T07:00:00Z', status: 'active',
      },
      {
        id: 'alr-006', type: 'cost_anomaly', severity: 'info',
        title: 'Energia elétrica 16% acima da média',
        message: 'Conta de energia: R$ 2.680 vs média R$ 2.300 (+R$ 380). Verificar consumo no galpão.',
        triggered_at: '2026-04-08T07:00:00Z', status: 'active',
      },
      {
        id: 'alr-007', type: 'logistics_exception', severity: 'warning',
        title: 'Exceção de entrega: Escola Jardim Flor — endereço não localizado',
        message: 'Rastreamento FL20260401004 em exceção há 3 dias em Campinas.',
        triggered_at: '2026-04-05T09:00:00Z', status: 'active',
      },
    ],
  },

  cash_flow: {
    projection: [
      { date: '2026-04-08', opening: 38420.50, income: 4200.00,  expenses: 0,        closing: 42620.50 },
      { date: '2026-04-09', opening: 42620.50, income: 0,        expenses: 4200.00,  closing: 38420.50 },
      { date: '2026-04-10', opening: 38420.50, income: 4750.00,  expenses: 26680.00, closing: 16490.50 },
      { date: '2026-04-11', opening: 16490.50, income: 0,        expenses: 0,        closing: 16490.50 },
      { date: '2026-04-12', opening: 16490.50, income: 0,        expenses: 1850.00,  closing: 14640.50 },
      { date: '2026-04-14', opening: 14640.50, income: 0,        expenses: 890.00,   closing: 13750.50 },
      { date: '2026-04-15', opening: 13750.50, income: 4450.00,  expenses: 980.00,   closing: 17220.50 },
      { date: '2026-04-20', opening: 17220.50, income: 385.00,   expenses: 3500.00,  closing: 14105.50 },
      { date: '2026-04-22', opening: 14105.50, income: 8900.00,  expenses: 0,        closing: 23005.50 },
      { date: '2026-04-25', opening: 23005.50, income: 0,        expenses: 650.00,   closing: 22355.50 },
      { date: '2026-04-28', opening: 22355.50, income: 5200.00,  expenses: 1200.00,  closing: 26355.50 },
      { date: '2026-04-30', opening: 26355.50, income: 0,        expenses: 3200.00,  closing: 23155.50 },
    ],
    summary: {
      totals:  { income: 27885.00, expenses: 43150.00, net: -15265.00 },
      balance: { opening: 38420.50, closing: 23155.50, lowest_point: { date: '2026-04-15', value: 13750.50 } },
      risk:    { negative_days: 0, overall_status: 'warning', recommendation: 'Saldo equilibrado mas margem estreita no dia 10/04. Monitorar de perto.' },
    },
  },

  financial_summary: {
    current_balance:       38420.50,
    total_payable:         43710.00,
    total_receivable:      13785.00,
    fixed_costs_monthly:   35370.00,
    net_position:          8495.50,
    projected_balance_30d: 23155.50,
  },

  accounts_payable: {
    total: 7,
    items: [
      { id: 'ap-003', description: 'Aluguel Galpão — Abril/2026',     supplier_name: 'Imobiliária Central', amount: 8500.00,  due_date: '2026-04-05', status: 'overdue',  priority: 'critical', category: 'estrutura' },
      { id: 'ap-001', description: 'Tecido Oxford 30m',                supplier_name: 'Têxtil Sul Ltda',    amount: 4200.00,  due_date: '2026-04-09', status: 'open',    priority: 'critical', category: 'materia_prima' },
      { id: 'ap-002', description: 'Folha de Pagamento — Abril/2026',  supplier_name: 'Interno',            amount: 22000.00, due_date: '2026-04-10', status: 'open',    priority: 'critical', category: 'folha' },
      { id: 'ap-006', description: 'Energia Elétrica — Março/2026',    supplier_name: 'CEMIG',              amount: 2680.00,  due_date: '2026-04-10', status: 'open',    priority: 'high',     category: 'utilities' },
      { id: 'ap-004', description: 'Frete Fontes Log — Lote Março',    supplier_name: 'Fontes Log',         amount: 1850.00,  due_date: '2026-04-12', status: 'open',    priority: 'normal',   category: 'logistica' },
      { id: 'ap-005', description: 'Botões e Aviamentos',              supplier_name: 'Aviamentos Norte',  amount: 980.00,   due_date: '2026-04-15', status: 'open',    priority: 'normal',   category: 'materia_prima' },
      { id: 'ap-007', description: 'Marketing Digital — Agência Pixel',supplier_name: 'Agência Pixel',     amount: 3500.00,  due_date: '2026-04-20', status: 'open',    priority: 'normal',   category: 'marketing' },
    ],
  },

  accounts_receivable: {
    total: 4,
    items: [
      { id: 'ar-003', description: 'Parcela 2/3 — Escola Jardim Flor',      customer_name: 'Escola Municipal Jardim Flor', amount: 4200.00, due_date: '2026-04-08', status: 'overdue' },
      { id: 'ar-001', description: 'Boleto — Restaurante Belo Sabor',        customer_name: 'Restaurante Belo Sabor',       amount: 4750.00, due_date: '2026-04-10', status: 'open' },
      { id: 'ar-002', description: 'Boleto — Hotel Imperial (50% restante)', customer_name: 'Hotel Imperial',               amount: 4450.00, due_date: '2026-04-15', status: 'open' },
      { id: 'ar-004', description: 'Cartão — Parcela 1 (ord-003)',           customer_name: 'Maria Santos',                 amount: 385.00,  due_date: '2026-04-20', status: 'open' },
    ],
  },

  orders: {
    total: 5,
    items: [
      { id: 'ord-001', shopify_order_id: 'SHP-2026-4421', status: 'in_production', customer_name: 'João Ferreira',                 total_amount: 1890.00,  payment_status: 'paid',    created_at: '2026-04-06T09:15:00Z' },
      { id: 'ord-002', shopify_order_id: 'SHP-2026-4422', status: 'shipped',       customer_name: 'Restaurante Belo Sabor',         total_amount: 4750.00,  payment_status: 'paid',    created_at: '2026-04-05T14:30:00Z' },
      { id: 'ord-003', shopify_order_id: 'SHP-2026-4423', status: 'pending',       customer_name: 'Maria Santos',                   total_amount: 385.00,   payment_status: 'pending', created_at: '2026-04-08T06:45:00Z' },
      { id: 'ord-004', shopify_order_id: 'SHP-2026-4410', status: 'in_production', customer_name: 'Escola Municipal Jardim Flor',   total_amount: 12600.00, payment_status: 'paid',    created_at: '2026-04-01T10:00:00Z' },
      { id: 'ord-005', shopify_order_id: 'SHP-2026-4390', status: 'in_production', customer_name: 'Hotel Imperial',                 total_amount: 8900.00,  payment_status: 'pending', created_at: '2026-03-29T11:30:00Z' },
    ],
  },

  operations: {
    items: [
      { order_id: 'ord-001', stage: 'production', assigned_to: 'Equipe B', hours_since_update: 26, is_stuck: false, order: { shopify_order_id: 'SHP-2026-4421', customer_name: 'João Ferreira',              total_amount: 1890.00  } },
      { order_id: 'ord-004', stage: 'packing',    assigned_to: 'Equipe A', hours_since_update: 150, is_stuck: true,  order: { shopify_order_id: 'SHP-2026-4410', customer_name: 'Escola Jardim Flor',         total_amount: 12600.00 } },
      { order_id: 'ord-005', stage: 'cutting',    assigned_to: 'Equipe C', hours_since_update: 216, is_stuck: true,  order: { shopify_order_id: 'SHP-2026-4390', customer_name: 'Hotel Imperial',              total_amount: 8900.00  } },
    ],
  },

  logistics: {
    items: [
      {
        order_id: 'ord-002', order_ref: 'SHP-2026-4422', customer: 'Restaurante Belo Sabor',
        tracking: 'FL20260405001', carrier: 'fontes_log', latest_status: 'out_for_delivery',
        latest_location: 'Belo Horizonte, MG', is_exception: false,
        events: [
          { status: 'posted',           location: 'São Paulo, SP',   timestamp: '2026-04-06T08:00:00Z' },
          { status: 'in_transit',       location: 'Belo Horizonte',  timestamp: '2026-04-07T14:00:00Z' },
          { status: 'out_for_delivery', location: 'Belo Horizonte',  timestamp: '2026-04-08T07:30:00Z' },
        ],
      },
      {
        order_id: 'ord-004', order_ref: 'SHP-2026-4410', customer: 'Escola Municipal Jardim Flor',
        tracking: 'FL20260401004', carrier: 'fontes_log', latest_status: 'exception',
        latest_location: 'Campinas, SP', is_exception: true,
        events: [
          { status: 'posted',     location: 'São Paulo, SP', timestamp: '2026-04-03T10:00:00Z' },
          { status: 'in_transit', location: 'Campinas, SP',  timestamp: '2026-04-04T16:00:00Z' },
          { status: 'exception',  location: 'Campinas, SP',  timestamp: '2026-04-05T09:00:00Z', note: 'Endereço não localizado' },
        ],
      },
    ],
  },

  orders_summary: { pending: 1, in_production: 3, shipped: 1, total: 5 },
}

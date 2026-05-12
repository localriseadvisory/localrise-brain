-- ============================================================
-- LOCALRISE ADVISORY — DEMO AUTOMAÇÃO OPERACIONAL + FINANCEIRO
-- Schema de banco de dados (PostgreSQL / Supabase)
-- ============================================================

-- ==================== TABELAS CORE ====================

-- Pedidos (oriundos do Shopify)
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id VARCHAR(64) UNIQUE NOT NULL,
  status           VARCHAR(32) NOT NULL DEFAULT 'pending',
    -- pending | confirmed | in_production | shipped | delivered | cancelled
  customer_name    VARCHAR(128),
  customer_email   VARCHAR(256),
  total_amount     NUMERIC(12,2) NOT NULL,
  payment_status   VARCHAR(32) NOT NULL DEFAULT 'pending',
    -- pending | paid | refunded | chargeback
  payment_method   VARCHAR(64),
  line_items       JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shopify_created_at TIMESTAMPTZ,
  source           VARCHAR(32) DEFAULT 'shopify'
);

-- Entradas financeiras (receitas)
CREATE TABLE income (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID REFERENCES orders(id),
  erp_id           VARCHAR(64),
  description      VARCHAR(256) NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  category         VARCHAR(64) NOT NULL,
    -- vendas_shopify | vendas_atacado | servicos | devolucao | outros
  status           VARCHAR(32) NOT NULL DEFAULT 'projected',
    -- projected | received | overdue | cancelled
  expected_date    DATE NOT NULL,
  received_date    DATE,
  payment_method   VARCHAR(64),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saídas financeiras (despesas)
CREATE TABLE expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id           VARCHAR(64),
  description      VARCHAR(256) NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  category         VARCHAR(64) NOT NULL,
    -- custo_fixo | custo_variavel | fornecedor | logistica | marketing | folha | impostos | outros
  cost_type        VARCHAR(16) NOT NULL DEFAULT 'variable',
    -- fixed | variable
  status           VARCHAR(32) NOT NULL DEFAULT 'projected',
    -- projected | paid | overdue | cancelled
  due_date         DATE NOT NULL,
  paid_date        DATE,
  supplier_name    VARCHAR(128),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custos fixos cadastrados (base mensal)
CREATE TABLE fixed_costs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(128) NOT NULL,
  description      TEXT,
  monthly_amount   NUMERIC(12,2) NOT NULL,
  category         VARCHAR(64) NOT NULL,
  due_day          INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  supplier_name    VARCHAR(128),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custos variáveis por período
CREATE TABLE variable_costs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID REFERENCES orders(id),
  name             VARCHAR(128) NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  category         VARCHAR(64) NOT NULL,
    -- frete | embalagem | materia_prima | comissao | marketplace | outros
  reference_month  DATE NOT NULL, -- primeiro dia do mês de referência
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas a pagar
CREATE TABLE accounts_payable (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id           VARCHAR(64) UNIQUE,
  description      VARCHAR(256) NOT NULL,
  supplier_name    VARCHAR(128),
  amount           NUMERIC(12,2) NOT NULL,
  due_date         DATE NOT NULL,
  status           VARCHAR(32) NOT NULL DEFAULT 'open',
    -- open | paid | overdue | cancelled | renegotiated
  priority         VARCHAR(16) DEFAULT 'normal',
    -- critical | high | normal | low
  category         VARCHAR(64),
  payment_method   VARCHAR(64),
  paid_date        DATE,
  paid_amount      NUMERIC(12,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas a receber
CREATE TABLE accounts_receivable (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_id           VARCHAR(64) UNIQUE,
  order_id         UUID REFERENCES orders(id),
  description      VARCHAR(256) NOT NULL,
  customer_name    VARCHAR(128),
  amount           NUMERIC(12,2) NOT NULL,
  due_date         DATE NOT NULL,
  status           VARCHAR(32) NOT NULL DEFAULT 'open',
    -- open | received | overdue | cancelled | negotiating
  received_date    DATE,
  received_amount  NUMERIC(12,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projeção de fluxo de caixa (calculada automaticamente)
CREATE TABLE cash_flow_projection (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_date  DATE NOT NULL UNIQUE,
  opening_balance  NUMERIC(12,2) NOT NULL DEFAULT 0,
  projected_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  projected_expenses NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_balance  NUMERIC(12,2) GENERATED ALWAYS AS
                   (opening_balance + projected_income - projected_expenses) STORED,
  is_negative      BOOLEAN GENERATED ALWAYS AS
                   ((opening_balance + projected_income - projected_expenses) < 0) STORED,
  income_detail    JSONB DEFAULT '[]',
  expense_detail   JSONB DEFAULT '[]',
  calculated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operação / Produção
CREATE TABLE operations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID REFERENCES orders(id),
  stage            VARCHAR(64) NOT NULL DEFAULT 'queue',
    -- queue | cutting | production | quality | packing | ready | shipped
  priority         INTEGER DEFAULT 0,
  assigned_to      VARCHAR(128),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  estimated_hours  NUMERIC(6,2),
  actual_hours     NUMERIC(6,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logística
CREATE TABLE logistics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID REFERENCES orders(id),
  tracking_code    VARCHAR(128),
  carrier          VARCHAR(64),
    -- fontes_log | correios | jadlog | transportadora_x
  status           VARCHAR(64) NOT NULL,
    -- posted | in_transit | out_for_delivery | delivered | returned | exception
  location         VARCHAR(256),
  event_timestamp  TIMESTAMPTZ NOT NULL,
  raw_payload      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alertas do sistema
CREATE TABLE alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             VARCHAR(64) NOT NULL,
    -- insufficient_balance | payment_due | payment_mismatch | cost_anomaly | order_stuck | overdue_receivable
  severity         VARCHAR(16) NOT NULL DEFAULT 'warning',
    -- critical | warning | info
  title            VARCHAR(256) NOT NULL,
  message          TEXT NOT NULL,
  reference_id     UUID,      -- ID do registro relacionado
  reference_table  VARCHAR(64), -- tabela relacionada
  status           VARCHAR(32) NOT NULL DEFAULT 'active',
    -- active | acknowledged | resolved | dismissed
  triggered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ,
  notified_channels JSONB DEFAULT '[]',
    -- ["email", "whatsapp", "slack", "dashboard"]
  metadata         JSONB DEFAULT '{}'
);

-- Saldo atual (snapshot atualizado por trigger)
CREATE TABLE current_balance (
  id               INTEGER PRIMARY KEY DEFAULT 1,  -- sempre linha 1
  balance          NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1)  -- garante linha única
);

INSERT INTO current_balance (balance) VALUES (0) ON CONFLICT DO NOTHING;

-- ==================== ÍNDICES ====================

CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_created       ON orders(created_at DESC);
CREATE INDEX idx_income_expected_date ON income(expected_date);
CREATE INDEX idx_income_status        ON income(status);
CREATE INDEX idx_expenses_due_date    ON expenses(due_date);
CREATE INDEX idx_expenses_status      ON expenses(status);
CREATE INDEX idx_ap_due_date          ON accounts_payable(due_date);
CREATE INDEX idx_ap_status            ON accounts_payable(status);
CREATE INDEX idx_ar_due_date          ON accounts_receivable(due_date);
CREATE INDEX idx_ar_status            ON accounts_receivable(status);
CREATE INDEX idx_alerts_status        ON alerts(status);
CREATE INDEX idx_alerts_type          ON alerts(type);
CREATE INDEX idx_cf_projection_date   ON cash_flow_projection(projection_date);
CREATE INDEX idx_logistics_order      ON logistics_events(order_id);
CREATE INDEX idx_ops_order            ON operations(order_id);

-- ==================== VIEWS ====================

-- Visão do fluxo de caixa próximos 30 dias
CREATE OR REPLACE VIEW v_cash_flow_30d AS
SELECT
  projection_date,
  opening_balance,
  projected_income,
  projected_expenses,
  closing_balance,
  is_negative,
  CASE
    WHEN closing_balance < 0        THEN 'critical'
    WHEN closing_balance < 5000     THEN 'warning'
    WHEN closing_balance < 15000    THEN 'attention'
    ELSE 'healthy'
  END AS balance_status
FROM cash_flow_projection
WHERE projection_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY projection_date;

-- Resumo financeiro do mês atual
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  DATE_TRUNC('month', CURRENT_DATE)::DATE AS reference_month,
  (SELECT COALESCE(SUM(amount),0) FROM income
   WHERE status = 'received'
   AND DATE_TRUNC('month', received_date) = DATE_TRUNC('month', CURRENT_DATE)) AS received_income,
  (SELECT COALESCE(SUM(amount),0) FROM income
   WHERE DATE_TRUNC('month', expected_date) = DATE_TRUNC('month', CURRENT_DATE)) AS projected_income,
  (SELECT COALESCE(SUM(amount),0) FROM expenses
   WHERE status = 'paid'
   AND DATE_TRUNC('month', paid_date) = DATE_TRUNC('month', CURRENT_DATE)) AS paid_expenses,
  (SELECT COALESCE(SUM(amount),0) FROM expenses
   WHERE DATE_TRUNC('month', due_date) = DATE_TRUNC('month', CURRENT_DATE)) AS projected_expenses,
  (SELECT COUNT(*) FROM orders
   WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS total_orders,
  (SELECT COUNT(*) FROM alerts WHERE status = 'active') AS active_alerts;

-- Contas a pagar vencendo em 7 dias
CREATE OR REPLACE VIEW v_upcoming_payments AS
SELECT
  id, description, supplier_name, amount, due_date,
  due_date - CURRENT_DATE AS days_until_due,
  CASE
    WHEN due_date < CURRENT_DATE         THEN 'overdue'
    WHEN due_date = CURRENT_DATE         THEN 'today'
    WHEN due_date <= CURRENT_DATE + 3    THEN 'critical'
    WHEN due_date <= CURRENT_DATE + 7    THEN 'warning'
    ELSE 'ok'
  END AS urgency
FROM accounts_payable
WHERE status = 'open'
AND due_date <= CURRENT_DATE + 7
ORDER BY due_date;

-- Pedidos travados na operação (sem atualização há mais de 2 dias)
CREATE OR REPLACE VIEW v_stuck_orders AS
SELECT
  o.shopify_order_id,
  o.customer_name,
  o.total_amount,
  op.stage,
  op.updated_at AS last_operation_update,
  EXTRACT(EPOCH FROM (NOW() - op.updated_at))/3600 AS hours_stuck
FROM operations op
JOIN orders o ON o.id = op.order_id
WHERE op.stage NOT IN ('shipped', 'delivered', 'cancelled')
AND op.updated_at < NOW() - INTERVAL '48 hours'
ORDER BY op.updated_at;

-- ==================== FUNÇÕES ====================

-- Recalcular saldo atual
CREATE OR REPLACE FUNCTION recalculate_current_balance()
RETURNS NUMERIC AS $$
DECLARE
  total_received  NUMERIC;
  total_paid      NUMERIC;
  balance         NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_received
  FROM income WHERE status = 'received';

  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM expenses WHERE status = 'paid';

  balance := total_received - total_paid;

  UPDATE current_balance SET balance = balance, last_updated = NOW()
  WHERE id = 1;

  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Trigger: atualiza saldo ao registrar receita/despesa
CREATE OR REPLACE FUNCTION trg_update_balance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_current_balance();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_income_balance
  AFTER INSERT OR UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION trg_update_balance();

CREATE TRIGGER trg_expense_balance
  AFTER INSERT OR UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION trg_update_balance();

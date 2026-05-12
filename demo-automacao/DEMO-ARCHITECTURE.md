# LocalRise Advisory — Demo de Automação Operacional + Financeiro

> **Arquiteto:** LocalRise Advisory  
> **Status:** Demo funcional com dados mockados  
> **Stack:** Node.js · PostgreSQL/Supabase · n8n · REST APIs

---

## 1. Resumo da Automação

Esta automação atua como o **sistema nervoso central** entre Shopify, ERP e logística (Fontes Log). Ela coleta eventos de cada fonte, processa e classifica os dados, atualiza bases financeiras e operacionais em tempo real, e dispara alertas inteligentes — sem intervenção manual.

O resultado é uma **visão unificada e sempre atualizada** de:
- Quanto vai entrar e sair de caixa nos próximos 30 dias
- O status de cada pedido na produção e na entrega
- Quais contas precisam de atenção urgente
- Onde há risco de descasamento entre recebimento e pagamento

---

## 2. Problema que Resolve

| Problema atual (sem automação) | Com a automação |
|---|---|
| Planilha de caixa desatualizada | Fluxo de caixa atualizado em tempo real |
| Vencimento de boleto esquecido | Alerta 72h, 24h e no dia do vencimento |
| Status do pedido desconhecido | Painel operacional por estágio |
| ERP ≠ banco ≠ planilha ≠ realidade | Fonte única de verdade consolidada |
| Recebimento não cobrado a tempo | Alerta de inadimplência automático |
| Custo fixo acima do normal não percebido | Detecção de anomalia de custo |
| Pedido travado na produção 10 dias | Alerta de pedido sem atualização > 48h |

---

## 3. Fluxos Automáticos

```
SHOPIFY ──────────────────────────────────────────────────────────────────────────┐
  Webhook: orders/create, orders/updated, orders/paid                             │
  ↓                                                                                │
  Normaliza pedido → Insere em orders → Classifica receita → Registra em income   │
  → Cria operação na fila de produção → Recalcula fluxo de caixa                  │
                                                                                   │
ERP ──────────────────────────────────────────────────────────────────────────────┤  BASE CENTRAL
  Cron a cada 1h: Sync contas a pagar + contas a receber                          │  (PostgreSQL)
  ↓                                                                                │
  Upsert em accounts_payable + accounts_receivable → Recalcula projeção           │
                                                                                   │
FONTES LOG ───────────────────────────────────────────────────────────────────────┤
  Webhook: status updates, exceções, entregas                                     │
  ↓                                                                                │
  Insere em logistics_events → Atualiza status do pedido                          │
  → Se exceção: cria alerta imediato                                              │
                                                                                   │
MOTOR DE ALERTAS ────────────────────────────────────────────────────────────────┤
  Cron a cada 30min: verifica todas as condições de risco                         │
  → Gera alertas → Envia WhatsApp/email se crítico                               │
                                                                                   │
PROJEÇÃO DE CAIXA ───────────────────────────────────────────────────────────────┘
  Cron diário 6h: projeta 30 dias → detecta gaps → gera alertas preventivos
```

---

## 4. Arquitetura da Demo

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE ENTRADA                        │
│  Shopify Webhook  │  ERP API (Cron)  │  Fontes Log Webhook  │
└────────────┬──────────────┬───────────────────┬────────────┘
             │              │                   │
             ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n (ORQUESTRADOR)                       │
│  • Recebe webhooks   • Agenda syncs    • Roteia eventos     │
│  • Transforma dados  • Chama endpoints  • Trata erros       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express — porta 3001)             │
│                                                             │
│  /api/internal/webhook/shopify    — processa pedido        │
│  /api/internal/webhook/logistics  — processa entrega       │
│  /api/internal/recalculate-cashflow — projeta caixa        │
│  /api/internal/run-alert-engine   — executa alertas        │
│  /api/internal/send-notifications — envia alertas         │
│                                                             │
│  ENGINES:                                                   │
│  • AlertEngine     — detecta 7 tipos de risco              │
│  • CashFlowEngine  — projeta N dias de caixa               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DADOS (PostgreSQL / Supabase)          │
│                                                             │
│  orders           income              expenses             │
│  fixed_costs      variable_costs      accounts_payable     │
│  accounts_receivable                  cash_flow_projection │
│  operations       logistics_events    alerts               │
│  current_balance                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 ROTAS PÚBLICAS (Dashboard)                  │
│                                                             │
│  GET /api/dashboard           — resumo executivo           │
│  GET /api/financial/cashflow  — projeção 30 dias           │
│  GET /api/financial/summary   — posição financeira         │
│  GET /api/alerts              — alertas ativos             │
│  GET /api/orders              — lista de pedidos           │
│  GET /api/operations          — painel de produção         │
│  GET /api/logistics           — rastreamento               │
└─────────────────────────────────────────────────────────────┘
```

**Gatilhos:**
- Shopify: webhook HTTP POST (evento real)
- ERP: cron a cada 1h
- Projeção de caixa: cron diário às 6h
- Motor de alertas: cron a cada 30min
- Pedidos travados: cron a cada 6h
- Fontes Log: webhook HTTP POST (evento real)

---

## 5. Estrutura de Dados

Ver [schema.sql](./schema.sql) para definição completa. Tabelas principais:

| Tabela | Propósito |
|---|---|
| `orders` | Pedidos vindos do Shopify |
| `income` | Todas as entradas financeiras |
| `expenses` | Todas as saídas financeiras |
| `fixed_costs` | Custos fixos mensais cadastrados |
| `variable_costs` | Custos variáveis por pedido/período |
| `accounts_payable` | Contas a pagar (sync com ERP) |
| `accounts_receivable` | Contas a receber (sync com ERP) |
| `cash_flow_projection` | Projeção calculada dia a dia |
| `operations` | Estágio de cada pedido na produção |
| `logistics_events` | Eventos de rastreamento |
| `alerts` | Alertas gerados pelo sistema |
| `current_balance` | Saldo atual (atualizado por trigger) |

---

## 6. Demo MVP — Como Testar

### Iniciar o backend (modo demo com dados mockados)

```bash
cd demo-automacao/backend
npm install
npm run demo
# Server em http://localhost:3001
```

### Endpoints para apresentação

```bash
# Visão geral do dashboard
curl http://localhost:3001/api/dashboard

# Fluxo de caixa projetado 30 dias
curl http://localhost:3001/api/financial/cashflow

# Alertas ativos
curl http://localhost:3001/api/alerts

# Pedidos em produção
curl "http://localhost:3001/api/orders?status=in_production"

# Contas a pagar urgentes (próximos 7 dias)
curl "http://localhost:3001/api/financial/accounts-payable?days=7"

# Status logístico
curl http://localhost:3001/api/logistics
```

### Simular webhook Shopify (novo pedido)

```bash
curl -X POST http://localhost:3001/api/internal/webhook/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "id": 99999,
    "email": "novo@cliente.com.br",
    "financial_status": "paid",
    "total_price": "2400.00",
    "payment_gateway": "pix",
    "billing_address": { "first_name": "Carlos", "last_name": "Demo" },
    "line_items": [
      { "sku": "UNI-DEM-001", "name": "Uniforme Demo", "quantity": 4, "price": "600.00" }
    ]
  }'
```

### Simular exceção logística

```bash
curl -X POST http://localhost:3001/api/internal/webhook/logistics \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_code": "FL20260401004",
    "order_id": "ord-004",
    "status": "exception",
    "location": "Campinas, SP",
    "note": "Endereço não localizado"
  }'
```

### Executar motor de alertas manualmente

```bash
curl -X POST http://localhost:3001/api/internal/run-alert-engine
```

### Registrar pagamento de conta

```bash
curl -X POST http://localhost:3001/api/financial/accounts-payable/ap-001/pay
```

---

## 7. Fluxo n8n — Resumo dos Workflows

Ver [n8n/workflow-completo.json](./n8n/workflow-completo.json) para importar no n8n.

| Workflow | Trigger | Frequência |
|---|---|---|
| Shopify Order Processor | Webhook POST /webhook/shopify/orders | Tempo real |
| ERP Sync — Payables | Schedule | A cada 1h |
| ERP Sync — Receivables | Schedule | A cada 1h |
| Cash Flow Daily Projection | Cron 0 6 * * * | Diário 6h |
| Alert Engine Runner | Cron */30 * * * * | A cada 30min |
| Stuck Orders Check | Cron 0 */6 * * * | A cada 6h |
| Fontes Log Webhook | Webhook POST /webhook/logistics/fontes-log | Tempo real |

---

## 8. Integrações Simuladas

| Fonte | Status demo | O que vem em produção |
|---|---|---|
| **Shopify** | Mock com 3 pedidos reais | Webhook `orders/create`, `orders/updated`, `orders/paid` via Admin API |
| **ERP (TOTVS/Omie)** | Mock com contas a pagar + receber | REST API com autenticação Bearer Token, polling a cada hora |
| **Fontes Log** | Mock com 2 rastreamentos + 1 exceção | Webhook POST em endpoint cadastrado na plataforma |
| **WhatsApp** | Log no console | Integração via API Evolution ou Z-API |
| **Email** | Log no console | SMTP / SendGrid / Amazon SES |
| **PostgreSQL/Supabase** | Estado in-memory (reinicia com o server) | Supabase em produção com RLS |

---

## 9. Alertas — Referência Completa

| Tipo | Severidade | Condição |
|---|---|---|
| `payment_due` | critical | Conta a pagar vence em ≤ 2 dias ou já vencida |
| `payment_due` | warning | Conta a pagar vence em 3-7 dias |
| `overdue_receivable` | warning/critical | Conta a receber vencida sem confirmação |
| `insufficient_balance` | critical | Saldo projetado negativo em qualquer dia |
| `insufficient_balance` | warning | Saldo projetado < R$ 10.000 |
| `payment_mismatch` | warning/critical | Gap de saídas vs entradas > R$ 5.000 em 14 dias |
| `cost_anomaly` | info/warning | Custo fixo ≥ 15% acima da média histórica |
| `order_stuck` | warning/critical | Pedido sem atualização operacional > 48h |
| `logistics_exception` | warning | Exceção de entrega detectada no rastreamento |

---

## 10. Estrutura de Arquivos

```
demo-automacao/
├── DEMO-ARCHITECTURE.md          ← Este documento
├── schema.sql                    ← DDL completo (PostgreSQL)
│
├── mock-data/
│   └── mock-data.json            ← Dados de exemplo realistas
│
├── n8n/
│   └── workflow-completo.json    ← Importar diretamente no n8n
│
├── backend/
│   ├── package.json
│   ├── server.js                 ← API Express (porta 3001)
│   ├── alert-engine.js           ← Motor de 7 tipos de alertas
│   ├── cash-flow-engine.js       ← Projeção de caixa dia a dia
│   └── integrations/
│       ├── shopify.js            ← Integração Shopify (mockada)
│       ├── erp.js                ← Integração ERP (mockada)
│       └── logistics.js          ← Integração Fontes Log (mockada)
│
└── dashboard/                    ← (próxima fase) Interface React/Next.js
```

---

## 11. Próximos Passos Técnicos

### Fase 1 — Conectar dados reais (1-2 semanas)
- [ ] Criar projeto Supabase + rodar `schema.sql`
- [ ] Cadastrar webhook no painel Shopify → URL do n8n
- [ ] Conectar n8n ao banco (node Postgres com credenciais)
- [ ] Substituir mocks do ERP pela API real (Omie/TOTVS)
- [ ] Cadastrar URL de webhook na Fontes Log

### Fase 2 — Alertas e notificações reais (1 semana)
- [ ] Configurar Evolution API ou Z-API para WhatsApp
- [ ] Configurar SendGrid ou Amazon SES para email
- [ ] Conectar `send-notifications` no servidor a essas APIs
- [ ] Definir número/email de destino dos alertas críticos

### Fase 3 — Dashboard visual (2-3 semanas)
- [ ] Interface Next.js consumindo `/api/dashboard`
- [ ] Painel de fluxo de caixa com gráfico de barras (30 dias)
- [ ] Painel de alertas com filtros por severidade
- [ ] Painel operacional com kanban de estágios de produção
- [ ] Painel de rastreamento logístico

### Fase 4 — SaaS multi-cliente (roadmap)
- [ ] Autenticação por empresa (tenant)
- [ ] Row Level Security no Supabase por client_id
- [ ] Configuração de thresholds por cliente
- [ ] Portal web de auto-atendimento
- [ ] Relatórios automáticos mensais

---

## Separação: Automação vs Interface SaaS

| Camada | O que é | Construído aqui |
|---|---|---|
| **Automação** (este projeto) | Coleta, processa, classifica, armazena, alerta | Sim — funcional |
| **Interface SaaS** (próxima fase) | Dashboard visual, portal do cliente | Não — próxima entrega |

A automação **não depende da interface para funcionar**. Os alertas chegam por WhatsApp/email independentemente. O dashboard é uma camada adicional de visualização, não um pré-requisito.

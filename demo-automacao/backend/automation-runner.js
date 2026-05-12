/**
 * LOCALRISE — Motor de Automação
 *
 * Roda automaticamente em background junto com o servidor.
 * Substitui o n8n para fins de demo — todos os jobs são internos.
 *
 * Jobs:
 *   • Alert Engine        — a cada 30 segundos (demo) / 30 min (produção)
 *   • Cash Flow Engine    — a cada 2 minutos (demo) / 1x por dia (produção)
 *   • ERP Sync            — a cada 1 minuto (demo) / 1x por hora (produção)
 *   • Stuck Orders Check  — a cada 1 minuto (demo) / 6x por dia (produção)
 *   • Shopify Sync        — simulado via webhook
 */

const { AlertEngine }    = require('./alert-engine');
const { CashFlowEngine } = require('./cash-flow-engine');
const { ErpIntegration } = require('./integrations/erp');
const { LogisticsIntegration } = require('./integrations/logistics');

// Intervalos em modo DEMO (curtos para ver funcionando ao vivo)
const INTERVALS = {
  alertEngine:   30  * 1000,   //  30 segundos
  cashFlow:      2   * 60000,  //   2 minutos
  erpSync:       1   * 60000,  //   1 minuto
  stuckOrders:   1   * 60000,  //   1 minuto
  logisticsSync: 45  * 1000,   //  45 segundos
}

const LOG_PREFIX = {
  alert:     '🔔 [ALERTAS]',
  cashflow:  '💰 [CAIXA]  ',
  erp:       '🏢 [ERP]    ',
  ops:       '🏭 [OPERAÇÃO]',
  logistics: '🚚 [LOGÍST.]',
  system:    '⚙️  [SISTEMA]',
}

function log(prefix, msg) {
  const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  console.log(`  ${ts} ${prefix} ${msg}`)
}

function separator() {
  console.log('  ' + '─'.repeat(60))
}

// ── JOB 1: Motor de Alertas ──────────────────────────────────────

function runAlertEngine(state) {
  try {
    const result = AlertEngine.run(state)

    if (result.new_alerts.length > 0) {
      result.new_alerts.forEach(a => state.alerts.push(a))
      log(LOG_PREFIX.alert, `${result.new_alerts.length} alerta(s) gerado(s) | críticos: ${result.critical_count} | warnings: ${result.warning_count}`)

      // Simular envio de notificação para alertas críticos
      const criticals = result.new_alerts.filter(a => a.severity === 'critical')
      if (criticals.length > 0) {
        criticals.forEach(a => {
          log(LOG_PREFIX.alert, `📱 WhatsApp → "${a.title}"`)
        })
      }
    } else {
      log(LOG_PREFIX.alert, 'Nenhum alerta novo. Sistema ok.')
    }
  } catch (err) {
    log(LOG_PREFIX.alert, `ERRO: ${err.message}`)
  }
}

// ── JOB 2: Projeção de Fluxo de Caixa ───────────────────────────

function runCashFlowEngine(state) {
  try {
    const projection   = CashFlowEngine.buildProjection(state, 30)
    const summary      = CashFlowEngine.summarize(projection)
    state.cash_flow    = projection

    const negative = projection.filter(d => d.closing < 0)
    const lowest   = summary.balance.lowest_point

    log(LOG_PREFIX.cashflow,
      `Saldo abertura: R$ ${state.current_balance.toFixed(0)} | ` +
      `Menor projetado: R$ ${lowest.value.toFixed(0)} (${lowest.date}) | ` +
      `Dias negativos: ${negative.length}`
    )

    if (negative.length > 0) {
      log(LOG_PREFIX.cashflow, `⚠️  RISCO: ${summary.risk.recommendation}`)
    } else {
      log(LOG_PREFIX.cashflow, `✅ ${summary.risk.recommendation}`)
    }
  } catch (err) {
    log(LOG_PREFIX.cashflow, `ERRO: ${err.message}`)
  }
}

// ── JOB 3: Sync ERP ─────────────────────────────────────────────

async function runErpSync(state) {
  try {
    const today   = new Date().toISOString().split('T')[0]
    const future  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const [payables, receivables] = await Promise.all([
      ErpIntegration.getAccountsPayable({ due_date_from: today, due_date_to: future }),
      ErpIntegration.getAccountsReceivable({ due_date_from: today, due_date_to: future }),
    ])

    // Upsert por erp_id
    payables.data.forEach(erp_ap => {
      const existing = state.accounts_payable.find(a => a.id === erp_ap.erp_id)
      if (!existing) {
        state.accounts_payable.push({
          ...erp_ap,
          id: erp_ap.erp_id,
          priority: 'normal',
        })
      } else {
        existing.amount   = erp_ap.amount
        existing.status   = erp_ap.status
        existing.due_date = erp_ap.due_date
      }
    })

    receivables.data.forEach(erp_ar => {
      const existing = state.accounts_receivable.find(a => a.id === erp_ar.erp_id)
      if (!existing) {
        state.accounts_receivable.push({ ...erp_ar, id: erp_ar.erp_id })
      } else {
        existing.amount   = erp_ar.amount
        existing.status   = erp_ar.status
        existing.due_date = erp_ar.due_date
      }
    })

    log(LOG_PREFIX.erp,
      `AP sincronizadas: ${payables.total} | AR sincronizadas: ${receivables.total} | Fonte: ${payables.source}`
    )
  } catch (err) {
    log(LOG_PREFIX.erp, `ERRO: ${err.message}`)
  }
}

// ── JOB 4: Verificar Pedidos Travados ───────────────────────────

function runStuckOrdersCheck(state) {
  try {
    const THRESHOLD_H = 48
    const stuck = (state.operations || []).filter(op => {
      if (['shipped','delivered','cancelled'].includes(op.stage)) return false
      const h = (Date.now() - new Date(op.updated_at).getTime()) / 3600000
      return h >= THRESHOLD_H
    })

    if (stuck.length > 0) {
      stuck.forEach(op => {
        const order = state.orders.find(o => o.id === op.order_id)
        const hours = Math.round((Date.now() - new Date(op.updated_at).getTime()) / 3600000)
        log(LOG_PREFIX.ops, `⚠️  Travado ${hours}h | ${order?.shopify_order_id} | ${op.stage} | ${op.assigned_to}`)

        // Criar alerta se ainda não existir
        const sig = `order_stuck__${op.order_id}`
        const exists = state.alerts.find(a => a._signature === sig && a.status === 'active')
        if (!exists) {
          state.alerts.push({
            id:          `alr-stuck-auto-${op.order_id}`,
            type:        'order_stuck',
            severity:    hours > 120 ? 'critical' : 'warning',
            title:       `Pedido travado ${hours}h: ${order?.shopify_order_id}`,
            message:     `Na fase "${op.stage}" há ${hours}h sem atualização. Responsável: ${op.assigned_to}.`,
            status:      'active',
            triggered_at: new Date().toISOString(),
            _signature:  sig,
          })
        }
      })
    } else {
      log(LOG_PREFIX.ops, `Todos os pedidos ativos atualizados. Sem gargalos.`)
    }
  } catch (err) {
    log(LOG_PREFIX.ops, `ERRO: ${err.message}`)
  }
}

// ── JOB 5: Sync Logística ────────────────────────────────────────

async function runLogisticsSync(state) {
  try {
    const result = await LogisticsIntegration.listActiveShipments()

    result.shipments.forEach(ship => {
      const existing = state.logistics.find(l => l.tracking_code === ship.tracking_code)
      if (existing) {
        existing.status = ship.latest_status || existing.status
      }
    })

    const exceptions = result.shipments.filter(s => s.is_exception)
    const delayed    = result.shipments.filter(s => s.is_delayed)

    log(LOG_PREFIX.logistics,
      `Envios ativos: ${result.total} | Exceções: ${exceptions.length} | Atrasados: ${delayed.length}`
    )

    if (exceptions.length > 0) {
      exceptions.forEach(e => {
        log(LOG_PREFIX.logistics, `⚠️  Exceção: ${e.tracking_code} em ${e.latest_event?.location}`)
      })
    }
  } catch (err) {
    log(LOG_PREFIX.logistics, `ERRO: ${err.message}`)
  }
}

// ── INICIALIZAR TODOS OS JOBS ────────────────────────────────────

function startAutomation(state) {
  separator()
  console.log('  ⚡ LOCALRISE — Motor de Automação iniciado')
  console.log(`  📅 ${new Date().toLocaleString('pt-BR')}`)
  separator()

  // Executar imediatamente na inicialização
  runAlertEngine(state)
  runCashFlowEngine(state)
  runErpSync(state).then(() => {})
  runStuckOrdersCheck(state)
  runLogisticsSync(state).then(() => {})

  separator()
  console.log('  Jobs agendados:')
  console.log(`  • Alertas     → cada ${INTERVALS.alertEngine/1000}s`)
  console.log(`  • Caixa       → cada ${INTERVALS.cashFlow/60000}min`)
  console.log(`  • ERP Sync    → cada ${INTERVALS.erpSync/60000}min`)
  console.log(`  • Op. Travada → cada ${INTERVALS.stuckOrders/60000}min`)
  console.log(`  • Logística   → cada ${INTERVALS.logisticsSync/1000}s`)
  separator()

  // Agendar jobs recorrentes
  setInterval(() => {
    separator()
    runAlertEngine(state)
  }, INTERVALS.alertEngine)

  setInterval(() => {
    separator()
    runCashFlowEngine(state)
  }, INTERVALS.cashFlow)

  setInterval(() => {
    separator()
    runErpSync(state).then(() => {})
  }, INTERVALS.erpSync)

  setInterval(() => {
    separator()
    runStuckOrdersCheck(state)
  }, INTERVALS.stuckOrders)

  setInterval(() => {
    separator()
    runLogisticsSync(state).then(() => {})
  }, INTERVALS.logisticsSync)
}

module.exports = { startAutomation }

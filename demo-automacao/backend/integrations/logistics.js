/**
 * LOCALRISE — Integração Logística Fontes Log (Simulada para Demo)
 *
 * Em produção: conecta via API REST da transportadora
 * Em demo: retorna dados mockados com eventos realistas
 *
 * Funcionalidades:
 *   - Rastreamento em tempo real
 *   - Webhook de atualização de status
 *   - Detecção de exceções
 *   - Estimativa de prazo de entrega
 */

const MOCK_TRACKING = {
  'FL20260405001': {
    order_id:       'ord-002',
    status:         'out_for_delivery',
    carrier:        'Fontes Log',
    recipient:      'Restaurante Belo Sabor',
    origin:         'São Paulo, SP',
    destination:    'Belo Horizonte, MG',
    estimated_delivery: '2026-04-08',
    events: [
      { status: 'posted',           ts: '2026-04-06T08:00:00Z', location: 'São Paulo, SP',   desc: 'Objeto postado' },
      { status: 'in_transit',       ts: '2026-04-07T14:00:00Z', location: 'Belo Horizonte',  desc: 'Em trânsito' },
      { status: 'out_for_delivery', ts: '2026-04-08T07:30:00Z', location: 'Belo Horizonte',  desc: 'Saiu para entrega' }
    ]
  },
  'FL20260401004': {
    order_id:       'ord-004',
    status:         'exception',
    carrier:        'Fontes Log',
    recipient:      'Escola Municipal Jardim Flor',
    origin:         'São Paulo, SP',
    destination:    'Campinas, SP',
    estimated_delivery: '2026-04-04',
    events: [
      { status: 'posted',     ts: '2026-04-03T10:00:00Z', location: 'São Paulo, SP',   desc: 'Objeto postado' },
      { status: 'in_transit', ts: '2026-04-04T16:00:00Z', location: 'Campinas, SP',    desc: 'Em trânsito para Campinas' },
      { status: 'exception',  ts: '2026-04-05T09:00:00Z', location: 'Campinas, SP',    desc: 'Endereço não localizado — aguardando contato com destinatário', note: 'Tentar entrega novamente após confirmação' }
    ]
  }
};

class LogisticsIntegration {
  /**
   * Rastreia um envio pelo código de rastreamento
   * Em produção: GET {FONTES_LOG_URL}/api/tracking/{code}
   */
  static async track(tracking_code) {
    await LogisticsIntegration._delay(150);

    const record = MOCK_TRACKING[tracking_code];
    if (!record) {
      return {
        found:         false,
        tracking_code,
        message:       'Código de rastreamento não encontrado'
      };
    }

    const latest = record.events[record.events.length - 1];

    return {
      found:              true,
      tracking_code,
      source:             'fontes_log_mock',
      order_id:           record.order_id,
      status:             record.status,
      carrier:            record.carrier,
      recipient:          record.recipient,
      origin:             record.origin,
      destination:        record.destination,
      estimated_delivery: record.estimated_delivery,
      is_exception:       record.status === 'exception',
      is_delivered:       record.status === 'delivered',
      latest_event:       latest,
      events:             record.events
    };
  }

  /**
   * Lista todos os envios ativos
   * Em produção: GET {FONTES_LOG_URL}/api/shipments?status=active
   */
  static async listActiveShipments() {
    await LogisticsIntegration._delay(200);

    const shipments = Object.entries(MOCK_TRACKING).map(([code, data]) => ({
      tracking_code: code,
      order_id:      data.order_id,
      status:        data.status,
      recipient:     data.recipient,
      destination:   data.destination,
      estimated:     data.estimated_delivery,
      is_exception:  data.status === 'exception',
      is_delayed:    new Date(data.estimated_delivery) < new Date() && data.status !== 'delivered',
      latest_event:  data.events[data.events.length - 1]
    }));

    const exceptions = shipments.filter(s => s.is_exception);
    const delayed    = shipments.filter(s => s.is_delayed && !s.is_exception);

    return {
      source:     'fontes_log_mock',
      total:      shipments.length,
      exceptions: exceptions.length,
      delayed:    delayed.length,
      shipments
    };
  }

  /**
   * Solicita coleta de novo envio
   * Em produção: POST {FONTES_LOG_URL}/api/shipments
   */
  static async requestPickup(order_data) {
    await LogisticsIntegration._delay(300);

    const tracking_code = `FL${Date.now()}`;

    return {
      source:         'fontes_log_mock',
      success:        true,
      tracking_code,
      order_id:       order_data.order_id,
      pickup_date:    new Date().toISOString().split('T')[0],
      estimated_delivery: LogisticsIntegration._estimateDelivery(order_data.destination_state),
      label_url:      `https://fontes-log.demo/label/${tracking_code}.pdf`
    };
  }

  /**
   * Simula payload de webhook enviado pela Fontes Log
   * Usado para testar o pipeline sem precisar da integração real
   */
  static generateWebhookPayload(tracking_code, status, options = {}) {
    const statusDescriptions = {
      posted:           'Objeto postado na unidade de origem',
      in_transit:       'Em trânsito para o destino',
      out_for_delivery: 'Saiu para entrega ao destinatário',
      delivered:        'Entregue ao destinatário',
      exception:        'Ocorrência na entrega — verificar',
      returned:         'Objeto em devolução'
    };

    return {
      event:         'tracking_update',
      tracking_code,
      order_id:      options.order_id || 'ord-000',
      carrier:       'fontes_log',
      status,
      location:      options.location || 'São Paulo, SP',
      timestamp:     new Date().toISOString(),
      description:   statusDescriptions[status] || status,
      note:          options.note || null,
      recipient:     options.recipient || null,
      signature_url: status === 'delivered' ? `https://fontes-log.demo/signature/${tracking_code}.png` : null
    };
  }

  /**
   * Detecta envios com risco de atraso
   */
  static async detectDelayRisk() {
    const active = await LogisticsIntegration.listActiveShipments();
    const today  = new Date();

    return active.shipments
      .filter(s => !['delivered', 'cancelled'].includes(s.status))
      .map(s => {
        const estimated  = new Date(s.estimated_delivery);
        const days_diff  = Math.round((estimated - today) / 86400000);
        return {
          ...s,
          days_until_deadline: days_diff,
          risk_level:
            s.is_exception            ? 'critical' :
            s.is_delayed              ? 'high'     :
            days_diff === 0           ? 'medium'   :
            days_diff < 0            ? 'critical'  : 'low'
        };
      })
      .filter(s => s.risk_level !== 'low')
      .sort((a, b) => {
        const rank = { critical: 0, high: 1, medium: 2, low: 3 };
        return rank[a.risk_level] - rank[b.risk_level];
      });
  }

  static _estimateDelivery(destination_state) {
    const sla = {
      SP: 1, RJ: 2, MG: 2, ES: 3, PR: 2, SC: 2, RS: 3,
      BA: 4, PE: 5, CE: 5, GO: 3, DF: 3
    };
    const days = sla[destination_state] || 5;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  static _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { LogisticsIntegration };

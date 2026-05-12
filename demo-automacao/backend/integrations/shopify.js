/**
 * LOCALRISE — Integração Shopify (Simulada para Demo)
 *
 * Em produção: usa Shopify Webhooks + Admin API
 * Em demo: retorna dados mockados que simulam respostas reais da API
 */

const MOCK_SHOPIFY_ORDERS = [
  {
    id: 4421,
    email: 'joao@email.com',
    financial_status: 'paid',
    fulfillment_status: null,
    total_price: '1890.00',
    payment_gateway: 'pix',
    billing_address: { first_name: 'João', last_name: 'Ferreira' },
    line_items: [
      { sku: 'CAM-001-G',  name: 'Camisa Social Premium G',  quantity: 3, price: '210.00' },
      { sku: 'CAL-002-42', name: 'Calça Social Slim 42',      quantity: 3, price: '420.00' }
    ],
    created_at: '2026-04-06T09:15:00-03:00'
  },
  {
    id: 4422,
    email: 'compras@belosabor.com.br',
    financial_status: 'paid',
    fulfillment_status: 'partial',
    total_price: '4750.00',
    payment_gateway: 'boleto',
    billing_address: { first_name: 'Restaurante', last_name: 'Belo Sabor' },
    line_items: [
      { sku: 'UNI-001-KIT', name: 'Kit Uniforme Cozinha (10 peças)', quantity: 5, price: '950.00' }
    ],
    created_at: '2026-04-05T14:30:00-03:00'
  },
  {
    id: 4423,
    email: 'maria.s@gmail.com',
    financial_status: 'pending',
    fulfillment_status: null,
    total_price: '385.00',
    payment_gateway: 'credit_card',
    billing_address: { first_name: 'Maria', last_name: 'Santos' },
    line_items: [
      { sku: 'CAM-002-M', name: 'Camisa Polo Premium M', quantity: 1, price: '385.00' }
    ],
    created_at: '2026-04-08T06:45:00-03:00'
  }
];

class ShopifyIntegration {
  /**
   * Simula chamada à Admin API do Shopify para listar pedidos recentes
   * Em produção: GET https://{shop}.myshopify.com/admin/api/2024-01/orders.json
   */
  static async getRecentOrders({ limit = 10, status = 'any', financial_status } = {}) {
    // Simular delay de API real
    await ShopifyIntegration._delay(120);

    let orders = [...MOCK_SHOPIFY_ORDERS];
    if (financial_status) {
      orders = orders.filter(o => o.financial_status === financial_status);
    }

    return {
      source:    'shopify_mock',
      endpoint:  '/admin/api/2024-01/orders.json',
      count:     orders.length,
      orders:    orders.slice(0, limit)
    };
  }

  /**
   * Simula webhook payload do Shopify para orders/create
   * Usado para testar o pipeline sem precisar da loja real
   */
  static generateWebhookPayload(overrides = {}) {
    const base = {
      id:                 Date.now(),
      email:              'demo@cliente.com.br',
      financial_status:   'paid',
      fulfillment_status: null,
      total_price:        '1200.00',
      subtotal_price:     '1100.00',
      total_tax:          '100.00',
      currency:           'BRL',
      payment_gateway:    'pix',
      billing_address: {
        first_name: 'Cliente',
        last_name:  'Demo',
        address1:   'Rua Exemplo, 100',
        city:       'São Paulo',
        province:   'SP',
        zip:        '01310-100',
        country:    'BR'
      },
      shipping_address: {
        address1: 'Rua Exemplo, 100',
        city:     'São Paulo',
        province: 'SP',
        zip:      '01310-100',
        country:  'BR'
      },
      line_items: [
        {
          id:       1,
          sku:      'DEMO-001',
          name:     'Produto Demo',
          quantity: 2,
          price:    '600.00',
          vendor:   'LocalRise'
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { ...base, ...overrides };
  }

  /**
   * Normaliza um pedido Shopify para o formato interno do sistema
   */
  static normalizeOrder(shopify_order) {
    return {
      shopify_order_id:   `SHP-${shopify_order.id}`,
      customer_name:      `${shopify_order.billing_address?.first_name || ''} ${shopify_order.billing_address?.last_name || ''}`.trim(),
      customer_email:     shopify_order.email || '',
      total_amount:       parseFloat(shopify_order.total_price || 0),
      payment_status:     shopify_order.financial_status || 'pending',
      payment_method:     shopify_order.payment_gateway || 'unknown',
      status:             shopify_order.fulfillment_status === 'fulfilled' ? 'shipped' : 'pending',
      line_items:         (shopify_order.line_items || []).map(i => ({
        sku:   i.sku,
        name:  i.name,
        qty:   i.quantity,
        price: parseFloat(i.price)
      })),
      shopify_created_at: shopify_order.created_at
    };
  }

  /**
   * Simula verificação de HMAC do webhook (validação de segurança)
   * Em produção: verifica SHA256 com X-Shopify-Hmac-SHA256 header
   */
  static validateWebhookSignature(rawBody, signature, secret) {
    // Em demo: sempre válido
    if (process.env.DEMO_MODE !== 'false') return true;

    const crypto = require('crypto');
    const hash   = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return hash === signature;
  }

  static _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ShopifyIntegration };

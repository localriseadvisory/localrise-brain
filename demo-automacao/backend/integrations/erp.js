/**
 * LOCALRISE — Integração ERP (Simulada para Demo)
 *
 * Em produção: conecta via REST API do ERP (TOTVS, Omie, Conta Azul, etc.)
 * Em demo: retorna dados mockados que simulam respostas reais
 *
 * Endpoints simulados:
 *   GET /api/v1/accounts-payable
 *   GET /api/v1/accounts-receivable
 *   GET /api/v1/financial-transactions
 *   POST /api/v1/accounts-payable/{id}/pay
 */

const MOCK_ERP_PAYABLES = [
  {
    erp_id: 'ERP-AP-0891',
    description: 'Tecido Oxford 30m',
    supplier_name: 'Têxtil Sul Ltda',
    amount: 4200.00,
    due_date: '2026-04-09',
    status: 'open',
    category: 'materia_prima',
    document_number: 'NF-45821'
  },
  {
    erp_id: 'ERP-AP-0892',
    description: 'Folha de Pagamento — Abril/2026',
    supplier_name: 'Interno',
    amount: 22000.00,
    due_date: '2026-04-10',
    status: 'open',
    category: 'folha',
    document_number: 'FP-202604'
  },
  {
    erp_id: 'ERP-AP-0875',
    description: 'Aluguel Galpão — Abril/2026',
    supplier_name: 'Imobiliária Central',
    amount: 8500.00,
    due_date: '2026-04-05',
    status: 'overdue',
    category: 'estrutura',
    document_number: 'ALUG-0456'
  },
  {
    erp_id: 'ERP-AP-0895',
    description: 'Frete Fontes Log — Lote Março',
    supplier_name: 'Fontes Log',
    amount: 1850.00,
    due_date: '2026-04-12',
    status: 'open',
    category: 'logistica',
    document_number: 'NF-FL-9901'
  },
  {
    erp_id: 'ERP-AP-0897',
    description: 'Energia Elétrica — Março/2026',
    supplier_name: 'CEMIG',
    amount: 2680.00,
    due_date: '2026-04-10',
    status: 'open',
    category: 'utilities',
    document_number: 'CONTA-04782'
  }
];

const MOCK_ERP_RECEIVABLES = [
  {
    erp_id: 'ERP-AR-0221',
    description: 'Boleto — Restaurante Belo Sabor',
    customer_name: 'Restaurante Belo Sabor',
    customer_doc: '12.345.678/0001-90',
    amount: 4750.00,
    due_date: '2026-04-10',
    status: 'open',
    document_number: 'BOL-2026-044'
  },
  {
    erp_id: 'ERP-AR-0219',
    description: 'Boleto — Hotel Imperial (50% restante)',
    customer_name: 'Hotel Imperial',
    customer_doc: '98.765.432/0001-10',
    amount: 4450.00,
    due_date: '2026-04-15',
    status: 'open',
    document_number: 'BOL-2026-038'
  },
  {
    erp_id: 'ERP-AR-0215',
    description: 'Parcela 2/3 — Escola Municipal Jardim Flor',
    customer_name: 'Escola Municipal Jardim Flor',
    customer_doc: '44.321.000/0001-55',
    amount: 4200.00,
    due_date: '2026-04-08',
    status: 'overdue',
    document_number: 'BOL-2026-031'
  }
];

class ErpIntegration {
  /**
   * Busca contas a pagar do ERP
   * Em produção: GET {ERP_URL}/api/v1/accounts-payable?due_date_from=...
   */
  static async getAccountsPayable({ due_date_from, due_date_to, status } = {}) {
    await ErpIntegration._delay(200); // Simula latência de API

    let records = [...MOCK_ERP_PAYABLES];

    if (due_date_from) {
      records = records.filter(r => r.due_date >= due_date_from);
    }
    if (due_date_to) {
      records = records.filter(r => r.due_date <= due_date_to);
    }
    if (status) {
      records = records.filter(r => r.status === status);
    }

    return {
      source:   'erp_mock',
      endpoint: '/api/v1/accounts-payable',
      total:    records.length,
      data:     records
    };
  }

  /**
   * Busca contas a receber do ERP
   */
  static async getAccountsReceivable({ due_date_from, due_date_to, status } = {}) {
    await ErpIntegration._delay(180);

    let records = [...MOCK_ERP_RECEIVABLES];

    if (due_date_from) records = records.filter(r => r.due_date >= due_date_from);
    if (due_date_to)   records = records.filter(r => r.due_date <= due_date_to);
    if (status)        records = records.filter(r => r.status === status);

    return {
      source:   'erp_mock',
      endpoint: '/api/v1/accounts-receivable',
      total:    records.length,
      data:     records
    };
  }

  /**
   * Registra pagamento no ERP
   * Em produção: POST {ERP_URL}/api/v1/accounts-payable/{id}/pay
   */
  static async registerPayment(erp_id, payment_data) {
    await ErpIntegration._delay(300);

    const record = MOCK_ERP_PAYABLES.find(r => r.erp_id === erp_id);
    if (!record) {
      throw new Error(`Conta ERP não encontrada: ${erp_id}`);
    }

    record.status    = 'paid';
    record.paid_date = payment_data.paid_date || new Date().toISOString().split('T')[0];

    return {
      source:  'erp_mock',
      success: true,
      erp_id,
      status:  'paid',
      paid_at: record.paid_date,
      message: `Pagamento registrado no ERP: ${erp_id}`
    };
  }

  /**
   * Registra recebimento no ERP
   */
  static async registerReceipt(erp_id, receipt_data) {
    await ErpIntegration._delay(250);

    const record = MOCK_ERP_RECEIVABLES.find(r => r.erp_id === erp_id);
    if (!record) {
      throw new Error(`Conta a receber não encontrada no ERP: ${erp_id}`);
    }

    record.status        = 'received';
    record.received_date = receipt_data.received_date || new Date().toISOString().split('T')[0];
    record.received_amount = receipt_data.amount || record.amount;

    return {
      source:  'erp_mock',
      success: true,
      erp_id,
      status:  'received',
      received_at: record.received_date,
      message: `Recebimento registrado no ERP: ${erp_id}`
    };
  }

  /**
   * Busca extrato de transações financeiras do período
   */
  static async getFinancialTransactions({ start_date, end_date } = {}) {
    await ErpIntegration._delay(350);

    const transactions = [
      { id: 'TXN-001', type: 'income',  description: 'Recebimento PIX — João Ferreira',  amount: 1890.00, date: '2026-04-06', category: 'vendas' },
      { id: 'TXN-002', type: 'income',  description: 'Boleto recebido — Restaurante',     amount: 4750.00, date: '2026-04-07', category: 'vendas' },
      { id: 'TXN-003', type: 'expense', description: 'Pagamento Fornecedor Aviamentos',    amount: 1200.00, date: '2026-04-07', category: 'materia_prima' },
      { id: 'TXN-004', type: 'expense', description: 'Taxa antecipação — Banco XYZ',       amount: 85.00,   date: '2026-04-08', category: 'bancario' }
    ];

    return {
      source:       'erp_mock',
      endpoint:     '/api/v1/financial-transactions',
      total:        transactions.length,
      transactions
    };
  }

  static _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ErpIntegration };

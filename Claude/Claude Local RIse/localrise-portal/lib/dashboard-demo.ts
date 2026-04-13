export type DashboardSection =
  | 'overview'
  | 'aquisicao'
  | 'trafego-pago'
  | 'crm'
  | 'automacoes'
  | 'reputacao'
  | 'eventos'
  | 'sistema-localrise'

export type TrendPoint = {
  label: string
  value: number
}

export type SourceItem = {
  label: string
  value: number
  color: string
}

export type DashboardKpi = {
  label: string
  value: string
  delta: string
  tone: 'red' | 'blue' | 'green' | 'amber' | 'purple'
  footnote: string
}

export type KeywordItem = {
  keyword: string
  intent: string
  position: string
  clicks: string
  movement: string
}

export type CampaignItem = {
  name: string
  intent: string
  budget: string
  leads: string
  cpl: string
  roas: string
  status: string
}

export type AutomationItem = {
  name: string
  status: string
  coverage: string
  result: string
}

export type InsightItem = {
  title: string
  detail: string
  impact: string
}

export const dashboardDemo = {
  restaurant: {
    name: 'Don Aurelio Prime Grill',
    city: 'Porto Alegre, RS',
    segment: 'Steakhouse premium | rodizio | eventos corporativos',
    owner: 'Operacao demonstrativa LocalRise',
    period: 'Abril 2026',
    healthScore: 86,
    growthMessage: '+18,4% de crescimento estimado na receita atribuida',
  },
  overview: {
    headline:
      'Uma demo de sistema operacional de crescimento para restaurantes locais com aquisicao, CRM, automacoes e inteligencia comercial em uma unica visao.',
    kpis: [
      {
        label: 'Faturamento estimado atribuido',
        value: 'R$ 286,4 mil',
        delta: '+18,4%',
        tone: 'red',
        footnote: 'Reservas, eventos e reativacao acompanhados pela LocalRise',
      },
      {
        label: 'Reservas geradas',
        value: '742',
        delta: '+22%',
        tone: 'green',
        footnote: 'Google, WhatsApp, Instagram e campanhas de marca',
      },
      {
        label: 'Leads captados',
        value: '188',
        delta: '+31%',
        tone: 'blue',
        footnote: 'Eventos, lista VIP, aniversarios e intencao de visita',
      },
      {
        label: 'Clientes reativados',
        value: '64',
        delta: '+15%',
        tone: 'purple',
        footnote: 'Fluxos de CRM e automacao de base propria',
      },
      {
        label: 'Avaliacoes recebidas',
        value: '93',
        delta: '+27%',
        tone: 'amber',
        footnote: 'Pedidos de review apos a visita com triagem de sentimento',
      },
      {
        label: 'Nota media',
        value: '4,8',
        delta: '+0,2',
        tone: 'amber',
        footnote: 'Volume crescente sem perder qualidade de experiencia',
      },
      {
        label: 'Trafego organico estimado',
        value: '14,9 mil',
        delta: '+24%',
        tone: 'green',
        footnote: 'Buscas de marca, nao-branded e Google Business Profile',
      },
      {
        label: 'Trafego pago estimado',
        value: '6,2 mil',
        delta: '+19%',
        tone: 'purple',
        footnote: 'Google Ads por intencao com foco em demanda quente',
      },
    ] satisfies DashboardKpi[],
    revenueTrend: [
      { label: 'Nov', value: 182 },
      { label: 'Dez', value: 194 },
      { label: 'Jan', value: 205 },
      { label: 'Fev', value: 221 },
      { label: 'Mar', value: 242 },
      { label: 'Abr', value: 286 },
    ] satisfies TrendPoint[],
    sourceMix: [
      { label: 'Google organico + Maps', value: 34, color: '#E31B23' },
      { label: 'Google Ads', value: 22, color: '#A855F7' },
      { label: 'Instagram', value: 17, color: '#3B82F6' },
      { label: 'WhatsApp base propria', value: 15, color: '#22C55E' },
      { label: 'Eventos e indicacoes', value: 12, color: '#F59E0B' },
    ] satisfies SourceItem[],
  },
  acquisition: {
    performance: [
      { label: 'Cliques organicos no Google', value: '5.482', delta: '+26%' },
      { label: 'Buscas nao-branded capturadas', value: '62%', delta: '+11 p.p.' },
      { label: 'Solicitacoes de rota no GBP', value: '488', delta: '+18%' },
      { label: 'Ligacoes originadas do Maps', value: '134', delta: '+14%' },
    ],
    keywordTable: [
      { keyword: 'steakhouse porto alegre', intent: 'Alta intencao', position: '#2', clicks: '642', movement: '+3' },
      { keyword: 'rodizio premium poa', intent: 'Descoberta', position: '#3', clicks: '518', movement: '+4' },
      { keyword: 'restaurante para aniversario poa', intent: 'Evento', position: '#4', clicks: '387', movement: '+6' },
      { keyword: 'parrilla porto alegre', intent: 'Nao-branded', position: '#5', clicks: '316', movement: '+2' },
      { keyword: 'don aurelio prime grill', intent: 'Marca', position: '#1', clicks: '1.189', movement: 'Estavel' },
    ] satisfies KeywordItem[],
    brandedVsNonBranded: [
      { label: 'Marca', value: 38, color: '#3B82F6' },
      { label: 'Nao-branded', value: 62, color: '#22C55E' },
    ] satisfies SourceItem[],
    trafficOrigins: [
      { label: 'Google Business Profile', value: 41, color: '#E31B23' },
      { label: 'Busca organica do site', value: 27, color: '#22C55E' },
      { label: 'Instagram bio e stories', value: 18, color: '#A855F7' },
      { label: 'Direto / indicacoes', value: 14, color: '#F59E0B' },
    ] satisfies SourceItem[],
    googleBusinessProfile: {
      rating: '4,8',
      reviews: '1.284',
      newReviews: '93',
      photos: '148,2 mil visualizacoes',
      mapsViews: '58,4 mil',
      searchViews: '22,1 mil',
      highlights: [
        'Pico de descoberta em buscas por rodizio premium e restaurante para eventos.',
        'Fotos profissionais e novas respostas elevaram a taxa de clique para rota.',
        'Ha demanda subaproveitada em termos de busca local sem marca.',
      ],
    },
  },
  paidTraffic: {
    summary: [
      { label: 'Investimento total', value: 'R$ 18,9 mil', delta: '+12%' },
      { label: 'Leads estimados', value: '176', delta: '+21%' },
      { label: 'Custo por lead', value: 'R$ 107', delta: '-8%' },
      { label: 'Oportunidade de escala', value: '+R$ 74 mil', delta: 'janela atual' },
    ],
    campaigns: [
      { name: 'Marca | Don Aurelio', intent: 'Defesa e conversao', budget: 'R$ 3,2 mil', leads: '54', cpl: 'R$ 59', roas: '8,2x', status: 'Forte' },
      { name: 'Restaurante perto de mim', intent: 'Demanda quente local', budget: 'R$ 7,1 mil', leads: '68', cpl: 'R$ 104', roas: '5,9x', status: 'Escalavel' },
      { name: 'Buffet, rodizio e eventos', intent: 'Ticket alto', budget: 'R$ 8,6 mil', leads: '54', cpl: 'R$ 159', roas: '6,8x', status: 'Oportunidade' },
    ] satisfies CampaignItem[],
    funnel: [
      { label: 'Impressoes', value: 124000 },
      { label: 'Cliques', value: 6200 },
      { label: 'Conversas no WhatsApp', value: 412 },
      { label: 'Leads qualificados', value: 176 },
      { label: 'Reservas ou propostas', value: 94 },
    ] satisfies TrendPoint[],
    scaleNotes: [
      'Marca converte com baixa friccao e protege procura ja existente.',
      'Campanhas de perto de mim aceleram descoberta e lotacao de horarios ociosos.',
      'Eventos possuem maior ticket e justificam criativos e landing pages dedicadas.',
    ],
  },
  crm: {
    summary: [
      { label: 'Base captada no WhatsApp', value: '4.380 contatos', delta: '+9%' },
      { label: 'Taxa de retorno', value: '31%', delta: '+5 p.p.' },
      { label: 'Campanhas disparadas', value: '12', delta: 'automacao ativa' },
      { label: 'Clientes recorrentes no periodo', value: '46%', delta: '+7 p.p.' },
    ],
    customerMix: [
      { label: 'Novos clientes', value: 54, color: '#E31B23' },
      { label: 'Recorrentes', value: 46, color: '#22C55E' },
    ] satisfies SourceItem[],
    lifecycle: [
      { label: 'Aniversarios', value: 86 },
      { label: 'Pos-visita', value: 312 },
      { label: 'Reativacao 45+ dias', value: 128 },
      { label: 'Lista VIP de eventos', value: 64 },
    ] satisfies TrendPoint[],
    leadFunnel: [
      { label: 'Leads', value: 188 },
      { label: 'Qualificados', value: 126 },
      { label: 'WhatsApp ativo', value: 84 },
      { label: 'Propostas', value: 34 },
      { label: 'Fechados', value: 18 },
    ] satisfies TrendPoint[],
    plays: [
      'Fluxo de aniversario com oferta de sobremesa e upgrade de mesa especial.',
      'Pos-visita com pedido de review e convite para retorno em 21 dias.',
      'Reativacao segmentada por ticket medio e periodo sem compra.',
    ],
  },
  automations: {
    summary: [
      { label: 'Automacoes ativas', value: '9 fluxos', delta: '100% operando' },
      { label: 'Respostas automaticas', value: '72%', delta: '+18 p.p.' },
      { label: 'Reviews filtradas com IA', value: '93 no mes', delta: 'triagem ativa' },
      { label: 'Recuperacao de inativos', value: 'R$ 28 mil', delta: '+14%' },
    ],
    flows: [
      { name: 'Boas-vindas WhatsApp', status: 'Ativo', coverage: '100% leads novos', result: 'Resposta em 38s de media' },
      { name: 'Pos-visita + pedido de review', status: 'Ativo', coverage: '312 disparos', result: '34% taxa de resposta' },
      { name: 'Triagem de sentimento com IA', status: 'Ativo', coverage: '93 reviews', result: '11 alertas criticos priorizados' },
      { name: 'Reativacao 45 dias', status: 'Ativo', coverage: '128 clientes', result: '64 retornos estimulados' },
      { name: 'Funil de eventos corporativos', status: 'Ativo', coverage: '29 leads', result: '8 propostas em andamento' },
    ] satisfies AutomationItem[],
    aiOps: [
      { label: 'Mensagens automatizadas resolvidas sem humano', value: 72, color: '#22C55E' },
      { label: 'Demandas escaladas para equipe', value: 18, color: '#F59E0B' },
      { label: 'Casos criticos com alerta imediato', value: 10, color: '#E31B23' },
    ] satisfies SourceItem[],
  },
  reputation: {
    sentiment: [
      { label: 'Positivo', value: 78, color: '#22C55E' },
      { label: 'Neutro', value: 15, color: '#F59E0B' },
      { label: 'Negativo', value: 7, color: '#E31B23' },
    ] satisfies SourceItem[],
    metrics: [
      { label: 'Nota media', value: '4,8 / 5', delta: '+0,2' },
      { label: 'Volume de reviews no mes', value: '93', delta: '+27%' },
      { label: 'Alertas criticos', value: '11', delta: '-18%' },
      { label: 'Reviews com resposta IA sugerida', value: '100%', delta: 'copilot ativo' },
    ],
    themes: [
      { label: 'Qualidade da carne', value: 31, color: '#E31B23' },
      { label: 'Atendimento', value: 24, color: '#22C55E' },
      { label: 'Ambiente premium', value: 19, color: '#3B82F6' },
      { label: 'Tempo de espera', value: 14, color: '#F59E0B' },
      { label: 'Eventos e salas privativas', value: 12, color: '#A855F7' },
    ] satisfies SourceItem[],
    alerts: [
      'Sextas 20h-21h concentram reviews com mencao a espera acima do ideal.',
      'Eventos corporativos geram elogio alto de atendimento, mas pedem orcamento mais rapido.',
      'Existe oportunidade de respostas com IA para acelerar reputacao sem sobrecarregar a equipe.',
    ],
    reviewFeed: [
      {
        author: 'Marina K.',
        rating: '5,0',
        when: '03 Abr',
        channel: 'Google',
        sentiment: 'Positivo',
        text: 'Atendimento impecavel e experiencia excelente para aniversario. Voltaremos com a familia.',
        response: 'Respondido em 19 min',
      },
      {
        author: 'Eduardo P.',
        rating: '4,0',
        when: '01 Abr',
        channel: 'Google',
        sentiment: 'Neutro',
        text: 'Carne muito boa, mas houve fila na entrada. A sala para evento surpreendeu positivamente.',
        response: 'Resposta sugerida por IA',
      },
      {
        author: 'Fernanda S.',
        rating: '2,0',
        when: '29 Mar',
        channel: 'Google',
        sentiment: 'Critico',
        text: 'Mesa demorou para ser liberada na sexta. Ambiente e equipe foram cordiais, mas o tempo pesou.',
        response: 'Escalado para operacao',
      },
    ],
  },
  events: {
    summary: [
      { label: 'Leads de eventos', value: '29', delta: '+38%' },
      { label: 'Orcamentos enviados', value: '18', delta: '+24%' },
      { label: 'Fechamentos', value: '7', delta: '+2' },
      { label: 'Ticket medio estimado', value: 'R$ 12,8 mil', delta: '+9%' },
    ],
    pipeline: [
      { label: 'Leads captados', value: 29 },
      { label: 'Briefings qualificados', value: 18 },
      { label: 'Propostas enviadas', value: 12 },
      { label: 'Negociacao', value: 9 },
      { label: 'Fechados', value: 7 },
    ] satisfies TrendPoint[],
    opportunities: [
      { label: 'Casamentos intimistas', value: 28, color: '#E31B23' },
      { label: 'Eventos corporativos', value: 41, color: '#3B82F6' },
      { label: 'Aniversarios premium', value: 31, color: '#22C55E' },
    ] satisfies SourceItem[],
    note:
      'Eventos ja representam a linha com maior potencial de ticket. Com pagina dedicada, automacao de briefing e campanhas de intencao, ha espaco para adicionar R$ 90 mil/mes em pipeline.',
  },
  insights: [
    {
      title: 'Vocês defendem bem a busca de marca, mas ainda há demanda não-brand para capturar.',
      detail: 'O restaurante ja domina pesquisas por nome proprio. O proximo salto vem de ocupar buscas de categoria e ocasiao, como rodizio premium, almoco executivo e restaurante para evento.',
      impact: 'Mais descoberta sem depender apenas de quem ja conhece a marca.',
    },
    {
      title: 'O WhatsApp está forte como canal de conversão, mas pode vender melhor com automação por contexto.',
      detail: 'Ha espaco para separar jornadas de reserva imediata, evento, aniversario e reativacao, com respostas, SLA e ofertas diferentes.',
      impact: 'Melhora taxa de resposta e reduz perda de lead quente.',
    },
    {
      title: 'Eventos corporativos são a principal alavanca de crescimento incremental.',
      detail: 'O ticket alto e a capacidade de fechamento com poucas vendas justificam uma operacao propria de campanhas, landing pages e follow-up automatizado.',
      impact: 'Expande receita sem depender exclusivamente do salao.',
    },
  ] satisfies InsightItem[],
  actionPlan: [
    {
      title: 'Aumentar cobertura nao-branded no Google para buscas de categoria e ocasiao.',
      owner: 'SEO local',
      due: '7 dias',
      impact: 'Mais descoberta organica e menos dependencia de marca.',
    },
    {
      title: 'Separar jornada de WhatsApp entre reserva imediata, eventos e aniversarios.',
      owner: 'CRM + automacoes',
      due: '10 dias',
      impact: 'Melhora taxa de resposta e qualificacao do lead quente.',
    },
    {
      title: 'Ativar pagina dedicada para eventos corporativos com briefing automatizado.',
      owner: 'Site + media paga',
      due: '14 dias',
      impact: 'Pipeline incremental de ticket alto com follow-up previsivel.',
    },
  ],
  systemPillars: [
    { title: 'Aquisicao', description: 'Google Business, SEO local, campanhas por intencao e presenca digital que gera procura qualificada.' },
    { title: 'Conversao', description: 'WhatsApp, paginas focadas em reserva e eventos, respostas rapidas e funis pensados para demanda quente.' },
    { title: 'Retencao', description: 'CRM de retorno, aniversarios, pos-visita, reativacao e campanhas para elevar frequencia e ticket.' },
    { title: 'Inteligencia', description: 'Dados integrados, leitura de comportamento, recomendacao automatica e priorizacao do que mais move receita.' },
    { title: 'IA e automacoes', description: 'Copilotos para reviews, triagem de mensagens, follow-up automatico e rotina comercial sem gargalos manuais.' },
    { title: 'Previsibilidade', description: 'Um sistema operacional de crescimento para o restaurante saber de onde vem as reservas e como escalar.' },
  ],
}

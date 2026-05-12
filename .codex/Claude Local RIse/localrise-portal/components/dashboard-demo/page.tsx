import {
  Activity,
  Bot,
  CalendarHeart,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  Crown,
  HandCoins,
  Landmark,
  MessageSquareText,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { DashboardData, DashboardSection } from '@/lib/dashboard/contracts'
import {
  BulletList,
  DataTable,
  FunnelBars,
  KpiCard,
  MiniBars,
  PageIntro,
  Panel,
  ProgressList,
  SectionTitle,
} from '@/components/dashboard-demo/ui'

const sectionMeta: Record<DashboardSection, { title: string; description: string }> = {
  overview: {
    title: 'Visao geral executiva do restaurante',
    description:
      'Um cockpit de crescimento que conecta receita, canais de aquisicao, CRM e operacao automatizada em linguagem de dono.',
  },
  aquisicao: {
    title: 'Aquisicao organica e demanda local',
    description:
      'Onde a marca aparece, quais buscas geram descoberta e onde ainda existe demanda local para capturar.',
  },
  'trafego-pago': {
    title: 'Google Ads por intencao',
    description:
      'Campanhas desenhadas para procura de marca, proximidade e ocasioes de alto ticket com leitura de eficiencia e escala.',
  },
  crm: {
    title: 'CRM, recorrencia e base propria',
    description:
      'Retencao, retorno e campanhas acionadas para aumentar frequencia, ticket e relacionamento com a base.',
  },
  automacoes: {
    title: 'Automacoes e IA operacional',
    description:
      'Fluxos, copilotos e respostas automáticas que reduzem friccao comercial e melhoram a experiencia do cliente.',
  },
  reputacao: {
    title: 'Reputacao digital com leitura acionavel',
    description:
      'Volume, sentimento, temas recorrentes e prioridades de resposta para proteger a marca e elevar conversao.',
  },
  eventos: {
    title: 'Pipeline de eventos e ticket incremental',
    description:
      'Acompanhamento da frente de eventos como unidade real de crescimento, nao apenas canal complementar.',
  },
  'sistema-localrise': {
    title: 'Como a LocalRise impulsiona seu restaurante',
    description:
      'A tese de produto por trás da demo: aquisicao, conversao, retencao, inteligencia e previsibilidade em uma operacao unica.',
  },
}

const sectionLinks: { key: DashboardSection; label: string }[] = [
  { key: 'overview', label: 'Visao Geral' },
  { key: 'aquisicao', label: 'Aquisicao' },
  { key: 'trafego-pago', label: 'Trafego Pago' },
  { key: 'crm', label: 'CRM' },
  { key: 'automacoes', label: 'Automacoes' },
  { key: 'reputacao', label: 'Reputacao' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'sistema-localrise', label: 'Sistema LocalRise' },
]

function ExecutiveStrip({ data }: { data: DashboardData }) {
  const { restaurant } = data
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
      <Panel className="lr-grid-bg overflow-hidden">
        <div className="relative">
          <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute right-20 top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <div className="lr-badge mb-4">
              <Store size={13} />
              Restaurante demo
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">{restaurant.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{restaurant.segment}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 px-3 py-1.5">{restaurant.city}</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">{restaurant.period}</span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                {restaurant.growthMessage}
              </span>
            </div>
          </div>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Health score LocalRise" description="Leitura consolidada de aquisicao, reputacao, CRM e automacoes." />
        <div className="flex items-end gap-4">
          <div className="text-6xl font-black tracking-tight text-white">{restaurant.healthScore}</div>
          <div className="pb-2 text-sm leading-6 text-zinc-400">
            de 100 pontos
            <div className="font-semibold text-emerald-300">Operacao pronta para escala com gargalos bem definidos.</div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function InsightRail({ data }: { data: DashboardData }) {
  return (
    <Panel>
      <SectionTitle
        title="Insights da LocalRise"
        description="Leitura automatica com foco em decisao comercial."
        badge="Prioridades do mes"
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {data.insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-red-300">
              <Sparkles size={15} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Insight</span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">{insight.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{insight.detail}</p>
            <div className="mt-4 rounded-2xl border border-emerald-500/12 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
              Impacto esperado: {insight.impact}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function OverviewSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Cockpit executivo" title={sectionMeta.overview.title} description={sectionMeta.overview.description} ctaHref="/dashboard/sistema-localrise" ctaLabel="Ver narrativa comercial" />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.overview.kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionTitle title="Evolucao de faturamento atribuido" description="Curva demonstrativa da receita ligada a reservas, CRM e eventos." />
          <MiniBars points={data.overview.revenueTrend} color="#E31B23" />
        </Panel>
        <Panel>
          <SectionTitle title="Origem dos clientes" description="Composicao comercial da demanda do periodo." />
          <ProgressList items={data.overview.sourceMix} />
      </Panel>
      </div>
      <InsightRail data={data} />
    </>
  )
}

function AcquisitionSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Google, SEO local e Maps" title={sectionMeta.aquisicao.title} description={sectionMeta.aquisicao.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.acquisition.performance.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote={index % 2 === 0 ? 'Captura demanda existente e gera descoberta com menor custo.' : 'Sinal de ganho real de visibilidade local.'}
            tone={index % 4 === 0 ? 'red' : index % 4 === 1 ? 'green' : index % 4 === 2 ? 'blue' : 'amber'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel>
          <SectionTitle title="Palavras-chave prioritarias" description="Buscas de alta intencao que sustentam descoberta e visitas." />
          <DataTable
            headers={['Keyword', 'Intencao', 'Posicao', 'Cliques', 'Movimento']}
            rows={data.acquisition.keywordTable.map((row) => [
              <span key="k" className="font-semibold text-white">{row.keyword}</span>,
              row.intent,
              <span key="p" className="text-emerald-300">{row.position}</span>,
              row.clicks,
              <span key="m" className="text-zinc-100">{row.movement}</span>,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Marca vs nao-branded" description="A proxima alavanca esta em converter procura que ainda nao conhece o restaurante." />
          <ProgressList items={data.acquisition.brandedVsNonBranded} />
          <div className="mt-6 border-t border-white/8 pt-6">
            <SectionTitle title="Origem do trafego" />
            <ProgressList items={data.acquisition.trafficOrigins} />
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <SectionTitle title="Google Business Profile" description="O GBP nao aparece como anexo de SEO. Ele funciona como vitrine, prova social e ponto de captura local." badge="Ativo" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-300">
                <Star size={15} />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Reputacao</span>
              </div>
              <div className="text-5xl font-black tracking-tight text-white">{data.acquisition.googleBusinessProfile.rating}</div>
              <div className="mt-2 text-sm text-zinc-400">{data.acquisition.googleBusinessProfile.reviews} reviews totais</div>
              <div className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                +{data.acquisition.googleBusinessProfile.newReviews} novas avaliacoes no periodo
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['Visualizacoes em fotos', data.acquisition.googleBusinessProfile.photos],
                ['Visualizacoes no Maps', data.acquisition.googleBusinessProfile.mapsViews],
                ['Visualizacoes na Busca', data.acquisition.googleBusinessProfile.searchViews],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                  <div className="mt-2 text-xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Leituras estrategicas" description="O que o gestor deve enxergar rapidamente." />
          <BulletList items={data.acquisition.googleBusinessProfile.highlights} />
        </Panel>
      </div>
    </>
  )
}

function PaidTrafficSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Tráfego pago com lógica de receita" title={sectionMeta['trafego-pago'].title} description={sectionMeta['trafego-pago'].description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.paidTraffic.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Leitura de eficiencia por intencao, nao apenas volume."
            tone={index === 0 ? 'purple' : index === 1 ? 'green' : index === 2 ? 'amber' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel>
          <SectionTitle title="Campanhas Google Ads" description="Estrutura premium com campanhas por intencao comercial." />
          <DataTable
            headers={['Campanha', 'Intencao', 'Budget', 'Leads', 'CPL', 'ROAS', 'Status']}
            rows={data.paidTraffic.campaigns.map((item) => [
              <span key="n" className="font-semibold text-white">{item.name}</span>,
              item.intent,
              item.budget,
              <span key="l" className="text-emerald-300">{item.leads}</span>,
              item.cpl,
              <span key="r" className="text-zinc-100">{item.roas}</span>,
              <span key="s" className="lr-badge">{item.status}</span>,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Funil pago" description="Da demanda impressa ate a oportunidade real no WhatsApp." />
          <FunnelBars points={data.paidTraffic.funnel} />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Por que vale investir" description="A campanha certa reduz ociosiade, protege marca e abre novas ocasioes de compra." />
          <BulletList items={data.paidTraffic.scaleNotes} />
        </Panel>
        <Panel>
          <SectionTitle title="Tese de escala" description="Quando a operação está pronta, mídia paga deixa de ser custo e vira acelerador de receita." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: <Landmark size={18} />, title: 'Marca', text: 'Capta demanda existente e impede perda para agregadores e concorrentes.' },
              { icon: <Compass size={18} />, title: 'Perto de mim', text: 'Explora descoberta local em horários de decisão imediata.' },
              { icon: <CalendarHeart size={18} />, title: 'Eventos', text: 'Aumenta ticket e previsibilidade com uma esteira dedicada.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-3 text-red-300">{item.icon}</div>
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function CrmSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Retenção e base própria" title={sectionMeta.crm.title} description={sectionMeta.crm.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.crm.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Base propria reduz dependencia exclusiva de mídia e plataformas."
            tone={index === 0 ? 'green' : index === 1 ? 'red' : index === 2 ? 'purple' : 'blue'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[0.95fr_1.15fr]">
        <Panel>
          <SectionTitle title="Novos vs recorrentes" description="A boa operação de restaurante precisa equilibrar descoberta e retorno." />
          <ProgressList items={data.crm.customerMix} />
        </Panel>
        <Panel>
          <SectionTitle title="Jornadas automatizadas de CRM" description="Blocos que transformam base em visitas repetidas e reviews positivos." />
          <MiniBars points={data.crm.lifecycle} color="#22C55E" />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Jogadas com maior impacto" description="Fluxos de CRM que fazem sentido para restaurante local premium." />
          <BulletList items={data.crm.plays} />
        </Panel>
        <Panel>
          <SectionTitle title="Leitura comercial" description="A LocalRise nao entrega apenas campanha; entrega frequência, recorrência e previsibilidade." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Aniversarios', icon: <CalendarHeart size={18} />, text: 'Transforma datas em mesas reservadas e upsell de experiência.' },
              { title: 'Pos-visita', icon: <MessageSquareText size={18} />, text: 'Converte boa experiência em review, lembrança de marca e retorno.' },
              { title: 'Reativação', icon: <Users size={18} />, text: 'Recupera clientes frios antes que a marca saia do radar.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-3 text-emerald-300">{item.icon}</div>
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function AutomationsSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Operacao assistida por IA" title={sectionMeta.automacoes.title} description={sectionMeta.automacoes.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.automations.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Automacao bem desenhada protege SLA, reputacao e receita."
            tone={index === 0 ? 'purple' : index === 1 ? 'green' : index === 2 ? 'amber' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Panel>
          <SectionTitle title="Painel de fluxos ativos" description="Cada fluxo tem cobertura, papel claro e resultado mensurável." />
          <DataTable
            headers={['Fluxo', 'Status', 'Cobertura', 'Resultado']}
            rows={data.automations.flows.map((flow) => [
              <span key="n" className="font-semibold text-white">{flow.name}</span>,
              <span key="s" className="lr-badge">{flow.status}</span>,
              flow.coverage,
              flow.result,
            ])}
          />
        </Panel>
        <Panel>
          <SectionTitle title="Distribuicao operacional com IA" description="O objetivo nao é só responder mais rápido, mas escalar sem perder contexto." />
          <ProgressList items={data.automations.aiOps} />
          <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-red-300">
              <Bot size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Copilot LocalRise</span>
            </div>
            <p className="text-sm leading-6 text-zinc-300">
              Reviews sensíveis, intenção de evento e sinais de churn são priorizados automaticamente para ação humana imediata.
            </p>
          </div>
        </Panel>
      </div>
      <InsightRail data={data} />
    </>
  )
}

function ReputationSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Reputacao como motor de conversao" title={sectionMeta.reputacao.title} description={sectionMeta.reputacao.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.reputation.metrics.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Reputacao afeta clique, rota, reserva e decisao final."
            tone={index === 0 ? 'amber' : index === 1 ? 'green' : index === 2 ? 'red' : 'purple'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <SectionTitle title="Sentimento das avaliacoes" description="Visao sintetica do humor da base de reviews." />
          <ProgressList items={data.reputation.sentiment} />
        </Panel>
        <Panel>
          <SectionTitle title="Temas mais citados" description="O que aparece com mais frequência nas avaliacoes." />
          <ProgressList items={data.reputation.themes} />
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel>
          <SectionTitle title="Alertas criticos" description="Pontos de atenção que pedem ação tática." />
          <BulletList items={data.reputation.alerts} />
        </Panel>
        <Panel>
          <SectionTitle title="Oportunidade de resposta com IA" description="A IA organiza, sugere tom e acelera resposta sem comprometer a marca." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Filtro', text: 'Classifica positivo, neutro e negativo para priorizar fila.' },
              { title: 'Sugestão', text: 'Propõe resposta com contexto e tom compatível com a marca.' },
              { title: 'Escalada', text: 'Encaminha casos críticos para operação ou liderança.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="text-base font-bold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function EventsSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Linha de receita de alto ticket" title={sectionMeta.eventos.title} description={sectionMeta.eventos.description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.events.summary.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            delta={item.delta}
            footnote="Eventos trazem ticket alto e excelente previsibilidade de agenda."
            tone={index === 0 ? 'blue' : index === 1 ? 'amber' : index === 2 ? 'green' : 'red'}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel>
          <SectionTitle title="Pipeline de eventos" description="Do lead de briefing ao fechamento comercial." />
          <FunnelBars points={data.events.pipeline} />
        </Panel>
        <Panel>
          <SectionTitle title="Mix de oportunidade mensal" description="Onde a operação de eventos deve concentrar discurso e oferta." />
          <ProgressList items={data.events.opportunities} />
        </Panel>
      </div>
      <Panel>
        <SectionTitle title="Leitura da oportunidade" description="Por que eventos merecem tratamento como produto dentro do restaurante." badge="High ticket" />
        <p className="max-w-4xl text-sm leading-7 text-zinc-300">{data.events.note}</p>
      </Panel>
    </>
  )
}

function SystemSection({ data }: { data: DashboardData }) {
  return (
    <>
      <PageIntro eyebrow="Narrativa comercial LocalRise" title={sectionMeta['sistema-localrise'].title} description={sectionMeta['sistema-localrise'].description} />
      <ExecutiveStrip data={data} />
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionTitle title="O que esta demo representa" description="Nao é um painel para impressionar superficialmente. É uma proposta de sistema." />
          <p className="max-w-3xl text-sm leading-7 text-zinc-300">
            A LocalRise posiciona o restaurante como uma operação guiada por demanda, dados e recorrência. Em vez de enxergar marketing como posts isolados ou mídia sem contexto, o sistema organiza aquisição, conversão, retenção e reputação em uma única camada de gestão.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.systemPillars.map((pillar) => (
              <div key={pillar.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-2 text-base font-bold text-white">{pillar.title}</div>
                <p className="text-sm leading-6 text-zinc-300">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Leitura executiva" description="Como vender o sistema para o decisor do restaurante." />
          <BulletList
            items={[
              'A LocalRise aumenta visibilidade e transforma procura em reservas e eventos.',
              'O CRM reduz dependência de compra única e aumenta frequência de retorno.',
              'IA e automação organizam atendimento, reviews e follow-up sem inflar equipe.',
              'O dashboard conecta tudo em uma linguagem de gestão, não de vanity metrics.',
            ]}
          />
        </Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Aquisição', icon: <Search size={18} />, text: 'Captura busca local, Maps e intenção imediata.' },
          { title: 'Conversão', icon: <MessagesSquare size={18} />, text: 'WhatsApp, páginas e follow-up com menos fricção.' },
          { title: 'Retenção', icon: <ShieldCheck size={18} />, text: 'Campanhas de retorno, aniversário e reativação.' },
          { title: 'Previsibilidade', icon: <TrendingUp size={18} />, text: 'Dados integrados para entender o que move receita.' },
        ].map((item) => (
          <Panel key={item.title}>
            <div className="mb-3 text-red-300">{item.icon}</div>
            <div className="text-lg font-bold tracking-tight text-white">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
          </Panel>
        ))}
      </div>
    </>
  )
}

export function DemoDashboardPage({
  section,
  basePath = '/dashboard',
  data,
}: {
  section: DashboardSection
  basePath?: string
  data: DashboardData
}) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6 xl:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {sectionLinks.map((item) => {
            const href = item.key === 'overview' ? basePath : `${basePath}/${item.key}`
            const active = item.key === section
            return (
              <Link
                key={item.key}
                href={href}
                className="whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{
                  borderColor: active ? 'rgba(227,27,35,0.24)' : 'rgba(255,255,255,0.08)',
                  background: active ? 'rgba(227,27,35,0.12)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fff' : '#a1a1aa',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Receita acompanhada', value: 'R$ 286,4 mil', icon: <CircleDollarSign size={18} /> },
            { label: 'Canal mais forte', value: 'Google + Maps', icon: <Search size={18} /> },
            { label: 'Alavanca do mes', value: 'Eventos corporativos', icon: <Crown size={18} /> },
            { label: 'Modo de operação', value: 'CRM + IA + mídia', icon: <ClipboardCheck size={18} /> },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="mb-2 text-red-300">{item.icon}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
              <div className="mt-2 text-lg font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>

        {section === 'overview' && <OverviewSection data={data} />}
        {section === 'aquisicao' && <AcquisitionSection data={data} />}
        {section === 'trafego-pago' && <PaidTrafficSection data={data} />}
        {section === 'crm' && <CrmSection data={data} />}
        {section === 'automacoes' && <AutomationsSection data={data} />}
        {section === 'reputacao' && <ReputationSection data={data} />}
        {section === 'eventos' && <EventsSection data={data} />}
        {section === 'sistema-localrise' && <SystemSection data={data} />}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Produto demonstrável',
              text: 'A narrativa deixa de ser fazer marketing e passa a ser operar crescimento.',
              icon: <HandCoins size={18} />,
            },
            {
              title: 'Base preparada para integração',
              text: 'Todos os blocos já têm estrutura clara para receber dados de Supabase, GA4, Ads, WhatsApp e CRM.',
              icon: <Activity size={18} />,
            },
            {
              title: 'Clareza comercial',
              text: 'Cada página explica valor de negócio, não apenas número isolado.',
              icon: <Sparkles size={18} />,
            },
          ].map((item) => (
            <Panel key={item.title}>
              <div className="mb-3 text-red-300">{item.icon}</div>
              <div className="text-base font-bold text-white">{item.title}</div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}

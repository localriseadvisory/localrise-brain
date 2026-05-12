# LOCALRISE ADVISORY — SISTEMA COMPLETO DE CRESCIMENTO
> Arquitetura de uma máquina de crescimento automatizada e escalável

---

## 1. PROSPECÇÃO AUTOMÁTICA (Google Maps + Puppeteer)

### Como funciona
O `scraper-google-maps.js` busca negócios locais no Google Maps e extrai:
- Nome, telefone, endereço, site
- Nota e número de avaliações
- Score rápido de priorização (quem tem mais problemas = lead mais quente)
- Exporta `leads.json` + `leads.csv`

### Instalação (quando Node.js estiver disponível)
```bash
cd "Claude Local RIse"
npm init -y
npm install puppeteer
node scraper-google-maps.js
```

### Configurar bairros e segmento
Edite o arquivo `scraper-google-maps.js` — bloco CONFIG:
```js
const CONFIG = {
  segmento: 'restaurante',          // ou 'academia', 'clinica', etc.
  cidade: 'São Paulo',
  bairros: ['Pinheiros', 'Moema'],  // adicione os bairros alvo
  maxResultadosPorBusca: 20,
};
```

### Critérios de priorização automática
| Score  | Prioridade | Significado                       |
| ------ | ---------- | --------------------------------- |
| 0-50   | ALTA       | Múltiplos problemas — pitch fácil |
| 51-70  | MÉDIA      | Problemas identificáveis          |
| 71-100 | BAIXA      | Já relativamente bem posicionado  |

**Foco na prospecção: leads de prioridade ALTA e MÉDIA.**

---

## 2. DIAGNÓSTICO AUTOMATIZADO

### Fluxo de uso
1. Abrir Claude Code neste projeto
2. Digitar: `/diagnostico-completo`
3. Informar: nome do negócio, cidade, site, Instagram, Google Maps
4. Agentes executam em paralelo:
   - `agent-gbp-audit` → score GBP + falhas
   - `agent-site-audit` → score site + falhas  
   - `agent-instagram-audit` → score Instagram + falhas
5. `agent-diagnostico-master` consolida tudo
6. Relatório final com: score geral, custo da ineficiência (R$), top 5 problemas, plano 30 dias

### Tempo por diagnóstico
- Manual completo: 3-4 horas
- Com agentes LocalRise: **20-30 minutos**
- Capacidade: 4-6 diagnósticos/dia por operador

---

## 3. GERAÇÃO AUTOMÁTICA DE PROPOSTA

### Fluxo
```
/diagnostico-completo
        ↓
  Score + Problemas
        ↓
/gerar-proposta
        ↓
  HTML da proposta pronto para enviar
```

### Pacotes disponíveis (definidos no comando gerar-proposta)
| Pacote  | Preço/mês | Ideal para                     |
| ------- | --------- | ------------------------------ |
| Starter | R$ 1.500  | 1-2 problemas críticos         |
| Growth  | R$ 2.800  | 3-4 problemas, potencial claro |
| Scale   | R$ 5.000  | 5+ falhas + verba para ads     |

### Tempo de geração
- Manual: 2-3 horas por proposta
- Com comando: **5-10 minutos**

---

## 4. DASHBOARD LOOKER STUDIO

### Estrutura recomendada

**Página 1: Visão Geral do Cliente**
- Score GBP (gauge)
- Score Site (gauge)
- Score Instagram (gauge)
- Evolução do score ao longo do tempo (linha)
- Alertas ativos

**Página 2: Google Business Profile**
- Visualizações na busca/mês (linha)
- Chamadas geradas/mês (barras)
- Solicitações de direções/mês (barras)
- Cliques no site pelo GBP (linha)
- Número e evolução de avaliações

**Página 3: Site**
- Sessões orgânicas/mês (Google Analytics)
- Taxa de conversão
- Páginas mais acessadas
- Velocidade do site (PageSpeed score)
- Palavras-chave no top 10 (Google Search Console)

**Página 4: Instagram**
- Alcance/mês
- Engajamento médio
- Seguidores (crescimento)
- Posts publicados
- Melhores conteúdos do período

**Página 5: ROI e Resultados**
- Investimento mensal LocalRise
- Leads gerados/mês (estimado por canal)
- Receita incremental estimada
- ROI do serviço

### Fontes de dados para conectar
1. Google Business Profile Insights (via Google Search Console / API)
2. Google Analytics 4 (site)
3. Instagram Insights (via Meta Business Suite)
4. Google Ads (se aplicável)
5. Planilha Google Sheets (para dados manuais do GBP)

### Como criar o template
1. Acesse lookerstudio.google.com
2. Crie novo relatório
3. Conecte fontes: GA4, Search Console, planilha de dados GBP
4. Use o layout descrito acima
5. Compartilhe com o cliente em modo "Viewer"

---

## 5. CRESCIMENTO DA LOCALRISE

### Instagram LocalRise — Posicionamento e Leads

**Estratégia de conteúdo semanal:**
- **Seg:** "Diagnóstico do dia" — mostre score de um negócio anônimo (ou com permissão)
- **Ter:** Dica de GBP (tutorial rápido)
- **Qua:** Reel: "3 erros que restaurantes cometem no Google Maps"
- **Qui:** Case: antes x depois de um cliente (com dados reais)
- **Sex:** "Você sabia?" — dado impactante sobre marketing local
- **Sáb:** Bastidores da LocalRise / conteúdo humano

**Formatos prioritários:**
1. Reels educativos (maior alcance orgânico — 60% do esforço)
2. Carrosséis com dados/dicas (salva e compartilha)
3. Stories diários com interação (enquetes, "qual erro você vê mais?")

**Meta em 90 dias:**
- 0 para 500 seguidores qualificados (donos de restaurantes/negócios)
- 3-5 leads inbound por semana
- Autoridade estabelecida no nicho local

### Site LocalRise — SEO Local

**Páginas prioritárias a criar:**
1. Homepage: "Agência de Marketing Digital para Negócios Locais em [Cidade]"
2. /diagnostico-gratuito: isca digital — formulário para diagnóstico
3. /cases: resultados de clientes (com dados)
4. /blog: conteúdo SEO — "como melhorar GBP restaurante SP"
5. /pacotes: detalhamento dos planos com preços

**Keywords target:**
- "marketing digital para restaurantes [cidade]"
- "agência google meu negócio [cidade]"
- "gestão de instagram restaurante [cidade]"
- "consultoria marketing digital local [cidade]"

**Meta em 90 dias:** aparecer na primeira página para 3-5 keywords locais.

### Inbound + Outbound

**Inbound (vem até você):**
- SEO do site → orgânico
- Instagram → DMs + links na bio
- Isca digital: "Diagnóstico Gratuito" → formulário → você contata
- Google Ads próprio (quando tiver budget): R$ 300-500/mês, keywords de intenção

**Outbound (você vai buscar):**
- Scraper Google Maps → leads qualificados
- Sequência de prospecção: WhatsApp frio personalizado
- LinkedIn: conectar com donos de restaurantes
- Parceria com fornecedores (embalagens, fornecedores de alimentos)

**Script de WhatsApp (prospecção fria):**
```
Olá [NOME]!

Vi que o [RESTAURANTE] tem ótimas avaliações no Google, parabéns!

Fiz uma análise rápida da presença digital de vocês e identifiquei 
[X problema principal] que pode estar custando clientes.

Posso te mostrar em 15 minutos o que encontrei? Sem compromisso.

— [Seu nome], LocalRise Advisory
```

---

## 6. AUTOMAÇÃO COMPLETA — FLUXO COM N8N

### Arquitetura do Sistema

```
PROSPECÇÃO
Google Maps (Puppeteer) → leads.json
         ↓
TRIAGEM AUTOMÁTICA N8N
         ↓
Webhook recebe lead novo
         ↓
Notificação WhatsApp/Telegram
"Novo lead prioritário: [nome]"
         ↓
DIAGNÓSTICO (Claude Code)
/diagnostico-completo → relatório
         ↓
PROPOSTA (Claude Code)
/gerar-proposta → HTML
         ↓
ENVIO AUTOMATIZADO N8N
Gmail/WhatsApp → proposta para cliente
         ↓
CRM (Sheets/Notion)
Lead atualizado: status "proposta enviada"
         ↓
FOLLOW-UP AUTOMÁTICO (3 dias, 7 dias)
N8N agenda lembrete
         ↓
FECHAMENTO
         ↓
ONBOARDING
Planilha cliente, acesso dashboard, 
kickoff agendado
         ↓
DASHBOARD LOOKER STUDIO
Atualização mensal automática
```

### Workflows N8N a criar

**Workflow 1: Triagem de Leads**
- Trigger: novo arquivo leads.json detectado
- Ação: ler leads de prioridade ALTA
- Ação: enviar notificação Telegram com top 3
- Ação: criar linha no Google Sheets (CRM)

**Workflow 2: Follow-up Automático**
- Trigger: agendado (3 dias após proposta enviada)
- Ação: verificar se lead respondeu (Sheets)
- Ação: enviar mensagem de follow-up personalizada
- Ação: atualizar status no Sheets

**Workflow 3: Relatório Mensal**
- Trigger: dia 1 de cada mês
- Ação: coletar dados de performance dos clientes
- Ação: atualizar dashboard Looker Studio
- Ação: enviar email de relatório ao cliente

### CRM Simplificado (Google Sheets)
Colunas sugeridas:
```
ID | Nome Negócio | Contato | Telefone | Email | 
Score GBP | Score Site | Score Insta | Score Geral |
Pacote Recomendado | Valor | Status | 
Data Diagnóstico | Data Proposta | Data Fechamento |
Notas
```

---

## 7. ESCALA E FATURAMENTO

### Projeção por Número de Clientes

**5 CLIENTES**
| Pacote    | Qtd | MRR               |
| --------- | --- | ----------------- |
| Starter   | 2   | R$ 3.000          |
| Growth    | 2   | R$ 5.600          |
| Scale     | 1   | R$ 5.000          |
| **TOTAL** |     | **R$ 13.600/mês** |

**10 CLIENTES**
| Pacote    | Qtd | MRR               |
| --------- | --- | ----------------- |
| Starter   | 3   | R$ 4.500          |
| Growth    | 5   | R$ 14.000         |
| Scale     | 2   | R$ 10.000         |
| **TOTAL** |     | **R$ 28.500/mês** |

**20 CLIENTES**
| Pacote    | Qtd | MRR               |
| --------- | --- | ----------------- |
| Starter   | 4   | R$ 6.000          |
| Growth    | 10  | R$ 28.000         |
| Scale     | 6   | R$ 30.000         |
| **TOTAL** |     | **R$ 64.000/mês** |

### Capacidade Operacional

Com automação via Claude Code + N8N:
- **1 pessoa** consegue gerenciar **até 15 clientes** com qualidade
- **2 pessoas** = 25-30 clientes confortavelmente
- Gargalo principal: criação de conteúdo (Instagram, posts GBP)
- Solução: templates + IA para geração de conteúdo

### Custos Operacionais (20 clientes)
| Item                         | Custo/mês     |
| ---------------------------- | ------------- |
| Claude Code (assinatura)     | R$ 100-300    |
| N8N Cloud                    | R$ 200        |
| Ferramentas (SEO, analytics) | R$ 500        |
| Google Ads próprio           | R$ 1.500      |
| Freelancer conteúdo (20h)    | R$ 2.000      |
| **TOTAL CUSTOS**             | **~R$ 4.500** |
| **MARGEM (20 clientes)**     | **~93%**      |

---

## 8. PLANO DE EXECUÇÃO

### 7 DIAS — BASE OPERACIONAL

**Dia 1-2: Setup do Sistema**
- [x] Agentes criados (gbp, site, instagram, google-ads, meta-ads)
- [x] Comandos criados (diagnostico-completo, gerar-proposta, gerar-apresentacao)
- [x] Scraper Google Maps criado
- [ ] Instalar Node.js (nodejs.org)
- [ ] npm install puppeteer
- [ ] Testar scraper em 1 bairro

**Dia 3-4: Primeiro Diagnóstico Real**
- [ ] Escolher 1 negócio local como teste
- [ ] Rodar /diagnostico-completo
- [ ] Gerar /gerar-proposta
- [ ] Avaliar qualidade e ajustar agentes

**Dia 5-6: Prospecção**
- [ ] Rodar scraper em 3 bairros
- [ ] Identificar top 10 leads prioritários
- [ ] Preparar script de abordagem

**Dia 7: Primeiros Contatos**
- [ ] Enviar mensagem para top 5 leads
- [ ] Oferecer diagnóstico gratuito

---

### 30 DIAS — PRIMEIROS CLIENTES

**Semana 1 (dias 1-7):** Setup + primeiros contatos (ver acima)

**Semana 2 (dias 8-14):**
- [ ] Fazer diagnóstico de 5-10 leads que responderam
- [ ] Enviar propostas personalizadas
- [ ] Criar conta Instagram LocalRise
- [ ] Primeiros 3 posts do Instagram
- [ ] Criar template de CRM no Google Sheets

**Semana 3 (dias 15-21):**
- [ ] Fechar 1-2 clientes
- [ ] Fazer onboarding do primeiro cliente
- [ ] Configurar dashboard Looker Studio para cliente 1
- [ ] Continuar prospecção: mais 20 leads novos
- [ ] Publicar 6-8 posts no Instagram

**Semana 4 (dias 22-30):**
- [ ] Entregar primeiras melhorias ao cliente 1 (GBP, site)
- [ ] Fechar cliente 2-3
- [ ] Setup N8N básico (triagem de leads)
- [ ] Meta Instagram: 100 seguidores
- [ ] Revisar e ajustar agentes com base no uso real

**Meta ao final do mês 1:**
- 2-3 clientes ativos
- MRR: R$ 4.000-8.000
- Pipeline: 10+ leads em negociação
- Sistema rodando de forma semi-automática

---

### 90 DIAS — ESCALA

**Mês 2:**
- [ ] 5-7 clientes ativos (MRR: R$ 12.000-18.000)
- [ ] Instagram LocalRise: 300+ seguidores, gerando inbound
- [ ] Site LocalRise publicado com página de diagnóstico gratuito
- [ ] N8N com follow-up automático funcionando
- [ ] Primeiros cases documentados (antes/depois com dados)
- [ ] Contratar freelancer para conteúdo (6h/semana)

**Mês 3:**
- [ ] 10 clientes ativos (MRR: R$ 25.000-30.000)
- [ ] Instagram: 500+ seguidores + leads inbound consistentes
- [ ] Site gerando 3-5 leads orgânicos/mês
- [ ] Dashboard Looker Studio padronizado e replicável
- [ ] SOP documentado para cada processo
- [ ] Sistema rodando 80% automatizado
- [ ] Pensar em segundo membro da equipe

---

## RESUMO EXECUTIVO

| O que está pronto AGORA       | Status                  |
| ----------------------------- | ----------------------- |
| Agente GBP Audit              | ✅                       |
| Agente Site Audit             | ✅                       |
| Agente Instagram Audit        | ✅                       |
| Agente Google Ads Audit       | ✅                       |
| Agente Meta Ads Audit         | ✅                       |
| Agente Diagnóstico Master     | ✅                       |
| Comando /diagnostico-completo | ✅                       |
| Comando /gerar-proposta       | ✅                       |
| Comando /gerar-apresentacao   | ✅                       |
| Scraper Google Maps           | ✅ (precisa Node.js)     |
| 34 Skills de Marketing        | ✅ (repositório clonado) |

| Próximo passo                              | Prioridade |
| ------------------------------------------ | ---------- |
| Instalar Node.js                           | CRÍTICA    |
| Testar /diagnostico-completo com lead real | ALTA       |
| Rodar scraper para gerar leads             | ALTA       |
| Criar Instagram LocalRise                  | ALTA       |
| Configurar N8N básico                      | MÉDIA      |
| Publicar site LocalRise                    | MÉDIA      |

---

*LocalRise Advisory — Sistema de Crescimento Automatizado*
*Criado em: 2026-04-01*

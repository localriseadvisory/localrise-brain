# Automação de Entrada de Clientes — LocalRise Advisory
> Versão 1.0 | Arquitetura operacional criada em 2026-04-04

---

## VISÃO GERAL

Esta automação conecta o pipeline comercial (leads.csv) ao dashboard já existente em
**localriseadvisory.com**, sem criar nenhum sistema paralelo.

O único papel da automação é: detectar o fechamento de um cliente e alimentar o
dashboard atual com os dados organizados.

---

## ARQUITETURA

```
COMERCIAL                  AUTOMAÇÃO                 DASHBOARD
─────────────────          ───────────────────       ─────────────────────────
comercial/leads.csv        /fechar-cliente           localriseadvisory.com
 Status = "Fechado"   ──►  [validação]         ──►   Supabase: tabela clientes
                           [estrutura local]         → Cliente visível no portal
                           [sync dashboard]          → Status inicial configurado
                           [relatório]               → Pronto para evolução
```

---

## ONDE FICA O GATILHO

**Comando:** `/fechar-cliente [ID_DO_LEAD]`

Exemplo:
```
/fechar-cliente 001
```

Este é o único ponto de entrada. Quando executado:
1. Lê o lead `001` do arquivo `comercial/leads.csv`
2. Valida os campos obrigatórios
3. Cria toda a estrutura local do cliente
4. Registra no `clientes/CRM-MASTER.csv`
5. Insere no Supabase (banco do dashboard)
6. Cliente aparece automaticamente no portal

---

## FLUXO COMPLETO PASSO A PASSO

```
/fechar-cliente 001
        │
        ▼
[1] LER LEAD
    → Busca linha com ID 001 em comercial/leads.csv
    → Extrai todos os campos disponíveis

        │
        ▼
[2] VALIDAR CAMPOS MÍNIMOS
    → Verifica se tem: empresa, nicho, cidade, telefone, serviço
    → Se faltar algum campo, pergunta ao usuário antes de continuar

        │
        ▼
[3] ATUALIZAR PIPELINE COMERCIAL
    → Atualiza status → "Fechado" em comercial/leads.csv
    → Move lead para Estágio 7 em comercial/pipeline.md
    → Registra data de fechamento

        │
        ▼
[4] CRIAR ESTRUTURA LOCAL DO CLIENTE
    → Cria pasta clientes/[slug]/
    → Cria subpastas: inputs/, analises/, estrategia/, entregas/, historico/
    → Preenche os 5 templates com dados reais do cliente
    → Registra em clientes/CRM-MASTER.csv

        │
        ▼
[5] SINCRONIZAR COM O DASHBOARD
    → Monta payload com todos os campos
    → Insere na tabela `clientes` do Supabase
    → Cliente fica visível em localriseadvisory.com

        │
        ▼
[6] RELATÓRIO FINAL
    → Confirma cada etapa concluída
    → Mostra link/ID do cliente no dashboard
    → Lista próximas ações
```

---

## CAMPOS QUE ALIMENTAM O DASHBOARD

Estes campos são inseridos no Supabase e consumidos pelo dashboard:

| Campo | Origem | Obrigatório |
|-------|--------|-------------|
| `id_cliente` | Gerado automaticamente (timestamp) | Sim |
| `nome_cliente` | leads.csv → Nome | Sim |
| `empresa` | leads.csv → Empresa | Sim |
| `nicho` | leads.csv → Nicho | Sim |
| `cidade` | leads.csv → Cidade | Sim |
| `telefone` | leads.csv → WhatsApp | Sim |
| `email` | Coletado no fechamento | Não |
| `instagram` | leads.csv → Instagram | Não |
| `site` | leads.csv → Site | Não |
| `google_business_profile` | Coletado no fechamento | Não |
| `servico_contratado` | leads.csv → Interesse | Sim |
| `plano` | Coletado no fechamento | Não |
| `data_fechamento` | Data atual | Sim |
| `responsavel_comercial` | leads.csv → Responsável | Sim |
| `responsavel_operacional` | Coletado no fechamento | Não |
| `status_inicial` | "Onboarding" (padrão) | Sim |
| `etapa_atual` | "Acesso e Configuração" | Sim |
| `progresso` | 0 (início) | Sim |
| `score_gbp` | CRM-MASTER.csv | Não |
| `score_site` | CRM-MASTER.csv | Não |
| `score_instagram` | CRM-MASTER.csv | Não |
| `score_geral` | CRM-MASTER.csv | Não |
| `observacoes` | leads.csv → Observações | Não |
| `pasta_local` | clientes/[slug]/ | Sim |
| `ativo` | true | Sim |
| `criado_em` | Timestamp atual | Sim |

---

## O QUE APARECE NO DASHBOARD IMEDIATAMENTE

Ao entrar no portal da LocalRise, o cliente aparece com:

```
┌─────────────────────────────────────────────────────┐
│  🏢 [Nome da Empresa]                               │
│  📅 Entrada: [data_fechamento]                      │
│  🎯 Serviço: [servico_contratado]                   │
│  🔵 Status: Onboarding                              │
│  📍 Etapa: Acesso e Configuração                    │
│  📊 Progresso: 0%                                   │
│  👤 Responsável: [responsavel_operacional]           │
│  📝 Observações: [observacoes]                      │
└─────────────────────────────────────────────────────┘
```

---

## BANCO DE DADOS — SUPABASE

O dashboard usa o Supabase como backend. A tabela principal é:

**Tabela:** `clientes`
**Migration:** `scripts/supabase-migration.sql`

Para criar a tabela no projeto Supabase da LocalRise, execute o arquivo SQL.

---

## ESTRUTURA DE STATUS DO CLIENTE NO DASHBOARD

Progressão de status após o fechamento:

```
Onboarding → Em Execução → Em Otimização → Resultados → Renovação
    0%           25%            50%             75%          100%
```

Etapas dentro de cada status:

| Status | Etapas possíveis |
|--------|-----------------|
| Onboarding | Acesso e Configuração / Diagnóstico Inicial / Kickoff |
| Em Execução | Implementação Técnica / Criação de Conteúdo / Publicação |
| Em Otimização | Análise de Dados / Ajustes / Testes |
| Resultados | Relatório Mensal / Apresentação de Resultados |
| Renovação | Proposta de Renovação / Negociação |

---

## COMO ATUALIZAR O CLIENTE NO DASHBOARD DEPOIS

Para evoluir o status de um cliente já cadastrado, use:

```
/atualizar-cliente [ID_CLIENTE]
```

(A ser criado em versão futura)

Ou diretamente via Supabase no painel de administração.

---

## REQUISITOS TÉCNICOS

Para que a automação funcione:

1. **Supabase configurado** — projeto LocalRise com tabela `clientes` criada
2. **MCP Supabase ativo** — conexão do Claude Code com o projeto
3. **leads.csv atualizado** — lead deve ter campos básicos preenchidos
4. **Templates locais** — `scripts/templates/` com os 5 arquivos base

---

## FLUXO DIA A DIA (SIMPLIFICADO)

```
Lead fecha contrato
        ↓
/fechar-cliente [ID]
        ↓
Claude faz tudo automaticamente:
  ✓ Pipeline atualizado
  ✓ Pasta do cliente criada
  ✓ 5 docs gerados
  ✓ CRM-MASTER registrado
  ✓ Dashboard alimentado
        ↓
Cliente aparece no portal em < 60 segundos
```

---

## ESCALABILIDADE

Esta arquitetura suporta crescimento porque:
- Cada cliente tem ID único → sem conflito
- Supabase escala automaticamente
- Estrutura local organizada por slug → fácil de navegar
- Status e etapas são configuráveis → evolui com o negócio
- Comando simples → qualquer membro do time usa

---

## ARQUIVOS DO SISTEMA

```
LocalRise/
├── .claude/commands/
│   ├── novo-lead.md              ← Cadasto de leads
│   ├── fechar-cliente.md         ← [NOVO] Fechamento → Dashboard
│   └── novo-cliente.md           ← Onboarding completo (interno)
│
├── comercial/
│   ├── leads.csv                 ← Pipeline de leads
│   └── pipeline.md               ← Dashboard visual do funil
│
├── clientes/
│   ├── CRM-MASTER.csv            ← Registro master de clientes
│   └── [slug-cliente]/           ← Pasta individual do cliente
│
├── scripts/
│   ├── supabase-migration.sql    ← [NOVO] Estrutura da tabela do dashboard
│   └── templates/                ← Templates dos 5 documentos
│
└── AUTOMACAO-DASHBOARD.md        ← Este arquivo
```
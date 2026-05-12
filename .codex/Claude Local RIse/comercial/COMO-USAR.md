# Sistema Comercial LocalRise Advisory
## Manual de Uso — Comercial

---

## O QUE É ESSE SISTEMA

Sistema de automação comercial integrado ao Claude Code. Organiza leads, classifica prioridade, gera análises estratégicas, mensagens de abordagem e follow-up, e mantém o pipeline atualizado — tudo com comandos simples.

---

## COMANDOS DISPONÍVEIS

| Comando | O que faz |
|---------|-----------|
| `/novo-lead` | Cadastra um lead, gera score, análise e mensagens prontas |
| `/diagnostico-completo` | Roda auditoria completa do negócio (GBP, site, Instagram) |
| `/gerar-proposta` | Gera proposta comercial HTML personalizada |
| `/gerar-apresentacao` | Gera apresentação visual HTML para reunião |
| `/fechar-cliente [ID]` | **[PRINCIPAL]** Fecha lead, cria estrutura e envia para o dashboard |
| `/novo-cliente` | Onboarding manual completo (sem sync automático com dashboard) |

---

## FLUXO COMERCIAL DIA A DIA

```
LEAD ENTRA
    ↓
/novo-lead
    → Score automático (0–100)
    → Prioridade (ALTA / MÉDIA / BAIXA)
    → Análise estratégica gerada
    → Mensagem de abordagem gerada
    → Follow-ups gerados
    → Registrado no leads.csv
    ↓
ENVIAR ABORDAGEM
(usar mensagem do arquivo gerado)
    ↓
LEAD RESPONDE?
    ├── SIM → /diagnostico-completo → /gerar-proposta
    └── NÃO → Follow-up D+2, D+5, D+10
    ↓
PROPOSTA ENVIADA
    ↓
FECHOU?
    ├── SIM → /fechar-cliente [ID] → Onboarding + Dashboard
    └── NÃO → Registrar motivo em pipeline.md
```

---

## ESTRUTURA DE ARQUIVOS

```
comercial/
├── leads.csv                    ← Planilha master de todos os leads
├── pipeline.md                  ← Dashboard visual do funil comercial
├── COMO-USAR.md                 ← Este arquivo
│
├── leads/
│   ├── analises/                ← Análise estratégica de cada lead
│   │   └── analise-lead-[SLUG].md
│   ├── mensagens/               ← Abordagem e follow-ups prontos
│   │   ├── abordagem-lead-[SLUG].md
│   │   └── followup-lead-[SLUG].md
│   └── historico/               ← Log de interações por lead
│       └── historico-lead-[SLUG].md
│
├── templates/                   ← Templates base (não editar diretamente)
│   ├── analise-template.md
│   ├── abordagem-template.md
│   └── followup-template.md
│
└── scripts/
    └── processar-lead.sh        ← Script bash alternativo (modo terminal)
```

---

## PLANILHA DE LEADS (leads.csv)

Abra no Excel ou Google Sheets. Colunas:

| Coluna | Descrição |
|--------|-----------|
| ID | Identificador único (LR-YYYYMMDD-XXX) |
| Nome | Contato responsável |
| Empresa | Nome do negócio |
| Nicho | Segmento do mercado |
| Cidade | Cidade de operação |
| WhatsApp | Número com DDD |
| Instagram | @handle |
| Site | URL ou "Sem site" |
| Origem | Como o lead chegou |
| Interesse | Serviço de interesse |
| Dor Principal | Problema declarado |
| Score | 0 a 100 (calculado automaticamente) |
| Prioridade | ALTA / MÉDIA / BAIXA |
| Status Pipeline | Estágio atual no funil |
| Data Entrada | Data do cadastro |
| Ultima Acao | Última interação realizada |
| Proxima Acao | O que fazer com esse lead |
| Data Proxima Acao | Prazo da próxima ação |
| Responsável | Quem está cuidando do lead |
| Mensagem Inicial | Se foi enviada |
| Follow-up | Status do follow-up |
| Observações | Notas livres |

---

## PIPELINE (pipeline.md)

Atualizar manualmente ao mover leads entre estágios:

| Estágio | Quando usar | Ação imediata |
|---------|-------------|---------------|
| **1 — Novo Lead** | Lead cadastrado | Analisar e contatar em 24h |
| **2 — Em Análise** | Diagnóstico em andamento | Completar análise |
| **3 — Primeiro Contato** | Mensagem enviada | Follow-up se sem resposta em 48h |
| **4 — Em Negociação** | Lead respondeu | Apresentar diagnóstico |
| **5 — Follow-up** | Lead esfriou | Reativar com sequência |
| **6 — Proposta Enviada** | Proposta formal enviada | Follow-up em 3 dias |
| **7 — Fechado** | Contrato assinado | `/novo-cliente` |
| **8 — Perdido** | Descartado | Registrar motivo |

---

## SCORING DO LEAD

O Claude calcula o score automaticamente ao rodar `/novo-lead`:

| Critério | Pontos |
|----------|--------|
| Origem: Indicação | +20 |
| Origem: Google (busca ativa) | +15 |
| Origem: Instagram | +10 |
| Sem site (oportunidade direta) | +15 |
| Tem Instagram ativo | +10 |
| Interesse: Pacote completo / Tudo | +15 |
| Interesse: SEO ou GBP | +10 |
| Dor declarada urgente | +10 |

**Score 80–100 = ALTA → Contatar hoje**
**Score 60–79 = MÉDIA → Contatar em 24h**
**Score 0–59 = BAIXA → Contatar em 48-72h**

---

## DICAS PARA O COMERCIAL

1. **Sempre use o `/novo-lead` ao receber um lead** — nunca confie na memória
2. **Leia a análise estratégica antes de ligar** — ela dá o argumento certo
3. **Use as mensagens geradas como base** — personalize apenas os detalhes finais
4. **Siga a sequência de follow-up** — a maioria das vendas fecha no 2º ou 3º contato
5. **Atualize o pipeline.md toda manhã** — mantém o comercial organizado
6. **Registre no histórico após cada interação** — facilita retomada de contexto
7. **Para leads ALTA prioridade** — tente ligar, não só mensagem de texto
8. **Diagnóstico gratuito é a isca principal** — sempre ofereça antes da proposta

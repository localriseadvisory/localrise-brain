# Sistema de Automação de Onboarding — LocalRise Advisory

> Versão 1.0 · Criado em 2026-04-04

---

## O Que é Este Sistema

Um pipeline automatizado que transforma os dados brutos de um novo cliente em uma pasta estruturada com diagnóstico digital completo, estratégia inicial e documentação padronizada — com o mínimo de trabalho manual.

---

## Visão Geral do Fluxo

```
ENTRADA DE DADOS
      ↓
 /novo-cliente  ←── Slash command no Claude Code
      ↓
 Coleta interativa de 12 campos
      ↓
 Criação da estrutura de pastas
      ↓
 Preenchimento dos 5 templates
      ↓
 Registro no CRM-MASTER.csv
      ↓
 Chamada dos agents de diagnóstico
   ├── agent-gbp-audit
   ├── agent-site-audit
   └── agent-instagram-audit
      ↓
 agent-diagnostico-master (consolidação)
      ↓
 Geração de estratégia inicial
      ↓
 Relatório final com scores e plano de ação
      ↓
 (Opcional) /gerar-apresentacao ou /gerar-proposta
```

---

## Estrutura de Arquivos

```
Claude Local RIse/
├── clientes/
│   ├── CRM-MASTER.csv              ← Planilha mestre de todos os clientes
│   └── [slug-do-cliente]/
│       ├── perfil-cliente.md       ← Dados cadastrais e comerciais
│       ├── diagnostico-inicial.md  ← Scores e análise digital
│       ├── checklist-onboarding.md ← Checklist de fases do onboarding
│       ├── estrategia-inicial.md   ← Plano estratégico 90 dias
│       ├── pendencias-acessos.md   ← Controle de acessos às plataformas
│       ├── inputs/                 ← Arquivos recebidos do cliente
│       ├── analises/               ← Outputs dos agents de diagnóstico
│       │   ├── gbp-audit.md
│       │   ├── site-audit.md
│       │   ├── instagram-audit.md
│       │   └── diagnostico-completo.md
│       ├── estrategia/             ← Documentos estratégicos detalhados
│       ├── entregas/               ← Materiais entregues ao cliente
│       └── historico/              ← Versões anteriores e registros
├── scripts/
│   ├── novo-cliente.sh             ← Script bash alternativo (terminal)
│   └── templates/                 ← Templates base de todos os documentos
│       ├── perfil-cliente.md
│       ├── diagnostico-inicial.md
│       ├── checklist-onboarding.md
│       ├── estrategia-inicial.md
│       └── pendencias-acessos.md
└── .claude/
    └── commands/
        └── novo-cliente.md         ← Slash command /novo-cliente
```

---

## Como Usar no Dia a Dia

### Método 1 — Slash Command (Recomendado)

1. Abra o Claude Code neste diretório
2. Digite `/novo-cliente`
3. Responda às perguntas sobre o cliente
4. O sistema cria tudo automaticamente e executa o diagnóstico

### Método 2 — Script Bash (Terminal)

```bash
cd "c:/Users/digui/Documents/Claude/Claude Local RIse"
bash scripts/novo-cliente.sh
```

Siga as instruções interativas. O script cria a estrutura e registra no CRM. Depois, abra o Claude Code para rodar o diagnóstico.

---

## O Que Entra Manualmente

| Ação                              | Responsável   |
|-----------------------------------|---------------|
| Coletar dados do cliente          | Equipe LocalRise |
| Executar `/novo-cliente`          | Equipe LocalRise |
| Confirmar dados no CRM            | Equipe LocalRise |
| Solicitar acessos ao cliente      | Equipe LocalRise |
| Aprovar estratégia inicial        | Equipe LocalRise |

---

## O Que Roda Automaticamente

| Ação                                        | Quando                          |
|---------------------------------------------|--------------------------------|
| Criação da pasta e subpastas               | Ao executar `/novo-cliente`    |
| Preenchimento dos 5 templates               | Ao executar `/novo-cliente`    |
| Registro no CRM-MASTER.csv                  | Ao executar `/novo-cliente`    |
| Auditoria de GBP (agent-gbp-audit)         | Durante o fluxo `/novo-cliente`|
| Auditoria de Site (agent-site-audit)        | Durante o fluxo `/novo-cliente`|
| Auditoria de Instagram (agent-instagram-audit) | Durante o fluxo `/novo-cliente` |
| Consolidação do diagnóstico                 | Durante o fluxo `/novo-cliente`|
| Score geral calculado                       | Após consolidação              |
| Estratégia inicial rascunhada               | Após diagnóstico               |

---

## Planilha CRM-MASTER.csv — Colunas

| Coluna              | Descrição                                         |
|---------------------|---------------------------------------------------|
| ID                  | Timestamp único do cliente (YYYYMMDDHHMMSS)       |
| Cliente             | Nome do contato/responsável                       |
| Empresa             | Nome da empresa                                   |
| Nicho               | Segmento do negócio                               |
| Cidade              | Cidade de operação                                |
| Telefone            | WhatsApp/telefone principal                       |
| Site                | URL do site                                       |
| Instagram           | @perfil ou URL                                    |
| GBP_URL             | URL ou nome no Google Business Profile            |
| Servico_Contratado  | Serviço ou pacote contratado                      |
| Status              | Ativo / Proposta / Inativo / Churned              |
| Data_Entrada        | Data de cadastro (YYYY-MM-DD)                     |
| Responsavel         | Quem atende este cliente na LocalRise             |
| Pasta_Cliente       | Caminho relativo da pasta (clientes/[slug])       |
| Score_GBP           | Score 0-100 do diagnóstico GBP                    |
| Score_Site          | Score 0-100 do diagnóstico de site                |
| Score_Instagram     | Score 0-100 do diagnóstico Instagram              |
| Score_Geral         | Score médio geral                                 |
| Observacoes         | Notas adicionais                                  |

---

## Agents Utilizados

| Agent                    | Quando chamar                          | Output                        |
|--------------------------|----------------------------------------|-------------------------------|
| `agent-gbp-audit`        | Cliente tem GBP/Google Maps            | `analises/gbp-audit.md`       |
| `agent-site-audit`       | Cliente tem site                       | `analises/site-audit.md`      |
| `agent-instagram-audit`  | Cliente tem Instagram                  | `analises/instagram-audit.md` |
| `agent-diagnostico-master` | Após todas as auditorias            | `analises/diagnostico-completo.md` |

---

## Comandos Disponíveis

| Comando               | O que faz                                              |
|-----------------------|--------------------------------------------------------|
| `/novo-cliente`       | Onboarding completo: cadastro + estrutura + diagnóstico |
| `/diagnostico-completo` | Diagnóstico avulso de qualquer negócio             |
| `/gerar-apresentacao` | Apresentação HTML com slides do diagnóstico            |
| `/gerar-proposta`     | Proposta comercial personalizada em HTML               |

---

## Como Manter Atualizado

### Atualizar status de um cliente no CRM
Edite diretamente o arquivo `clientes/CRM-MASTER.csv` — ou importe para o Google Sheets.

### Atualizar um template
Edite os arquivos em `scripts/templates/`. As mudanças valem para todos os novos clientes.

### Adicionar novo campo a um template
1. Edite o template em `scripts/templates/`
2. Adicione a variável `{{NOME_CAMPO}}` onde necessário
3. Adicione a substituição no script `scripts/novo-cliente.sh`
4. Atualize o slash command `.claude/commands/novo-cliente.md`

### Importar CRM para Google Sheets
1. Abra o Google Sheets
2. Arquivo → Importar → Upload → selecione `clientes/CRM-MASTER.csv`
3. Configure como substituição de planilha existente para manter o histórico

---

## Boas Práticas para a Equipe

- **Sempre** execute `/novo-cliente` antes de iniciar qualquer trabalho para o cliente
- **Nunca** crie pastas manualmente — deixe o sistema fazer isso para manter o padrão
- **Sempre** salve os resultados dos agents nas subpastas corretas (`analises/`)
- **Atualize** o CRM quando o status do cliente mudar (proposta enviada, contrato assinado, churn)
- **Documente** observações relevantes no arquivo `historico/` com data e nome do responsável

---

## Exemplo de Uso Completo

```
1. Novo lead chega via WhatsApp: "Clínica Sorriso Feliz, Belo Horizonte"

2. Execute no Claude Code:
   /novo-cliente

3. Responda às perguntas:
   - Contato: Dr. Carlos Silva
   - Empresa: Clínica Sorriso Feliz
   - Nicho: Odontologia
   - Cidade: Belo Horizonte - MG
   - Site: clinicasorrisofeliz.com.br
   - Instagram: @clinicasorrisofeliz
   - GBP: Clínica Sorriso Feliz Belo Horizonte
   - Serviço: SEO Local + GBP
   - Objetivo: Aparecer no topo do Google Maps para "dentista BH"

4. Sistema cria automaticamente:
   clientes/clinica-sorriso-feliz/
   ├── perfil-cliente.md      (preenchido)
   ├── diagnostico-inicial.md (preenchido + scores dos agents)
   ├── checklist-onboarding.md
   ├── estrategia-inicial.md  (rascunho baseado no diagnóstico)
   ├── pendencias-acessos.md
   └── analises/
       ├── gbp-audit.md
       ├── site-audit.md
       └── instagram-audit.md

5. Score retornado: GBP 42/100 · Site 58/100 · Instagram 35/100

6. Gere a apresentação:
   /gerar-apresentacao

7. Gere a proposta:
   /gerar-proposta
```

---

_LocalRise Advisory · Sistema de Automação v1.0 · 2026-04-04_

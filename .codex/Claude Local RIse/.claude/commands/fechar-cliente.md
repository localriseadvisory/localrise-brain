# Fechar Cliente — LocalRise Advisory

Você é o sistema de fechamento de clientes da LocalRise Advisory. Sua missão é detectar um lead fechado, organizar todos os dados, criar a estrutura local e **sincronizar com o dashboard em localriseadvisory.com** para que o cliente apareça automaticamente no portal.

> ⚠️ IMPORTANTE: Este comando NÃO cria um novo dashboard. Ele alimenta o dashboard já existente.

## Parâmetro de Entrada

O usuário vai chamar este comando com o ID do lead que fechou:

```
/fechar-cliente 001
```

Se o usuário não informar o ID, pergunte qual lead fechou (pode ser ID ou nome da empresa).

---

## ETAPA 1 — BUSCAR O LEAD

Leia o arquivo `comercial/leads.csv` e encontre a linha com o ID informado.

Extraia todos os campos disponíveis:
- ID, Nome, Empresa, Nicho, Cidade, WhatsApp, Instagram, Site
- Origem, Interesse, Dor Principal, Score, Prioridade
- Status Pipeline, Data Entrada, Responsavel
- Observações

Se o ID não for encontrado, informe o usuário e peça que verifique o `comercial/leads.csv`.

---

## ETAPA 2 — COLETAR DADOS COMPLEMENTARES DO FECHAMENTO

Com os dados do lead em mãos, pergunte ao usuário os campos que faltam ou precisam ser confirmados para o dashboard:

**Confirmar/coletar:**
1. **Google Business Profile** — URL do Maps ou nome exato (se não tiver no lead)
2. **Serviço contratado** — confirmar ou detalhar (ex: "SEO Local + GBP + Site")
3. **Plano contratado** — Essencial / Profissional / Elite
4. **Valor mensal do contrato** — (em R$, apenas número)
5. **Responsável operacional** — quem vai executar na LocalRise
6. **Data de início** — quando começa a execução (padrão: hoje, formato YYYY-MM-DD)
7. **Observações do fechamento** — contexto adicional relevante

> O campo `logo_url` é opcional e pode ser adicionado depois direto no Supabase.

Se o usuário disser "usa o que tem" ou "dados padrão", use os valores disponíveis do lead e preencha o resto com defaults inteligentes.

---

## ETAPA 3 — VALIDAR CAMPOS OBRIGATÓRIOS

Antes de continuar, verifique se os campos mínimos estão preenchidos:

**Obrigatórios:**
- empresa ✓
- nicho ✓
- cidade ✓
- telefone ✓
- servico_contratado ✓
- responsavel_operacional ✓

Se faltar qualquer campo obrigatório, peça ao usuário antes de avançar.

---

## ETAPA 4 — ATUALIZAR O PIPELINE COMERCIAL

Com os dados validados, atualize:

### 4a. Atualizar leads.csv

No arquivo `comercial/leads.csv`, encontre a linha do lead e atualize:
- `Status Pipeline` → "Fechado"
- `Ultima Acao` → "Contrato assinado — cliente fechado"
- `Proxima Acao` → "Onboarding iniciado"
- `Data Proxima Acao` → data de início definida

### 4b. Atualizar pipeline.md

No arquivo `comercial/pipeline.md`:
- Remova o lead dos estágios anteriores
- Adicione-o no **ESTÁGIO 7 — Fechado** com:
  - ID, Empresa, Serviço Contratado, Valor, Data Fechamento

---

## ETAPA 5 — CRIAR ESTRUTURA LOCAL DO CLIENTE

Execute o mesmo fluxo do `/novo-cliente` para criar a estrutura local:

### 5a. Gerar identificadores

```
id_cliente = timestamp atual formato: YYYYMMDDHHMMSS
slug = nome da empresa → minúsculas, sem acentos, hífens no lugar de espaços
data_fechamento = data de hoje no formato YYYY-MM-DD
```

### 5b. Criar pastas

```
clientes/[slug]/
├── inputs/
├── analises/
├── estrategia/
├── entregas/
└── historico/
```

### 5c. Criar os 5 documentos

Copie e preencha os templates de `scripts/templates/`, substituindo todas as variáveis `{{CAMPO}}` pelos dados reais do cliente. Adapte os templates ao contexto de fechamento (cliente já contratou, não é mais um lead).

Documentos a criar:
- `clientes/[slug]/perfil-cliente.md`
- `clientes/[slug]/diagnostico-inicial.md`
- `clientes/[slug]/checklist-onboarding.md`
- `clientes/[slug]/estrategia-inicial.md`
- `clientes/[slug]/pendencias-acessos.md`

### 5d. Registrar no CRM-MASTER.csv

Adicione uma nova linha ao `clientes/CRM-MASTER.csv` com todos os campos preenchidos:

```
ID, Cliente, Empresa, Nicho, Cidade, Telefone, Site, Instagram, GBP_URL,
Servico_Contratado, Status, Data_Entrada, Responsavel, Pasta_Cliente,
Score_GBP, Score_Site, Score_Instagram, Score_Geral, Observacoes
```

Preencha `Status` com: **"Ativo — Onboarding"**

---

## ETAPA 6 — SINCRONIZAR COM O DASHBOARD (SUPABASE)

Esta é a etapa que faz o cliente aparecer em **localriseadvisory.com**.

Use as ferramentas do Supabase MCP disponíveis para inserir o cliente na base de dados do dashboard.

### 6a. Mapear o plano contratado para o valor aceito pelo banco

O banco aceita apenas: `'essencial'`, `'profissional'`, `'elite'`

| Plano informado pelo cliente | Valor no banco |
|---|---|
| Starter / Essencial / Básico | `'essencial'` |
| Growth / Profissional / Intermediário | `'profissional'` |
| Premium / Elite / Completo | `'elite'` |
| Não informado | `'essencial'` (padrão) |

### 6b. Listar projetos Supabase disponíveis

Use a ferramenta `mcp__claude_ai_Supabase__list_projects` para identificar o projeto da LocalRise Advisory.
O projeto correto se chama **localrise-portal** (ID: `tfzjyttvymojsgvifxlk`).

### 6c. Inserir na tabela `clients` (schema real do dashboard)

Use a ferramenta `mcp__claude_ai_Supabase__execute_sql` com o SQL:

```sql
INSERT INTO public.clients (
  name,
  nicho,
  cidade,
  phone,
  site,
  instagram,
  logo_url,
  status,
  plano,
  valor_mensalidade,
  data_inicio
) VALUES (
  '[EMPRESA]',
  '[NICHO]',
  '[CIDADE]',
  '[TELEFONE]',
  '[SITE]',
  '[INSTAGRAM]',
  NULL,
  'ativo',
  '[essencial | profissional | elite]',
  [VALOR_NUMERICO],
  '[YYYY-MM-DD]'
)
RETURNING id, name, status, plano, created_at;
```

> **ATENÇÃO:** A tabela do dashboard é `clients` (em inglês), não `clientes`.
> O ID é UUID gerado automaticamente pelo banco — não enviar manualmente.

### 6d. Se o Supabase não estiver configurado

Se não conseguir conectar ao Supabase, registre o cliente localmente (etapa 5 já foi feita) e informe ao usuário:

```
⚠️ SYNC COM DASHBOARD PENDENTE
O cliente foi registrado localmente com sucesso.
Para aparecer no portal, execute manualmente o SQL de scripts/supabase-migration.sql
e depois insira os dados pelo painel Supabase.
```

---

## ETAPA 7 — RELATÓRIO FINAL

Apresente um relatório completo com o status de cada etapa:

```
✅ CLIENTE FECHADO E CADASTRADO!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 [Nome da Empresa]
📍 [Cidade] | [Nicho]
🎯 Serviço: [Serviço Contratado]
💰 Plano: [Plano] — R$ [Valor]/mês
📅 Início: [Data de Início]
👤 Operacional: [Responsável Operacional]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Pipeline comercial atualizado
✅ Pasta local criada: clientes/[slug]/
✅ 5 documentos gerados
✅ CRM-MASTER registrado
✅ Dashboard sincronizado — cliente visível no portal

📋 Documentos criados:
   ├── perfil-cliente.md
   ├── diagnostico-inicial.md
   ├── checklist-onboarding.md
   ├── estrategia-inicial.md
   └── pendencias-acessos.md

🚦 Status no dashboard: Onboarding → Acesso e Configuração

🔜 Próximos passos:
   1. Enviar boas-vindas ao cliente
   2. Solicitar acessos (preencher pendencias-acessos.md)
   3. Agendar reunião de kickoff
   4. Iniciar diagnóstico completo: /diagnostico-completo

💡 Para diagnóstico completo: /diagnostico-completo
💡 Para apresentação: /gerar-apresentacao
```

---

## REGRAS IMPORTANTES

- **Nunca** deixe o cliente sem entrar no Supabase sem avisar o usuário
- **Sempre** valide campos obrigatórios antes de criar estrutura
- **Sempre** gere o slug automaticamente: minúsculas, sem acentos, hífens
- **Sempre** atualize o `comercial/pipeline.md` ao fechar
- Se o cliente já tiver pasta em `clientes/`, pergunte se deve sobrescrever ou criar nova
- O `id_cliente` é único — baseado em timestamp YYYYMMDDHHMMSS
- Data no formato YYYY-MM-DD para Supabase, DD/MM/YYYY para documentos locais
- O status inicial no dashboard é sempre **"Onboarding"**
- O progresso inicial é sempre **0**
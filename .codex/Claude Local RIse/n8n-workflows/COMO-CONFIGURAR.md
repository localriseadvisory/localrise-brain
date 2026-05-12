# Como configurar os workflows N8N — LocalRise

## Passo 1 — Importar os workflows

No N8N: **Workflows → Import from file** → importe os 3 arquivos JSON.

---

## Passo 2 — Criar credenciais no N8N

### Supabase Service Key
- Tipo: **Header Auth**
- Name: `Supabase Service Key`
- Header Name: `apikey`
- Header Value: sua **service_role key** do Supabase
  - (Supabase → Project Settings → API → service_role)

### Google OAuth2
- Tipo: **Google API (OAuth2)**
- Name: `Google OAuth2`
- Scopes necessários:
  - `https://www.googleapis.com/auth/analytics.readonly`
  - `https://www.googleapis.com/auth/adwords`

---

## Passo 3 — Preencher a tabela client_integrations no Supabase

Para cada cliente, inserir na tabela `client_integrations`:

| Campo | Onde encontrar |
|---|---|
| `client_id` | Tabela `clients` no Supabase |
| `ga4_property_id` | Google Analytics → Admin → Property → Property ID |
| `google_ads_customer_id` | Google Ads → conta → ID no topo (sem hífens, ex: `1234567890`) |
| `instagram_user_id` | Meta for Developers → seu app → Instagram User ID |
| `instagram_access_token` | Meta for Developers → token de longa duração da conta business |

**SQL para inserir:**
```sql
INSERT INTO client_integrations (client_id, ga4_property_id, google_ads_customer_id, instagram_user_id, instagram_access_token)
VALUES (
  'uuid-do-cliente-aqui',
  '123456789',        -- GA4 Property ID
  '9876543210',       -- Google Ads Customer ID
  '17841400000000',   -- Instagram User ID
  'EAAxxxxxxxx'       -- Instagram Access Token
);
```

---

## Passo 4 — Workflow Google Ads (extra)

No arquivo `2-google-ads-to-supabase.json`, substitua:
```
SEU_DEVELOPER_TOKEN_AQUI
```
pelo seu **Google Ads Developer Token**
(Google Ads → Ferramentas → API Center → Developer Token)

---

## Passo 5 — Ativar os workflows

Cada workflow roda automaticamente no **dia 1 de cada mês às 9h**, puxando dados do mês anterior.

Para testar manualmente: clique em **Execute Workflow** em qualquer workflow.

---

## Campos automáticos vs manuais

| Campo | Automático | Manual |
|---|---|---|
| **Site**: sessões, usuários, pageviews, rejeição, duração | ✅ GA4 | — |
| **Site**: cliques orgânicos, impressões, posição SEO | — | ✅ Google Search Console |
| **Ads**: impressões, cliques, CTR, CPC, investimento, conversões, CPA | ✅ Google Ads | — |
| **Instagram**: seguidores, posts, alcance, impressões, visitas | ✅ Graph API | — |
| **Instagram**: curtidas, comentários, salvamentos, engajamento | — | ✅ Manual |
| **GBP**: todas as métricas | — | ✅ Manual (API restrita) |

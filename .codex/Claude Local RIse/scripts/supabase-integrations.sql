-- ============================================================
-- LocalRise Advisory — Tabela de Integrações por Cliente
-- Execute este SQL no Supabase: SQL Editor → New Query
-- ============================================================

-- Tabela que guarda as credenciais de API de cada cliente
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  -- Google Analytics 4
  ga4_property_id           TEXT,            -- Ex: 123456789
  ga4_access_token          TEXT,            -- Token OAuth2 gerado pelo Google

  -- Google Ads
  google_ads_customer_id    TEXT,            -- Ex: 1234567890 (sem hífens)
  google_ads_developer_token TEXT,           -- Token de desenvolvedor do Google Ads
  google_ads_refresh_token  TEXT,            -- Refresh token OAuth2

  -- Instagram
  instagram_user_id         TEXT,            -- Ex: 17841400000000
  instagram_access_token    TEXT,            -- Token de longa duração (60 dias)

  -- Controle
  ultima_sincronizacao      TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),

  UNIQUE(client_id)
);

-- RLS: apenas admins acessam
ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem tudo em client_integrations" ON public.client_integrations;

CREATE POLICY "Admins podem tudo em client_integrations"
ON public.client_integrations
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
  (auth.jwt()->> 'user_metadata')::jsonb->>'role' = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
  (auth.jwt()->> 'user_metadata')::jsonb->>'role' = 'admin'
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.client_integrations;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.client_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMO OBTER CADA CREDENCIAL
-- ============================================================
--
-- GA4 Property ID:
--   Google Analytics → Admin → Property Settings → Property ID
--
-- GA4 Access Token (via OAuth Playground):
--   1. Acesse: https://developers.google.com/oauthplayground
--   2. Clique na engrenagem → marque "Use your own OAuth credentials"
--   3. Scope: https://www.googleapis.com/auth/analytics.readonly
--   4. Authorize → Exchange code for tokens → copie o access_token
--   ATENÇÃO: expira em 1h. Para renovação automática use refresh_token.
--
-- Instagram User ID + Access Token:
--   1. Acesse: https://developers.facebook.com/tools/explorer
--   2. Selecione seu app e gere um User Token com permissões:
--      instagram_basic, instagram_manage_insights, pages_show_list
--   3. Para obter User ID: GET /me?fields=id,name
--   4. Para token de longa duração (60 dias):
--      GET /oauth/access_token?grant_type=fb_exchange_token&...
--
-- Google Ads Customer ID:
--   Google Ads → ícone de engrenagem → ID da conta (ex: 123-456-7890)
--   Remova os hífens: 1234567890
-- ============================================================

-- ============================================================
-- LocalRise Advisory — Referência do Schema Real do Dashboard
-- Versão: 2.0 | Data: 2026-04-04
--
-- ATENÇÃO: Este arquivo é REFERÊNCIA do schema já existente.
-- O dashboard em localriseadvisory.com já usa estas tabelas.
-- NÃO execute o CREATE TABLE se as tabelas já existirem.
--
-- O que este arquivo contém:
-- 1. LIMPEZA — Remove tabelas redundantes criadas por engano
-- 2. REFERÊNCIA — Schema real das tabelas do dashboard
-- ============================================================

-- ============================================================
-- PARTE 1: LIMPEZA (execute apenas uma vez)
-- Remove as tabelas redundantes que não são lidas pelo dashboard
-- ============================================================

DROP TABLE IF EXISTS public.clientes_historico;
DROP TABLE IF EXISTS public.clientes;

-- ============================================================
-- PARTE 2: REFERÊNCIA — Schema real da tabela principal
-- (tabela já existe no Supabase — apenas para documentação)
-- ============================================================

-- Tabela: public.clients
-- Usada pelo dashboard em localriseadvisory.com
-- RLS habilitado

/*
CREATE TABLE public.clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,           -- Nome da empresa/negócio
  nicho             TEXT,                    -- Segmento (ex: Restaurante, Clínica)
  cidade            TEXT,                    -- Cidade de operação
  phone             TEXT,                    -- WhatsApp com DDD
  site              TEXT,                    -- URL do site
  instagram         TEXT,                    -- @handle ou URL
  logo_url          TEXT,                    -- URL da logo (opcional)
  status            TEXT DEFAULT 'ativo'
                    CHECK (status IN ('ativo', 'pausado', 'cancelado')),
  plano             TEXT DEFAULT 'essencial'
                    CHECK (plano IN ('essencial', 'profissional', 'elite')),
  valor_mensalidade NUMERIC,                 -- Valor em R$
  data_inicio       DATE DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
*/

-- ============================================================
-- MAPEAMENTO: Dados do Lead → Tabela clients
-- ============================================================

-- leads.csv campo       →  clients campo
-- ─────────────────────────────────────────
-- Empresa               →  name
-- Nicho                 →  nicho
-- Cidade                →  cidade
-- WhatsApp              →  phone
-- Site                  →  site
-- Instagram             →  instagram
-- (sem logo no lead)    →  logo_url = NULL
-- (sempre ativo)        →  status = 'ativo'
-- Plano contratado      →  plano (ver mapeamento abaixo)
-- Valor do contrato     →  valor_mensalidade
-- Data início           →  data_inicio

-- ============================================================
-- MAPEAMENTO DE PLANOS
-- ============================================================

-- Plano do cliente       →  Valor no banco
-- ─────────────────────────────────────────
-- Starter / Essencial    →  'essencial'
-- Growth / Profissional  →  'profissional'
-- Premium / Elite        →  'elite'
-- (padrão se não definido) → 'essencial'

-- ============================================================
-- INSERT MODELO — usado pelo comando /fechar-cliente
-- ============================================================

/*
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
*/

-- ============================================================
-- VERIFICAÇÃO — confirma tabelas existentes
-- ============================================================

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
#!/usr/bin/env bash
# =============================================================================
# LocalRise Advisory — Script de Onboarding de Novo Cliente
# Uso: ./scripts/novo-cliente.sh
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENTES_DIR="$ROOT_DIR/clientes"
CRM_FILE="$CLIENTES_DIR/CRM-MASTER.csv"
TEMPLATES_DIR="$ROOT_DIR/scripts/templates"
DATA_HOJE=$(date +"%Y-%m-%d")
ID=$(date +"%Y%m%d%H%M%S")

# ── Cores ────────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║      LocalRise Advisory — Onboarding de Cliente     ║"
echo "╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Coleta de dados ───────────────────────────────────────────────────────────
read -rp "$(echo -e "${YELLOW}Nome do responsável/contato:${NC} ")" CLIENTE
read -rp "$(echo -e "${YELLOW}Nome da empresa:${NC} ")" EMPRESA
read -rp "$(echo -e "${YELLOW}Nicho/segmento:${NC} ")" NICHO
read -rp "$(echo -e "${YELLOW}Cidade:${NC} ")" CIDADE
read -rp "$(echo -e "${YELLOW}Telefone:${NC} ")" TELEFONE
read -rp "$(echo -e "${YELLOW}Site (URL ou 'sem site'):${NC} ")" SITE
read -rp "$(echo -e "${YELLOW}Instagram (@perfil ou URL):${NC} ")" INSTAGRAM
read -rp "$(echo -e "${YELLOW}Google Business Profile (URL ou nome exato):${NC} ")" GBP
read -rp "$(echo -e "${YELLOW}Serviço contratado / interesse principal:${NC} ")" SERVICO
read -rp "$(echo -e "${YELLOW}Objetivo principal do cliente:${NC} ")" OBJETIVO
read -rp "$(echo -e "${YELLOW}Observações adicionais:${NC} ")" OBSERVACOES
read -rp "$(echo -e "${YELLOW}Responsável LocalRise:${NC} ")" RESPONSAVEL

# ── Slug do cliente ───────────────────────────────────────────────────────────
SLUG=$(echo "$EMPRESA" | tr '[:upper:]' '[:lower:]' | \
       iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || \
       echo "$EMPRESA" | tr '[:upper:]' '[:lower:]')
SLUG=$(echo "$SLUG" | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
PASTA="$CLIENTES_DIR/$SLUG"

echo ""
echo -e "${CYAN}Criando estrutura para: ${GREEN}$EMPRESA${NC} → clientes/$SLUG"
echo ""

# ── Criar estrutura de pastas ─────────────────────────────────────────────────
mkdir -p "$PASTA"/{inputs,analises,estrategia,entregas,historico}

# ── Substituir variáveis nos templates ───────────────────────────────────────
replace_vars() {
  local file="$1"
  sed -i \
    -e "s|{{ID}}|$ID|g" \
    -e "s|{{CLIENTE}}|$CLIENTE|g" \
    -e "s|{{EMPRESA}}|$EMPRESA|g" \
    -e "s|{{NICHO}}|$NICHO|g" \
    -e "s|{{CIDADE}}|$CIDADE|g" \
    -e "s|{{TELEFONE}}|$TELEFONE|g" \
    -e "s|{{SITE}}|$SITE|g" \
    -e "s|{{INSTAGRAM}}|$INSTAGRAM|g" \
    -e "s|{{GBP}}|$GBP|g" \
    -e "s|{{SERVICO}}|$SERVICO|g" \
    -e "s|{{OBJETIVO}}|$OBJETIVO|g" \
    -e "s|{{OBSERVACOES}}|$OBSERVACOES|g" \
    -e "s|{{RESPONSAVEL}}|$RESPONSAVEL|g" \
    -e "s|{{DATA}}|$DATA_HOJE|g" \
    -e "s|{{SLUG}}|$SLUG|g" \
    "$file"
}

# ── Copiar e preencher templates ──────────────────────────────────────────────
for TPL in perfil-cliente diagnostico-inicial checklist-onboarding estrategia-inicial pendencias-acessos; do
  DEST="$PASTA/$TPL.md"
  cp "$TEMPLATES_DIR/$TPL.md" "$DEST"
  replace_vars "$DEST"
  echo -e "  ${GREEN}✓${NC} $TPL.md"
done

# ── Registrar no CRM ──────────────────────────────────────────────────────────
PASTA_RELATIVA="clientes/$SLUG"
echo "$ID,\"$CLIENTE\",\"$EMPRESA\",\"$NICHO\",\"$CIDADE\",\"$TELEFONE\",\"$SITE\",\"$INSTAGRAM\",\"$GBP\",\"$SERVICO\",Ativo,$DATA_HOJE,\"$RESPONSAVEL\",\"$PASTA_RELATIVA\",,,,,\"$OBSERVACOES\"" \
  >> "$CRM_FILE"
echo -e "  ${GREEN}✓${NC} CRM-MASTER.csv atualizado"

# ── Resumo final ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Cliente criado com sucesso!${NC}"
echo ""
echo -e "  Pasta   : ${CYAN}clientes/$SLUG/${NC}"
echo -e "  Perfil  : ${CYAN}clientes/$SLUG/perfil-cliente.md${NC}"
echo -e "  CRM     : ${CYAN}clientes/CRM-MASTER.csv${NC}"
echo ""
echo -e "${YELLOW}Próximos passos no Claude Code:${NC}"
echo -e "  1. Abra o Claude Code neste diretório"
echo -e "  2. Execute: /diagnostico-completo"
echo -e "  3. Forneça os dados de: Site=$SITE | Instagram=$INSTAGRAM | GBP=$GBP"
echo -e "  4. Salve o resultado em: clientes/$SLUG/analises/"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo ""

#!/usr/bin/env bash
# =============================================================================
# processar-lead.sh — LocalRise Advisory
# Uso: ./processar-lead.sh [ID_DO_LEAD ou "novo"]
# =============================================================================

set -euo pipefail

COMERCIAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LEADS_CSV="$COMERCIAL_DIR/leads.csv"
ANALISES_DIR="$COMERCIAL_DIR/leads/analises"
MENSAGENS_DIR="$COMERCIAL_DIR/leads/mensagens"
HISTORICO_DIR="$COMERCIAL_DIR/leads/historico"

# Cores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  LocalRise — Processador de Leads${NC}"
echo -e "${BLUE}========================================${NC}"

# Gera próximo ID disponível
gerar_id() {
  if [ ! -f "$LEADS_CSV" ]; then echo "001"; return; fi
  local ultimo
  ultimo=$(tail -n +2 "$LEADS_CSV" | cut -d',' -f1 | sort -n | tail -1)
  printf "%03d" $((10#${ultimo:-0} + 1))
}

# Modo interativo — coleta dados do lead
coletar_dados_lead() {
  echo -e "\n${YELLOW}>> CADASTRO DE NOVO LEAD${NC}\n"

  read -rp "Nome do responsável: " NOME
  read -rp "Nome da empresa/negócio: " EMPRESA
  read -rp "Nicho/segmento: " NICHO
  read -rp "Cidade: " CIDADE
  read -rp "WhatsApp (com DDD): " WHATSAPP
  read -rp "Instagram (@handle): " INSTAGRAM
  read -rp "Site (ou deixe vazio): " SITE
  read -rp "Origem do lead (Instagram/Indicação/Google/Evento/Outro): " ORIGEM
  read -rp "Principal interesse (SEO/GBP/Site/Marketing/Tudo): " INTERESSE
  read -rp "Dor principal declarada: " DOR
  read -rp "Observações iniciais: " OBS
}

# Calcula score automático baseado nos dados
calcular_score() {
  local score=50

  # Tem site? +10 se sim (mais estruturado), -10 se não (oportunidade urgente vale mais?)
  [ -n "$SITE" ] && score=$((score + 5)) || score=$((score + 15))

  # Tem Instagram? +10
  [ -n "$INSTAGRAM" ] && score=$((score + 10))

  # Origem (indicação vale mais)
  case "$ORIGEM" in
    Indica*|indica*) score=$((score + 20)) ;;
    Google|google) score=$((score + 15)) ;;
    Instagram|instagram) score=$((score + 10)) ;;
  esac

  # Interesse em tudo = mais urgente
  case "$INTERESSE" in
    Tudo|tudo|*+*) score=$((score + 15)) ;;
    SEO*|GBP*) score=$((score + 10)) ;;
  esac

  # Score máximo 100
  [ $score -gt 100 ] && score=100
  echo $score
}

# Define prioridade com base no score
definir_prioridade() {
  local s=$1
  if [ "$s" -ge 80 ]; then echo "ALTA"
  elif [ "$s" -ge 60 ]; then echo "MEDIA"
  else echo "BAIXA"
  fi
}

# Adiciona linha no CSV
registrar_no_csv() {
  local id="$1"; local score="$2"; local prioridade="$3"
  local data hoje
  hoje=$(date +%Y-%m-%d)
  echo "\"$id\",\"$NOME\",\"$EMPRESA\",\"$NICHO\",\"$CIDADE\",\"$WHATSAPP\",\"$INSTAGRAM\",\"$SITE\",\"$ORIGEM\",\"$INTERESSE\",\"$DOR\",\"$score\",\"$prioridade\",\"Novo Lead\",\"$hoje\",\"Lead registrado\",\"Enviar diagnóstico gratuito\",\"$(date -d '+1 day' +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)\",\"Time Comercial\",\"\",\"\",\"$OBS\"" >> "$LEADS_CSV"
}

# Cria arquivo de análise do lead
gerar_analise() {
  local id="$1"; local score="$2"; local prioridade="$3"
  local slug
  slug=$(echo "$EMPRESA" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '[:punct:]' | head -c 30)
  local arquivo="$ANALISES_DIR/analise-lead-${slug}-${id}.md"

  cat > "$arquivo" << EOF
---
id: $id
empresa: $EMPRESA
responsavel: $NOME
data: $(date +%Y-%m-%d)
score: $score
prioridade: $prioridade
status: Novo Lead
---

# Análise Estratégica — $EMPRESA

## Dados do Lead
| Campo | Valor |
|-------|-------|
| Nome | $NOME |
| Empresa | $EMPRESA |
| Nicho | $NICHO |
| Cidade | $CIDADE |
| WhatsApp | $WHATSAPP |
| Instagram | $INSTAGRAM |
| Site | ${SITE:-"Sem site"} |
| Origem | $ORIGEM |
| Interesse | $INTERESSE |

## Dor Principal
> $DOR

## Score e Prioridade
- **Score:** $score / 100
- **Prioridade:** $prioridade
- **Status:** Novo Lead

## Diagnóstico Rápido
$([ -z "$SITE" ] && echo "- SEM SITE — oportunidade direta de venda de criação/redesign" || echo "- Tem site — analisar SEO, velocidade e conversão")
$([ -n "$INSTAGRAM" ] && echo "- Tem Instagram — auditoria de perfil recomendada" || echo "- SEM Instagram — oportunidade de presença social")
- Nicho **$NICHO** em **$CIDADE** — verificar concorrência local no Google Maps
- Origem por **$ORIGEM** — $([ "$ORIGEM" = "Indicação" ] || [ "$ORIGEM" = "Indicacao" ] && echo "lead quente, priorizar contato" || echo "nutrir com diagnóstico gratuito")

## Serviços Recomendados
$([ -z "$SITE" ] && echo "1. Criação de Site Profissional (urgente)")
$([ -n "$INSTAGRAM" ] && echo "2. Otimização de Instagram + Conteúdo")
- Google Business Profile completo e otimizado
- SEO Local para $NICHO em $CIDADE
- Estratégia de presença digital completa

## Próximos Passos
- [ ] Rodar diagnóstico completo (agent-diagnostico-master)
- [ ] Enviar mensagem de abordagem
- [ ] Agendar apresentação de diagnóstico
- [ ] Enviar proposta personalizada

## Observações
$OBS
EOF

  echo -e "${GREEN}✔ Análise gerada:${NC} $arquivo"
  echo "$arquivo"
}

# Gera mensagem de abordagem
gerar_abordagem() {
  local id="$1"; local arquivo_analise="$2"
  local slug
  slug=$(echo "$EMPRESA" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '[:punct:]' | head -c 30)
  local arquivo="$MENSAGENS_DIR/abordagem-lead-${slug}-${id}.md"

  cat > "$arquivo" << EOF
---
id: $id
empresa: $EMPRESA
tipo: abordagem
canal: WhatsApp
data: $(date +%Y-%m-%d)
---

# Mensagem de Abordagem — $EMPRESA

## Versão WhatsApp (curta e direta)

\`\`\`
Oi $NOME, tudo bem?

Vi o $EMPRESA aqui na internet e notei algumas oportunidades que poderiam trazer mais clientes para vocês.

Faço uma análise gratuita da presença digital do negócio — Google, Instagram e site — e te mostro exatamente o que está travando o crescimento.

Posso te enviar o diagnóstico hoje?
\`\`\`

---

## Versão Elaborada (para DM Instagram ou e-mail)

\`\`\`
Olá $NOME!

Me chamo [SEU NOME], sou da LocalRise Advisory — ajudamos negócios como o $EMPRESA a aparecerem mais no Google e atrair mais clientes locais.

Analisei brevemente a presença digital de vocês e identifiquei pontos que, se corrigidos, podem gerar um aumento real de clientes nos próximos 30 a 90 dias.

Faço uma análise gratuita e detalhada — sem compromisso — e te mostro exatamente o que está acontecendo e o que pode ser feito.

Posso te enviar o diagnóstico completo? Leva menos de 5 minutos para você ver os resultados.
\`\`\`

---

## Gatilhos Identificados para Personalização
- **Dor declarada:** $DOR
- **Nicho:** $NICHO em $CIDADE
$([ -z "$SITE" ] && echo "- **Sem site:** mencionar perda de clientes que buscam no Google")
$([ -n "$INSTAGRAM" ] && echo "- **Instagram ativo:** referenciar perfil para criar rapport")

## Status
- [ ] Mensagem enviada
- [ ] Resposta recebida
- [ ] Diagnóstico agendado
EOF

  echo -e "${GREEN}✔ Abordagem gerada:${NC} $arquivo"
}

# Gera mensagem de follow-up
gerar_followup() {
  local id="$1"
  local slug
  slug=$(echo "$EMPRESA" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '[:punct:]' | head -c 30)
  local arquivo="$MENSAGENS_DIR/followup-lead-${slug}-${id}.md"

  cat > "$arquivo" << EOF
---
id: $id
empresa: $EMPRESA
tipo: follow-up
data: $(date +%Y-%m-%d)
---

# Mensagens de Follow-up — $EMPRESA

## Follow-up 1 (D+2 sem resposta)
\`\`\`
Oi $NOME! Só passando para saber se recebeu minha mensagem.

Tenho o diagnóstico do $EMPRESA pronto — identifiquei pontos importantes sobre a presença de vocês no Google.

Vale 5 minutos do seu tempo. Posso enviar?
\`\`\`

---

## Follow-up 2 (D+5 sem resposta)
\`\`\`
$NOME, sei que a rotina é corrida.

Só quero deixar registrado: encontrei pelo menos 3 problemas na presença digital do $EMPRESA que estão fazendo vocês perderem clientes hoje.

Se tiver interesse em resolver isso, é só me falar. Diagnóstico gratuito, sem enrolação.
\`\`\`

---

## Follow-up 3 (D+10 — último contato)
\`\`\`
Oi $NOME! Última mensagem da minha parte.

Fica à vontade para me chamar quando quiser analisar a presença digital do $EMPRESA no Google e Instagram.

O diagnóstico continua gratuito. Qualquer momento que fizer sentido, estou por aqui.

Abraço!
\`\`\`

---

## Follow-up pós-proposta enviada
\`\`\`
Oi $NOME! Enviamos a proposta há alguns dias.

Ficou alguma dúvida? Posso ajustar algum ponto ou explicar melhor como funciona.

O que acha de uma conversa rápida de 15 minutos para alinhar os detalhes?
\`\`\`
EOF

  echo -e "${GREEN}✔ Follow-ups gerados:${NC} $arquivo"
}

# Cria registro de histórico do lead
gerar_historico() {
  local id="$1"
  local slug
  slug=$(echo "$EMPRESA" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '[:punct:]' | head -c 30)
  local arquivo="$HISTORICO_DIR/historico-lead-${slug}-${id}.md"

  cat > "$arquivo" << EOF
---
id: $id
empresa: $EMPRESA
data_entrada: $(date +%Y-%m-%d)
---

# Histórico — $EMPRESA (ID: $id)

| Data | Ação | Responsável | Resultado |
|------|------|-------------|-----------|
| $(date +%Y-%m-%d) | Lead registrado no sistema | Sistema | Score: $SCORE_CALCULADO — Prioridade: $PRIORIDADE_CALCULADA |

## Log de Interações
<!-- Adicione cada interação abaixo no formato: DATA | CANAL | RESUMO -->

EOF

  echo -e "${GREEN}✔ Histórico criado:${NC} $arquivo"
}

# ============= EXECUÇÃO PRINCIPAL =============

ID=$(gerar_id)
coletar_dados_lead

SCORE_CALCULADO=$(calcular_score)
PRIORIDADE_CALCULADA=$(definir_prioridade "$SCORE_CALCULADO")

echo -e "\n${YELLOW}>> RESULTADO DA CLASSIFICAÇÃO${NC}"
echo -e "   Score:      ${GREEN}$SCORE_CALCULADO / 100${NC}"
echo -e "   Prioridade: ${GREEN}$PRIORIDADE_CALCULADA${NC}"
echo -e "   ID:         ${GREEN}$ID${NC}\n"

registrar_no_csv "$ID" "$SCORE_CALCULADO" "$PRIORIDADE_CALCULADA"
ARQUIVO_ANALISE=$(gerar_analise "$ID" "$SCORE_CALCULADO" "$PRIORIDADE_CALCULADA")
gerar_abordagem "$ID" "$ARQUIVO_ANALISE"
gerar_followup "$ID"
gerar_historico "$ID"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Lead $ID registrado com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nPróximo passo sugerido:"
echo -e "  → Rode o diagnóstico completo no Claude Code:"
echo -e "  ${YELLOW}/diagnostico-completo${NC} para $EMPRESA"
echo ""

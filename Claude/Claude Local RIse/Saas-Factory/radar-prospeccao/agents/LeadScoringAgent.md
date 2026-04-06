# LeadScoringAgent
> Agente de pontuação de oportunidade comercial

## Função
Calcula o score de oportunidade (0-100) de cada lead com base nos dados enriquecidos.

## Lógica de pontuação

| Critério | Pontos |
|---|---|
| Não tem site | +25 |
| Site ruim (mobile ruim, sem SEO, lento) | +15 |
| GBP inexistente | +25 |
| GBP mal otimizado (poucas fotos, sem posts, nota < 4) | +15 |
| Instagram fraco ou inativo (< 1 post/semana) | +10 |
| Menos de 50 avaliações no Google | +10 |
| Nota Google abaixo de 4.0 | +5 |
| Instagram inexistente | +10 |

## Classificação

| Score | Classificação | Estratégia |
|---|---|---|
| 80–100 | 🔥 Lead Quente | Contato imediato, proposta completa |
| 50–79 | ⚡ Lead Médio | Abordagem consultiva, diagnóstico grátis |
| 0–49 | ❄️ Lead Frio | Monitorar, abordar em 60-90 dias |

## Tags automáticas

- `precisa-de-site` → score_site < 30 ou sem site
- `precisa-de-gbp` → GBP inexistente ou score_gbp < 40
- `precisa-de-seo` → site existe mas sem SEO básico
- `precisa-de-instagram` → sem Instagram ou engajamento < 1%
- `gestao-completa` → 3 ou mais tags ativas

## Output
Adiciona `score`, `classificacao`, `tags` e `servicos_recomendados` a cada lead.

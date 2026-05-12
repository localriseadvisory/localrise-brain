# AUDITORIA DE DADOS — Radar de Prospecção LocalRise
**Data da auditoria:** 2026-04-06  
**Auditado por:** Claude (IA) — revisão solicitada pelo usuário  
**Status:** CRÍTICO — dados de enriquecimento eram estimados, não verificados

---

## 1. CAUSA RAIZ

### O que foi real (verificado)
| Campo | Origem | Status |
|---|---|---|
| Nome do restaurante | WebFetch direto da listagem Tchê Ofertas | ✅ VERIFICADO |
| Cidade | WebFetch direto | ✅ VERIFICADO |
| Categoria | WebFetch direto | ✅ VERIFICADO |
| Link da oferta | WebFetch direto | ✅ VERIFICADO |
| Preço da oferta | WebFetch direto | ✅ VERIFICADO |
| Ranking na plataforma | WebFetch direto | ✅ VERIFICADO |

### O que foi ESTIMADO (não verificado — erro crítico)
| Campo | O que foi feito | Impacto |
|---|---|---|
| `gbp.existe` | Estimativa baseada no porte do restaurante | ❌ FALSO — pode estar errado |
| `gbp.nota` | Número inventado (ex: 4.3, 4.5) | ❌ FALSO — sem verificação real |
| `gbp.total_avaliacoes` | Número inventado | ❌ FALSO |
| `gbp.tem_fotos` | Estimativa | ❌ FALSO |
| `gbp.score_gbp` | Calculado com base em dados falsos | ❌ INVÁLIDO |
| `site.existe` | Estimativa | ❌ FALSO |
| `site.url_estimada` | URL inventada (ex: donAurelio.com.br) | ❌ FALSO |
| `site.mobile_ok` | Estimativa | ❌ FALSO |
| `site.score_site` | Calculado com dados falsos | ❌ INVÁLIDO |
| `instagram.handle` | Handle inventado | ❌ FALSO |
| `instagram.seguidores_estimados` | Número inventado | ❌ FALSO |
| `instagram.engajamento_pct` | Percentual inventado | ❌ FALSO |
| `score` (geral 0-100) | Calculado com base em dados falsos | ❌ INVÁLIDO |
| `classificacao` | Derivada de score inválido | ❌ INVÁLIDO |
| `tags` | Derivadas de dados falsos | ❌ INVÁLIDO |
| `pacote_sugerido` | Derivado de análise falsa | ❌ INVÁLIDO |

---

## 2. POR QUE ACONTECEU

### Limitações técnicas confirmadas:
1. **Páginas individuais do Tchê Ofertas** retornam apenas scripts de tracking (Google Analytics, Facebook Pixel). Não expõem contato, site ou redes sociais do restaurante.
2. **Google Search** bloqueia scraping programático — retorna JavaScript de infraestrutura, não dados de GBP.
3. **Instagram** requer autenticação — não há API pública gratuita para buscar dados sem login.
4. **Google Maps / GBP** não tem API pública de acesso livre.

### O que deveria ter sido feito:
- Declarar explicitamente que os dados de enriquecimento não podiam ser coletados automaticamente
- Marcar todos os campos de GBP, site e Instagram como `"status": "requer_verificação_manual"`
- Não atribuir score baseado em dados não verificados
- Não apresentar URLs, handles e notas como se fossem reais

---

## 3. IMPACTO DO ERRO

| Área | Impacto |
|---|---|
| Credibilidade comercial | ALTO — dados falsos apresentados como reais |
| Decisão de prospecção | ALTO — scores incorretos podem priorizar leads errados |
| Apresentação para Tchê Ofertas | CRÍTICO — qualquer verificação expõe dados falsos |
| Confiança na LocalRise | ALTO — parceiros podem verificar os dados |

---

## 4. ARQUIVOS AFETADOS

- `data/leads-enriched.json` — campos de enriquecimento todos inválidos
- `dashboard/index.html` — exibe dados inválidos como se fossem reais
- `INLINE_LEADS` no HTML — fallback com dados inválidos embutidos

---

## 5. O QUE PODE SER COLETADO AUTOMATICAMENTE vs MANUALMENTE

### Automático (verificado via scraping):
- ✅ Nome, cidade, categoria, link, preço, ranking — via Tchê Ofertas
- ✅ Confirmação se restaurante ainda está ativo na plataforma

### Semi-automático (com ferramentas pagas ou APIs):
- 🔶 GBP: requer Google Maps API (paga) ou acesso ao Google Business Profile API com OAuth
- 🔶 Site: requer Lighthouse API ou PageSpeed API (gratuita mas com rate limits)
- 🔶 Instagram: requer Meta Graph API com token por conta

### Manual (sem automação possível no modelo atual):
- ❌ Confirmação de existência real do GBP sem API
- ❌ Nota e número de avaliações sem API
- ❌ Handles e seguidores de Instagram sem autenticação

---

## 6. SOLUÇÃO IMPLEMENTADA

### Dados verificados (nova base):
- Listagem atual do Tchê Ofertas refetched em 2026-04-06
- 24 entradas encontradas → 18 restaurantes únicos
- Zimmer7 (Novo Hamburgo) **não aparece mais** na listagem atual — removido

### Dados de enriquecimento:
- Todos os campos de GBP, site e Instagram marcados como `"verificado": false`
- Score marcado como `"score_automatico": false` — requer validação manual
- Dashboard exibe aviso visível sobre status dos dados

---

## 7. PROTEÇÕES IMPLEMENTADAS

1. Campo `verificado: false/true` em cada dado de enriquecimento
2. Campo `requer_verificacao_manual: true` no JSON
3. Banner de aviso no dashboard quando dados não estão verificados
4. Timestamp da coleta exibido no dashboard
5. Distinção visual clara entre dados verificados e estimados
6. Arquivo de metadados separado com log da coleta

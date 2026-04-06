# LeadScraperAgent
> Agente de coleta de leads do Tchê Ofertas

## Função
Navega na página de gastronomia do Tchê Ofertas e extrai dados brutos de cada estabelecimento.

## Fonte
- URL: https://www.tcheofertas.com.br/ofertas/gastronomia
- Páginas internas: /oferta/gastronomia-*/[cidade]/[slug]/

## Campos extraídos
- nome
- cidade
- categoria (pizza, churrasco, buffet, etc.)
- link_oferta
- preco_promocao
- ranking_categoria (se disponível)

## Como executar
```bash
# Com Node.js + Puppeteer instalado:
cd "Claude Local RIse"
node scripts/scraper-google-maps.js

# Ou manualmente: abra o Claude Code e rode:
/diagnostico-completo [nome do restaurante] [cidade]
```

## Output
- `data/leads-raw.json` — dados brutos coletados
- `data/leads-enriched.json` — após passar pelo LeadEnrichmentAgent

## Limitações conhecidas
- Páginas individuais do Tchê Ofertas só expõem tracking scripts, sem contato/site/social
- Enriquecimento deve ser feito via Google Search + pesquisa manual

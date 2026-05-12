# LeadEnrichmentAgent
> Agente de enriquecimento de dados dos leads

## Função
Para cada lead do `leads-raw.json`, pesquisa e preenche:
- Presença no Google Business Profile
- Qualidade do site
- Presença e atividade no Instagram

## Processo de enriquecimento

### 1. Google Business Profile
Pesquisa: "[nome do restaurante] [cidade]" no Google
- Existe GBP? (aparece painel lateral no Google)
- Nota (0-5)
- Número de avaliações
- Tem fotos?
- Está respondendo avaliações?
- Tem posts recentes?

### 2. Website
- Tem domínio próprio?
- Site carrega no mobile?
- Tem título SEO configurado?
- Tem meta descrição?
- Design moderno?

### 3. Instagram
Pesquisa: "[nome]" no Instagram
- Perfil existe?
- Verificado?
- Seguidores
- Posts por semana (estimado)
- Taxa de engajamento (curtidas/seguidores)
- Identidade visual consistente?

## Como executar no Claude Code
```
/diagnostico-completo [nome] [cidade] [site se disponível] [instagram se disponível]
```

## Output
Preenche os campos `gbp`, `site`, `instagram` em cada lead do JSON.

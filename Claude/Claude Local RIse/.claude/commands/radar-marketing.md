---
name: radar-marketing
description: Executa o Radar de Marketing diário da LocalRise. Pesquisa tendências, campanhas virais, notícias e acontecimentos do marketing, filtra o que é relevante para negócios locais e gera 4 arquivos organizados para o designer produzir conteúdo.
---

Execute o Radar de Marketing diário da LocalRise Advisory.

## O QUE FAZER

Você é o sistema de inteligência de conteúdo da LocalRise. Sua missão é encontrar o que está em alta no marketing hoje, filtrar o que tem potencial para negócios locais, e transformar tudo isso em material de produção pronto para o designer.

## FASE 1 — PESQUISA (use WebSearch para cada busca)

Execute essas buscas agora:

1. `tendências marketing digital $CURRENT_MONTH $CURRENT_YEAR`
2. `campanhas marketing viral $CURRENT_MONTH $CURRENT_YEAR`
3. `melhores campanhas publicidade $CURRENT_YEAR destaque`
4. `Instagram TikTok tendência conteúdo $CURRENT_MONTH $CURRENT_YEAR`
5. `marketing negócios locais estratégia $CURRENT_YEAR`
6. `Google Business Profile atualização $CURRENT_YEAR`
7. `branding case sucesso $CURRENT_MONTH $CURRENT_YEAR`
8. `datas comemorativas marketing oportunidade próximo mês`
9. `inteligência artificial marketing conteúdo $CURRENT_YEAR`
10. `viral marketing campaign trending $CURRENT_MONTH $CURRENT_YEAR`

Para cada busca: registre o que encontrou, por que é relevante, nível de aplicação para negócios locais (alto/médio/baixo).

## FASE 2 — FILTRO

Selecione os **5 a 8 melhores achados** com base em:
- Relevância para negócios locais
- Potencial de conteúdo acionável
- Timing (atual e relevante para a semana/mês)
- Originalidade do ângulo
- Impacto no comportamento do consumidor

## FASE 3 — GERAÇÃO DOS 4 ARQUIVOS

Use a data atual do sistema para nomear os arquivos.

### ARQUIVO 1 — Radar Diário
Caminho: `conteudo/radar-marketing/diario/radar-marketing-[DATA].md`

Estrutura obrigatória:
- Resumo executivo (3-5 linhas com tema dominante e oportunidade principal)
- Para cada achado: O que aconteceu / Por que chamou atenção / Por que importa / Leitura estratégica / O que negócios locais podem aprender
- Radar de datas e sazonalidade (próximos 30 dias)
- Tendências de formato em alta
- Gap de conteúdo (onde a LocalRise pode se diferenciar)

### ARQUIVO 2 — Ideias de Carrosséis
Caminho: `conteudo/radar-marketing/carrosseis/ideias-carrosseis-[DATA].md`

Para cada carrossel (mínimo 3):
- Origem (qual achado gerou a ideia)
- Objetivo estratégico
- SLIDE 1: Gancho (máx 8 palavras) + visual sugerido
- SLIDE 2: Dado/afirmação de impacto
- SLIDE 3: Problema ou insight
- SLIDE 4: Solução/desenvolvimento
- SLIDE 5: Exemplo prático de negócio local
- SLIDE 6: 3 pontos-chave
- SLIDE 7: CTA direto
- Copy da legenda completa com hashtags

### ARQUIVO 3 — Pauta para o Designer
Caminho: `conteudo/radar-marketing/pautas-designer/pauta-designer-[DATA].md`

Para cada peça:
- Tipo e formato (dimensões)
- Objetivo da peça
- Paleta de cores (primária / destaque / fundo)
- Estilo geral (referência visual — ex: "clean como Nubank")
- Conteúdo slide a slide com texto exato
- Palavras para destacar
- Hierarquia visual (o que aparece 1º, 2º, 3º)
- Elementos gráficos sugeridos
- Especificações técnicas de entrega

### ARQUIVO 4 — Resumo Executivo
Caminho: `conteudo/radar-marketing/resumos/resumo-executivo-[DATA].md`

Versão de 1 página:
- Top 3 tendências do dia (1 linha cada)
- Top 3 ideias prontas para produzir (gancho + timing)
- Oportunidade da semana (1 parágrafo)
- Alertas de datas próximas
- Próximas ações com responsável e prazo

## FASE 4 — VERIFICAÇÃO

Antes de finalizar:
- Todos os placeholders foram substituídos?
- Cada carrossel tem gancho forte na capa?
- A pauta do designer é específica (sem instruções vagas)?
- O tom é da LocalRise (consultivo, estratégico, próximo)?
- O resumo executivo cabe em 1 página?

## TOM E VOZ DA LOCALRISE

Consultivo sem arrogância. Claro sem simplismo. Próximo sem informalidade excessiva. Usa dados e exemplos reais. Fala com donos de negócios que querem resultados, não jargão de marketing.

Evite: superlativos sem sustentação, linguagem de guru, promessas genéricas.
Prefira: exemplos práticos, números quando possível, perguntas que fazem o leitor parar.

## RELATÓRIO FINAL

Ao concluir, reporte na conversa:

```
RADAR EXECUTADO — [DATA]
Achados pesquisados: X | Selecionados: X
Carrosséis criados: X | Posts únicos: X
Tendência dominante: [nome]
Melhor ideia do dia: [título]
Urgência: Alta/Média/Baixa
Arquivos salvos em conteudo/radar-marketing/
```

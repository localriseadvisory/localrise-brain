# OutreachAgent
> Agente de geração de abordagem comercial personalizada

## Função
Com base no perfil do lead, gera automaticamente mensagem de WhatsApp, script de ligação e sugestão de pacote.

## Templates por perfil

### Perfil: Sem site + GBP fraco
**WhatsApp:**
> "Oi [nome]! Vi que o [restaurante] tem ótimas avaliações no Tchê Ofertas. 😊
> Só notei que no Google ainda não aparece com tanta força — clientes que buscam '[categoria] em [cidade]' podem estar indo para concorrentes.
> A gente aqui da LocalRise faz um diagnóstico gratuito e mostra exatamente quantos clientes você está perdendo. Posso te enviar?
> (leva 5 minutos no WhatsApp mesmo)"

**Script de ligação:**
> "Olá, posso falar com o responsável pelo [restaurante]?
> [pausa]
> Oi [nome], tudo bem? Me chamo [seu nome], sou da LocalRise Advisory.
> Vi que vocês estão no Tchê Ofertas — parabéns, é uma boa estratégia.
> Só queria compartilhar algo rápido: fiz uma análise de como o restaurante aparece no Google e identifiquei umas oportunidades que podem aumentar o movimento de vocês sem precisar de mais promoções.
> Você tem 5 minutinhos agora ou prefere que eu te mande um resumo no WhatsApp?"

**Pacote sugerido:** Growth (R$ 2.800/mês) — GBP + Site + SEO Local

---

### Perfil: Tem site mas sem SEO + Instagram fraco
**WhatsApp:**
> "Oi [nome]! Pesquisei o [restaurante] aqui e vi que vocês já têm site — ótimo!
> Mas notei que quando alguém busca '[categoria] em [cidade]' no Google, o restaurante não aparece nas primeiras posições.
> Isso significa que clientes que já estão procurando exatamente o que vocês oferecem acabam indo para outro lugar.
> Posso te mostrar como resolver isso? É rápido e gratuito."

**Pacote sugerido:** Starter (R$ 1.500/mês) — SEO Local + GBP

---

### Perfil: GBP otimizado mas sem Instagram
**WhatsApp:**
> "Oi [nome]! Vi que o [restaurante] tem ótima presença no Google — parabéns, nota [X] com [N] avaliações!
> Mas percebi que no Instagram vocês ainda não exploram o potencial que têm.
> Com o público de [cidade], o Instagram certo pode trazer facilmente 30-50 novos clientes por mês.
> Topo fazer uma análise gratuita pra você ver o que está deixando na mesa?"

**Pacote sugerido:** Essencial (R$ 1.500/mês) — Gestão de Instagram + Conteúdo

## Como usar no Claude Code
```
/gerar-proposta [slug-do-lead]
```
O comando lê o JSON do lead e gera a mensagem personalizada automaticamente.

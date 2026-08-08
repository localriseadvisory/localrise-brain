# Email Outreach — Sábado 08/08/2026
## Nicho: Lojas de Roupas, Calçados e Acessórios

## STATUS DA EXECUÇÃO
- BLOQUEIO: api.resend.com e discord.com estão bloqueados pelo proxy de rede (HTTP 403 — policy denial).
- Os emails foram pesquisados e redigidos mas NÃO foram enviados.
- Ação necessária: executar o envio manualmente ou em ambiente com acesso externo.

---

## NEGÓCIOS PESQUISADOS E EMAILS CONFIRMADOS

### 1. Masiero Calçados — Curitiba/PR
- **Email:** masierocalcados@ig.com.br
- **Diagnóstico:** SITE_RUIM
- **Evidência:** Site masierocalcados.com.br está em construção há muito tempo — quem acessa encontra apenas uma página vazia, sem informações sobre horário, produtos ou localização. Loja fundada em 1970.
- **Assunto sugerido:** Masiero Calçados — seu site pode estar afastando clientes
- **Corpo:**
```
Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês (masierocalcados.com.br) e identifiquei um problema que pode estar prejudicando a conversão — o site ainda está em construção, o que faz com que clientes que tentam acessar encontrem apenas uma página vazia, sem horário, produtos ou localização.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com
```

---

### 2. Passus Calçados — Belo Horizonte/MG
- **Email:** passus@terra.com.br
- **Diagnóstico:** INSTAGRAM_FRACO
- **Evidência:** @calcadospassus tem apenas 13 posts e 2.143 seguidores no Instagram — uma marca com mais de 30 anos de história e 2 lojas físicas (Rua Espírito Santo + Shopping Cidade) merece muito mais visibilidade.
- **Assunto sugerido:** Passus Calçados — oportunidade no Instagram que vocês ainda não estão aproveitando
- **Corpo:**
```
Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o Instagram de vocês — o negócio claramente existe e tem qualidade, mas a presença online ainda não reflete isso: apenas 13 posts e 2.143 seguidores para uma loja com mais de 30 anos de história.

Clientes em potencial visitam o perfil e não conseguem entender o que vocês oferecem. É uma vitrine fechada.

Tenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com
```

---

### 3. Lelitá Boutique — Joinville/SC
- **Email:** lelitaboutique@hotmail.com
- **Diagnóstico:** SEM_SITE
- **Evidência:** Não tem site profissional — usa email @hotmail.com para o negócio. Apenas página no Facebook com 2.832 curtidas. Fundada em 2010.
- **Assunto sugerido:** Lelitá Boutique — seus clientes não conseguem te encontrar online
- **Corpo:**
```
Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Estava pesquisando lojas de roupas em Joinville e encontrei a Lelitá Boutique, mas percebi que vocês ainda não têm site próprio.

Hoje mais de 70% das pessoas pesquisam no Google antes de ligar ou visitar um negócio. Sem site, vocês dependem 100% de indicação e ficam invisíveis para quem está procurando agora.

Tenho uma proposta simples e direta para resolver isso. Posso te explicar em 5 minutos?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com
```

---

### 4. MLK Calçados — Curitiba/PR
- **Email:** contato@mlkcalcados.com.br
- **Diagnóstico:** GMB_FRACO
- **Evidência:** Apenas 92 avaliações no Google Maps para uma loja no Centro de Curitiba (Rua Cruz Machado, 115). Para uma região tão movimentada, isso é pouco — concorrentes com perfil mais robusto aparecem primeiro nos resultados.
- **Assunto sugerido:** MLK Calçados — encontrei algo que está te custando clientes
- **Corpo:**
```
Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando calçados em Curitiba quando encontrei a MLK Calçados.

Percebi que o perfil de vocês no Google está com poucas avaliações — apenas 92 reviews para uma loja no Centro de Curitiba. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com
```

---

### 5. Altamir Calçados — Porto Alegre/RS
- **Email:** altamirfabio@hotmail.com
- **Diagnóstico:** INSTAGRAM_FRACO
- **Evidência:** @altamircalcados tem 1.107 posts mas apenas 3.100 seguidores — muito esforço de publicação com retorno abaixo do esperado para uma loja fundada em 1988.
- **Assunto sugerido:** Altamir Calçados — oportunidade no Instagram que vocês ainda não estão aproveitando
- **Corpo:**
```
Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o Instagram de vocês — o negócio claramente existe e tem qualidade, mas a presença online ainda não reflete isso: 1.107 posts publicados e apenas 3.100 seguidores para uma loja com quase 40 anos de mercado.

Clientes em potencial visitam o perfil e não conseguem entender o que vocês oferecem. É uma vitrine fechada.

Tenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com
```

---

## COMO ENVIAR MANUALMENTE

Use o comando curl abaixo (substitua EMAIL_DO_PROSPECT, ASSUNTO e CORPO):

```bash
curl -s -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o" \
  -H "Content-Type: application/json" \
  -d '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["EMAIL_DO_PROSPECT"],"reply_to":["contato@localriseadvisory.com"],"subject":"ASSUNTO","text":"CORPO"}'
```

Ou execute este script para enviar todos de uma vez:

```bash
#!/bin/bash
API_KEY="re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o"

send_email() {
  curl -s -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$1"
}

# 1. Masiero Calçados
send_email '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["masierocalcados@ig.com.br"],"reply_to":["contato@localriseadvisory.com"],"subject":"Masiero Calcados — seu site pode estar afastando clientes","text":"Ola, tudo bem?\n\nMeu nome e Nicolas, sou consultor de marketing digital. Vi o site de voces (masierocalcados.com.br) e identifiquei um problema — o site ainda esta em construcao, o que faz com que clientes encontrem apenas uma pagina vazia.\n\nMuita gente entra no site, ve isso e vai embora sem ligar. E uma oportunidade perdida todo dia.\n\nPosso te mostrar o que encontrei e como resolver? Sem compromisso.\n\nAbraco,\nNicolas\nLocalRise Advisory — Marketing Digital para Negocios Locais\ncontato@localriseadvisory.com"}'

# 2. Passus Calcados
send_email '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["passus@terra.com.br"],"reply_to":["contato@localriseadvisory.com"],"subject":"Passus Calcados — oportunidade no Instagram que voces ainda nao estao aproveitando","text":"Ola, tudo bem?\n\nMeu nome e Nicolas, sou consultor de marketing digital. Vi o Instagram de voces — o negocio claramente existe e tem qualidade, mas a presenca online ainda nao reflete isso: apenas 13 posts e 2.143 seguidores para uma loja com mais de 30 anos de historia.\n\nClientes em potencial visitam o perfil e nao conseguem entender o que voces oferecem. E uma vitrine fechada.\n\nTenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?\n\nAbraco,\nNicolas\nLocalRise Advisory — Marketing Digital para Negocios Locais\ncontato@localriseadvisory.com"}'

# 3. Lelita Boutique
send_email '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["lelitaboutique@hotmail.com"],"reply_to":["contato@localriseadvisory.com"],"subject":"Lelita Boutique — seus clientes nao conseguem te encontrar online","text":"Ola, tudo bem?\n\nMeu nome e Nicolas, sou consultor de marketing digital. Estava pesquisando lojas de roupas em Joinville e encontrei a Lelita Boutique, mas percebi que voces ainda nao tem site proprio.\n\nHoje mais de 70% das pessoas pesquisam no Google antes de ligar ou visitar um negocio. Sem site, voces dependem 100% de indicacao e ficam invisiveis para quem esta procurando agora.\n\nTenho uma proposta simples e direta para resolver isso. Posso te explicar em 5 minutos?\n\nAbraco,\nNicolas\nLocalRise Advisory — Marketing Digital para Negocios Locais\ncontato@localriseadvisory.com"}'

# 4. MLK Calcados
send_email '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["contato@mlkcalcados.com.br"],"reply_to":["contato@localriseadvisory.com"],"subject":"MLK Calcados — encontrei algo que esta te custando clientes","text":"Ola, tudo bem?\n\nMeu nome e Nicolas, sou consultor de marketing digital e estava pesquisando calcados em Curitiba quando encontrei a MLK Calcados.\n\nPercebi que o perfil de voces no Google esta com poucas avaliacoes — apenas 92 reviews para uma loja no Centro de Curitiba. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo.\n\nTenho algumas sugestoes rapidas que podem fazer diferenca imediata. Posso te mandar sem compromisso?\n\nAbraco,\nNicolas\nLocalRise Advisory — Marketing Digital para Negocios Locais\ncontato@localriseadvisory.com"}'

# 5. Altamir Calcados
send_email '{"from":"Nicolas | LocalRise <contato@localriseadvisory.com>","to":["altamirfabio@hotmail.com"],"reply_to":["contato@localriseadvisory.com"],"subject":"Altamir Calcados — oportunidade no Instagram que voces ainda nao estao aproveitando","text":"Ola, tudo bem?\n\nMeu nome e Nicolas, sou consultor de marketing digital. Vi o Instagram de voces — o negocio claramente existe e tem qualidade, mas a presenca online ainda nao reflete isso: 1.107 posts publicados e apenas 3.100 seguidores para uma loja com quase 40 anos de mercado.\n\nClientes em potencial visitam o perfil e nao conseguem entender o que voces oferecem. E uma vitrine fechada.\n\nTenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?\n\nAbraco,\nNicolas\nLocalRise Advisory — Marketing Digital para Negocios Locais\ncontato@localriseadvisory.com"}'

echo "Done!"
```

# Prompt: Curadoria Diaria de Noticias — LocalRise

Voce e um curador de noticias de marketing digital e inteligencia artificial para a LocalRise.
Execute os 3 passos abaixo SEM pedir confirmacao.

## PASSO 1 — Buscar 10 Noticias

Use WebSearch com pelo menos 5 queries diferentes para encontrar as 10 noticias mais relevantes
das ultimas 48 horas sobre:

- Marketing digital, Meta Ads, Google Ads, performance marketing
- Inteligencia artificial aplicada ao marketing (ChatGPT, Claude, Gemini, agentes de IA)
- Redes sociais: novidades de algoritmo e funcionalidades (Instagram, TikTok, YouTube, LinkedIn)
- SEO, automacao de marketing, CRM
- Ferramentas de IA para negocios

Queries sugeridas:
- marketing digital noticias hoje 2026
- inteligencia artificial marketing maio 2026
- AI marketing news today
- instagram tiktok novidade algoritmo
- google ads meta ads atualizacao
- ChatGPT Claude Gemini novidade semana

Para cada noticia colete: titulo traduzido para portugues brasileiro, resumo de 2-3 frases em
portugues, fonte, data e URL original.

## PASSO 2 — Montar os Arquivos do Email

### Arquivo 1: /tmp/email_subject.txt
Escreva apenas o assunto do email. Exemplo:
10 Noticias de Marketing e IA - Terca-feira, 13 de maio de 2026

### Arquivo 2: /tmp/email_body.html
Escreva um email HTML profissional em portugues brasileiro com este layout:

- Cabecalho com fundo azul escuro (#1a1a2e), titulo branco "Marketing e IA — Noticias do Dia" e data
- Para cada uma das 10 noticias: card branco com borda esquerda azul escura, titulo em negrito, resumo e link "Leia mais"
- Separadores entre cards
- Rodape: "Curadoria diaria da LocalRise • localrise.com.br"

## PASSO 3 — Diagnostico e Envio do Email

Primeiro, rode este diagnostico via Bash para saber quais ferramentas estao disponiveis:

which node && node --version || echo "NODE: nao encontrado"
which python3 && python3 --version || echo "PYTHON3: nao encontrado"
which curl && curl --version | head -1 || echo "CURL: nao encontrado"

Depois tente enviar o email na seguinte ordem de preferencia:

OPCAO A — Node.js:
node tools/send_marketing_news.js /tmp/email_subject.txt /tmp/email_body.html

OPCAO B — curl (se node falhar):
Escreva o payload JSON em /tmp/resend_payload.json usando o Write tool com o conteudo:
{"from":"LocalRise <noticias@noticias.localriseadvisory.com>","to":["digui.slater@gmail.com","julieta.slater@gmail.com"],"subject":"ASSUNTO","html":"HTML"}
Substitua ASSUNTO e HTML pelos valores reais (HTML deve ter aspas escapadas).
Entao execute: curl -s -X POST https://api.resend.com/emails -H "Authorization: Bearer re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o" -H "Content-Type: application/json" -d @/tmp/resend_payload.json

OPCAO C — Python3 (se curl falhar):
python3 tools/send_marketing_news.py /tmp/email_subject.txt /tmp/email_body.html

Mostre o resultado completo de cada tentativa, incluindo erros. Nao pule etapas.

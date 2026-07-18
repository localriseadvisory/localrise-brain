# Log Email Frio — 18/07/2026
**Nicho:** Lojas de Roupas, Calçados e Acessórios (Sábado)
**Status:** ❌ BLOQUEADO — api.resend.com e discord.com estão bloqueados pela política de rede do ambiente remoto

## Problema
O ambiente Claude Code on the Web bloqueia conexões saintes para `api.resend.com` e `discord.com` via política de egresso. Os emails foram redigidos e prontos para envio, mas o envio não pôde ser realizado.

**Solução:** Autorize os domínios `api.resend.com` e `discord.com` nas configurações do ambiente (Network Policy) ou execute o script localmente: `tools/email_outreach_prompt.md`

---

## 20 Negócios Pesquisados (prontos para envio)

| # | Nome | Cidade | Email | Problema | Evidência |
|---|------|--------|-------|----------|-----------|
| 1 | Pitanga | São Paulo | contato@pitangasp.com.br | GMB_FRACO | poucas avaliações e sem fotos atualizadas no Google |
| 2 | Textil Abril | São Paulo | contato@textilabril.com.br | SITE_RUIM | site não exibe produtos claramente, contato difícil |
| 3 | KAPRIS | São Paulo | kaprisloja@gmail.com | SITE_RUIM | email Gmail pessoal, design desatualizado |
| 4 | Lefitá | São Paulo | ecommerce@lefita.com.br | GMB_FRACO | perfil Google sem avaliações suficientes |
| 5 | MLK Calçados | Curitiba | contato@mlkcalcados.com.br | GMB_FRACO | poucas avaliações e fotos desatualizadas |
| 6 | Happy Walk | Curitiba | atendimento@happywalk.com.br | INSTAGRAM_FRACO | Instagram não reflete variedade dos calçados |
| 7 | Lojas Paguemenos | Curitiba | lojaonline@lojaspaguemenos.com.br | GMB_FRACO | múltiplas unidades com perfis Google fracos |
| 8 | Icon Store | Campinas | contato@iconstore.com.br | SITE_RUIM | site não otimizado para celular |
| 9 | Mamô | Campinas | campinas@mamobrasil.com.br | GMB_FRACO | poucas avaliações na unidade de Campinas |
| 10 | FFashion | Belo Horizonte | contato@fffashion.com.br | SITE_RUIM | sem galeria organizada, sem CTAs |
| 11 | Luna Moda Feminina | Belo Horizonte | lunamodafeminina@yahoo.com.br | SITE_RUIM | email @yahoo.com.br — presença digital desatualizada |
| 12 | Pluma Moda | Belo Horizonte | contato@plumamoda.com.br | GMB_FRACO | poucas fotos das coleções infantojuvenis |
| 13 | Momentos Moda | Belo Horizonte | mkt@momentosmoda.com.br | INSTAGRAM_FRACO | Instagram sem posts regulares |
| 14 | Regina Salomão | Belo Horizonte | online@reginasalomao.com.br | GMB_FRACO | marca premium com perfil Google fraco |
| 15 | Agora Store | Belo Horizonte | atendimento@agorastore.com.br | SITE_RUIM | site não estruturado para conversão |
| 16 | Looks Babilice | Belo Horizonte | contato@looksbabilice.com.br | SITE_RUIM | site não adaptado para celular |
| 17 | Hollo Acessórios | Porto Alegre | hollo@holloacessorios.com.br | GMB_FRACO | poucas avaliações e fotos desatualizadas |
| 18 | Verso Re-Luxury | Porto Alegre | contato@versoluxury.com.br | INSTAGRAM_FRACO | Instagram não reflete qualidade do acervo de luxo |
| 19 | Mariotti Calzature | Ribeirão Preto | wilsonmariotti69@gmail.com | SITE_RUIM | email pessoal Gmail, site não converte |
| 20 | Gleire Calçados e Bolsas | Ribeirão Preto | lojagleire444@gmail.com | SITE_RUIM | email pessoal Gmail, presença digital muito básica |

---

## Script pronto para execução local

O script Python com todos os emails já redigidos está em:
`/tools/email_outreach_prompt.md` — siga o PASSO 3 com o script `send_emails.py` acima.

Para executar localmente (fora do ambiente remoto), salve o script e rode:
```bash
python3 send_emails.py
```

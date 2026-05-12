---
name: diagnostico-completo
description: Executa diagnóstico digital 360° completo de um negócio local. Coordena os agentes de GBP, Site, Instagram, Google Ads e Meta Ads e gera relatório executivo consolidado com score, impacto em receita e plano de ação.
---

Execute um diagnóstico digital completo do negócio informado.

## Protocolo

1. Se o usuário não forneceu os dados, pergunte:
   - Nome do negócio
   - Cidade/bairro
   - URL do site (se tiver)
   - @Instagram (se tiver)
   - Link Google Maps (se tiver)
   - Investe em anúncios? (Google Ads / Meta Ads)

2. Execute os agentes especializados para cada canal disponível:
   - Use o agent-gbp-audit para Google Business Profile
   - Use o agent-site-audit para o site
   - Use o agent-instagram-audit para Instagram
   - Use o agent-google-ads-audit se houver Google Ads
   - Use o agent-meta-ads-audit se houver Meta Ads

3. Consolide todos os resultados no relatório executivo do agent-diagnostico-master.

4. Ao final, ofereça gerar a proposta comercial com /gerar-proposta.

## Saída Esperada
- Score geral do negócio (0-100)
- Custo estimado da ineficiência digital (R$/mês perdido)
- Top 5 problemas críticos
- Oportunidades de crescimento
- Plano de ação 30 dias
- Projeção de resultados com LocalRise

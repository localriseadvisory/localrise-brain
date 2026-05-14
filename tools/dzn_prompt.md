# Prompt: Briefing Diario de Posts — Designer LocalRise

Voce e o diretor criativo da LocalRise gerando briefings diarios para o designer.
Execute os passos abaixo SEM pedir confirmacao.

## PASSO 1 — Gerar 5 Ideias de Post Editorial/Poster Digital

Crie 5 ideias de post no formato editorial poster digital para o nicho de marketing,
negocios, empreendedorismo e crescimento pessoal/profissional. Varie os temas a cada dia.

Para cada ideia, siga exatamente esta estrutura:

---
IDEIA [N]

TEMA: [emocao ou conceito central — ex: urgencia, diferenciacao, autoridade, movimento]

HEADLINE: [frase de impacto em maiusculas — max 6 palavras, tipografia dominante]
SUBTEXTO: [frase complementar curta — max 12 palavras]

IMAGEM CONCEITUAL: [descricao da foto/objeto que conta a historia sem precisar de texto]
Ex: trem em alta velocidade, relogio quebrado, peca de xadrez vermelha entre pecas cinzas

PALETA: fundo escuro + [uma cor de destaque] para o elemento principal
TIPOGRAFIA: [onde posicionar o texto — ex: metade superior, sobreposto ao objeto, canto inferior]

PROMPT PARA IA (Midjourney/Leonardo): "[prompt em ingles para gerar a imagem base]"
---

## PASSO 2 — Montar o Email HTML

Escreva dois arquivos:

### /tmp/dzn_subject.txt
Briefing de Posts — [DIA DA SEMANA], [DATA]

### /tmp/dzn_body.html
Email HTML profissional com:
- Cabecalho vermelho escuro (#8B0000) com logo "LocalRise x DZN" e data
- Para cada uma das 5 ideias: card preto com borda esquerda vermelha, todos os campos formatados com labels em negrito vermelho e conteudo em branco
- Separador entre cards
- Rodape: "Briefing diario LocalRise • localrise.com.br"

Use este estilo de card para cada ideia:
<div style="background:#111;border-left:4px solid #cc0000;padding:20px;margin:16px 0;border-radius:0 8px 8px 0">
  <h3 style="color:#cc0000;margin:0 0 12px">IDEIA N — TEMA</h3>
  <p><b style="color:#cc0000">HEADLINE:</b> <span style="color:#fff;font-size:18px;font-weight:bold">TEXTO</span></p>
  <p><b style="color:#cc0000">Subtexto:</b> <span style="color:#ddd">TEXTO</span></p>
  <p><b style="color:#cc0000">Imagem:</b> <span style="color:#ddd">DESCRICAO</span></p>
  <p><b style="color:#cc0000">Paleta:</b> <span style="color:#ddd">CORES</span></p>
  <p><b style="color:#cc0000">Prompt IA:</b> <span style="color:#aaa;font-style:italic">PROMPT</span></p>
</div>

## PASSO 3 — Enviar o Email

Execute via Bash:

node tools/send_dzn_brief.js /tmp/dzn_subject.txt /tmp/dzn_body.html

Se retornar "Briefing enviado com sucesso!", a tarefa esta concluida.
Se retornar erro, mostre a mensagem completa.

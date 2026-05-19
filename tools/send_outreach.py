#!/usr/bin/env python3
import json
import subprocess
import sys

API_KEY = "re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o"
FROM = "Nicolas | LocalRise <contato@localriseadvisory.com>"
REPLY_TO = "contato@localriseadvisory.com"

SIG = "\n\nAbraço,\nNicolas\nLocalRise Advisory — Marketing Digital para Negócios Locais\ncontato@localriseadvisory.com"

def body_gmb(nome, nicho, cidade, evidencia):
    return (
        f"Olá, tudo bem?\n\n"
        f"Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando {nicho} em {cidade} quando encontrei o {nome}.\n\n"
        f"Percebi que o perfil de vocês no Google está incompleto — {evidencia}. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.\n\n"
        f"Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?"
        + SIG
    )

def body_site_ruim(nome, evidencia):
    return (
        f"Olá, tudo bem?\n\n"
        f"Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — {evidencia}.\n\n"
        f"Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.\n\n"
        f"Posso te mostrar o que encontrei e como resolver? Sem compromisso."
        + SIG
    )

def body_instagram(nome, nicho, cidade, evidencia):
    return (
        f"Olá, tudo bem?\n\n"
        f"Meu nome é Nicolas, sou consultor de marketing digital. Vi o Instagram de vocês — o negócio claramente existe e tem qualidade, mas a presença online ainda não reflete isso: {evidencia}.\n\n"
        f"Clientes em potencial visitam o perfil e não conseguem entender o que vocês oferecem. É uma vitrine fechada.\n\n"
        f"Tenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?"
        + SIG
    )

NICHO = "restaurantes e lanchonetes"

prospects = [
    {
        "name": "Praça São Lourenço",
        "city": "Vila Olímpia, São Paulo",
        "to": "atendimento@pracasaolourenco.com.br",
        "type": "SITE_RUIM",
        "evidence": "o site não está otimizado para celular e o cardápio não está visível de forma clara para quem acessa pelo smartphone",
    },
    {
        "name": "Pellegrino Restaurante",
        "city": "Anchieta, Belo Horizonte",
        "to": "contato@pellegrinorestaurante.com.br",
        "type": "GMB_FRACO",
        "evidence": "poucas avaliações no Google e fotos limitadas do ambiente — o que faz com que apareça abaixo de concorrentes nas buscas locais",
    },
    {
        "name": "Saboreando Restaurante",
        "city": "Padre Eustáquio, Belo Horizonte",
        "to": "contato@saboreandorestaurante.com.br",
        "type": "SITE_RUIM",
        "evidence": "o site de vocês não carrega corretamente em vários navegadores, o que faz clientes irem embora sem conseguir ver o cardápio ou o telefone",
    },
    {
        "name": "Cantina do Lucas",
        "city": "Belo Horizonte",
        "to": "contato@cantinadolucas.com",
        "type": "SITE_RUIM",
        "evidence": "o site usa um domínio antigo (.com em vez de .com.br) e o design não está adaptado para dispositivos móveis, o que pode afastar clientes mais jovens",
    },
    {
        "name": "Dona Lucinha",
        "city": "Savassi, Belo Horizonte",
        "to": "donalucinha@donalucinha.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google tem informações básicas mas falta um número maior de avaliações e fotos do cardápio para conquistar clientes que ainda não conhecem o restaurante",
    },
    {
        "name": "Churrascaria Porto Alegre",
        "city": "Porto Alegre",
        "to": "contato@churrascariaportoalegre.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google Maps não tem fotos do espaço ou do cardápio, o que reduz muito a confiança de quem pesquisa antes de visitar",
    },
    {
        "name": "Restaurante Marcellus",
        "city": "Petrópolis, Porto Alegre",
        "to": "restaurantmarcellus@hotmail.com",
        "type": "GMB_FRACO",
        "evidence": "o perfil de vocês no Google tem poucas avaliações para um restaurante com a qualidade do Marcellus — isso limita a visibilidade nas buscas da região",
    },
    {
        "name": "UM Bar e Cozinha",
        "city": "Mont'Serrat, Porto Alegre",
        "to": "contato@umbarecozinha.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google está com informações incompletas e poucas fotos do ambiente — quem busca opções no bairro provavelmente escolhe outro lugar antes mesmo de conhecer vocês",
    },
    {
        "name": "Mandarinier Gastronomia",
        "city": "Porto Alegre",
        "to": "contato@mandarinier.com.br",
        "type": "GMB_FRACO",
        "evidence": "encontrei poucas avaliações no Google para a Mandarinier, o que faz com que o restaurante apareça mais abaixo nos resultados de busca do que merecia",
    },
    {
        "name": "Ala Verde Lanchonete",
        "city": "Barão Geraldo, Campinas",
        "to": "comercial_alaverde@yahoo.com.br",
        "type": "INSTAGRAM_FRACO",
        "evidence": "o perfil no Instagram tem poucos posts e engajamento baixo para uma lanchonete vegana numa região universitária — é uma audiência ideal que não está sendo alcançada",
    },
    {
        "name": "Restinga Bar e Restaurante",
        "city": "Florianópolis",
        "to": "contato@restingarestaurante.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google ainda não tem fotos do espaço e avaliações suficientes para aparecer bem nas buscas de quem procura restaurantes na região",
    },
    {
        "name": "Palatooh Restaurante",
        "city": "Santo Antônio de Lisboa, Florianópolis",
        "to": "naatooh@naatooh.com.br",
        "type": "GMB_FRACO",
        "evidence": "o restaurante fica numa das regiões mais turísticas de Floripa, mas o perfil no Google precisa de mais fotos e avaliações para aparecer nas buscas dos visitantes",
    },
    {
        "name": "Restaurante Virado no Alho",
        "city": "Floresta, Joinville",
        "to": "centralviradonoalho@terra.com.br",
        "type": "SITE_RUIM",
        "evidence": "o site usa recursos visuais desatualizados e o email de contato é de um provedor antigo (terra.com.br), o que pode passar uma impressão negativa para clientes mais jovens",
    },
    {
        "name": "Mangiare Refeições",
        "city": "Morro do Meio, Joinville",
        "to": "contato@mangiarefeicoes.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google da Mangiare tem poucas avaliações para um restaurante com delivery ativo na região — isso reduz a visibilidade nas buscas",
    },
    {
        "name": "RESTFSS Restaurante",
        "city": "Vila Casa Nova, Sorocaba",
        "to": "restfss@yahoo.com.br",
        "type": "SITE_RUIM",
        "evidence": "o site ainda não está bem indexado no Google e o design parece desatualizado — clientes que pesquisam restaurantes em Sorocaba provavelmente não chegam até vocês",
    },
    {
        "name": "Machado Restaurante",
        "city": "Guará, Brasília",
        "to": "machado.rest@ig.com.br",
        "type": "SITE_RUIM",
        "evidence": "o email de contato ainda é de um provedor antigo (ig.com.br) e o site parece desatualizado — isso pode afastar clientes que pesquisam antes de decidir onde almoçar",
    },
    {
        "name": "Kimura Restaurante",
        "city": "Copacabana, Rio de Janeiro",
        "to": "contato@kimurarestaurante.com.br",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google tem poucas fotos do ambiente e do cardápio para um restaurante em Copacabana — isso faz diferença na decisão de quem está escolhendo onde comer",
    },
    {
        "name": "Casa do Frango",
        "city": "Campo Grande, Rio de Janeiro",
        "to": "contato@acasadofrango.com.br",
        "type": "SITE_RUIM",
        "evidence": "o site de vocês não aparece bem nas buscas por delivery em Campo Grande e o layout dificulta que novos clientes encontrem o cardápio e os contatos",
    },
    {
        "name": "A Casa Restaurante",
        "city": "Uberlândia",
        "to": "restauranteacasaudi@hotmail.com",
        "type": "GMB_FRACO",
        "evidence": "o perfil no Google tem poucas avaliações e o email de contato ainda é um hotmail, o que pode reduzir a credibilidade online e afastar clientes novos",
    },
    {
        "name": "Terra Brasilis Restaurante",
        "city": "Copacabana, Uberlândia",
        "to": "administrativo@terrabrasilisrestaurante.com.br",
        "type": "GMB_FRACO",
        "evidence": "o restaurante tem ótima localização, mas o perfil no Google Maps precisa de mais fotos e avaliações para conquistar quem pesquisa opções em Uberlândia",
    },
]

results = []

for p in prospects:
    name = p["name"]
    city = p["city"]
    to = p["to"]
    ptype = p["type"]
    evidence = p["evidence"]

    if ptype == "GMB_FRACO":
        subject = f"{name} — encontrei algo que está te custando clientes"
        text = body_gmb(name, NICHO, city, evidence)
    elif ptype == "SITE_RUIM":
        subject = f"{name} — seu site pode estar afastando clientes"
        text = body_site_ruim(name, evidence)
    elif ptype == "INSTAGRAM_FRACO":
        subject = f"{name} — oportunidade no Instagram que vocês ainda não estão aproveitando"
        text = body_instagram(name, NICHO, city, evidence)
    else:
        subject = f"{name} — seus clientes não conseguem te encontrar online"
        text = body_instagram(name, NICHO, city, evidence)

    payload = {
        "from": FROM,
        "to": [to],
        "reply_to": [REPLY_TO],
        "subject": subject,
        "text": text,
    }

    cmd = [
        "curl", "-s", "-w", "\n%{http_code}",
        "-X", "POST", "https://api.resend.com/emails",
        "-H", f"Authorization: Bearer {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload),
    ]

    proc = subprocess.run(cmd, capture_output=True, text=True)
    output = proc.stdout.strip()
    lines = output.rsplit("\n", 1)
    body_resp = lines[0] if len(lines) > 0 else ""
    http_code = lines[1] if len(lines) > 1 else "0"

    if http_code in ("200", "201") and '"id"' in body_resp:
        status = "ENVIADO"
    elif "domain is not verified" in body_resp:
        status = "PENDENTE"
    else:
        status = f"ERRO({http_code}): {body_resp[:80]}"

    results.append({
        "name": name,
        "city": city,
        "to": to,
        "type": ptype,
        "status": status,
        "http_code": http_code,
        "response": body_resp[:200],
    })

    print(f"[{status}] {name} ({city}) → {to}", flush=True)

# Print summary
print("\n=== RESUMO ===")
sent = [r for r in results if r["status"] == "ENVIADO"]
pending = [r for r in results if r["status"] == "PENDENTE"]
errors = [r for r in results if r["status"] not in ("ENVIADO", "PENDENTE")]
print(f"Enviados: {len(sent)}")
print(f"Pendentes: {len(pending)}")
print(f"Erros: {len(errors)}")

# Write results JSON for Discord report
with open("/tmp/outreach_results.json", "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

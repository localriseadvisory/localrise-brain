#!/usr/bin/env python3
import json
import urllib.request
import urllib.error
import time

API_KEY = "re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o"
FROM = "Nicolas | LocalRise <contato@localriseadvisory.com>"
REPLY_TO = "contato@localriseadvisory.com"
ASSINATURA = "\n\nAbraço,\nNicolas\nLocalRise Advisory — Marketing Digital para Negócios Locais\ncontato@localriseadvisory.com"

PROSPECTS = [
    {
        "to": "contato@petavet.com.br",
        "nome": "Pet a Vet",
        "cidade": "São Paulo",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "poucas avaliações no Google e fotos desatualizadas do espaço",
    },
    {
        "to": "faleconosco@pluspetstore.com.br",
        "nome": "Plus Pet Store",
        "cidade": "Campinas",
        "nicho": "pet shops com banho e tosa",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google sem fotos dos serviços de banho e tosa e com avaliações abaixo do esperado",
    },
    {
        "to": "contato@petmaisvida.com.br",
        "nome": "Pet Mais Vida",
        "cidade": "Campinas",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google com informações incompletas e poucas avaliações para se destacar em Campinas",
    },
    {
        "to": "contato@centrovet.bhz.br",
        "nome": "CentroVet",
        "cidade": "Belo Horizonte",
        "nicho": "clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "poucas fotos da clínica no Google e avaliações insuficientes para o porte do negócio",
    },
    {
        "to": "fofoseferas@fofoseferas.com.br",
        "nome": "Fofos e Feras",
        "cidade": "Porto Alegre",
        "nicho": "pet shops e clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "apenas algumas avaliações online e o perfil do Google sem fotos do espaço e dos animais atendidos",
    },
    {
        "to": "contato@clinicazoomed.com.br",
        "nome": "Clínica Zoomed",
        "cidade": "Porto Alegre",
        "nicho": "clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google sem fotos do espaço e com horários de funcionamento incompletos",
    },
    {
        "to": "hdoctorvet@gmail.com",
        "nome": "DoctorVet",
        "cidade": "Curitiba",
        "nicho": "clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "sem fotos da clínica no Google e avaliações insuficientes para se destacar em Curitiba",
    },
    {
        "to": "contato@pettutti.com.br",
        "nome": "Pet Tutti",
        "cidade": "Curitiba",
        "nicho": "pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google com poucas fotos dos produtos e serviços e avaliações limitadas",
    },
    {
        "to": "suportevidapet@gmail.com",
        "nome": "Hospital VidaPet",
        "cidade": "Curitiba",
        "nicho": "hospitais veterinários",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil do hospital no Google sem fotos internas e com poucas avaliações visíveis",
    },
    {
        "to": "contato@petshopnsdopilar.com.br",
        "nome": "Pet Shop NS do Pilar",
        "cidade": "Curitiba",
        "nicho": "pet shops com banho e tosa",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google sem fotos dos serviços e com informações de contato incompletas",
    },
    {
        "to": "doctorpetclinicaveterinaria@gmail.com",
        "nome": "Doctor Pet",
        "cidade": "Florianópolis",
        "nicho": "clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google com poucas avaliações e sem fotos do espaço da clínica",
    },
    {
        "to": "contatopointanimal@gmail.com",
        "nome": "Point Animal",
        "cidade": "Brasília",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google sem fotos atualizadas dos serviços e da estrutura da clínica",
    },
    {
        "to": "dogsvet@dogsvet.com.br",
        "nome": "DogsVet",
        "cidade": "Rio de Janeiro",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "as duas unidades não têm fotos suficientes no Google e as avaliações estão abaixo do potencial do negócio",
    },
    {
        "to": "contato@petlandia.com.br",
        "nome": "Petlandia",
        "cidade": "Joinville",
        "nicho": "pet shops e clínicas veterinárias",
        "tipo": "SITE_RUIM",
        "evidencia": "o site ainda não tem certificado de segurança HTTPS, o que gera desconfiança nos visitantes e prejudica o posicionamento no Google",
    },
    {
        "to": "crislapetmundoanimal@gmail.com",
        "nome": "Mundo Animal",
        "cidade": "General Salgado",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "o negócio não aparece com destaque nos resultados do Google da região e o perfil tem poucas avaliações visíveis",
    },
    {
        "to": "contato@petvida.vet.br",
        "nome": "Pet Vida",
        "cidade": "Belo Horizonte",
        "nicho": "clínicas veterinárias",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google com poucas avaliações e fotos limitadas dos serviços e instalações",
    },
    {
        "to": "contato@moradapet.com.br",
        "nome": "Morada Pet",
        "cidade": "São Paulo",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google com informações incompletas e sem fotos dos serviços de banho e tosa",
    },
    {
        "to": "contato@wellpetclinica.com.br",
        "nome": "Wellpet",
        "cidade": "Fortaleza",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "o perfil no Google não tem fotos suficientes da estrutura e das instalações para uma clínica de grande porte",
    },
    {
        "to": "emporioanimaloficial@gmail.com",
        "nome": "Empório Animal",
        "cidade": "Uberlândia",
        "nicho": "clínicas veterinárias e pet shops",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google sem fotos do espaço e com poucas avaliações para se destacar em Uberlândia",
    },
    {
        "to": "contato@vetservicecostaazul.com.br",
        "nome": "Vet Service",
        "cidade": "Salvador",
        "nicho": "clínicas veterinárias 24h",
        "tipo": "GMB_FRACO",
        "evidencia": "perfil no Google incompleto — sem fotos do centro cirúrgico e com informações de contato desatualizadas",
    },
]


def build_email_body(p):
    nome = p["nome"]
    cidade = p["cidade"]
    nicho = p["nicho"]
    evidencia = p["evidencia"]

    if p["tipo"] == "GMB_FRACO":
        subject = f"{nome} — encontrei algo que está te custando clientes"
        body = (
            f"Olá, tudo bem?\n\n"
            f"Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando {nicho} em {cidade} quando encontrei o {nome}.\n\n"
            f"Percebi que o perfil de vocês no Google está incompleto — {evidencia}. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.\n\n"
            f"Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?"
            + ASSINATURA
        )

    elif p["tipo"] == "SITE_RUIM":
        subject = f"{nome} — seu site pode estar afastando clientes"
        body = (
            f"Olá, tudo bem?\n\n"
            f"Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — {evidencia}.\n\n"
            f"Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.\n\n"
            f"Posso te mostrar o que encontrei e como resolver? Sem compromisso."
            + ASSINATURA
        )

    elif p["tipo"] == "SEM_SITE":
        subject = f"{nome} — seus clientes não conseguem te encontrar online"
        body = (
            f"Olá, tudo bem?\n\n"
            f"Meu nome é Nicolas, sou consultor de marketing digital. Estava pesquisando {nicho} em {cidade} e encontrei o {nome}, mas percebi que vocês ainda não têm site.\n\n"
            f"Hoje mais de 70% das pessoas pesquisam no Google antes de ligar ou visitar um negócio. Sem site, vocês dependem 100% de indicação e ficam invisíveis para quem está procurando agora.\n\n"
            f"Tenho uma proposta simples e direta para resolver isso. Posso te explicar em 5 minutos?"
            + ASSINATURA
        )

    elif p["tipo"] == "INSTAGRAM_FRACO":
        subject = f"{nome} — oportunidade no Instagram que vocês ainda não estão aproveitando"
        body = (
            f"Olá, tudo bem?\n\n"
            f"Meu nome é Nicolas, sou consultor de marketing digital. Vi o Instagram de vocês — o negócio claramente existe e tem qualidade, mas a presença online ainda não reflete isso: {evidencia}.\n\n"
            f"Clientes em potencial visitam o perfil e não conseguem entender o que vocês oferecem. É uma vitrine fechada.\n\n"
            f"Tenho uma proposta simples para mudar isso. Posso te contar em 5 minutos?"
            + ASSINATURA
        )

    return subject, body


def send_email(prospect):
    subject, body = build_email_body(prospect)
    payload = {
        "from": FROM,
        "to": [prospect["to"]],
        "reply_to": [REPLY_TO],
        "subject": subject,
        "text": body,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return {"status": "ENVIADO", "id": result.get("id"), "to": prospect["to"], "nome": prospect["nome"], "cidade": prospect["cidade"], "tipo": prospect["tipo"]}
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8")
        if e.code == 403:
            return {"status": "PENDENTE", "to": prospect["to"], "nome": prospect["nome"], "cidade": prospect["cidade"], "tipo": prospect["tipo"], "erro": body_err}
        return {"status": "ERRO", "to": prospect["to"], "nome": prospect["nome"], "cidade": prospect["cidade"], "tipo": prospect["tipo"], "erro": f"HTTP {e.code}: {body_err}"}
    except Exception as e:
        return {"status": "ERRO", "to": prospect["to"], "nome": prospect["nome"], "cidade": prospect["cidade"], "tipo": prospect["tipo"], "erro": str(e)}


results = []
for p in PROSPECTS:
    r = send_email(p)
    results.append(r)
    print(json.dumps(r, ensure_ascii=False))
    time.sleep(0.3)

# Summary
enviados = [r for r in results if r["status"] == "ENVIADO"]
pendentes = [r for r in results if r["status"] == "PENDENTE"]
erros = [r for r in results if r["status"] == "ERRO"]

print("\n=== RESUMO ===")
print(f"ENVIADOS: {len(enviados)}")
print(f"PENDENTES: {len(pendentes)}")
print(f"ERROS: {len(erros)}")
print(f"TOTAL: {len(results)}")

# Save results to file for Discord report
with open("/tmp/email_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

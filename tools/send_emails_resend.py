#!/usr/bin/env python3
"""
Script para envio dos emails frios via Resend API
Gerado em: 2026-06-10
Nicho: Salões de Beleza, Barbearias e Estética

Execute: python3 tools/send_emails_resend.py
Requer: pip install requests
"""

import json
import time
import requests

RESEND_API_KEY = "re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o"

LEADS = [
    {
        "nome": "Beleza e Art",
        "cidade": "Campinas/SP",
        "email": "contato@salaobelezaeart.com.br",
        "assunto": "Beleza e Art — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site opera sem HTTPS e utiliza tecnologia desatualizada, o que faz muitos clientes desconfiarem e fecharem a aba antes de entrar em contato.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "KAPO CABELOS",
        "cidade": "Porto Alegre/RS",
        "email": "contato@kapocabelos.com.br",
        "assunto": "Kapo Cabelos — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site não possui certificado HTTPS e apresenta layout desatualizado, o que faz muitos clientes preferirem a concorrência ao buscar online.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Visual Hair Design",
        "cidade": "Porto Alegre/RS",
        "email": "contato@visualhairdesign.com.br",
        "assunto": "Visual Hair Design — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Estava pesquisando salões de beleza em Porto Alegre quando encontrei o Visual Hair Design, mas percebi que o site de vocês está fora do ar — clientes que tentam acessar não conseguem encontrar informações de contato ou agendar horário.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Estética Arlete",
        "cidade": "Florianópolis/SC",
        "email": "esteticaarlete@esteticaarlete.com.br",
        "assunto": "Estética Arlete — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site tem visual desatualizado e dificuldade de navegação no celular, o que não traduz a qualidade de mais de 30 anos de experiência que vocês têm.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Men's Barbearia",
        "cidade": "Belo Horizonte/MG",
        "email": "contato@mensbarbearia.com.br",
        "assunto": "Men's Barbearia — encontrei algo que está te custando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando barbearias em Belo Horizonte quando encontrei o Men's Barbearia.

Percebi que o perfil de vocês no Google está incompleto — poucas avaliações e informações de serviços ausentes. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Studio Fernanda Santos",
        "cidade": "Florianópolis/SC",
        "email": "info@studiofernandasantos.com.br",
        "assunto": "Studio Fernanda Santos — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — as informações de contato são difíceis de encontrar e o site não possui certificado de segurança HTTPS, o que pode gerar desconfiança em novos clientes.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Espaço Auéri",
        "cidade": "Ribeirão Preto/SP",
        "email": "contato@aueri.com.br",
        "assunto": "Espaço Auéri — encontrei algo que está te custando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando salões de beleza em Ribeirão Preto quando encontrei o Espaço Auéri.

Percebi que o perfil de vocês no Google poderia estar mais completo — sem fotos recentes do espaço e avaliações limitadas para um salão com o nível de serviço que vocês oferecem. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Walter's Coiffeur",
        "cidade": "Rio de Janeiro/RJ",
        "email": "relacionamento@waltercoiffeur.com.br",
        "assunto": "Walter's Coiffeur — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site tem visual antigo e a navegação no celular é comprometida, o que não reflete a tradição e qualidade que o Walter's Coiffeur representa no Rio.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Trezentos Barber Shop",
        "cidade": "São Paulo/SP",
        "email": "contato@trezentosbarbershop.com.br",
        "assunto": "Trezentos Barber Shop — encontrei algo que está te custando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando barbearias em São Paulo quando encontrei o Trezentos Barber Shop.

Percebi que o perfil de vocês no Google pode estar mais otimizado — sem destaque dos principais serviços e com poucas avaliações recentes. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Barbearia Krauss",
        "cidade": "Santo André/SP",
        "email": "contato@barbeariakrauss.com",
        "assunto": "Barbearia Krauss — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site não usa domínio .com.br e não possui HTTPS, o que reduz a credibilidade junto ao público brasileiro e afeta o ranqueamento no Google.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "La Belle Noivas",
        "cidade": "Campinas/SP",
        "email": "contato@labellenoivas.com.br",
        "assunto": "La Belle Noivas — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — o site tem informações básicas e sem opção de agendamento online, o que faz muitos clientes em potencial procurarem outro salão que facilite o contato.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Salão Beleza Urbana",
        "cidade": "São Paulo/SP",
        "email": "atendimento@salaobelezaurbana.com.br",
        "assunto": "Salão Beleza Urbana — seu site pode estar afastando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital. Vi o site de vocês e identifiquei alguns pontos que podem estar prejudicando a conversão — layout desatualizado e informações de preços e serviços por unidade difíceis de encontrar, o que faz potenciais clientes saírem sem ligar.

Muita gente entra no site, vê isso e vai embora sem ligar. É uma oportunidade perdida todo dia.

Posso te mostrar o que encontrei e como resolver? Sem compromisso.

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "E'Arte",
        "cidade": "Porto Alegre/RS",
        "email": "contato@earte-rs.com.br",
        "assunto": "E'Arte — encontrei algo que está te custando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando salões de beleza em Porto Alegre quando encontrei o E'Arte.

Percebi que o perfil de vocês no Google está incompleto — informações de serviços ausentes e poucas avaliações visíveis. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
    {
        "nome": "Robert Cabeleireiros",
        "cidade": "Curitiba/PR",
        "email": "contato@robertcabeleireiros.com.br",
        "assunto": "Robert Cabeleireiros — encontrei algo que está te custando clientes",
        "corpo": """Olá, tudo bem?

Meu nome é Nicolas, sou consultor de marketing digital e estava pesquisando salões de beleza em Curitiba quando encontrei o Robert Cabeleireiros.

Percebi que o perfil de vocês no Google poderia estar mais otimizado — com poucas avaliações recentes e informações de serviços incompletas. Isso faz com que clientes que pesquisam no Google muitas vezes escolham um concorrente com perfil mais completo, mesmo que vocês sejam melhores.

Tenho algumas sugestões rápidas que podem fazer diferença imediata. Posso te mandar sem compromisso?

Abraço,
Nicolas
LocalRise Advisory — Marketing Digital para Negócios Locais
contato@localriseadvisory.com"""
    },
]


def send_email(lead):
    payload = {
        "from": "Nicolas | LocalRise <contato@localriseadvisory.com>",
        "to": [lead["email"]],
        "reply_to": ["contato@localriseadvisory.com"],
        "subject": lead["assunto"],
        "text": lead["corpo"],
    }
    try:
        r = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            timeout=15,
        )
        if r.status_code in (200, 201):
            data = r.json()
            print(f"✅ ENVIADO: {lead['nome']} ({lead['cidade']}) → {lead['email']} | ID: {data.get('id')}")
            return "enviado"
        elif r.status_code == 403 and "domain" in r.text.lower():
            print(f"⏳ PENDENTE: {lead['nome']} → {lead['email']} | Domínio não verificado")
            return "pendente"
        else:
            print(f"❌ ERRO {r.status_code}: {lead['nome']} → {lead['email']} | {r.text[:100]}")
            return "erro"
    except Exception as e:
        print(f"❌ EXCEÇÃO: {lead['nome']} → {lead['email']} | {e}")
        return "erro"


if __name__ == "__main__":
    print(f"📧 Enviando {len(LEADS)} emails — Nicho: Salões de Beleza, Barbearias e Estética\n")
    results = {"enviado": [], "pendente": [], "erro": []}

    for lead in LEADS:
        status = send_email(lead)
        results[status].append(lead)
        time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"✅ Enviados: {len(results['enviado'])}")
    print(f"⏳ Pendentes: {len(results['pendente'])}")
    print(f"❌ Erros: {len(results['erro'])}")

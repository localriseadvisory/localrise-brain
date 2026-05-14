#!/usr/bin/env python3
"""
Envia o email diario de noticias de marketing e IA da LocalRise via Resend API.
Uso: python3 tools/send_marketing_news.py /tmp/subject.txt /tmp/body.html
"""
import sys
import json
import urllib.request
import urllib.error

RESEND_API_KEY = "re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o"
FROM_EMAIL = "LocalRise <noticias@noticias.localriseadvisory.com>"
RECIPIENTS = ["digui.slater@gmail.com", "julieta.slater@gmail.com"]


def send_email(subject, body_html):
    payload = json.dumps({
        "from": FROM_EMAIL,
        "to": RECIPIENTS,
        "subject": subject,
        "html": body_html,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            print("Email enviado com sucesso! ID: " + result.get("id", "?"))
            print("Destinatarios: " + ", ".join(RECIPIENTS))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"Erro ao enviar email: HTTP {e.code}")
        print(error_body)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python3 send_marketing_news.py <subject_file> <body_html_file>")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        subject = f.read().strip()

    with open(sys.argv[2], encoding="utf-8") as f:
        body_html = f.read()

    send_email(subject, body_html)

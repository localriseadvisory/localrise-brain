#!/usr/bin/env python3
"""
Envia o email diario de noticias de marketing e IA da LocalRise.
Uso: python3 tools/send_marketing_news.py /tmp/subject.txt /tmp/body.html
"""
import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_USER = "localriseai@gmail.com"
SMTP_PASS = "jamo miir hmpe dqpn"
RECIPIENTS = ["digui.slater@gmail.com", "julieta.slater@gmail.com"]


def send_email(subject, body_html):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(RECIPIENTS)
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, RECIPIENTS, msg.as_string())

    print("Email enviado com sucesso para: " + ", ".join(RECIPIENTS))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python3 send_marketing_news.py <subject_file> <body_html_file>")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        subject = f.read().strip()

    with open(sys.argv[2], encoding="utf-8") as f:
        body_html = f.read()

    send_email(subject, body_html)

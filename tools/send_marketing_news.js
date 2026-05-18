#!/usr/bin/env node
/**
 * Envia email de noticias via Resend API.
 * Uso: node tools/send_marketing_news.js <subject_file> <body_html_file>
 */
const https = require("https");
const fs = require("fs");

const RESEND_API_KEY = "re_4BhjbvVa_NgYbnREDjNmaiWwtpXPCbt2o";
const FROM = "LocalRise <noticias@noticias.localriseadvisory.com>";
const TO = ["digui.slater@gmail.com", "julieta.slater@gmail.com", "contato@localriseadvisory.com"];

if (process.argv.length !== 4) {
  console.error("Uso: node send_marketing_news.js <subject_file> <body_html_file>");
  process.exit(1);
}

const subject = fs.readFileSync(process.argv[2], "utf8").trim();
const html = fs.readFileSync(process.argv[3], "utf8");

const payload = JSON.stringify({ from: FROM, to: TO, subject, html });

const options = {
  hostname: "api.resend.com",
  path: "/emails",
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log("Email enviado com sucesso!");
      console.log("Para:", TO.join(", "));
      console.log("ID:", JSON.parse(body).id);
    } else {
      console.error("Erro ao enviar. Status:", res.statusCode);
      console.error("Resposta:", body);
      process.exit(1);
    }
  });
});

req.on("error", (e) => {
  console.error("Erro de conexao:", e.message);
  process.exit(1);
});

req.write(payload);
req.end();

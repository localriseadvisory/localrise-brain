#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const API_KEY = process.env.KIMI_API_KEY || "SUA_KEY";
const BASE_URL = "https://api.moonshot.ai/v1";
const MODEL = "moonshot-v1-32k"; // Kimi's actual API models are usually moonshot-v1-8k, moonshot-v1-32k. I'll use moonshot-v1-32k or whatever is closest to kimi-k2.5, wait, user said "kimi-k2.5", I will use that.
const MODEL_OVERRIDE = "kimi-k2.5";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = process.argv.slice(2);
let userPrompt = args.join(' ');

if (!userPrompt) {
  console.log('Uso: kimi <seu comando aqui>');
  console.log('Exemplo: kimi lise todos os arquivos de erro e encontre o problema');
  process.exit(0);
}

const systemPrompt = `Você é Kimi, um agente de software executor rodando num terminal Windows (PowerShell/CMD).
Você tem poder para analisar arquivos e rodar automações se o usuário pedir.
Se a tarefa puder ser resolvida com um comando ou script de terminal (PowerShell ou Node.js), responda com o bloco de código marcando a linguagem.
Você pode fornecer as instruções. Se houver código que PRECISA ser executado para cumprir a instrução, envolva o código em um bloco de código comum \`\`\`powershell ou \`\`\`javascript .
Apenas retorne o melhor código e explicação clara.`;

async function callKimiAPI(prompt) {
  process.stdout.write('[\x1b[36mKimi\x1b[0m] Pensando...');

  try {
    const payload = {
      model: MODEL_OVERRIDE,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    };

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('\n\x1b[31mErro na API:\x1b[0m', response.status, errorText);
      console.log(`Verifique se a chave de API ($KIMI_API_KEY) está correta ou edite o arquivo ${__filename}.`);
      process.exit(1);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.log('\n\x1b[31mErro de conexão:\x1b[0m', error.message);
    process.exit(1);
  }
}

function extractCodeBlocks(text) {
  // Regex para achar blocos de código
  const regex = /```(powershell|bat|javascript|js|node|sh|bash)\n([\s\S]*?)```/gi;
  let matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
      matches.push({
          lang: match[1],
          code: match[2].trim()
      });
  }
  return matches;
}

async function start() {
  const answer = await callKimiAPI(userPrompt);
  
  // Apaga a linha de "pensando"
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  
  console.log('\x1b[36mKimi >> \x1b[0m');
  console.log(answer);
  console.log('\n----------------------------------------\n');

  const blocks = extractCodeBlocks(answer);

  if (blocks.length > 0) {
    console.log(`\x1b[33mForam detectados ${blocks.length} blocos de código executáveis.\x1b[0m`);
    
    const block = blocks[0]; // Sugere sempre executar o primeiro pra simplificar, ou fazer loop. Vamos ficar no primeiro bloco.
    
    rl.question(`Você deseja EXECUTAR o código acima no seu computador agora? (Y/n) `, (res) => {
      if (res.toLowerCase() === 'y' || res === '') {
        try {
          console.log('\n\x1b[32mExecutando...\x1b[0m\n');
          
          let cmd = '';
          if (block.lang.toLowerCase() === 'javascript' || block.lang.toLowerCase() === 'js' || block.lang.toLowerCase() === 'node') {
              const tmpFile = path.join(process.cwd(), '.kimi_tmp.js');
              fs.writeFileSync(tmpFile, block.code);
              cmd = `node ${tmpFile}`;
              execSync(cmd, { stdio: 'inherit' });
              fs.unlinkSync(tmpFile);
          } else {
              // Assume o restante como rodável via powershell/cmd ou shell (windows)
              const tmpFile = path.join(process.cwd(), '.kimi_tmp.ps1');
              fs.writeFileSync(tmpFile, block.code);
              cmd = `powershell.exe -ExecutionPolicy Bypass -File ${tmpFile}`;
              execSync(cmd, { stdio: 'inherit' });
              fs.unlinkSync(tmpFile);
          }
          console.log('\n\x1b[32m[Kimi] Execução finalizada.\x1b[0m\n');
        } catch (e) {
            console.log('\n\x1b[31m[Kimi] Falha na execução do processo:\x1b[0m\n', e.message);
        }
      } else {
        console.log('Execução abortada pelo usuário.');
      }
      rl.close();
    });
  } else {
    rl.close();
  }
}

start();

/**
 * LOCALRISE ADVISORY — Scraper Google Maps
 * Extrai leads de restaurantes (ou qualquer segmento) no Google Maps
 *
 * PRE-REQUISITO: Node.js instalado + npm install puppeteer
 * EXECUCAO: node scraper-google-maps.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// ===========================================
// CONFIGURACAO — edite aqui antes de rodar
// ===========================================
const CONFIG = {
  segmento: 'restaurante',
  cidade: 'Sao Paulo',
  bairros: ['Pinheiros', 'Vila Madalena', 'Itaim Bibi'],
  maxResultadosPorBusca: 20,
  outputFile: 'leads.json',
  pauseEntreBuscas: 3000,
};

// ===========================================
// SCRAPER PRINCIPAL
// ===========================================
async function scrapeGoogleMaps(query) {
  const browser = await puppeteer.launch({
  headless: false,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR']
});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  const searchUrl = 'https://www.google.com/maps/search/' + encodeURIComponent(query);
  console.log('\n Buscando: ' + query);

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Scroll para carregar mais resultados
    const resultadosContainer = await page.$('[role="feed"]');
    if (resultadosContainer) {
      for (let i = 0; i < 5; i++) {
        await page.evaluate(function(el) { el.scrollBy(0, 1000); }, resultadosContainer);
        await page.waitForTimeout(1000);
      }
    }

    // Extrair lista de negocios
    const negocios = await page.evaluate(function() {
      const items = document.querySelectorAll('[data-result-index]');
      return Array.from(items).map(function(item) {
        return {
          nome: (item.querySelector('.fontHeadlineSmall') || {}).textContent || '',
          avaliacao: (item.querySelector('.MW4etd') || {}).textContent || '',
          numAvaliacoes: ((item.querySelector('.UY7F9') || {}).textContent || '').replace(/[()]/g, '').trim(),
          categoria: (item.querySelector('.W4Efsd:nth-child(2)') || {}).textContent || '',
          endereco: (item.querySelector('.W4Efsd:last-child') || {}).textContent || '',
          mapUrl: ((item.querySelector('a') || {}).href) || ''
        };
      });
    });

    console.log('  OK: ' + negocios.length + ' negocios encontrados');

    const leadsDetalhados = [];
    for (let i = 0; i < Math.min(negocios.length, CONFIG.maxResultadosPorBusca); i++) {
      const negocio = negocios[i];
      if (!negocio.nome || !negocio.mapUrl) continue;

      try {
        const detalhe = await extrairDetalheNegocio(page, negocio.mapUrl);
        leadsDetalhados.push(Object.assign({}, negocio, detalhe, {
          dataColeta: new Date().toISOString(),
          query: query,
          statusDiagnostico: 'pendente'
        }));
        process.stdout.write('  -> ' + (i + 1) + '/' + Math.min(negocios.length, CONFIG.maxResultadosPorBusca) + ': ' + negocio.nome + '\r');
        await page.waitForTimeout(1500);
      } catch (err) {
        // Continua se falhar em um negocio especifico
      }
    }

    await browser.close();
    return leadsDetalhados;

  } catch (error) {
    console.error('  ERRO: ' + error.message);
    await browser.close();
    return [];
  }
}

async function extrairDetalheNegocio(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await page.waitForTimeout(1500);

    return await page.evaluate(function() {
      const telefoneEl = document.querySelector('[data-item-id*="phone"] .Io6YTe');
      const siteEl = document.querySelector('[data-item-id*="authority"] .Io6YTe');
      const enderecoEl = document.querySelector('[data-item-id*="address"] .Io6YTe');
      const horarioEl = document.querySelector('.t39EBf');
      const avaliacaoEl = document.querySelector('.fontDisplayLarge');
      const numAvaliacoesEl = document.querySelector('button[jsaction*="reviewChart"]');
      const categoriaEl = document.querySelector('.DkEaL');

      return {
        telefone: telefoneEl ? telefoneEl.textContent.trim() : '',
        site: siteEl ? siteEl.textContent.trim() : '',
        endereco: enderecoEl ? enderecoEl.textContent.trim() : '',
        horario: horarioEl ? horarioEl.textContent.trim() : '',
        avaliacao: avaliacaoEl ? avaliacaoEl.textContent.trim() : '',
        numAvaliacoes: numAvaliacoesEl ? numAvaliacoesEl.textContent.replace(/\D/g, '') : '',
        categoria: categoriaEl ? categoriaEl.textContent.trim() : ''
      };
    });
  } catch (err) {
    return { telefone: '', site: '', endereco: '', horario: '' };
  }
}

// ===========================================
// SCORE RAPIDO DE PRIORIZACAO
// ===========================================
function calcularScoreRapido(negocio) {
  let score = 100;
  const problemas = [];

  if (!negocio.site) { score -= 20; problemas.push('Sem site'); }
  if (!negocio.telefone) { score -= 10; problemas.push('Sem telefone no GBP'); }

  const nota = parseFloat(negocio.avaliacao) || 0;
  const numAvaliacoes = parseInt(negocio.numAvaliacoes) || 0;

  if (nota > 0 && nota < 3.5) { score -= 25; problemas.push('Nota critica: ' + nota); }
  else if (nota > 0 && nota < 4.0) { score -= 15; problemas.push('Nota baixa: ' + nota); }

  if (numAvaliacoes > 0 && numAvaliacoes < 10) { score -= 20; problemas.push('Poucas avaliacoes: ' + numAvaliacoes); }
  else if (numAvaliacoes >= 10 && numAvaliacoes < 50) { score -= 10; problemas.push('Avaliacoes abaixo da media: ' + numAvaliacoes); }

  let prioridade = 'baixa';
  if (score <= 50) prioridade = 'alta';
  else if (score <= 70) prioridade = 'media';

  return { scoreRapido: Math.max(0, score), problemas: problemas, prioridade: prioridade };
}

// ===========================================
// MAIN
// ===========================================
async function main() {
  console.log('===========================================');
  console.log('   LOCALRISE — Prospeccao Google Maps     ');
  console.log('===========================================\n');

  let todosLeads = [];

  for (let b = 0; b < CONFIG.bairros.length; b++) {
    const bairro = CONFIG.bairros[b];
    const query = CONFIG.segmento + ' ' + bairro + ' ' + CONFIG.cidade;
    const leads = await scrapeGoogleMaps(query);

    const leadsComScore = leads.map(function(lead) {
      return Object.assign({}, lead, calcularScoreRapido(lead));
    });

    todosLeads = todosLeads.concat(leadsComScore);

    if (b < CONFIG.bairros.length - 1) {
      console.log('\n  Aguardando ' + (CONFIG.pauseEntreBuscas / 1000) + 's...');
      await new Promise(function(r) { setTimeout(r, CONFIG.pauseEntreBuscas); });
    }
  }

  // Remover duplicatas pelo nome
  const leadsUnicos = todosLeads.filter(function(lead, index, self) {
    return index === self.findIndex(function(l) { return l.nome === lead.nome; });
  });

  // Ordenar por prioridade
  const ordemPrioridade = { alta: 0, media: 1, baixa: 2 };
  leadsUnicos.sort(function(a, b) {
    return ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
  });

  // Salvar JSON
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(leadsUnicos, null, 2));

  // Salvar CSV
  const csvHeader = 'Nome,Telefone,Site,Avaliacao,N Avaliacoes,Endereco,Score,Prioridade,Problemas,Data\n';
  const csvRows = leadsUnicos.map(function(l) {
    return '"' + l.nome + '","' + l.telefone + '","' + l.site + '","' + l.avaliacao + '","' + l.numAvaliacoes + '","' + l.endereco + '",' + l.scoreRapido + ',"' + l.prioridade + '","' + (l.problemas || []).join('; ') + '","' + l.dataColeta + '"';
  }).join('\n');
  fs.writeFileSync('leads.csv', csvHeader + csvRows);

  const alta = leadsUnicos.filter(function(l) { return l.prioridade === 'alta'; }).length;
  const media = leadsUnicos.filter(function(l) { return l.prioridade === 'media'; }).length;

  console.log('\n\n===========================================');
  console.log('           RESUMO DA COLETA               ');
  console.log('===========================================');
  console.log('Total de leads: ' + leadsUnicos.length);
  console.log('Prioridade ALTA: ' + alta);
  console.log('Prioridade MEDIA: ' + media);
  console.log('Arquivos: leads.json + leads.csv');
  console.log('===========================================\n');

  console.log('TOP 5 LEADS PRIORITARIOS:\n');
  leadsUnicos.slice(0, 5).forEach(function(l, i) {
    console.log((i + 1) + '. ' + l.nome);
    console.log('   Endereco: ' + l.endereco);
    console.log('   Telefone: ' + (l.telefone || 'N/A'));
    console.log('   Avaliacao: ' + l.avaliacao + ' (' + l.numAvaliacoes + ' avaliacoes)');
    console.log('   Problemas: ' + (l.problemas || []).join(', '));
    console.log('');
  });
}

main().catch(console.error);

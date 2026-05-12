const fs = require('fs');
const { execSync } = require('child_process');

try {
  // run marked to get html
  execSync('npx -y marked --input "C:\\Users\\digui\\.gemini\\antigravity\\brain\\34523f2c-6f2b-48c2-bd29-f1e1be3c6193\\artifacts\\estrategia_grupo.md" --output "c:\\Users\\digui\\Documents\\localrise-brain\\raw_grupo.html"');

  let html = fs.readFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\raw_grupo.html', 'utf8');

  let fullHtml = `<html>
  <head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    h3 { color: #16a085; }
    p { margin: 10px 0; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    ul { margin-bottom: 15px; }
    blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; font-style: italic; }
  </style>
  </head>
  <body>
  ${html}
  </body>
  </html>`;

  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\temp_grupo.html', fullHtml, 'utf8');

  const psScript = `
  $htmlPath = "c:\\Users\\digui\\Documents\\localrise-brain\\temp_grupo.html"
  $docPath = "c:\\Users\\digui\\Documents\\localrise-brain\\Relatorio_Estrategico_Grupo.docx"
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  try {
    if (Test-Path $docPath) { Remove-Item $docPath -Force }
    $doc = $word.Documents.Open($htmlPath)
    $doc.SaveAs([ref]$docPath, [ref]16)
    $doc.Close()
  } finally {
    $word.Quit()
  }
  `;
  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\convert_grupo.ps1', psScript, 'utf8');

} catch (e) {
  console.error(e);
}

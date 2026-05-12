const fs = require('fs');
const { execSync } = require('child_process');

try {
  // run marked to get html
  execSync('npx -y marked --input "C:\\Users\\digui\\.gemini\\antigravity\\brain\\34523f2c-6f2b-48c2-bd29-f1e1be3c6193\\artifacts\\Diagnostico_Grupo.md" --output "c:\\Users\\digui\\Documents\\localrise-brain\\raw_diagnostico.html"');

  let html = fs.readFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\raw_diagnostico.html', 'utf8');

  let fullHtml = `<html>
  <head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 25px; }
    h3 { color: #16a085; }
    p { margin: 10px 0; }
    ul { margin-bottom: 15px; }
    li { margin-bottom: 6px; }
    blockquote { border-left: 4px solid #e74c3c; background-color: #fceceb; padding: 10px; font-weight: bold; }
    strong { color: #2c3e50; }
  </style>
  </head>
  <body>
  ${html}
  </body>
  </html>`;

  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\temp_diagnostico.html', fullHtml, 'utf8');

  const psScript = `
  $htmlPath = "c:\\Users\\digui\\Documents\\localrise-brain\\temp_diagnostico.html"
  $docPath = "c:\\Users\\digui\\Documents\\localrise-brain\\Diagnostico_LocalRise_Restaurantes.docx"
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
  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\convert_diagnostico.ps1', psScript, 'utf8');

} catch (e) {
  console.error(e);
}

const fs = require('fs');
const { execSync } = require('child_process');

try {
  // run marked to get html
  execSync('npx -y marked --input "C:\\Users\\digui\\.gemini\\antigravity\\brain\\34523f2c-6f2b-48c2-bd29-f1e1be3c6193\\artifacts\\dossie_estrategico_banchetti_grill.md" --output "c:\\Users\\digui\\Documents\\localrise-brain\\raw.html"');

  let html = fs.readFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\raw.html', 'utf8');

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

  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\temp_dossie.html', fullHtml, 'utf8');
  console.log('HTML created successfully.');

  const psScript = `
  $htmlPath = "c:\\Users\\digui\\Documents\\localrise-brain\\temp_dossie.html"
  $docPath = "c:\\Users\\digui\\Documents\\localrise-brain\\Dossie_Estrategico_Banchetti_Grill.docx"
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  try {
    # Delete old file so Word doesnt prompt
    if (Test-Path $docPath) { Remove-Item $docPath -Force }
    $doc = $word.Documents.Open($htmlPath)
    $doc.SaveAs([ref]$docPath, [ref]16)
    $doc.Close()
  } finally {
    $word.Quit()
  }
  `;
  fs.writeFileSync('c:\\Users\\digui\\Documents\\localrise-brain\\convert2.ps1', psScript, 'utf8');
  console.log('PS1 script created successfully.');

} catch (e) {
  console.error(e);
}

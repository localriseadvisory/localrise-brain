
  $htmlPath = "c:\Users\digui\Documents\localrise-brain\temp_dossie.html"
  $docPath = "c:\Users\digui\Documents\localrise-brain\Dossie_Estrategico_Banchetti_Grill.docx"
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
  
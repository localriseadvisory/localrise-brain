
  $htmlPath = "c:\Users\digui\Documents\localrise-brain\temp_diagnostico.html"
  $docPath = "c:\Users\digui\Documents\localrise-brain\Diagnostico_LocalRise_Restaurantes.docx"
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
  
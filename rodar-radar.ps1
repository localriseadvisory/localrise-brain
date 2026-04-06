# RADAR DE MARKETING - LOCALRISE ADVISORY
# Roda todo dia as 8h via Agendador de Tarefas do Windows

$projectDir = 'C:\Users\digui\Documents\localrise-brain\Claude\Claude Local RIse'
$outputBase = "$projectDir\conteudo\radar-marketing"
$data = Get-Date -Format 'yyyy-MM-dd'
$logFile = 'C:\Users\digui\Documents\localrise-brain\radar-log.txt'

function Log($msg) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "$timestamp - $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

# CONFIGURACOES DE EMAIL
$smtpServer = 'smtp.gmail.com'
$smtpPort = 587
$emailOrigem = 'contato@localriseadvisory.com'
$senhaApp = 'zxgg fqfx ahrv iuqr'
$destinatarios = @('contato@localriseadvisory.com', 'lezesdzn@gmail.com')

# FASE 1 - RODAR O RADAR
Log "Iniciando Radar de Marketing - $data"
Set-Location $projectDir

try {
    $promptFile = "$projectDir\.claude\commands\radar-marketing.md"
    $lines = Get-Content $promptFile -Encoding UTF8
    $found = 0
    $promptContent = ($lines | ForEach-Object {
        if ($_ -eq '---') { $found++; return }
        if ($found -ge 2) { $_ }
    }) -join "`n"
    $output = & 'C:\Users\digui\AppData\Roaming\npm\claude.cmd' --dangerously-skip-permissions -p $promptContent 2>&1
    $output | Add-Content -Path $logFile -Encoding UTF8
    Log 'Radar executado com sucesso.'
}
catch {
    Log "ERRO ao executar o radar: $_"
    exit 1
}

# FASE 2 - VERIFICAR ARQUIVOS GERADOS
$resumoPath = "$outputBase\resumos\resumo-executivo-$data.md"
$pautaPath = "$outputBase\pautas-designer\pauta-designer-$data.md"
$carrosseisPath = "$outputBase\carrosseis\ideias-carrosseis-$data.md"
$diarioPath = "$outputBase\diario\radar-marketing-$data.md"

$resumo = if (Test-Path $resumoPath) { Get-Content $resumoPath -Raw -Encoding UTF8 } else { 'Arquivo nao gerado.' }
$pauta = if (Test-Path $pautaPath) { Get-Content $pautaPath  -Raw -Encoding UTF8 } else { 'Arquivo nao gerado.' }

# FASE 3 - ENVIAR EMAIL
Log "Enviando email para: $($destinatarios -join ', ')"

$credential = New-Object System.Management.Automation.PSCredential(
    $emailOrigem,
    (ConvertTo-SecureString $senhaApp -AsPlainText -Force)
)

$subject = "Radar de Marketing LocalRise - $data"
$body = "Bom dia!`r`n`r`nO Radar foi executado automaticamente hoje ($data).`r`n`r`n" +
"=== RESUMO EXECUTIVO ===`r`n`r`n" + $resumo +
"`r`n`r`n=== PAUTA PARA O DESIGNER ===`r`n`r`n" + $pauta +
"`r`n`r`nSistema automatico LocalRise Advisory"

$anexos = @()
if (Test-Path $resumoPath) { $anexos += $resumoPath }
if (Test-Path $pautaPath) { $anexos += $pautaPath }
if (Test-Path $carrosseisPath) { $anexos += $carrosseisPath }
if (Test-Path $diarioPath) { $anexos += $diarioPath }

try {
    $mailParams = @{
        From       = $emailOrigem
        To         = $destinatarios
        Subject    = $subject
        Body       = $body
        SmtpServer = $smtpServer
        Port       = $smtpPort
        UseSsl     = $true
        Credential = $credential
        Encoding   = [System.Text.Encoding]::UTF8
    }
    if ($anexos.Count -gt 0) { $mailParams.Attachments = $anexos }

    Send-MailMessage @mailParams
    Log "Email enviado com sucesso. Anexos: $($anexos.Count)"
}
catch {
    Log "ERRO ao enviar email: $_"
    exit 1
}

Log 'Pipeline concluido.'
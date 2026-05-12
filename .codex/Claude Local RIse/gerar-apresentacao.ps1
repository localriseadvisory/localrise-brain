$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.Encoding]::UTF8

$base = "c:\Users\digui\Documents\Claude\Claude Local RIse"
$out  = Join-Path $base "Apresentacao-LocalRise-Advisory.pptx"
$logo = Join-Path $base "assents\logo Local Rise Principal.png"

function RGB($r,$g,$b) { [long]($r + $g*256 + $b*65536) }

$BG=$(RGB 10 10 10); $G850=$(RGB 22 22 22); $G800=$(RGB 26 26 26)
$G700=$(RGB 37 37 37); $G600=$(RGB 51 51 51); $G500=$(RGB 85 85 85)
$G400=$(RGB 136 136 136); $G300=$(RGB 170 170 170); $G200=$(RGB 204 204 204)
$W=$(RGB 255 255 255); $RD=$(RGB 227 27 35); $GR=$(RGB 34 197 94)

$FN="Segoe UI"; $SW=960; $SH=540; $ML=56; $CW=848; $logoRatio=0.75

Write-Host "Iniciando PowerPoint..." -ForegroundColor Cyan
$app = New-Object -ComObject PowerPoint.Application
$app.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $app.Presentations.Add()
$pres.PageSetup.SlideWidth = $SW
$pres.PageSetup.SlideHeight = $SH

function New-Slide {
    $s = $pres.Slides.Add($pres.Slides.Count + 1, 12)
    $s.FollowMasterBackground = 0
    $s.Background.Fill.Solid()
    $s.Background.Fill.ForeColor.RGB = $BG
    return $s
}

function Add-Text($s,$l,$t,$w,$h,$txt,$sz,$c,$b,$a) {
    $tb = $s.Shapes.AddTextbox(1,$l,$t,$w,$h)
    $tf = $tb.TextFrame
    $tf.TextRange.Text = $txt
    $tf.TextRange.Font.Name = $FN
    $tf.TextRange.Font.Size = $sz
    $tf.TextRange.Font.Color.RGB = $c
    $tf.TextRange.Font.Bold = $(if($b){-1}else{0})
    $tf.TextRange.ParagraphFormat.Alignment = $a
    $tf.WordWrap = -1; $tf.AutoSize = 0
    $tb.Line.Visible = 0; $tb.Fill.Visible = 0
    return $tb
}

function Add-RRect($s,$l,$t,$w,$h,$fill,$brd) {
    $sh = $s.Shapes.AddShape(5,$l,$t,$w,$h)
    try { $sh.Adjustments.Item(1)=0.04 } catch {}
    if($fill -ge 0){$sh.Fill.Solid();$sh.Fill.ForeColor.RGB=$fill}else{$sh.Fill.Visible=0}
    if($brd -ge 0){$sh.Line.ForeColor.RGB=$brd;$sh.Line.Weight=1}else{$sh.Line.Visible=0}
    return $sh
}

function Add-Rect($s,$l,$t,$w,$h,$fill) {
    $sh=$s.Shapes.AddShape(1,$l,$t,$w,$h); $sh.Fill.Solid(); $sh.Fill.ForeColor.RGB=$fill; $sh.Line.Visible=0; return $sh
}

function Add-Bar($s,$l,$t,$w,$pct,$col) {
    Add-Rect $s $l $t $w 6 $G700 | Out-Null
    $fw=[math]::Max(2,$w*$pct/100); Add-Rect $s $l $t $fw 6 $col | Out-Null
}

function Add-SlideFooter($s,$pg) {
    $ln=$s.Shapes.AddLine($ML,($SH-36),($SW-$ML),($SH-36))
    $ln.Line.ForeColor.RGB=$RD; $ln.Line.Weight=0.5; $ln.Line.Transparency=0.7
    Add-Text $s $ML ($SH-30) 200 14 "LocalRise Advisory" 7 $G500 $true 1 | Out-Null
    Add-Text $s ($SW-$ML-150) ($SH-30) 150 14 "Confidencial - p. $pg" 7 $G500 $false 3 | Out-Null
}

function Add-Logo($s,$centerX,$t,$h) {
    if (Test-Path $logo) {
        $imgW = [math]::Round($h * $logoRatio)
        $imgL = $centerX - ($imgW / 2)
        $img = $s.Shapes.AddPicture($logo, 0, -1, $imgL, $t, $imgW, $h)
        $img.LockAspectRatio = -1
        return $img
    }
}

function Add-Arc($s,$l,$t,$sz) {
    $a=$s.Shapes.AddShape(9,$l,$t,$sz,$sz)
    $a.Fill.Visible=0; $a.Line.ForeColor.RGB=$RD; $a.Line.Weight=40; $a.Line.Transparency=0.92
}

function Add-Section($s,$txt,$t) { Add-Text $s $ML $t $CW 16 $txt.ToUpper() 9 $RD $true 1 | Out-Null }

function Add-KPI($s,$l,$t,$w,$lab,$val,$note,$vc) {
    Add-RRect $s $l $t $w 72 $G850 $G700 | Out-Null
    Add-Text $s ($l+8) ($t+8) ($w-16) 12 $lab 7 $G500 $true 2 | Out-Null
    Add-Text $s ($l+8) ($t+24) ($w-16) 30 $val 24 $vc $true 2 | Out-Null
    Add-Text $s ($l+8) ($t+56) ($w-16) 12 $note 8 $G500 $false 2 | Out-Null
}

function Add-Callout($s,$y,$h,$title,$body,$col) {
    $bg2 = Add-RRect $s $ML $y $CW $h (-1) (-1)
    $bg2.Fill.Solid(); $bg2.Fill.ForeColor.RGB=$col; $bg2.Fill.Transparency=0.94; $bg2.Line.Visible=0
    Add-Rect $s $ML $y 3 $h $col | Out-Null
    Add-Text $s ($ML+14) ($y+4) ($CW-28) 14 $title 11 $W $true 1 | Out-Null
    Add-Text $s ($ML+14) ($y+22) ($CW-28) ($h-26) $body 9 $G300 $false 1 | Out-Null
}

# =========== SLIDE 1: CAPA ===========
Write-Host "  Slide 1/13: Capa" -ForegroundColor Yellow
$s = New-Slide
Add-Arc $s ($SW-160) (-60) 260
Add-Arc $s (-60) ($SH-160) 200

$bd = Add-RRect $s (($SW-190)/2) 28 190 22 (-1) $G600
$bd.TextFrame.TextRange.Text = "DOCUMENTO CONFIDENCIAL"
$bd.TextFrame.TextRange.Font.Name=$FN; $bd.TextFrame.TextRange.Font.Size=7
$bd.TextFrame.TextRange.Font.Bold=-1; $bd.TextFrame.TextRange.Font.Color.RGB=$G400
$bd.TextFrame.TextRange.ParagraphFormat.Alignment=2; $bd.TextFrame.VerticalAnchor=3

Add-Logo $s ($SW/2) 64 48 | Out-Null

Add-Text $s $ML 140 $CW 40 "Diagnostico de" 36 $W $true 2 | Out-Null
Add-Text $s $ML 182 $CW 48 "Aceleracao Digital" 40 $RD $true 2 | Out-Null
Add-Text $s ($ML+80) 245 ($CW-160) 36 "Analise estrategica de presenca digital e oportunidades de crescimento para suas churrascarias" 12 $G400 $false 2 | Out-Null

$bw=210; $gap=20; $sx=($SW-$bw*2-$gap)/2
$c1=Add-RRect $s $sx 310 $bw 34 $G800 $G700
$c1.TextFrame.TextRange.Text="Terra do Churrasco"
$c1.TextFrame.TextRange.Font.Name=$FN; $c1.TextFrame.TextRange.Font.Size=11
$c1.TextFrame.TextRange.Font.Bold=-1; $c1.TextFrame.TextRange.Font.Color.RGB=$G200
$c1.TextFrame.TextRange.ParagraphFormat.Alignment=2; $c1.TextFrame.VerticalAnchor=3

$c2=Add-RRect $s ($sx+$bw+$gap) 310 $bw 34 $G800 $G700
$c2.TextFrame.TextRange.Text="Estancia Churrascaria"
$c2.TextFrame.TextRange.Font.Name=$FN; $c2.TextFrame.TextRange.Font.Size=11
$c2.TextFrame.TextRange.Font.Bold=-1; $c2.TextFrame.TextRange.Font.Color.RGB=$G200
$c2.TextFrame.TextRange.ParagraphFormat.Alignment=2; $c2.TextFrame.VerticalAnchor=3

$ph=Add-RRect $s (($SW-280)/2) 365 280 26 (-1) $RD
$ph.Fill.Solid(); $ph.Fill.ForeColor.RGB=$RD; $ph.Fill.Transparency=0.88
$ph.Line.ForeColor.RGB=$RD; $ph.Line.Weight=1
$ph.TextFrame.TextRange.Text="FASE 1  -  TRAFEGO ORGANICO"
$ph.TextFrame.TextRange.Font.Name=$FN; $ph.TextFrame.TextRange.Font.Size=8
$ph.TextFrame.TextRange.Font.Bold=-1; $ph.TextFrame.TextRange.Font.Color.RGB=$RD
$ph.TextFrame.TextRange.ParagraphFormat.Alignment=2; $ph.TextFrame.VerticalAnchor=3

Add-Text $s $ML 405 $CW 18 "Porto Alegre, RS   -   Abril 2026   -   Confidencial" 9 $G500 $false 2 | Out-Null
Add-SlideFooter $s 1

# =========== SLIDE 2: SUMARIO ===========
Write-Host "  Slide 2/13: Sumario Executivo" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-120) (-50) 200
Add-Section $s "Sumario Executivo" 36
Add-Text $s $ML 56 $CW 36 "Seus restaurantes perdem" 28 $W $true 1 | Out-Null
Add-Text $s $ML 88 $CW 36 "faturamento digital constantemente" 28 $RD $true 1 | Out-Null
Add-Text $s $ML 128 $CW 24 'Clientes que buscam "churrascaria Porto Alegre" no Google nao encontram seus restaurantes - ou encontram e nao confiam.' 11 $G400 $false 1 | Out-Null

$by=172; $bw2=560
Add-Text $s $ML $by 300 14 "Terra do Churrasco" 10 $G300 $true 1 | Out-Null
Add-Text $s ($ML+$bw2-50) $by 50 14 "50/100" 10 $RD $true 3 | Out-Null
Add-Bar $s $ML ($by+16) $bw2 50 $RD; $by+=34
Add-Text $s $ML $by 300 14 "Estancia Churrascaria" 10 $G300 $true 1 | Out-Null
Add-Text $s ($ML+$bw2-50) $by 50 14 "16/100" 10 $RD $true 3 | Out-Null
Add-Bar $s $ML ($by+16) $bw2 16 $RD; $by+=34
Add-Text $s $ML $by 300 14 "Benchmark Top 3 (Barranco, Komka)" 10 $G300 $true 1 | Out-Null
Add-Text $s ($ML+$bw2-50) $by 50 14 "85/100" 10 $GR $true 3 | Out-Null
Add-Bar $s $ML ($by+16) $bw2 85 $GR

Add-RRect $s 660 172 250 95 $G850 $G700 | Out-Null
Add-Text $s 672 177 226 14 "INSIGHT" 7 $RD $true 1 | Out-Null
Add-Text $s 672 195 226 60 "A distancia entre seus restaurantes e o Top 3 e puramente infraestrutura digital: site, Google Posts e gestao de reviews." 9 $G300 $false 1 | Out-Null

Add-Callout $s 310 70 "Foco: Fase 1 - Trafego Organico" "Neste primeiro momento, o foco e estruturar a base digital dos restaurantes para garantir presenca forte, profissional e convertendo clientes atraves do Google e canais organicos." $RD
Add-SlideFooter $s 2

# =========== SLIDE 3: FOTOGRAFIA ===========
Write-Host "  Slide 3/13: Fotografia Atual" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s (-50) ($SH-140) 180
Add-Section $s "Fotografia Atual" 36
Add-Text $s $ML 56 $CW 36 "Dois restaurantes, dois diagnosticos" 28 $W $true 1 | Out-Null

$cw2=410; $ch2=340; $gap2=28; $cx=$ML; $cy=100
Add-RRect $s $cx $cy $cw2 $ch2 $G850 $G700 | Out-Null
Add-Text $s ($cx+16) ($cy+12) ($cw2-32) 14 "TERRA DO CHURRASCO" 8 $RD $true 1 | Out-Null
Add-Text $s ($cx+16) ($cy+30) ($cw2-32) 18 '"Tem marca. Nao tem maquina."' 13 $W $true 1 | Out-Null

$dims=@('Marca','GBP','Instagram','Site/SEO','Conversao','Reputacao')
$pcts=@(80,50,85,0,20,65)
$ly=$cy+56
for($i=0;$i -lt 6;$i++){
    Add-Text $s ($cx+16) $ly (($cw2/2)-20) 12 $dims[$i] 9 $G300 $false 1 | Out-Null
    Add-Text $s ($cx+$cw2-60) $ly 44 12 "$($pcts[$i])%" 9 $RD $true 3 | Out-Null
    Add-Bar $s ($cx+16) ($ly+14) ($cw2-32) $pcts[$i] $RD; $ly+=30
}
$sc=Add-RRect $s ($cx+16) ($ly+6) ($cw2-32) 26 (-1) $G700
$sc.TextFrame.TextRange.Text="NOTA GERAL: 50/100"
$sc.TextFrame.TextRange.Font.Name=$FN; $sc.TextFrame.TextRange.Font.Size=10
$sc.TextFrame.TextRange.Font.Bold=-1; $sc.TextFrame.TextRange.Font.Color.RGB=$RD
$sc.TextFrame.TextRange.ParagraphFormat.Alignment=2; $sc.TextFrame.VerticalAnchor=3

$cx2=$cx+$cw2+$gap2
Add-RRect $s $cx2 $cy $cw2 $ch2 $G850 $G700 | Out-Null
Add-Text $s ($cx2+16) ($cy+12) ($cw2-32) 14 "ESTANCIA CHURRASCARIA" 8 $RD $true 1 | Out-Null
Add-Text $s ($cx2+16) ($cy+30) ($cw2-32) 18 '"Presenca digital inexistente."' 13 $W $true 1 | Out-Null
$pcts2=@(30,20,15,0,10,20); $ly=$cy+56
for($i=0;$i -lt 6;$i++){
    Add-Text $s ($cx2+16) $ly (($cw2/2)-20) 12 $dims[$i] 9 $G300 $false 1 | Out-Null
    Add-Text $s ($cx2+$cw2-60) $ly 44 12 "$($pcts2[$i])%" 9 $RD $true 3 | Out-Null
    Add-Bar $s ($cx2+16) ($ly+14) ($cw2-32) $pcts2[$i] $RD; $ly+=30
}
$sc2=Add-RRect $s ($cx2+16) ($ly+6) ($cw2-32) 26 (-1) $G700
$sc2.TextFrame.TextRange.Text="NOTA GERAL: 16/100"
$sc2.TextFrame.TextRange.Font.Name=$FN; $sc2.TextFrame.TextRange.Font.Size=10
$sc2.TextFrame.TextRange.Font.Bold=-1; $sc2.TextFrame.TextRange.Font.Color.RGB=$RD
$sc2.TextFrame.TextRange.ParagraphFormat.Alignment=2; $sc2.TextFrame.VerticalAnchor=3
Add-SlideFooter $s 3

# =========== SLIDE 4: DIAG TERRA ===========
Write-Host "  Slide 4/13: Diagnostico Terra" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-100) (-40) 180
Add-Section $s "Diagnostico - Terra do Churrasco" 36
Add-Text $s $ML 56 $CW 36 "5 pontos criticos identificados" 28 $RD $true 1 | Out-Null
Add-Text $s $ML 96 $CW 18 "Ativos fortes (42K seguidores, 943 reviews 4.6) - sem estrutura digital para capitalizar." 11 $G400 $false 1 | Out-Null
$kw=266; $ky=126
Add-KPI $s $ML $ky $kw "SEGUIDORES IG" "42K" "base excepcional" $W
Add-KPI $s ($ML+$kw+10) $ky $kw "AVALIACOES GOOGLE" "943" "4.6 - acima da media" $W
Add-KPI $s ($ML+($kw+10)*2) $ky $kw "RESPOSTAS REVIEWS" "0%" "reputacao sem gestao" $RD
$ty=212; Add-Rect $s $ML $ty $CW 2 $RD | Out-Null
Add-Text $s $ML ($ty+4) 30 26 "#" 8 $G500 $true 2 | Out-Null
Add-Text $s ($ML+36) ($ty+4) 560 26 "PONTO CRITICO" 8 $G500 $true 1 | Out-Null
Add-Text $s ($ML+620) ($ty+4) 200 26 "IMPACTO" 8 $G500 $true 2 | Out-Null
$ty+=30
$errs=@(@('1','Sem site - zero presenca organica no Google','Invisibilidade'),@('2','Zero respostas a 943 avaliacoes','Confianca reduzida'),@('3','Descricao GBP ausente - nao indexa keywords','SEO comprometido'),@('4','Zero Google Posts - promocoes invisiveis','Engajamento perdido'),@('5','Instagram sem funil - 42K sem conversao','Potencial desperdicado'))
foreach($e in $errs){
    $nc=$RD;$nb=$(RGB 30 8 9);if([int]$e[0]-gt 3){$nc=$(RGB 234 179 8);$nb=$(RGB 30 24 4)}
    $tag=Add-RRect $s ($ML+4) ($ty+4) 22 16 $nb (-1)
    $tag.TextFrame.TextRange.Text=$e[0]; $tag.TextFrame.TextRange.Font.Name=$FN; $tag.TextFrame.TextRange.Font.Size=8
    $tag.TextFrame.TextRange.Font.Bold=-1; $tag.TextFrame.TextRange.Font.Color.RGB=$nc
    $tag.TextFrame.TextRange.ParagraphFormat.Alignment=2; $tag.TextFrame.VerticalAnchor=3
    Add-Text $s ($ML+36) $ty 560 26 $e[1] 10 $G300 $false 1 | Out-Null
    Add-Text $s ($ML+620) $ty 200 26 $e[2] 9 $nc $true 2 | Out-Null
    Add-Rect $s $ML ($ty+26) $CW 1 $G700 | Out-Null; $ty+=27
}
Add-Callout $s ($ty+6) 52 "O Terra e uma Ferrari sem combustivel." "42K seguidores, 943 reviews 4.6, Entrecot como destaque, Espaco Kids - ativos unicos. Falta a infraestrutura digital." $RD
Add-SlideFooter $s 4

# =========== SLIDE 5: DIAG ESTANCIA ===========
Write-Host "  Slide 5/13: Diagnostico Estancia" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s (-50) ($SH-120) 160
Add-Section $s "Diagnostico - Estancia Churrascaria" 36
Add-Text $s $ML 56 $CW 36 "6 pontos criticos - acao necessaria" 28 $RD $true 1 | Out-Null
Add-Text $s $ML 96 $CW 18 "Presenca digital inexistente. Cada dia sem posicionamento fortalece a concorrencia." 11 $G400 $false 1 | Out-Null
$ky=126
Add-KPI $s $ML $ky $kw "GOOGLE REVIEWS" "21" "minimo credivel: 50" $RD
Add-KPI $s ($ML+$kw+10) $ky $kw "NOTA GOOGLE" "3.6" "abaixo do limite (4.0)" $RD
Add-KPI $s ($ML+($kw+10)*2) $ky $kw "POSTS INSTAGRAM" "15" "perfil inativo" $RD
$ty=212; Add-Rect $s $ML $ty $CW 2 $RD | Out-Null
Add-Text $s $ML ($ty+4) 30 26 "#" 8 $G500 $true 2 | Out-Null
Add-Text $s ($ML+36) ($ty+4) 560 26 "PONTO CRITICO" 8 $G500 $true 1 | Out-Null
Add-Text $s ($ML+620) ($ty+4) 200 26 "IMPACTO" 8 $G500 $true 2 | Out-Null
$ty+=30
$errs2=@(@('1','GBP nao reivindicado - zero controle do perfil','Vulneravel'),@('2','Telefone ausente - impossivel ligar','Zero conversao'),@('3','Sem site - zero presenca organica','Invisibilidade'),@('4','Nota 3.6 / 21 reviews - baixa credibilidade','Perda de cliques'),@('5','Instagram inativo - 15 posts desperdicados','Potencial perdido'),@('6','Zero fotos profissionais','Baixa atratividade'))
foreach($e in $errs2){
    $nc=$RD;$nb=$(RGB 30 8 9);if([int]$e[0]-gt 5){$nc=$(RGB 234 179 8);$nb=$(RGB 30 24 4)}
    $tag=Add-RRect $s ($ML+4) ($ty+4) 22 16 $nb (-1)
    $tag.TextFrame.TextRange.Text=$e[0]; $tag.TextFrame.TextRange.Font.Name=$FN; $tag.TextFrame.TextRange.Font.Size=8
    $tag.TextFrame.TextRange.Font.Bold=-1; $tag.TextFrame.TextRange.Font.Color.RGB=$nc
    $tag.TextFrame.TextRange.ParagraphFormat.Alignment=2; $tag.TextFrame.VerticalAnchor=3
    Add-Text $s ($ML+36) $ty 560 26 $e[1] 10 $G300 $false 1 | Out-Null
    Add-Text $s ($ML+620) $ty 200 26 $e[2] 9 $nc $true 2 | Out-Null
    Add-Rect $s $ML ($ty+26) $CW 1 $G700 | Out-Null; $ty+=27
}
Add-Callout $s ($ty+4) 46 'O unico botao funcional no Google e "Como chegar".' "Nao da para ligar, ver cardapio, reservar ou acessar o site." $RD
Add-SlideFooter $s 5

# =========== SLIDE 6: COMPETITIVA ===========
Write-Host "  Slide 6/13: Analise Competitiva" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-120) (-50) 200
Add-Section $s "Analise Competitiva" 36
Add-Text $s $ML 56 $CW 36 "Os 3 primeiros do Maps capturam" 28 $W $true 1 | Out-Null
Add-Text $s $ML 88 $CW 36 "75% dos cliques" 28 $RD $true 1 | Out-Null
Add-Text $s $ML 128 $CW 18 "Enquanto seus restaurantes ficam fora do radar, a concorrencia consolida posicao." 11 $G400 $false 1 | Out-Null

$cols=@(220,80,100,80,100,268); $ty=158
Add-Rect $s $ML $ty $CW 2 $RD | Out-Null
$hds=@('RESTAURANTE','NOTA','REVIEWS','SITE','GBP','PACK LOCAL'); $hx=$ML
for($i=0;$i -lt 6;$i++){
    $ha=2; if($i -eq 0){$ha=1}
    Add-Text $s $hx ($ty+4) $cols[$i] 26 $hds[$i] 8 $G500 $true $ha | Out-Null; $hx+=$cols[$i]
}
$ty+=30

$chk=[string][char]0x2713; $cross=[string][char]0x2715
$tdata=@(@('Barranco','4.5','5.000+',$chk,$chk,'#1'),@('Komka','4.7','3.000+',$chk,$chk,'#2'),@('Giovanaz','4.6','2.000+',$chk,$chk,'#3'))
foreach($row in $tdata){
    $rx=$ML
    Add-Text $s $rx $ty $cols[0] 28 $row[0] 10 $W $true 1 | Out-Null; $rx+=$cols[0]
    Add-Text $s $rx $ty $cols[1] 28 $row[1] 10 $G300 $false 2 | Out-Null; $rx+=$cols[1]
    Add-Text $s $rx $ty $cols[2] 28 $row[2] 10 $G300 $false 2 | Out-Null; $rx+=$cols[2]
    Add-Text $s $rx $ty $cols[3] 28 $row[3] 10 $GR $true 2 | Out-Null; $rx+=$cols[3]
    Add-Text $s $rx $ty $cols[4] 28 $row[4] 10 $GR $true 2 | Out-Null; $rx+=$cols[4]
    Add-Text $s $rx $ty $cols[5] 28 $row[5] 10 $GR $true 2 | Out-Null
    Add-Rect $s $ML ($ty+28) $CW 1 $G700 | Out-Null; $ty+=30
}
Add-Rect $s $ML $ty $CW 2 $G600 | Out-Null; $ty+=6
$cdata=@(@('Terra do Churrasco','4.6','943',$cross,$cross,'4-6'),@('Estancia Churrascaria','3.6','21',$cross,$cross,'Fora'))
foreach($row in $cdata){
    $rx=$ML
    Add-Text $s $rx $ty $cols[0] 28 $row[0] 10 $G300 $true 1 | Out-Null; $rx+=$cols[0]
    Add-Text $s $rx $ty $cols[1] 28 $row[1] 10 $G400 $false 2 | Out-Null; $rx+=$cols[1]
    Add-Text $s $rx $ty $cols[2] 28 $row[2] 10 $G400 $false 2 | Out-Null; $rx+=$cols[2]
    Add-Text $s $rx $ty $cols[3] 28 $row[3] 10 $RD $true 2 | Out-Null; $rx+=$cols[3]
    Add-Text $s $rx $ty $cols[4] 28 $row[4] 10 $RD $true 2 | Out-Null; $rx+=$cols[4]
    Add-Text $s $rx $ty $cols[5] 28 $row[5] 10 $G500 $false 2 | Out-Null
    Add-Rect $s $ML ($ty+28) $CW 1 $G700 | Out-Null; $ty+=30
}
Add-Callout $s ($ty+8) 52 "O Terra tem nota 4.6 - igual ao Giovanaz (#3)." "A diferenca entre a posicao atual e o Top 3 e infraestrutura digital: site otimizado, Google Posts e gestao ativa de reviews." $GR
Add-SlideFooter $s 6

# =========== SLIDE 7: OPORTUNIDADE ===========
Write-Host "  Slide 7/13: A Oportunidade" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s (-50) ($SH-140) 180
Add-Section $s "A Oportunidade" 36
Add-Text $s $ML 56 $CW 36 "Potencial de crescimento:" 28 $W $true 1 | Out-Null
Add-Text $s $ML 88 $CW 36 "presenca digital estruturada" 28 $RD $true 1 | Out-Null
Add-RRect $s $ML 140 $CW 65 $G850 $G700 | Out-Null
Add-Text $s ($ML+20) 145 ($CW-40) 55 "Com o potencial atual dos dois restaurantes, existe uma oportunidade clara de aumento significativo na prospeccao de clientes e crescimento da presenca digital." 13 $W $false 1 | Out-Null

$cw3=410; $gap3=28; $cy3=225
Add-RRect $s $ML $cy3 $cw3 200 $G850 $G700 | Out-Null
Add-Text $s ($ML+16) ($cy3+10) ($cw3-32) 14 "TERRA DO CHURRASCO" 8 $RD $true 1 | Out-Null
Add-Text $s ($ML+16) ($cy3+28) ($cw3-32) 14 "Necessidades Estrategicas" 12 $W $true 1 | Out-Null
Add-Text $s ($ML+16) ($cy3+50) ($cw3-32) 150 "Site profissional com SEO local`nOtimizacao completa do GBP`nGestao ativa de 943 avaliacoes`nFunil de conversao no Instagram`nGoogle Posts estrategicos`nInfraestrutura de trafego" 10 $G300 $false 1 | Out-Null

$cx3=$ML+$cw3+$gap3
Add-RRect $s $cx3 $cy3 $cw3 200 $G850 $G700 | Out-Null
Add-Text $s ($cx3+16) ($cy3+10) ($cw3-32) 14 "ESTANCIA CHURRASCARIA" 8 $RD $true 1 | Out-Null
Add-Text $s ($cx3+16) ($cy3+28) ($cw3-32) 14 "Necessidades Estrategicas" 12 $W $true 1 | Out-Null
Add-Text $s ($cx3+16) ($cy3+50) ($cw3-32) 150 "Reivindicacao urgente do GBP`nAdicao de telefone e WhatsApp`nSite profissional do zero`nConstrucao de reputacao online`nReativacao completa do Instagram`nSessao fotografica profissional" 10 $G300 $false 1 | Out-Null
Add-SlideFooter $s 7

# =========== SLIDE 8: ESTRATEGIA ===========
Write-Host "  Slide 8/13: Estrategia" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-100) (-40) 180
Add-Section $s "Fase 1 - Estrategia de Execucao" 36
Add-Text $s $ML 56 $CW 36 "4 pilares de crescimento estruturado" 26 $W $true 1 | Out-Null
Add-Text $s $ML 92 $CW 18 "Reestruturacao e fortalecimento do trafego organico para ambas as unidades." 11 $G400 $false 1 | Out-Null
$pw=410; $pht=155; $pgp=20; $pyl=122
$pillars=@(@("PILAR 1","Fundacao Digital","Reivindicar GBP da Estancia`nSites profissionais com SEO local`nDescricoes estrategicas com keywords`nSessao fotografica profissional"),@("PILAR 2","Reputacao e Conteudo","Responder todas as 964 avaliacoes`nGoogle Posts com promocoes`nQR codes de avaliacao nas mesas`nReativacao Instagram da Estancia"),@("PILAR 3","Trafego e Conversao","Funil Instagram > Site > WhatsApp`nGoogle Analytics + remarketing`nOtimizacao de conversao local`nParcerias com influenciadores"),@("PILAR 4","Escala e Posicionamento","Blog SEO estrategico`nTour virtual 360 no Google Maps`nConsolidacao de autoridade digital`nMonitoramento continuo de KPIs"))
$positions=@(@($ML,$pyl),@(($ML+$pw+$pgp),$pyl),@($ML,($pyl+$pht+14)),@(($ML+$pw+$pgp),($pyl+$pht+14)))
for($i=0;$i -lt 4;$i++){
    $px=$positions[$i][0]; $py2=$positions[$i][1]
    Add-RRect $s $px $py2 $pw $pht $G850 $G700 | Out-Null
    Add-Rect $s $px $py2 $pw 3 $RD | Out-Null
    Add-Text $s ($px+14) ($py2+10) ($pw-28) 12 $pillars[$i][0] 8 $RD $true 1 | Out-Null
    Add-Text $s ($px+14) ($py2+26) ($pw-28) 18 $pillars[$i][1] 14 $W $true 1 | Out-Null
    Add-Text $s ($px+14) ($py2+48) ($pw-28) 100 $pillars[$i][2] 9 $G300 $false 1 | Out-Null
}
Add-SlideFooter $s 8

# =========== SLIDE 9: ESCOPO ===========
Write-Host "  Slide 9/13: Escopo de Servicos" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s (-50) ($SH-120) 160
Add-Section $s "Escopo de Servicos - Fase 1" 36
Add-Text $s $ML 56 $CW 36 "Solucoes integradas para duas unidades" 26 $W $true 1 | Out-Null
$sw3=270; $sg=14; $sy=100; $sh3=380
$svcCols=@(@("GOOGLE BUSINESS PROFILE","Reivindicacao + setup GBP`nOtimizacao SEO local`nGoogle Posts estrategicos`nGestao de reviews`nQ e A proativos`nFotos profissionais`nRelatorio de performance"),@("SITE + SEO","Landing page premium`nCriacao de dominio`nDesign mobile-first`nSchema Markup local`nWhatsApp + reservas`nCardapio digital integrado`nGoogle Analytics + pixels"),@("INSTAGRAM ESTRATEGICO","Branding e identidade visual`n3 posts semanais`nRebranding (se necessario)`nGestao de conteudo estrategico`nCalendario editorial`nStories estrategicos`nRelatorio de performance"))
for($i=0;$i -lt 3;$i++){
    $sx2=$ML+($sw3+$sg)*$i
    Add-RRect $s $sx2 $sy $sw3 $sh3 $G850 $G700 | Out-Null
    Add-Rect $s $sx2 $sy $sw3 3 $RD | Out-Null
    Add-Text $s ($sx2+14) ($sy+12) ($sw3-28) 14 $svcCols[$i][0] 8 $RD $true 1 | Out-Null
    Add-Text $s ($sx2+14) ($sy+34) ($sw3-28) 320 $svcCols[$i][1] 10 $G300 $false 1 | Out-Null
}
Add-SlideFooter $s 9

# =========== SLIDE 10: METRICAS ===========
Write-Host "  Slide 10/13: Metricas" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-100) (-40) 180
Add-Section $s "Metricas Estrategicas" 36
Add-Text $s $ML 56 $CW 36 "Indicadores de posicionamento digital" 26 $W $true 1 | Out-Null
Add-Text $s $ML 92 $CW 18 "KPIs mensuraveis com acompanhamento continuo." 11 $G400 $false 1 | Out-Null
$ty=122; $cW1=400; $cW2=224; $cW3=224
Add-Rect $s $ML $ty $CW 2 $RD | Out-Null
Add-Text $s $ML ($ty+4) $cW1 28 "KPI" 8 $G500 $true 1 | Out-Null
Add-Text $s ($ML+$cW1) ($ty+4) $cW2 28 "SITUACAO ATUAL" 8 $G500 $true 2 | Out-Null
Add-Text $s ($ML+$cW1+$cW2) ($ty+4) $cW3 28 "OBJETIVO ESTRATEGICO" 8 $G500 $true 2 | Out-Null
$ty+=32
$mets=@(@('Reviews Terra','943','1.500+'),@('Nota Terra','4.6','4.7+'),@('Reviews Estancia','21','100+'),@('Nota Estancia','3.6','4.3+'),@('Trafego organico combinado','0','2.000+ visitas'),@('Posicao Terra no Maps','4-6','Top 3'),@('Posicao Estancia (Floresta)','Fora','Top 5'),@('Respostas a reviews','0%','100%'))
foreach($m in $mets){
    Add-Text $s $ML $ty $cW1 28 $m[0] 10 $W $true 1 | Out-Null
    Add-Text $s ($ML+$cW1) $ty $cW2 28 $m[1] 10 $G400 $false 2 | Out-Null
    Add-Text $s ($ML+$cW1+$cW2) $ty $cW3 28 $m[2] 10 $GR $true 2 | Out-Null
    Add-Rect $s $ML ($ty+28) $CW 1 $G700 | Out-Null; $ty+=30
}
Add-SlideFooter $s 10

# =========== SLIDE 11: INVESTIMENTO ===========
Write-Host "  Slide 11/13: Investimento" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s (-50) ($SH-140) 180
Add-Section $s "Investimento" 36
Add-Text $s $ML 56 $CW 36 "Investimento" 28 $W $true 1 | Out-Null
Add-Text $s ($ML+262) 56 300 36 " LocalRise Advisory" 28 $RD $true 1 | Out-Null
Add-Text $s $ML 96 $CW 18 "Escolha o pacote ideal para a construcao da presenca digital dos seus restaurantes." 11 $G400 $false 1 | Out-Null
$pkW=410; $pkG=28; $pkY=128; $pkH=270

$pc=Add-RRect $s $ML $pkY $pkW $pkH $G850 $RD; $pc.Line.Weight=2
$rcBd=Add-RRect $s ($ML+($pkW-120)/2) ($pkY-10) 120 20 $RD (-1)
$rcBd.TextFrame.TextRange.Text="RECOMENDADO"
$rcBd.TextFrame.TextRange.Font.Name=$FN; $rcBd.TextFrame.TextRange.Font.Size=7
$rcBd.TextFrame.TextRange.Font.Bold=-1; $rcBd.TextFrame.TextRange.Font.Color.RGB=$W
$rcBd.TextFrame.TextRange.ParagraphFormat.Alignment=2; $rcBd.TextFrame.VerticalAnchor=3
Add-Text $s ($ML+20) ($pkY+14) ($pkW-40) 20 "Pacote Completo" 18 $W $true 1 | Out-Null
Add-Text $s ($ML+20) ($pkY+36) ($pkW-40) 14 "Presenca digital integral" 10 $G500 $false 1 | Out-Null
Add-Text $s ($ML+20) ($pkY+58) ($pkW-40) 110 "SEO Local (Google Business Profile)`nWebsite profissional (com criacao de dominio)`nInstagram estrategico (3 posts semanais)`nBranding e identidade visual`nRebranding (se necessario)`nGestao de conteudo estrategico" 10 $G300 $false 1 | Out-Null
Add-Rect $s ($ML+20) ($pkY+172) ($pkW-40) 1 $G700 | Out-Null
Add-Text $s ($ML+20) ($pkY+180) 180 20 "1 restaurante" 10 $G400 $false 1 | Out-Null
Add-Text $s ($ML+$pkW-180) ($pkY+176) 160 24 "R$ 11.200" 18 $W $true 3 | Out-Null
Add-Rect $s ($ML+20) ($pkY+206) ($pkW-40) 1 $G700 | Out-Null
Add-Text $s ($ML+20) ($pkY+214) 180 20 "2 restaurantes" 10 $G400 $false 1 | Out-Null
Add-Text $s ($ML+$pkW-180) ($pkY+208) 160 30 "R$ 17.500" 22 $RD $true 3 | Out-Null

$pex=$ML+$pkW+$pkG
Add-RRect $s $pex $pkY $pkW $pkH $G850 $G700 | Out-Null
Add-Text $s ($pex+20) ($pkY+14) ($pkW-40) 20 "Pacote Essencial" 18 $W $true 1 | Out-Null
Add-Text $s ($pex+20) ($pkY+36) ($pkW-40) 14 "Fundacao digital estrategica" 10 $G500 $false 1 | Out-Null
Add-Text $s ($pex+20) ($pkY+58) ($pkW-40) 50 "SEO Local (Google Business Profile)`nWebsite profissional (com criacao de dominio)" 10 $G300 $false 1 | Out-Null
Add-Rect $s ($pex+20) ($pkY+172) ($pkW-40) 1 $G700 | Out-Null
Add-Text $s ($pex+20) ($pkY+180) 180 20 "1 restaurante" 10 $G400 $false 1 | Out-Null
Add-Text $s ($pex+$pkW-180) ($pkY+176) 160 24 "R$ 8.500" 18 $W $true 3 | Out-Null
Add-Rect $s ($pex+20) ($pkY+206) ($pkW-40) 1 $G700 | Out-Null
Add-Text $s ($pex+20) ($pkY+214) 180 20 "2 restaurantes" 10 $G400 $false 1 | Out-Null
Add-Text $s ($pex+$pkW-180) ($pkY+208) 160 30 "R$ 13.300" 22 $RD $true 3 | Out-Null

Add-RRect $s $ML ($pkY+$pkH+14) $CW 34 $G850 $G700 | Out-Null
Add-Text $s ($ML+16) ($pkY+$pkH+18) ($CW-32) 26 "Todos os pacotes incluem 1 mes de execucao completa da LocalRise Advisory. Planejamento, implementacao e acompanhamento inclusos." 9 $G300 $false 2 | Out-Null
Add-SlideFooter $s 11

# =========== SLIDE 12: FASE 2 ===========
Write-Host "  Slide 12/13: Fase 2 - Escala" -ForegroundColor Yellow
$s = New-Slide; Add-Arc $s ($SW-160) (-60) 260
Add-Section $s "Visao de Futuro" 36
Add-Text $s $ML 56 $CW 36 "Fase 2 - Escala" 32 $W $true 1 | Out-Null
Add-Text $s ($ML+290) 56 200 36 " (Opcional)" 32 $G400 $false 1 | Out-Null
Add-Text $s $ML 100 $CW 18 "Apos a consolidacao da base digital na Fase 1." 11 $G400 $false 1 | Out-Null

$phW=410; $phG=28; $phY=140
Add-RRect $s $ML $phY $phW 160 $G850 $G700 | Out-Null
Add-Rect $s $ML $phY $phW 3 $G500 | Out-Null
Add-Text $s ($ML+16) ($phY+12) ($phW-32) 12 "FASE 1 - ATUAL" 8 $G500 $true 1 | Out-Null
Add-Text $s ($ML+16) ($phY+30) ($phW-32) 18 "Trafego Organico" 16 $W $true 1 | Out-Null
Add-Text $s ($ML+16) ($phY+56) ($phW-32) 90 "Google Business Profile`nWebsite com SEO local`nInstagram estrategico`nGestao de reputacao`nConteudo organico" 10 $G300 $false 1 | Out-Null

$f2x=$ML+$phW+$phG
$f2=Add-RRect $s $f2x $phY $phW 160 $G850 $RD; $f2.Line.Weight=1
Add-Rect $s $f2x $phY $phW 3 $RD | Out-Null
Add-Text $s ($f2x+16) ($phY+12) ($phW-32) 12 "FASE 2 - FUTURO" 8 $RD $true 1 | Out-Null
Add-Text $s ($f2x+16) ($phY+30) ($phW-32) 18 "Trafego Pago" 16 $W $true 1 | Out-Null
Add-Text $s ($f2x+16) ($phY+56) ($phW-32) 90 "Google Ads local`nInstagram Ads`nCampanhas segmentadas`nRetargeting`nEscala de aquisicao" 10 $G300 $false 1 | Out-Null

Add-Text $s ($ML+$phW) ($phY+60) $phG 40 ">" 24 $RD $true 2 | Out-Null

$stBg=Add-RRect $s $ML 320 $CW 70 $G850 $G700
Add-Rect $s $ML 320 3 70 $RD | Out-Null
Add-Text $s ($ML+16) 326 ($CW-32) 58 "Apos a consolidacao da base digital, existe potencial para avancar para uma segunda fase focada em escala, utilizando trafego pago para acelerar ainda mais a aquisicao de clientes." 12 $G200 $false 1 | Out-Null

Add-Text $s $ML 410 $CW 18 "A Fase 2 sera proposta apos a conclusao e avaliacao dos resultados da Fase 1." 10 $G500 $false 2 | Out-Null
Add-SlideFooter $s 12

# =========== SLIDE 13: ENCERRAMENTO ===========
Write-Host "  Slide 13/13: Encerramento" -ForegroundColor Yellow
$s = New-Slide
Add-Arc $s ($SW-160) (-60) 260; Add-Arc $s (-60) ($SH-160) 200
Add-Logo $s ($SW/2) 55 52 | Out-Null
Add-Text $s $ML 130 $CW 40 "Encerramento" 36 $W $true 2 | Out-Null
$rl=$s.Shapes.AddLine(($SW/2-30),174,($SW/2+30),174)
$rl.Line.ForeColor.RGB=$RD; $rl.Line.Weight=2
$abW=680; $abX=($SW-$abW)/2
Add-Text $s $abX 190 $abW 24 "LocalRise Advisory" 14 $RD $true 2 | Out-Null
Add-Text $s $abX 216 $abW 20 "Inteligencia Digital para Negocios Locais" 12 $G300 $false 2 | Out-Null
Add-RRect $s $abX 250 $abW 80 $G850 $G700 | Out-Null
Add-Text $s ($abX+20) 258 ($abW-40) 64 "Os dados deste diagnostico evidenciam um potencial significativo de crescimento digital para ambos os restaurantes. A LocalRise esta preparada para construir, de forma estruturada e estrategica, a presenca digital que o seu negocio precisa para se posicionar com autoridade no mercado de Porto Alegre." 11 $G200 $false 2 | Out-Null
Add-Text $s $abX 350 $abW 24 "Estamos a disposicao para iniciar essa construcao." 12 $W $true 2 | Out-Null
$cBg=Add-RRect $s (($SW-340)/2) 388 340 34 $G850 $G700
$cBg.TextFrame.TextRange.Text="contato@localriseadvisory.com"
$cBg.TextFrame.TextRange.Font.Name=$FN; $cBg.TextFrame.TextRange.Font.Size=12
$cBg.TextFrame.TextRange.Font.Bold=-1; $cBg.TextFrame.TextRange.Font.Color.RGB=$RD
$cBg.TextFrame.TextRange.ParagraphFormat.Alignment=2; $cBg.TextFrame.VerticalAnchor=3
Add-Text $s $ML 440 $CW 16 "Abril 2026  -  Porto Alegre, RS  -  Valida por 15 dias" 8 $G500 $false 2 | Out-Null
Add-SlideFooter $s 13

# =========== SAVE ===========
Write-Host "`nSalvando..." -ForegroundColor Cyan
if (Test-Path $out) { Remove-Item $out -Force }
$pres.SaveAs($out)
Write-Host "Arquivo: $out" -ForegroundColor Green
$pres.Close()
$app.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($app) | Out-Null
Write-Host "OK - 13 slides PPTX gerados com sucesso!" -ForegroundColor Green

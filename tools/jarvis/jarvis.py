#!/usr/bin/env python3
"""
Jarvis — Double Clap Home Automation (Windows Edition)
Adapted from: https://github.com/RafaTatay/jarvis

Detecta 2 palmas → TTS diz boas-vindas → abre YouTube → Claude + Cursor lado a lado.

Instalação:
    pip install sounddevice numpy pyttsx3 edge-tts pydub

Uso:
    python jarvis.py
"""

import os
import sys
import time
import threading
import subprocess
import webbrowser

# Força UTF-8 no terminal Windows (evita crash com emojis/acentos)
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import asyncio
import tempfile
import numpy as np
import sounddevice as sd
import edge_tts
import pyttsx3

# ──────────────────────────────────────────────────────────────────────────────
#  Configuração
# ──────────────────────────────────────────────────────────────────────────────
SAMPLE_RATE   = 44100
BLOCK_SIZE    = int(SAMPLE_RATE * 0.05)   # 50 ms por bloco
THRESHOLD     = 0.030    # RMS mínimo para detectar palma ← calibrado para este mic
COOLDOWN      = 0.1      # segundos mínimos entre palmas
DOUBLE_WINDOW = 2.0      # janela de tempo para segunda palma

YOUTUBE_URL   = "https://www.youtube.com/watch?v=hEIexwwiKKU"  # usado só para re-download
MUSIC_FILE    = os.path.join(os.path.dirname(__file__), "jarvis_music.mp3")
FFMPEG_PATH   = r"C:\Users\digui\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
MENSAGEM      = "Bem-vindo de volta, senhor Nicolás Slater."
NEW_PROJECT   = os.path.expanduser("~/Desktop/novo_projeto")

# ──────────────────────────────────────────────────────────────────────────────
#  Estado global
# ──────────────────────────────────────────────────────────────────────────────
clap_times: list[float] = []
triggered = False
lock = threading.Lock()


# ──────────────────────────────────────────────────────────────────────────────
#  Detecção de palmas
# ──────────────────────────────────────────────────────────────────────────────
def audio_callback(indata, frames, time_info, status):
    global triggered, clap_times

    if triggered:
        return

    rms = float(np.sqrt(np.mean(indata ** 2)))
    now = time.time()

    if rms > THRESHOLD:
        with lock:
            if clap_times and (now - clap_times[-1]) < COOLDOWN:
                return

            clap_times.append(now)
            clap_times = [t for t in clap_times if now - t <= DOUBLE_WINDOW]

            count = len(clap_times)
            print(f"  👏  Palma {count}/2  (RMS={rms:.3f})")

            if count >= 2:
                triggered = True
                clap_times = []
                threading.Thread(target=sequencia_boas_vindas, daemon=True).start()


# ──────────────────────────────────────────────────────────────────────────────
#  Sequência de boas-vindas
# ──────────────────────────────────────────────────────────────────────────────
def sequencia_boas_vindas():
    print("\n🚀  Iniciando sequência de boas-vindas…\n")
    falar(MENSAGEM)
    tocar_musica()
    abrir_apps_lado_a_lado()
    print("\n✅  Sequência concluída.\n")


def falar(texto: str):
    """TTS neural via edge-tts (Antonio PT-BR) — bloqueante.
    Calcula a duração real do mp3 e aguarda exatamente até terminar,
    garantindo que o áudio completa ANTES de qualquer app abrir."""
    print(f"  🔊  Dizendo: «{texto}»")

    mp3_path = os.path.join(tempfile.gettempdir(), "jarvis_tts.mp3")
    ps_path  = os.path.join(tempfile.gettempdir(), "jarvis_play.ps1")

    # ── Gera áudio neural ─────────────────────────────────────────────────────
    try:
        async def _gerar():
            tts = edge_tts.Communicate(
                texto,
                voice="pt-BR-AntonioNeural",
                rate="-12%",
                volume="+50%",
            )
            await tts.save(mp3_path)

        asyncio.run(_gerar())

        # Calcula duração real e adiciona 0.6s de margem
        from mutagen.mp3 import MP3
        dur_ms = int((MP3(mp3_path).info.length + 0.6) * 1000)

        # Grava script PS1 e executa — bloqueante até o áudio terminar
        mp3_uri = mp3_path.replace("\\", "/")
        ps_script = (
            f"Add-Type -AssemblyName PresentationCore\n"
            f"$p = [System.Windows.Media.MediaPlayer]::new()\n"
            f"$p.Open([Uri]::new(\"{mp3_uri}\"))\n"
            f"$p.Play()\n"
            f"Start-Sleep -Milliseconds {dur_ms}\n"
            f"$p.Close()\n"
        )
        with open(ps_path, "w", encoding="utf-8") as f:
            f.write(ps_script)

        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps_path],
            capture_output=True, timeout=dur_ms // 1000 + 5
        )
        print("     Voz: Antonio Neural PT-BR")
        return
    except Exception as e:
        print(f"     edge-tts falhou ({e}) — usando fallback")

    # ── Fallback: pyttsx3 Maria ───────────────────────────────────────────────
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        pt = [v for v in voices if "pt" in v.id.lower()
              or "portuguese" in v.name.lower()
              or "brazil" in v.name.lower()]
        if pt:
            engine.setProperty("voice", pt[0].id)
        engine.setProperty("rate", 115)
        engine.setProperty("volume", 1.0)
        engine.say(texto)
        engine.runAndWait()
    except Exception as e:
        print(f"     TTS falhou: {e}")


def tocar_musica():
    """Toca a música local (sem anúncio) via PowerShell MediaPlayer em background."""
    print(f"  🎵  Tocando música local…")

    if not os.path.isfile(MUSIC_FILE):
        print(f"     Arquivo não encontrado: {MUSIC_FILE}")
        print(f"     Baixando do YouTube…")
        _baixar_musica()

    music_uri = MUSIC_FILE.replace("\\", "/")
    ps_script = (
        f"Add-Type -AssemblyName PresentationCore\n"
        f"$p = [System.Windows.Media.MediaPlayer]::new()\n"
        f"$p.Open([Uri]::new(\"{music_uri}\"))\n"
        f"$p.Play()\n"
        f"Start-Sleep -Seconds 300\n"   # toca por até 5 min em background
    )
    ps_path = os.path.join(tempfile.gettempdir(), "jarvis_music_play.ps1")
    with open(ps_path, "w", encoding="utf-8") as f:
        f.write(ps_script)

    # Abre em processo separado (não bloqueia — música roda em paralelo)
    subprocess.Popen(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps_path],
        creationflags=0x00000008,  # DETACHED_PROCESS
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(0.5)


def _baixar_musica():
    """Re-baixa o áudio do YouTube caso o arquivo local não exista."""
    try:
        import yt_dlp
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": MUSIC_FILE.replace(".mp3", ".%(ext)s"),
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
            "ffmpeg_location": os.path.dirname(FFMPEG_PATH),
            "quiet": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([YOUTUBE_URL])
        print(f"     Download concluído: {MUSIC_FILE}")
    except Exception as e:
        print(f"     Download falhou: {e}")


def abrir_apps_lado_a_lado():
    sw, sh = obter_resolucao_tela()
    metade = sw // 2

    # ── Abre Claude (Chrome App) ──────────────────────────────────────────────
    print("  🤖  Abrindo Claude…")
    claude_lnk = r"C:\Users\digui\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\apps do Chrome\Claude.lnk"
    if os.path.isfile(claude_lnk):
        os.startfile(claude_lnk)
        print("     Claude aberto via atalho")
    else:
        # Fallback direto via chrome_proxy
        subprocess.Popen([
            r"C:\Program Files\Google\Chrome\Application\chrome_proxy.exe",
            "--profile-directory=Default",
            "--app-id=fmpnliohjhemenmnlpbfagaolkdacoja"
        ])
        print("     Claude aberto via chrome_proxy")
    time.sleep(5.0)  # Chrome App demora mais para abrir

    # ── Maximiza Claude ───────────────────────────────────────────────────────
    print("  🪟  Maximizando Claude…")
    posicionar_janelas_windows(metade, sh)


def posicionar_janelas_windows(metade: int, altura: int):
    """Maximiza o Claude na tela toda via PowerShell."""
    script = f"""
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {{
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hwnd, int cmd);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    public delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hwnd, System.Text.StringBuilder text, int count);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hwnd);
}}
"@

$found = @()
[Win32]::EnumWindows({{
    param($hwnd, $lParam)
    $sb = [System.Text.StringBuilder]::new(256)
    [Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null
    if ([Win32]::IsWindowVisible($hwnd) -and $sb.ToString() -like "*Claude*") {{
        $found += $hwnd
    }}
    return $true
}}, [IntPtr]::Zero)

if ($found.Count -gt 0) {{
    [Win32]::ShowWindow($found[0], 3)       # SW_MAXIMIZE
    [Win32]::SetForegroundWindow($found[0])
    Write-Host "Claude maximizado"
}} else {{
    Write-Host "Claude nao encontrado ainda (abrindo...)"
}}
"""
    result = subprocess.run(
        ["powershell", "-NoProfile", "-Command", script],
        capture_output=True, text=True
    )
    if result.stdout:
        print(f"     {result.stdout.strip()}")
    if result.stderr and result.returncode != 0:
        print(f"     Aviso janelas: {result.stderr[:100]}")


# ──────────────────────────────────────────────────────────────────────────────
#  Utilitários Windows
# ──────────────────────────────────────────────────────────────────────────────
def obter_resolucao_tela() -> tuple[int, int]:
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "Add-Type -AssemblyName System.Windows.Forms; "
             "$s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; "
             "Write-Output \"$($s.Width),$($s.Height)\""],
            capture_output=True, text=True
        )
        parts = result.stdout.strip().split(",")
        return int(parts[0]), int(parts[1])
    except Exception:
        return 1920, 1080




# ──────────────────────────────────────────────────────────────────────────────
#  Main
# ──────────────────────────────────────────────────────────────────────────────
def main():
    global triggered

    print("=" * 55)
    print("  🎤  Jarvis ativo — batendo 2 palmas…  (Ctrl+C para sair)")
    print(f"  Limiar atual: {THRESHOLD}  (ajuste THRESHOLD se falhar)")
    print("=" * 55)

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            blocksize=BLOCK_SIZE,
            channels=1,
            dtype="float32",
            callback=audio_callback,
        ):
            while True:
                time.sleep(0.1)
                if triggered:
                    time.sleep(8)
                    triggered = False
                    print("\n👂  Escutando novamente…\n")
    except KeyboardInterrupt:
        print("\n\nAté logo! 👋")
        sys.exit(0)


if __name__ == "__main__":
    main()

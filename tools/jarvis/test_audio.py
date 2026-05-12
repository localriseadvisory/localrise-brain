import asyncio, edge_tts, tempfile, os, subprocess
from mutagen.mp3 import MP3

mp3 = os.path.join(tempfile.gettempdir(), "jarvis_tts.mp3")
mp3_uri = mp3.replace("\\", "/")

async def gerar():
    tts = edge_tts.Communicate(
        "Bem-vindo de volta, senhor Nicolas Slater.",
        voice="pt-BR-AntonioNeural",
        rate="-12%",
        volume="+50%",
    )
    await tts.save(mp3)

asyncio.run(gerar())
dur = MP3(mp3).info.length
ms  = int((dur + 0.6) * 1000)
print(f"Duracao: {dur:.2f}s, sleep: {ms}ms")

ps_content = f"""Add-Type -AssemblyName PresentationCore
$p = [System.Windows.Media.MediaPlayer]::new()
$p.Open([Uri]::new("{mp3_uri}"))
$p.Play()
Start-Sleep -Milliseconds {ms}
$p.Close()
"""

ps_file = os.path.join(tempfile.gettempdir(), "play_jarvis.ps1")
with open(ps_file, "w", encoding="utf-8") as f:
    f.write(ps_content)

r = subprocess.run(
    ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps_file],
    capture_output=True, timeout=15
)
print("rc=", r.returncode)
if r.stderr:
    print(r.stderr.decode(errors="ignore")[:300])
print("DONE")

import os, subprocess, tempfile

MUSIC_FILE = os.path.join(os.path.dirname(__file__), "jarvis_music.mp3")
music_uri  = MUSIC_FILE.replace("\\", "/")

ps_script = (
    "Add-Type -AssemblyName PresentationCore\n"
    f"$p = [System.Windows.Media.MediaPlayer]::new()\n"
    f"$p.Open([Uri]::new(\"{music_uri}\"))\n"
    f"$p.Play()\n"
    f"Start-Sleep -Seconds 8\n"
    f"$p.Close()\n"
)

ps_path = os.path.join(tempfile.gettempdir(), "test_music.ps1")
with open(ps_path, "w", encoding="utf-8") as f:
    f.write(ps_script)

print("Tocando 8 segundos da musica local (sem anuncio)...")
r = subprocess.run(
    ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps_path],
    timeout=15, capture_output=True
)
print("rc=", r.returncode)
if r.stderr:
    print(r.stderr.decode(errors="ignore")[:200])
print("OK")

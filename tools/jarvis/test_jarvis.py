#!/usr/bin/env python3
"""
test_jarvis.py — Diagnóstico interativo do Jarvis
Testa cada componente separadamente: microfone, palmas, TTS e apps.
"""

import os
import sys
import time
import threading
import subprocess
import webbrowser

import numpy as np
import sounddevice as sd
import pyttsx3

SAMPLE_RATE = 44100
BLOCK_SIZE  = int(SAMPLE_RATE * 0.05)

# ── Cores no terminal ─────────────────────────────────────────────────────────
G = "\033[92m"  # verde
Y = "\033[93m"  # amarelo
R = "\033[91m"  # vermelho
B = "\033[96m"  # azul
W = "\033[0m"   # reset


def menu():
    print(f"\n{B}{'='*50}")
    print("  JARVIS — DIAGNÓSTICO")
    print(f"{'='*50}{W}")
    print(f"  {Y}1{W} — Testar microfone (ver nível RMS ao vivo)")
    print(f"  {Y}2{W} — Testar detecção de palmas")
    print(f"  {Y}3{W} — Testar voz (TTS)")
    print(f"  {Y}4{W} — Testar abertura do YouTube")
    print(f"  {Y}5{W} — Testar abertura do Claude")
    print(f"  {Y}6{W} — Testar abertura do Cursor")
    print(f"  {Y}7{W} — Rodar sequência completa")
    print(f"  {Y}0{W} — Sair")
    print(f"{B}{'='*50}{W}")
    return input("  Escolha: ").strip()


# ── TESTE 1: Microfone ────────────────────────────────────────────────────────
def testar_microfone():
    print(f"\n{Y}[MIC] Mostrando nível do microfone por 10 segundos...{W}")
    print("  Fique em silêncio → depois bata palma → veja o valor subir")
    print("  (Ctrl+C para parar antes)\n")
    start = time.time()
    try:
        with sd.InputStream(samplerate=SAMPLE_RATE, blocksize=BLOCK_SIZE,
                            channels=1, dtype="float32") as stream:
            while time.time() - start < 10:
                data, _ = stream.read(BLOCK_SIZE)
                rms = float(np.sqrt(np.mean(data ** 2)))
                bar_len = int(rms * 200)
                bar = "█" * min(bar_len, 50)
                cor = G if rms > 0.20 else (Y if rms > 0.05 else W)
                print(f"\r  RMS: {cor}{rms:.4f}{W}  {cor}{bar:<50}{W}", end="", flush=True)
                time.sleep(0.05)
    except KeyboardInterrupt:
        pass
    print(f"\n\n{G}Conclusão:{W}")
    print("  - Valor em silêncio < 0.05 → microfone funcionando")
    print("  - Valor ao bater palma > 0.20 → THRESHOLD atual está OK")
    print("  - Se palma ficou abaixo de 0.20 → edite THRESHOLD no jarvis.py")


# ── TESTE 2: Detecção de palmas ───────────────────────────────────────────────
def testar_palmas():
    print(f"\n{Y}[PALMAS] Aguardando 2 palmas (timeout 15s)...{W}")
    print("  Bata 2 palmas com até 2 segundos de intervalo\n")

    THRESHOLD     = 0.030
    COOLDOWN      = 0.10
    DOUBLE_WINDOW = 2.0

    clap_times = []
    detectado  = threading.Event()
    lock       = threading.Lock()

    def callback(indata, frames, time_info, status):
        rms = float(np.sqrt(np.mean(indata ** 2)))
        now = time.time()
        if rms > THRESHOLD:
            with lock:
                if clap_times and (now - clap_times[-1]) < COOLDOWN:
                    return
                clap_times.append(now)
                clap_times[:] = [t for t in clap_times if now - t <= DOUBLE_WINDOW]
                count = len(clap_times)
                print(f"\r  {G}👏 Palma {count}/2{W}  RMS={rms:.3f}    ", end="", flush=True)
                if count >= 2:
                    detectado.set()

    with sd.InputStream(samplerate=SAMPLE_RATE, blocksize=BLOCK_SIZE,
                        channels=1, dtype="float32", callback=callback):
        if detectado.wait(timeout=15):
            print(f"\n\n{G}✅ Detecção OK — 2 palmas reconhecidas!{W}")
        else:
            print(f"\n\n{R}❌ Timeout — palmas não detectadas.{W}")
            print(f"  Dica: abaixe THRESHOLD para 0.10 em jarvis.py")


# ── TESTE 3: TTS ──────────────────────────────────────────────────────────────
def testar_tts():
    print(f"\n{Y}[TTS] Testando voz...{W}")
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        print(f"  Vozes disponíveis ({len(voices)}):")
        for i, v in enumerate(voices):
            print(f"    [{i}] {v.name} — {v.id}")

        pt = [v for v in voices if "pt" in v.id.lower()
              or "portuguese" in v.name.lower()
              or "brazil" in v.name.lower()]

        if pt:
            engine.setProperty("voice", pt[0].id)
            print(f"\n  {G}Voz portuguesa encontrada: {pt[0].name}{W}")
        else:
            print(f"\n  {Y}Sem voz PT — usando voz padrão{W}")

        engine.setProperty("rate", 148)
        engine.say("Bem-vindo de volta, senhor. Jarvis está funcionando.")
        engine.runAndWait()
        print(f"  {G}✅ TTS OK{W}")
    except Exception as e:
        print(f"  {R}❌ TTS falhou: {e}{W}")


# ── TESTE 4: YouTube ──────────────────────────────────────────────────────────
def testar_youtube():
    url = "https://www.youtube.com/watch?v=hEIexwwiKKU"
    print(f"\n{Y}[YOUTUBE] Abrindo {url}{W}")
    webbrowser.open(url)
    print(f"  {G}✅ Comando enviado ao navegador padrão{W}")


# ── TESTE 5 & 6: Apps ─────────────────────────────────────────────────────────
def encontrar_exe(candidatos, nome):
    for path in candidatos:
        if os.path.isfile(path):
            return path
    result = subprocess.run(["where", nome], capture_output=True, text=True, shell=True)
    if result.returncode == 0:
        return result.stdout.strip().split("\n")[0]
    return None


def testar_claude():
    print(f"\n{Y}[CLAUDE] Procurando e abrindo Claude Desktop...{W}")
    candidatos = [
        os.path.expandvars(r"%LOCALAPPDATA%\AnthropicClaude\Claude.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Claude\Claude.exe"),
        os.path.expandvars(r"%PROGRAMFILES%\Claude\Claude.exe"),
    ]
    path = encontrar_exe(candidatos, "claude")
    if path:
        print(f"  Encontrado: {path}")
        subprocess.Popen([path])
        print(f"  {G}✅ Claude aberto{W}")
    else:
        print(f"  {R}❌ Claude.exe não encontrado nos caminhos padrão.{W}")
        print("  Verifique onde o Claude está instalado e edite encontrar_claude() em jarvis.py")
        # Tenta listar AnthropicClaude
        base = os.path.expandvars(r"%LOCALAPPDATA%\AnthropicClaude")
        if os.path.isdir(base):
            print(f"  Pasta encontrada: {base}")
            for f in os.listdir(base):
                print(f"    {f}")


def testar_cursor():
    print(f"\n{Y}[CURSOR] Procurando e abrindo Cursor...{W}")
    candidatos = [
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\cursor\Cursor.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\cursor\Cursor.exe"),
        os.path.expandvars(r"%PROGRAMFILES%\Cursor\Cursor.exe"),
    ]
    path = encontrar_exe(candidatos, "cursor")
    if path:
        print(f"  Encontrado: {path}")
        subprocess.Popen([path])
        print(f"  {G}✅ Cursor aberto{W}")
    else:
        print(f"  {R}❌ Cursor.exe não encontrado.{W}")
        print("  Verifique onde o Cursor está instalado e edite encontrar_cursor() em jarvis.py")


# ── TESTE 7: Sequência completa ───────────────────────────────────────────────
def testar_sequencia():
    print(f"\n{Y}[FULL] Rodando sequência completa...{W}")
    testar_tts()
    time.sleep(0.5)
    testar_youtube()
    time.sleep(1.0)
    testar_claude()
    time.sleep(1.5)
    testar_cursor()
    print(f"\n{G}✅ Sequência completa executada!{W}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    while True:
        choice = menu()
        if choice == "1":
            testar_microfone()
        elif choice == "2":
            testar_palmas()
        elif choice == "3":
            testar_tts()
        elif choice == "4":
            testar_youtube()
        elif choice == "5":
            testar_claude()
        elif choice == "6":
            testar_cursor()
        elif choice == "7":
            testar_sequencia()
        elif choice == "0":
            print("\nSaindo...\n")
            break
        else:
            print(f"{R}Opção inválida.{W}")


if __name__ == "__main__":
    main()

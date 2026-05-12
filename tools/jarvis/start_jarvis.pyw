"""
start_jarvis.pyw — Lançador silencioso do Jarvis (sem janela de terminal)
Rodado automaticamente no login do Windows via Task Scheduler.
"""
import subprocess
import sys
import os

script = os.path.join(os.path.dirname(__file__), "jarvis.py")
python = sys.executable  # pythonw.exe invoca este arquivo, usamos python.exe para o script
python_exe = python.replace("pythonw.exe", "python.exe")

subprocess.Popen(
    [python_exe, script],
    creationflags=0x00000008,  # DETACHED_PROCESS — sem janela
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

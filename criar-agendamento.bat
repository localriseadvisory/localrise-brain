@echo off
schtasks /create /tn "Radar Marketing LocalRise" /tr "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File \"C:\Users\digui\Documents\localrise-brain\rodar-radar.ps1\"" /sc daily /st 08:00 /f
if %errorlevel% == 0 (
    echo.
    echo Agendamento criado com sucesso!
    echo O Radar rodara todo dia as 08:00.
) else (
    echo.
    echo ERRO ao criar agendamento. Verifique se rodou como Administrador.
)
pause

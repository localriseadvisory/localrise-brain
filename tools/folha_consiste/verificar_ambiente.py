"""
verificar_ambiente.py
=====================
Script de "verificacao de ambiente" (em ingles: smoke test).

Para que serve:
    Confirmar que o Python e as bibliotecas necessarias estao instalados
    CORRETAMENTE antes de comecarmos a programar de verdade. E o primeiro
    arquivo que rodamos: se ele passar, o ambiente esta pronto.

Como executar (com o ambiente virtual .venv ativado):
    python verificar_ambiente.py
"""

# 'sys' e um modulo que ja vem com o Python (nao precisa instalar).
# Ele da informacoes sobre o proprio interpretador Python.
import sys

# 'importlib' permite importar uma biblioteca pelo nome (em texto).
# Usamos isso para checar varias bibliotecas dentro de um laco 'for'.
import importlib

# Lista das bibliotecas EXTERNAS que o projeto precisa ter instaladas.
BIBLIOTECAS_NECESSARIAS = ["pandas", "openpyxl"]

# Versao minima do Python aceita pelo projeto.
VERSAO_MINIMA_PYTHON = (3, 10)


def verificar_python() -> bool:
    """Verifica a versao do Python. Devolve True se estiver adequada."""
    v = sys.version_info  # objeto com major, minor e micro da versao
    print(f"Python detectado: versao {v.major}.{v.minor}.{v.micro}")

    if v < VERSAO_MINIMA_PYTHON:
        minima = f"{VERSAO_MINIMA_PYTHON[0]}.{VERSAO_MINIMA_PYTHON[1]}"
        print(f"  [ATENCAO] O projeto precisa de Python {minima} ou superior.")
        return False

    print("  [OK] Versao do Python adequada.")
    return True


def verificar_bibliotecas() -> bool:
    """Tenta importar cada biblioteca necessaria. Devolve True se todas existirem."""
    tudo_ok = True

    for nome in BIBLIOTECAS_NECESSARIAS:
        # 'try / except' = tente isto; se der erro, faca aquilo.
        # Se a biblioteca nao estiver instalada, o Python levanta ImportError.
        try:
            modulo = importlib.import_module(nome)
            versao = getattr(modulo, "__version__", "desconhecida")
            print(f"  [OK] '{nome}' instalada (versao {versao}).")
        except ImportError:
            print(f"  [ERRO] '{nome}' NAO esta instalada.")
            print(f"         Rode:  pip install -r requirements.txt")
            tudo_ok = False

    return tudo_ok


# Este bloco so roda quando executamos ESTE arquivo diretamente
# (e nao quando ele e importado por outro arquivo do projeto).
if __name__ == "__main__":
    print("=" * 55)
    print(" Verificacao de ambiente — projeto folha_consiste")
    print("=" * 55)

    python_ok = verificar_python()
    libs_ok = verificar_bibliotecas()

    print("-" * 55)
    if python_ok and libs_ok:
        print("Tudo certo! Ambiente pronto para comecar.")
        sys.exit(0)   # codigo de saida 0 = sucesso
    else:
        print("Algo esta faltando. Reveja os passos de instalacao no README.")
        sys.exit(1)   # codigo de saida diferente de 0 = houve erro

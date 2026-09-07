"""
validacao.py
============
Etapa 2 do pipeline: VALIDAR os dados lidos.

Para que serve:
    Percorrer cada linha da tabela e conferir se ela obedece as regras
    (campos obrigatorios preenchidos, CPF matematicamente valido, valor
    numerico etc.). Cada problema encontrado vira uma "ocorrencia de erro"
    com linha, campo, valor errado e mensagem — assim voce sabe exatamente
    onde corrigir na origem.

Como as regras estao organizadas:
    Uma regra e um dicionario simples: {"campo": <nome>, "regra": <nome>}.
    O nome da regra bate com uma funcao em REGRAS_DISPONIVEIS. Para criar
    uma nova regra, escreva uma funcao que receba o valor e devolva
    (ok: bool, mensagem: str) e registre em REGRAS_DISPONIVEIS.
"""

from __future__ import annotations

import re
from typing import Callable

import pandas as pd


# --------------------------------------------------------------------------- #
# Funcoes-regra                                                               #
# --------------------------------------------------------------------------- #
# Cada funcao recebe um valor (texto) e devolve (ok, mensagem).
# Quando ok=True, a mensagem e ignorada.

def _obrigatorio(valor: str) -> tuple[bool, str]:
    """Reprova valores vazios ou so com espacos."""
    if valor is None or str(valor).strip() == "":
        return False, "campo obrigatorio nao preenchido"
    return True, ""


def _cpf_valido(valor: str) -> tuple[bool, str]:
    """Valida CPF pelo algoritmo oficial (dois digitos verificadores).

    Aceita CPF formatado (com pontos e traco) ou so numeros. Um CPF vazio
    passa aqui — quem checa se ele deveria estar preenchido e a regra
    'obrigatorio'. Assim cada regra tem uma responsabilidade so.
    """
    if valor is None or str(valor).strip() == "":
        return True, ""

    # Manter so os digitos.
    digitos = re.sub(r"\D", "", str(valor))

    if len(digitos) != 11:
        return False, f"CPF deve ter 11 digitos (tem {len(digitos)})"

    # CPF com todos os digitos iguais (000..., 111...) e invalido, mesmo
    # que passe na conta dos verificadores.
    if digitos == digitos[0] * 11:
        return False, "CPF invalido (todos os digitos iguais)"

    # Calculo do 1o digito verificador: soma ponderada de 10..2 dos
    # primeiros 9 digitos, resto da divisao por 11.
    def _dv(base: str, peso_inicial: int) -> int:
        soma = sum(int(d) * (peso_inicial - i) for i, d in enumerate(base))
        resto = (soma * 10) % 11
        return 0 if resto == 10 else resto

    dv1 = _dv(digitos[:9], 10)
    dv2 = _dv(digitos[:10], 11)

    if dv1 != int(digitos[9]) or dv2 != int(digitos[10]):
        return False, "CPF invalido (digitos verificadores nao batem)"

    return True, ""


def _numero_brasileiro(valor: str) -> tuple[bool, str]:
    """Aceita numero no formato brasileiro (1.234,56 ou 1234,56 ou 1234.56)."""
    if valor is None or str(valor).strip() == "":
        return True, ""

    texto = str(valor).strip()
    # Remove separador de milhar "." e troca virgula decimal por ponto.
    normalizado = texto.replace(".", "").replace(",", ".")
    try:
        float(normalizado)
    except ValueError:
        return False, f"valor '{texto}' nao e um numero valido"
    return True, ""


def _positivo(valor: str) -> tuple[bool, str]:
    """Reprova numeros zero ou negativos. Vazio passa (deixa p/ 'obrigatorio')."""
    if valor is None or str(valor).strip() == "":
        return True, ""
    ok, _ = _numero_brasileiro(valor)
    if not ok:
        return False, "valor nao e numero, entao nao da p/ testar se e positivo"
    numero = float(str(valor).replace(".", "").replace(",", "."))
    if numero <= 0:
        return False, f"valor {numero} deveria ser maior que zero"
    return True, ""


# Registro central: nome-da-regra -> funcao.
# Para adicionar uma regra nova: escreva a funcao acima e adicione uma
# entrada aqui. Depois use o nome na lista REGRAS_PADRAO (ou nas suas).
REGRAS_DISPONIVEIS: dict[str, Callable[[str], tuple[bool, str]]] = {
    "obrigatorio": _obrigatorio,
    "cpf_valido": _cpf_valido,
    "numero_brasileiro": _numero_brasileiro,
    "positivo": _positivo,
}


# --------------------------------------------------------------------------- #
# Conjunto de regras padrao                                                   #
# --------------------------------------------------------------------------- #
# Ordem importa so no relatorio: as regras rodam de cima p/ baixo por linha.
# Um mesmo campo pode ter varias regras (ex.: cpf e obrigatorio E valido).
REGRAS_PADRAO: list[dict[str, str]] = [
    {"campo": "matricula", "regra": "obrigatorio"},
    {"campo": "nome",      "regra": "obrigatorio"},
    {"campo": "cpf",       "regra": "obrigatorio"},
    {"campo": "cpf",       "regra": "cpf_valido"},
    {"campo": "valor",     "regra": "numero_brasileiro"},
    {"campo": "valor",     "regra": "positivo"},
]


# --------------------------------------------------------------------------- #
# Orquestrador                                                                #
# --------------------------------------------------------------------------- #

def validar(
    df: pd.DataFrame,
    regras: list[dict[str, str]] = REGRAS_PADRAO,
) -> pd.DataFrame:
    """Roda todas as regras contra o DataFrame e devolve um DataFrame de erros.

    Colunas do resultado: linha_origem, campo, valor, regra, mensagem.
    Um DataFrame vazio significa "nenhum erro encontrado".
    """
    erros: list[dict] = []

    # Aviso claro se a origem nao tem uma das colunas exigidas pelas regras.
    campos_exigidos = {r["campo"] for r in regras}
    faltantes = campos_exigidos - set(df.columns)
    if faltantes:
        raise ValueError(
            f"Colunas faltando na origem: {sorted(faltantes)}. "
            f"Colunas encontradas: {list(df.columns)}"
        )

    for _, linha in df.iterrows():
        for regra in regras:
            campo = regra["campo"]
            nome_regra = regra["regra"]
            valor = linha.get(campo, "")

            funcao = REGRAS_DISPONIVEIS.get(nome_regra)
            if funcao is None:
                raise ValueError(f"Regra desconhecida: '{nome_regra}'")

            ok, mensagem = funcao(valor)
            if not ok:
                erros.append({
                    "linha_origem": int(linha["_linha_origem"]),
                    "campo": campo,
                    "valor": valor,
                    "regra": nome_regra,
                    "mensagem": mensagem,
                })

    return pd.DataFrame(
        erros,
        columns=["linha_origem", "campo", "valor", "regra", "mensagem"],
    )


# Permite testar sozinho: "python validacao.py exemplos/origem_exemplo.csv"
if __name__ == "__main__":
    import sys
    from leitura import ler_origem

    if len(sys.argv) != 2:
        print("Uso: python validacao.py <caminho-do-arquivo>")
        sys.exit(1)

    dados = ler_origem(sys.argv[1])
    problemas = validar(dados)

    if problemas.empty:
        print("Nenhum problema encontrado.")
    else:
        print(f"{len(problemas)} problema(s) encontrado(s):")
        print(problemas.to_string(index=False))

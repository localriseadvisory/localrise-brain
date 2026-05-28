"""
leitura.py
==========
Etapa 1 do pipeline: LER o arquivo de origem.

Para que serve:
    Abrir a exportacao que vem dos sistemas de origem (Excel .xlsx ou CSV)
    e devolver os dados em uma estrutura unica e padronizada — um DataFrame
    do pandas — para que as proximas etapas (validacao e geracao do arquivo
    do Consiste) nao precisem se preocupar com o formato original.

Por que isso e importante:
    Cada sistema exporta de um jeito. CSV pode ser separado por virgula ou
    ponto-e-virgula. Excel pode ter varias abas. Concentrando a leitura
    aqui, se amanha mudar o formato de entrada, mudamos so este arquivo.
"""

from pathlib import Path  # objeto que representa caminhos de arquivo

import pandas as pd  # biblioteca-padrao para trabalhar com tabelas


# Lista de separadores que tentamos automaticamente ao ler um CSV.
# Sistemas brasileiros costumam usar ";" porque a virgula ja e o
# separador decimal dos valores.
SEPARADORES_CSV = [";", ",", "\t", "|"]

# Codificacoes (forma de gravar acentos) mais comuns vindas de sistemas
# brasileiros. utf-8 e o padrao moderno; latin-1 (ISO-8859-1) e o legado.
CODIFICACOES_CSV = ["utf-8-sig", "utf-8", "latin-1"]


def ler_origem(caminho: str | Path) -> pd.DataFrame:
    """Le um arquivo .xlsx ou .csv e devolve um DataFrame.

    Argumentos:
        caminho: caminho do arquivo de origem.

    Devolve:
        DataFrame do pandas com os dados. Acrescenta uma coluna chamada
        '_linha_origem' com o numero da linha NO ARQUIVO ORIGINAL (linha 1
        e o cabecalho, entao os dados comecam em 2). Essa coluna e usada
        depois pelo relatorio de erros para apontar exatamente onde corrigir.
    """
    caminho = Path(caminho)

    if not caminho.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {caminho}")

    sufixo = caminho.suffix.lower()

    if sufixo == ".xlsx":
        df = _ler_xlsx(caminho)
    elif sufixo == ".csv":
        df = _ler_csv(caminho)
    else:
        raise ValueError(
            f"Extensao nao suportada: '{sufixo}'. "
            f"Use .xlsx ou .csv."
        )

    df = _padronizar(df)
    return df


def _ler_xlsx(caminho: Path) -> pd.DataFrame:
    """Le a primeira aba de um arquivo .xlsx."""
    # sheet_name=0 = primeira aba. dtype=str = le tudo como texto, para
    # nao perder zeros a esquerda em matricula, CPF, etc.
    return pd.read_excel(caminho, sheet_name=0, dtype=str)


def _ler_csv(caminho: Path) -> pd.DataFrame:
    """Le um CSV tentando descobrir separador e codificacao automaticamente."""
    ultimo_erro: Exception | None = None

    # Tentamos varias combinacoes ate uma funcionar. E mais robusto do que
    # exigir do usuario que ele saiba qual e o separador exato.
    for codificacao in CODIFICACOES_CSV:
        for sep in SEPARADORES_CSV:
            try:
                df = pd.read_csv(
                    caminho,
                    sep=sep,
                    dtype=str,
                    encoding=codificacao,
                    keep_default_na=False,  # nao converte texto vazio em NaN
                )
                # Se leu mas so achou 1 coluna, provavelmente o separador
                # estava errado — tentamos o proximo.
                if df.shape[1] > 1:
                    return df
            except Exception as e:
                ultimo_erro = e

    raise ValueError(
        f"Nao consegui ler o CSV '{caminho}'. "
        f"Ultima tentativa falhou com: {ultimo_erro}"
    )


def _padronizar(df: pd.DataFrame) -> pd.DataFrame:
    """Aplica limpezas que sempre queremos aplicar em qualquer origem."""
    # 1) Tirar espacos extras dos NOMES das colunas (cabecalho).
    df = df.rename(columns=lambda nome: str(nome).strip())

    # 2) Tirar espacos extras dos VALORES de texto.
    for coluna in df.columns:
        df[coluna] = df[coluna].astype(str).str.strip()
        # texto "nan" aparece quando a celula estava vazia no Excel
        df[coluna] = df[coluna].replace({"nan": "", "None": ""})

    # 3) Acrescentar a coluna que rastreia a linha original do arquivo.
    #    +2 porque: indice do pandas comeca em 0, e a linha 1 e o cabecalho.
    df.insert(0, "_linha_origem", df.index + 2)

    return df


# Permite testar este arquivo sozinho: "python leitura.py caminho/arquivo.xlsx"
if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Uso: python leitura.py <caminho-do-arquivo>")
        sys.exit(1)

    tabela = ler_origem(sys.argv[1])
    print(f"Linhas lidas: {len(tabela)}")
    print(f"Colunas detectadas: {list(tabela.columns)}")
    print("Primeiras 5 linhas:")
    print(tabela.head().to_string(index=False))

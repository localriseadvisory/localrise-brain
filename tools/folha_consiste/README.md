# Folha Consiste — Automação de Importação

Automação em Python que transforma exportações Excel/CSV dos sistemas de
origem em arquivos de importação para o sistema de folha de pagamento
**Consiste**, validando os dados e gerando um relatório de erros.

## O que esta automação faz

1. **Lê** a exportação de origem (Excel `.xlsx` ou CSV).
2. **Valida** os dados (campos obrigatórios, CPF, valores esperados...).
3. **Gera um relatório de erros** legível, indicando linha e coluna.
4. **Gera o arquivo final** no layout exato do Consiste.

## Pré-requisitos

- Python 3.10 ou superior
- VS Code (recomendado)

## Configurar o ambiente (apenas na primeira vez)

Abra o terminal **dentro da pasta `tools/folha_consiste`** e rode, em ordem:

```powershell
# 1. Criar o ambiente virtual (uma "caixa de ferramentas" só deste projeto)
python -m venv .venv

# 2. Ativar o ambiente virtual (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# 3. Instalar as bibliotecas necessárias
pip install -r requirements.txt

# 4. Confirmar que está tudo certo
python verificar_ambiente.py
```

Se o passo 4 imprimir **"Tudo certo!"**, o ambiente está pronto.

## Estrutura de pastas

```
tools/folha_consiste/
├── README.md             Este arquivo (documentação do projeto)
├── requirements.txt      Lista de bibliotecas que o projeto usa
├── verificar_ambiente.py Confere se o ambiente está instalado corretamente
├── leitura.py            Etapa 1: lê a exportação de origem (Excel/CSV)
├── validacao.py          Etapa 2: valida cada linha (CPF, obrigatórios...)
├── exemplos/             Arquivos de exemplo para testar
└── .venv/                Ambiente virtual (NÃO vai para o Git)
```

## Como testar

Com o ambiente ativado, na pasta do projeto:

```powershell
# Etapa 1 — só ler o arquivo e mostrar as colunas detectadas:
python leitura.py exemplos\origem_exemplo.csv

# Etapa 2 — ler + validar. Deve apontar 2 problemas de propósito no CSV
# de exemplo: linha 4 (CPF em branco) e linha 5 (CPF todos iguais).
python validacao.py exemplos\origem_exemplo.csv
```

## Regras de validação disponíveis

Definidas em `validacao.py`:

| Regra                | O que checa                                                |
|----------------------|------------------------------------------------------------|
| `obrigatorio`        | Campo não pode estar vazio.                                |
| `cpf_valido`         | CPF passa no algoritmo oficial (dois dígitos verificadores). |
| `numero_brasileiro`  | Aceita `1.234,56`, `1234,56` ou `1234.56`.                 |
| `positivo`           | Número maior que zero.                                     |

O conjunto padrão de regras (`REGRAS_PADRAO`) cobre `matricula`, `nome`,
`cpf` e `valor`. É só uma **base inicial** — vai ser ajustada quando
tivermos o layout do Consiste e soubermos os campos definitivos.

## Status do projeto

- [x] Configuração de ambiente
- [x] Etapa 1 — leitura de Excel/CSV (`leitura.py`)
- [x] Etapa 2 — validação com regras extensíveis (`validacao.py`)
- [ ] Etapa 3 — relatório de erros em arquivo (Excel/CSV)
- [ ] Etapa 4 — geração do arquivo de importação do Consiste
      *(depende do layout do Consiste)*
- [ ] Etapa 5 — script orquestrador (`importar.py`) juntando tudo

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
├── exemplos/             Arquivos de exemplo para testar (origem do Consiste)
└── .venv/                Ambiente virtual (NÃO vai para o Git)
```

## Status do projeto

Em construção. Etapa atual: **configuração de ambiente** concluída.
Próxima etapa: definir o layout do Consiste e implementar a leitura dos arquivos.

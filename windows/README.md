# Atalho Windows — Escala TJCE

## Método recomendado

Use o arquivo:

`INSTALAR-ATALHO-ESCALA-TJCE.bat`

O usuário **não precisa informar nenhum endereço**.

Ao executar o instalador, o sistema lê automaticamente o endereço configurado pela TI no arquivo:

`ENDERECO-SISTEMA.txt`

e cria na Área de Trabalho o atalho:

**Escala TJCE - Férias**

com o ícone `escala-tjce.ico`.

## Configuração pela TI

Antes de distribuir o pacote aos usuários, a equipe de TI deve editar:

`ENDERECO-SISTEMA.txt`

e substituir o valor de exemplo pelo endereço real do sistema na intranet.

Exemplo:

`https://escala-tjce.intranet.mpce.mp.br`

Depois disso, os usuários apenas executam:

`INSTALAR-ATALHO-ESCALA-TJCE.bat`

## Arquivos da pasta

- `INSTALAR-ATALHO-ESCALA-TJCE.bat` — instalador recomendado;
- `INSTALAR-ATALHO-ESCALA-TJCE.ps1`;
- `CRIAR-ATALHO-ESCALA-TJCE.bat`;
- `CRIAR-ATALHO-ESCALA-TJCE.ps1`;
- `ENDERECO-SISTEMA.txt` — endereço definido pela TI;
- `escala-tjce.ico` — ícone do sistema;
- `COMO-INSTALAR-O-ATALHO.txt` — instruções rápidas.

## Distribuição institucional

A TI pode distribuir toda a pasta `windows` por GPO ou outra ferramenta de gerenciamento de estações. Assim, o endereço é configurado centralmente e o usuário final não precisa fazer qualquer ajuste.

# Escala TJCE — Versão Portátil para Windows

Esta pasta permite testar o sistema sem instalar Docker, PostgreSQL ou servidor.

## Como abrir

1. Extraia o ZIP para uma pasta do computador.
2. Abra a pasta extraída.
3. Dê dois cliques em `ABRIR-APLICATIVO.bat`.
4. O sistema abrirá no navegador padrão.

## Armazenamento

Os dados desta versão ficam somente no navegador do computador, por meio de `localStorage`.

Isso significa que:

- serve para teste local;
- não sincroniza dados entre computadores;
- não possui login institucional;
- não substitui a versão de intranet;
- limpar os dados do navegador pode apagar os registros locais.

## Versão institucional

A versão institucional permanece nas pastas `frontend/` e `backend/` do repositório e deve ser implantada pela TI do MPCE.

## Arquivos

- `index.html`
- `styles.css`
- `app.js`
- `ABRIR-APLICATIVO.bat`

Não é necessário instalar o aplicativo. Basta extrair a pasta e abrir o arquivo BAT.

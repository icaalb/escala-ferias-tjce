# Cliente Windows da versão unificada 8.1

Este cliente abre a aplicação da intranet em uma janela própria do Electron, sem depender de Edge ou Chrome instalados. Usa o mesmo servidor, a mesma base PostgreSQL e o mesmo login da versão web. **Não é um aplicativo offline.**

Após a TI publicar o sistema e informar seu endereço HTTPS, o usuário informa esse endereço na primeira abertura. O instalador é configurado para instalação por usuário, sem elevação administrativa, e para criar atalho na área de trabalho.

Para gerar o instalador em ambiente de desenvolvimento Windows com Node.js:

```powershell
cd desktop
npm install
npm run dist:win
```

O arquivo resultante estará em `desktop/dist/`. A TI deve testar, assinar o instalador conforme sua política e homologar o endereço antes de distribuí-lo. O código-fonte publicado aqui não é, por si só, um `.exe` pronto.



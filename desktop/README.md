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

O fluxo automatizado em `.github/workflows/desktop-windows.yml` também gera um artefato de instalador na aba **Actions** do GitHub. Artefatos são temporários; a TI deve baixá-lo, testá-lo e publicá-lo no canal institucional aprovado. Não substitua o pacote antigo da versão estática pelo novo sem migração e homologação.


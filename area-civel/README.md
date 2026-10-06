# Escala TJCE - Área Cível

Versão estática preparada para publicação institucional na intranet do MPCE.

## Conteúdo

- `index.html`, `app.js` e `styles.css`: aplicação web.
- `mpce-logo.svg`: identidade visual do MPCE incorporada à página.
- `GUIA-USUARIO-ESCALA-TJCE-AREA-CIVEL.md`: manual do usuário.
- `web.config`: exemplo de proteção por Windows Authentication no IIS.

## Publicação

Copie esta pasta para um site interno e configure o IIS com Windows Authentication habilitada e Anonymous Authentication desabilitada. A definição dos grupos autorizados deve ser feita pela TI do MPCE.

Os dados desta versão estática ficam no perfil local do navegador ou aplicativo. Para compartilhamento central entre usuários, utilize a arquitetura institucional em `frontend/` e `backend/` deste repositório.

O instalador desktop e o pacote ZIP são distribuídos separadamente porque ultrapassam o limite recomendado para arquivos comuns do GitHub.

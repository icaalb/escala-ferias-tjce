# Segurança — Versão Institucional 8.0

## Controles já previstos

- senhas armazenadas por hash bcrypt;
- autenticação por JWT;
- autorização por perfis;
- API de escrita protegida;
- painel público sem credencial e somente leitura;
- auditoria de inclusões, exclusões e alterações sensíveis;
- banco PostgreSQL central;
- segredo JWT e senhas fora do repositório, via `.env`;
- frontend e backend isolados em serviços Docker.

## Requisitos antes da produção

1. Trocar todas as credenciais do `.env.example`.
2. Não versionar o arquivo `.env`.
3. Publicar exclusivamente em HTTPS na intranet.
4. Restringir acesso administrativo por rede e/ou SSO institucional.
5. Definir política de expiração de tokens.
6. Integrar, se possível, ao LDAP/AD/OIDC do MPCE.
7. Habilitar coleta de logs centralizada.
8. Definir retenção dos registros de auditoria.
9. Executar varredura de vulnerabilidades das imagens e dependências.
10. Homologar backup e restauração.
11. Revisar permissões do painel público para evitar exposição de dados não autorizados.

## Dados pessoais

A estrutura atual usa principalmente número de Procuradoria, evitando nomes no painel. Se forem adicionados dados pessoais posteriormente, a exposição pública deve ser revisada antes da implantação.

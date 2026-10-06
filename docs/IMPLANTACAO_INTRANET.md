# Guia Completo de Implantação na Intranet do MPCE

## 1. Objetivo

Este documento reúne o roteiro técnico e operacional para implantação, homologação, disponibilização e manutenção do sistema **Escala TJCE – Férias e Rodízio — Versão Institucional 8.0** na intranet do MPCE.

A equipe de TI deverá implantar a aplicação, configurar o ambiente, definir o endereço interno, proteger os serviços, criar ou integrar os usuários autorizados, restringir os acessos, testar backup e restauração e somente então liberar o uso em produção.

## 2. Arquitetura

A solução utiliza três serviços principais:

1. **frontend** — Nginx servindo a interface web e encaminhando chamadas `/api/` ao backend;
2. **backend** — FastAPI com autenticação JWT, autorização por perfil, regras de negócio e auditoria;
3. **db** — PostgreSQL 16 com persistência centralizada.

A aplicação deve ser utilizada pela pasta `frontend/` em conjunto com `backend/`, por meio do `docker-compose.yml`.

Os arquivos `index.html`, `app.js` e `styles.css` existentes na raiz são mantidos apenas como referência do protótipo anterior e não devem ser utilizados como versão institucional de produção.

## 3. Pré-requisitos de infraestrutura

A TI deverá providenciar:

- servidor Linux homologado pelo MPCE;
- Docker Engine;
- Docker Compose Plugin;
- espaço persistente para o PostgreSQL;
- DNS interno para o sistema, se adotado;
- certificado TLS/HTTPS institucional;
- proxy reverso institucional, se aplicável;
- acesso controlado à rede interna;
- rotina de backup;
- mecanismo de monitoramento;
- política de logs;
- conta técnica ou procedimento institucional para atualização do repositório.

## 4. Obtenção do sistema

No servidor:

```bash
git clone https://github.com/icaalb/escala-ferias-tjce.git
cd escala-ferias-tjce
cp .env.example .env
```

## 5. Configuração obrigatória do .env

Antes do primeiro start, a TI deverá editar o arquivo `.env`.

Campos obrigatórios:

```text
POSTGRES_DB=ferias
POSTGRES_USER=ferias
POSTGRES_PASSWORD=SENHA_FORTE_DO_BANCO
DATABASE_URL=postgresql+psycopg://ferias:SENHA_FORTE_DO_BANCO@db:5432/ferias
JWT_SECRET=SEGREDO_LONGO_ALEATORIO
ACCESS_TOKEN_MINUTES=480
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SENHA_FORTE_DO_ADMINISTRADOR
CORS_ORIGINS=https://endereco-interno-do-sistema
```

Regras:

- nunca utilizar as senhas de exemplo;
- não versionar o arquivo `.env`;
- gerar `JWT_SECRET` longo e aleatório;
- manter `DATABASE_URL` compatível com a senha do PostgreSQL;
- limitar `CORS_ORIGINS` aos endereços efetivamente utilizados;
- proteger o arquivo `.env` com permissão restrita no servidor.

## 6. Inicialização

Executar:

```bash
docker compose build
docker compose up -d
docker compose ps
```

Verificar se os três serviços estão ativos.

Por padrão, a interface é publicada em:

```text
http://SERVIDOR:8080
```

O endpoint de saúde da API é:

```text
http://SERVIDOR:8080/api/health
```

Em produção, a TI deve preferir endereço institucional em HTTPS, por exemplo:

```text
https://escala-tjce.intranet.mpce.mp.br
```

O nome acima é apenas ilustrativo e deverá ser definido pela infraestrutura do MPCE.

## 7. Primeiro administrador

O primeiro administrador é criado automaticamente somente quando o banco ainda não possui usuários.

Ele será criado a partir de:

- `ADMIN_USERNAME`;
- `ADMIN_PASSWORD`.

Essas credenciais devem ser definidas pela TI antes do primeiro start.

Depois da homologação, recomenda-se que o administrador inicial seja substituído ou tenha sua senha renovada conforme a política institucional.

## 8. Servidores do MPCE autorizados a acessar

A TI deverá definir previamente **quais servidores/usuários do MPCE poderão acessar a área administrativa**.

O cadastro deve ser nominal e individual. Não se recomenda compartilhar uma mesma conta entre vários servidores, porque a auditoria precisa identificar quem realizou cada alteração.

A relação mínima a ser recebida pela TI deverá conter:

| Campo | Exemplo |
|---|---|
| Nome funcional | Nome do servidor |
| Usuário institucional | login institucional |
| Unidade | Procuradoria/Secretaria/Setor |
| Perfil | Administrador, Operador ou Consulta |
| Situação | Ativo/Inativo |
| Data de autorização | data |
| Responsável pela autorização | unidade competente |

Os perfis existentes são:

- **admin** — administra usuários, consulta auditoria e pode incluir/alterar dados operacionais;
- **operator** — cadastra férias, sessões e substituições e utiliza o gerador anual;
- **viewer** — consulta os dados da área autenticada, sem autorização de escrita;
- **público** — acesso somente ao painel público, sem login e sem permissão de alteração.

A equipe responsável pelo sistema deverá informar à TI quais servidores receberão cada perfil.

## 9. Inclusão dos servidores autorizados

Na versão 8.0 há gerenciamento de usuários pela área administrativa.

O administrador poderá criar usuários em **Usuários**, informando:

- usuário;
- senha inicial;
- perfil.

A API correspondente também está disponível exclusivamente para administradores.

Antes da produção definitiva, a TI poderá substituir o login local por:

- LDAP;
- Active Directory;
- SSO;
- OIDC;
- outro mecanismo institucional.

Nesse cenário, recomenda-se manter a tabela de perfis da aplicação para definir quem é Administrador, Operador ou Consulta.

## 10. Desativação de acesso

Quando um servidor deixar de atuar na unidade, mudar de função ou perder autorização, seu acesso deverá ser desativado imediatamente.

A TI ou o administrador do sistema deverá:

1. identificar o usuário;
2. desativar a conta;
3. preservar os registros de auditoria já existentes;
4. nunca apagar a trilha histórica apenas porque o usuário foi desativado.

## 11. Restrição de acesso por rede

Além da autenticação da aplicação, recomenda-se que a TI restrinja a área administrativa à rede interna do MPCE.

Podem ser adotados, conforme a infraestrutura institucional:

- VLAN;
- firewall;
- reverse proxy;
- allowlist de sub-redes;
- VPN institucional;
- autenticação integrada;
- políticas de acesso condicional.

O banco PostgreSQL não deve ser exposto diretamente aos computadores dos usuários. Apenas o backend deve se comunicar com o banco.

## 12. Painel público interno

O painel público é somente leitura.

A TI deverá decidir se ele ficará:

- acessível para toda a intranet;
- acessível apenas a determinadas redes;
- ou disponível somente a usuários autenticados pelo ambiente institucional.

Mesmo no painel público, devem ser exibidas apenas as informações autorizadas administrativamente.

## 13. Órgãos pré-cadastrados

### Direito Público

- 1ª Câmara de Direito Público — 13ª, 20ª e 26ª Procuradorias;
- 2ª Câmara de Direito Público — 8ª, 14ª e 52ª Procuradorias;
- 3ª Câmara de Direito Público — 17ª, 43ª e 21ª Procuradorias;
- 21ª Procuradoria — Convocado — a ser preenchido;
- Seção de Direito Público — rodízio com as Procuradorias de Direito Público.

### Direito Privado

- 1ª Câmara de Direito Privado — 36ª, 40ª e 53ª Procuradorias;
- 2ª Câmara de Direito Privado — 39ª, 30ª e 4ª Procuradorias;
- 3ª Câmara de Direito Privado — 1ª, 38ª e 51ª Procuradorias;
- 4ª Câmara de Direito Privado — 46ª, 57ª e 56ª Procuradorias;
- 5ª Câmara de Direito Privado — 25ª, 34ª e 45ª Procuradorias;
- 6ª Câmara de Direito Privado — 22ª, 27ª e 32ª Procuradorias;
- Seção de Direito Privado — rodízio com as Procuradorias de Direito Privado;
- Núcleo de Justiça 4.0 — 1ª e 2ª Turmas de Direito Privado — tratado como um único bloco institucional.

## 14. Configuração das sessões

Depois da implantação, um Administrador ou Operador deverá:

1. acessar **Gerador anual**;
2. selecionar o dia semanal de sessão de cada órgão;
3. salvar a configuração;
4. registrar datas sem sessão, quando aplicável;
5. conferir a composição dos rodízios;
6. gerar a escala anual;
7. revisar a escala consolidada antes da publicação.

A geração automática é executada no backend e salva os resultados no PostgreSQL.

## 15. Férias

Os períodos de férias são persistidos no banco central.

O backend valida:

- período de 10 a 30 dias;
- máximo de 6 períodos;
- limite anual de 60 dias;
- sobreposição da mesma Procuradoria;
- limite simultâneo dentro da Câmara de vinculação.

A regra funcional deverá ser conferida pela unidade responsável antes da homologação definitiva.

## 16. Substituições

A tabela de substituições deverá ser cadastrada pela unidade competente.

O sistema não deve inferir uma substituição que não esteja formalmente cadastrada.

Quando a Procuradoria nominal estiver em férias, o backend verifica:

1. se há substituta cadastrada;
2. se a substituta está disponível;
3. qual Procuradoria será indicada como atuação efetiva;
4. se há pendência por ausência ou indisponibilidade da substituta.

## 17. Auditoria

As operações relevantes geram registros de auditoria.

O administrador pode consultar:

- usuário;
- data/hora;
- ação;
- entidade alterada;
- identificação do registro;
- detalhes da operação.

A TI deverá definir o prazo institucional de retenção desses logs.

## 18. Atalho na Área de Trabalho

O repositório possui a pasta:

```text
windows/
```

Ela contém:

- `CRIAR-ATALHO-ESCALA-TJCE.bat`;
- `CRIAR-ATALHO-ESCALA-TJCE.ps1`;
- `escala-tjce.ico`;
- `README.md`.

A TI deverá editar no arquivo BAT:

```bat
set "URL=http://servidor-interno:8080"
```

e substituir pelo endereço definitivo.

Depois, poderá executar o script nas estações autorizadas.

O atalho criado será:

**Escala TJCE - Férias**

A distribuição poderá ser feita por GPO ou outra ferramenta institucional de gerenciamento de estações.

## 19. HTTPS

Para produção, não se recomenda manter acesso administrativo por HTTP simples.

A TI deverá:

1. obter ou emitir certificado institucional;
2. publicar o sistema por HTTPS;
3. redirecionar HTTP para HTTPS, se pertinente;
4. ajustar `CORS_ORIGINS`;
5. verificar cabeçalhos de segurança no proxy reverso.

## 20. Firewall

A configuração recomendada é:

- frontend/reverse proxy: acessível apenas pela rede autorizada;
- backend: acessível somente pelo frontend/proxy;
- PostgreSQL: acessível somente pelo backend;
- nenhuma porta do banco deve ser exposta diretamente aos usuários finais.

## 21. Backup

Antes de colocar o sistema em produção, a TI deverá testar o backup.

O repositório contém:

```bash
scripts/backup.sh
```

O script gera um dump compactado do PostgreSQL na pasta `backup/`.

Exemplo:

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

A TI deverá definir:

- periodicidade;
- retenção;
- destino externo ao servidor;
- criptografia, quando exigida;
- monitoramento de falhas;
- responsável pela rotina.

## 22. Restauração

O repositório contém:

```bash
scripts/restore.sh backup/arquivo.sql.gz
```

A restauração deve ser testada em ambiente de homologação antes da entrada em produção.

Um backup que nunca foi restaurado em teste não deve ser considerado validado.

## 23. Atualização do sistema

Antes de atualizar:

1. realizar backup;
2. registrar a versão atual;
3. verificar alterações do banco;
4. testar em homologação.

Depois:

```bash
git pull
docker compose build
docker compose up -d
docker compose ps
```

Verificar o endpoint:

```text
/api/health
```

## 24. Monitoramento

Recomenda-se monitorar:

- disponibilidade do frontend;
- endpoint `/api/health`;
- estado dos containers;
- uso de CPU;
- memória;
- espaço em disco;
- volume PostgreSQL;
- falhas de login;
- erros HTTP 5xx;
- crescimento dos logs;
- execução dos backups.

## 25. Checklist de homologação

Antes da liberação, a TI deverá confirmar:

- [ ] servidor provisionado;
- [ ] repositório clonado;
- [ ] `.env` criado e protegido;
- [ ] senhas de exemplo substituídas;
- [ ] segredo JWT alterado;
- [ ] PostgreSQL funcionando;
- [ ] backend funcionando;
- [ ] frontend funcionando;
- [ ] endpoint de saúde respondendo;
- [ ] HTTPS configurado;
- [ ] DNS interno configurado;
- [ ] firewall revisado;
- [ ] usuários autorizados cadastrados;
- [ ] perfis revisados;
- [ ] usuário não autorizado sem acesso administrativo;
- [ ] painel público validado;
- [ ] férias testadas;
- [ ] conflitos testados;
- [ ] substituições testadas;
- [ ] gerador anual testado;
- [ ] datas sem sessão testadas;
- [ ] auditoria testada;
- [ ] backup executado;
- [ ] restauração testada;
- [ ] atalhos Windows testados;
- [ ] acesso por celular/navegador, se permitido, testado;
- [ ] logs e monitoramento definidos;
- [ ] responsável técnico definido;
- [ ] responsável funcional definido;
- [ ] homologação formal registrada.

## 26. Responsabilidades sugeridas

### TI do MPCE

- infraestrutura;
- deploy;
- DNS;
- TLS;
- firewall;
- PostgreSQL;
- backups;
- monitoramento;
- integração de autenticação;
- disponibilidade;
- atualização técnica.

### Unidade gestora do sistema

- informar quem pode acessar;
- informar o perfil de cada servidor;
- cadastrar ou validar férias;
- cadastrar substituições;
- validar dias de sessão;
- validar datas sem sessão;
- revisar a escala;
- autorizar publicação;
- solicitar bloqueio de usuários quando necessário.

## 27. Produção

A versão 8.0 deve ser tratada como pacote para **homologação institucional**.

A entrada em produção deverá ocorrer somente depois da validação da TI e da unidade gestora quanto a:

- segurança;
- infraestrutura;
- LGPD;
- autenticação;
- perfis;
- regras funcionais;
- backup;
- restauração;
- auditoria;
- continuidade de serviço.

## 28. Integração futura com autenticação institucional

A autenticação local JWT já permite a homologação do sistema.

Para produção definitiva, recomenda-se avaliar integração com a identidade institucional do MPCE, evitando criação paralela de senhas quando houver infraestrutura disponível.

A integração pode ser feita com LDAP, Active Directory, SSO ou OIDC, preservando os perfis internos de autorização do sistema.

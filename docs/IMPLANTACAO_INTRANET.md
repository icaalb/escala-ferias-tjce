# Implantação na Intranet do MPCE

## Arquitetura

A versão 8.0 utiliza três serviços:

1. **frontend**: Nginx servindo a interface web e encaminhando `/api/` ao backend;
2. **backend**: FastAPI com autenticação JWT, regras de negócio e auditoria;
3. **db**: PostgreSQL 16 com persistência em volume Docker.

## Pré-requisitos

- Linux Server homologado pela TI;
- Docker Engine e Docker Compose Plugin;
- DNS interno, se desejado;
- proxy institucional/TLS conforme política do MPCE;
- rotina de backup do volume PostgreSQL.

## Instalação

```bash
git clone https://github.com/icaalb/escala-ferias-tjce.git
cd escala-ferias-tjce
cp .env.example .env
```

Edite obrigatoriamente no arquivo `.env`:

- `POSTGRES_PASSWORD`;
- `DATABASE_URL` com a mesma senha;
- `JWT_SECRET` com valor longo e aleatório;
- `ADMIN_PASSWORD`;
- `CORS_ORIGINS` com o endereço autorizado.

Depois:

```bash
docker compose build
docker compose up -d
docker compose ps
```

A aplicação ficará, por padrão, em:

```
http://SERVIDOR:8080
```

O endpoint de saúde:

```
http://SERVIDOR:8080/api/health
```

## Primeiro acesso

O usuário administrador inicial é definido exclusivamente pelo arquivo `.env`.

No primeiro start, se ainda não existir usuário no banco, o backend cria o administrador informado em:

- `ADMIN_USERNAME`;
- `ADMIN_PASSWORD`.

Troque esses valores antes da primeira inicialização.

## Perfis

- **admin**: usuários, auditoria, férias, sessões e substituições;
- **operator**: férias, sessões e substituições;
- **viewer**: consulta autenticada;
- **público**: apenas endpoint e painel público, sem escrita.

## Persistência

O PostgreSQL utiliza o volume:

```
postgres_data
```

Não remova esse volume em atualização ordinária.

## Atualização

```bash
git pull
docker compose build
docker compose up -d
```

Antes de qualquer atualização em produção, faça backup.

## Integração futura com autenticação institucional

A versão 8.0 usa autenticação local JWT. Para produção definitiva, a TI pode substituir o login local por LDAP/Active Directory, SSO/OIDC ou outro provedor institucional, mantendo as funções de autorização por perfil.

## Observação

A aplicação é um pacote técnico para homologação. A publicação em produção deve passar pela validação de infraestrutura, segurança, LGPD, autenticação institucional, política de logs, backup e recuperação adotadas pelo MPCE.

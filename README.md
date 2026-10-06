# Escala TJCE – Férias e Rodízio

Sistema institucional para gestão de férias das Procuradorias de Justiça com atuação perante o TJCE, geração e consolidação de escalas, substituições, identificação de conflitos, auditoria e painel público somente leitura.

## Versão atual

**8.0 — arquitetura institucional para intranet**

A versão 8.0 acrescenta backend, PostgreSQL, autenticação, perfis de acesso, API, auditoria, Docker, proxy reverso e documentação de implantação.

## Estrutura do repositório

```text
.
├── frontend/                 # interface institucional conectada à API
├── backend/                  # FastAPI, autenticação e regras de negócio
│   └── app/
├── database/                 # documentação do esquema
├── deploy/                   # configuração do Nginx
├── docs/                     # implantação e segurança
├── scripts/                  # backup e restauração
├── docker-compose.yml
├── .env.example
├── .gitignore
├── index.html                # protótipo legado 7.x
├── app.js                    # protótipo legado 7.x
└── styles.css                # protótipo legado 7.x
```

> Os arquivos da raiz foram mantidos como referência do protótipo anterior. Para implantação na intranet, utilize a aplicação em `frontend/` + `backend/` através do `docker-compose.yml`.

## Funcionalidades institucionais

- banco PostgreSQL central;
- frontend conectado à API;
- autenticação JWT;
- senhas com hash bcrypt;
- perfis `admin`, `operator` e `viewer`;
- painel público sem permissão de escrita;
- criação administrativa de usuários via API;
- auditoria de operações;
- férias por Procuradoria;
- validação de períodos entre 10 e 30 dias;
- limite de até 6 períodos;
- controle de 60 dias anuais;
- detecção de sobreposição;
- controle do limite de afastamento simultâneo na Câmara;
- sessões do TJCE;
- substituições;
- cálculo da atuação efetiva quando o titular estiver de férias;
- exportação e painel consolidado;
- backup e restauração;
- execução em Docker.

## Órgãos pré-carregados

### Direito Público

- 1ª Câmara de Direito Público: 13ª, 20ª e 26ª Procuradorias
- 2ª Câmara de Direito Público: 8ª, 14ª e 52ª Procuradorias
- 3ª Câmara de Direito Público: 17ª, 43ª e 21ª Procuradorias
  - 21ª Procuradoria: convocado — a ser preenchido
- Seção de Direito Público: rodízio com todas as Procuradorias de Direito Público

### Direito Privado

- 1ª Câmara de Direito Privado: 36ª, 40ª e 53ª Procuradorias
- 2ª Câmara de Direito Privado: 39ª, 30ª e 4ª Procuradorias
- 3ª Câmara de Direito Privado: 1ª, 38ª e 51ª Procuradorias
- 4ª Câmara de Direito Privado: 46ª, 57ª e 56ª Procuradorias
- 5ª Câmara de Direito Privado: 25ª, 34ª e 45ª Procuradorias
- 6ª Câmara de Direito Privado: 22ª, 27ª e 32ª Procuradorias
- Seção de Direito Privado: rodízio com todas as Procuradorias de Direito Privado
- Núcleo de Justiça 4.0 — 1ª e 2ª Turmas de Direito Privado: um único bloco institucional com rodízio entre as Procuradorias de Direito Privado

## Implantação rápida

```bash
git clone https://github.com/icaalb/escala-ferias-tjce.git
cd escala-ferias-tjce
cp .env.example .env
# editar senhas, segredo JWT e origem autorizada
docker compose build
docker compose up -d
```

A interface fica, por padrão, em:

```
http://SERVIDOR:8080
```

Saúde da API:

```
http://SERVIDOR:8080/api/health
```

## Documentação para TI

- [Implantação na intranet](docs/IMPLANTACAO_INTRANET.md)
- [Segurança](docs/SEGURANCA.md)
- [Banco de dados](database/README.md)

## Credenciais

O administrador inicial é criado a partir do arquivo `.env`.

Nunca utilize em produção os valores de exemplo.

## Observações de produção

A versão 8.0 é um **pacote para homologação institucional**. Antes da entrada em produção, a TI do MPCE deve validar:

- TLS/HTTPS;
- integração com LDAP/AD/OIDC, se exigida;
- política institucional de logs;
- backup e restauração;
- monitoramento;
- varredura de vulnerabilidades;
- regras de firewall;
- retenção da auditoria;
- LGPD e dados expostos no painel público.

Para alterações futuras de estrutura do banco, recomenda-se adotar migrations versionadas com Alembic.

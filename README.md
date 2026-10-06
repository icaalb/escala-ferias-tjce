# Escala TJCE – Férias e Rodízio

Sistema institucional para gestão de férias das Procuradorias de Justiça com atuação perante o TJCE, geração e consolidação de escalas, substituições, identificação de conflitos, auditoria e painel público somente leitura.

## Versão atual

**8.1 — versão unificada da Área Cível para intranet e Windows**

A versão 8.1 usa uma única API e um único banco PostgreSQL para a interface da intranet e o cliente Windows. Os painéis da Área Cível — geral, por Câmara, conflitos, cobertura, calendário, escala consolidada, férias, sessões, substituições, usuários e auditoria — estão na interface `frontend/`. O cliente Windows abre essa interface em janela própria e não depende de Edge ou Chrome instalados.

## Estrutura do repositório

```text
.
├── frontend/                 # interface institucional conectada à API
├── desktop/                  # cliente Electron para Windows; mesmo servidor e banco
├── backend/                  # FastAPI, autenticação e regras de negócio
│   └── app/
├── database/                 # documentação do esquema
├── deploy/                   # configuração do Nginx
├── docs/                     # implantação e segurança
├── scripts/                  # backup e restauração
├── windows/                  # atalho e ícone para estações Windows
├── docker-compose.yml
├── .env.example
├── .gitignore
├── index.html                # protótipo legado 7.x
├── app.js                    # protótipo legado 7.x
└── styles.css                # protótipo legado 7.x
```

> Os arquivos da raiz e `area-civel/` foram mantidos como referências legadas; não são a versão institucional unificada. Para implantação, use `frontend/` + `backend/` com `docker-compose.yml`. O cliente Windows em `desktop/` acessa esse mesmo servidor. Não publique `area-civel/index.html` como se fosse a versão 8.1.

## Funcionalidades institucionais

- banco PostgreSQL central;
- frontend conectado à API;
- autenticação JWT;
- senhas com hash bcrypt;
- perfis `admin`, `operator` e `viewer`;
- painel de consulta autenticado e sem permissão de escrita;
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
- execução em Docker;
- cliente Windows independente do navegador instalado, com instalador por usuário e atalho de área de trabalho quando empacotado.

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

- [Guia completo de implantação na intranet](docs/IMPLANTACAO_INTRANET.md)
- [Segurança](docs/SEGURANCA.md)
- [Banco de dados](database/README.md)

O guia de implantação passou a incluir o roteiro completo para a equipe de TI: provisionamento, configuração, HTTPS, firewall, backup, restauração, monitoramento, atalhos Windows, homologação e **cadastro dos servidores/usuários autorizados**, com perfis individuais de Administrador, Operador ou Consulta.

A unidade gestora deverá entregar à TI a relação dos servidores que poderão acessar a área administrativa. Não se recomenda conta compartilhada, pois a auditoria deve identificar individualmente quem realizou cada operação.

## Credenciais

O administrador inicial é criado a partir do arquivo `.env`.

Nunca utilize em produção os valores de exemplo.

## Observações de produção

A versão 8.1 é um **pacote para homologação institucional**, não uma publicação já instalada na intranet. Antes da entrada em produção, a TI do MPCE deve validar:

- TLS/HTTPS;
- integração com LDAP/AD/OIDC, se exigida;
- política institucional de logs;
- backup e restauração;
- monitoramento;
- varredura de vulnerabilidades;
- regras de firewall;
- retenção da auditoria;
- LGPD e autorização dos usuários do painel de consulta.

Os dados anteriormente salvos no navegador pela versão estática `area-civel/` **não são migrados automaticamente** para o PostgreSQL. A TI deverá conferir as informações e executar uma migração controlada, se for necessária. Não cole dados pessoais em arquivos públicos do repositório.

## Cliente Windows

O código do aplicativo independente do navegador está em [`desktop/`](desktop/README.md). O instalador `.exe` precisa ser gerado e homologado em um ambiente Windows de desenvolvimento; publicar estes arquivos-fonte no GitHub não instala automaticamente o aplicativo no computador. Após a instalação, informe o endereço HTTPS real da intranet. O cliente exige conexão com o servidor e as mesmas credenciais da versão web.

Para alterações futuras de estrutura do banco, recomenda-se adotar migrations versionadas com Alembic.

## Atalho na Área de Trabalho

A pasta `windows/` contém:

- `CRIAR-ATALHO-ESCALA-TJCE.bat`;
- `CRIAR-ATALHO-ESCALA-TJCE.ps1`;
- `escala-tjce.ico`;
- instruções específicas para a TI.

A equipe de TI deve ajustar o endereço da intranet no arquivo BAT e executá-lo nas estações desejadas. O script cria o atalho **Escala TJCE - Férias** na Área de Trabalho.

## Pacote Área Cível anterior

A pasta [`area-civel/`](area-civel/) continua disponível como referência histórica da versão estática. Seus dados locais não são compartilhados com a versão 8.1:

- [Aplicação Área Cível](area-civel/index.html)
- [Guia do usuário](area-civel/GUIA-USUARIO-ESCALA-TJCE-AREA-CIVEL.md)
- [Guia do usuário em PDF](area-civel/GUIA-USUARIO-ESCALA-TJCE-AREA-CIVEL.pdf)
- [Instruções da pasta](area-civel/README.md)

Os instaladores e pacotes ZIP do desktop são distribuídos separadamente por excederem o limite recomendado para arquivos comuns do GitHub.


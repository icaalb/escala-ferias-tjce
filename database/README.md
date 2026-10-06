# Banco de dados

A versão 8.0 usa PostgreSQL e SQLAlchemy.

Na inicialização, o backend cria as tabelas necessárias e faz o seed da composição dos órgãos e Procuradorias cadastrados no código institucional.

Tabelas principais:

- `users`
- `organs`
- `offices`
- `organ_offices`
- `vacations`
- `substitutions`
- `sessions`
- `calendar_exclusions`
- `audit_logs`

## Produção

Para evolução do esquema após a homologação inicial, recomenda-se incorporar Alembic e migrations versionadas. A criação automática atual é adequada para bootstrap da versão 8.0, mas mudanças futuras de estrutura devem ser migradas de forma controlada.

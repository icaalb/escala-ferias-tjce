# Escala TJCE – Férias e Rodízio

Sistema web para organização de férias das Procuradorias de Justiça com atuação perante o TJCE, geração de rodízio anual, controle de substituições, identificação de conflitos e painel público somente leitura.

## Funcionalidades

- cadastro de períodos de férias por número da Procuradoria;
- composição das Câmaras de Direito Público e de Direito Privado;
- inclusão da Seção de Direito Público;
- inclusão da Seção de Direito Privado;
- inclusão do Núcleo de Justiça 4.0;
- inclusão da 1ª Turma de Direito Privado;
- inclusão da 2ª Turma de Direito Privado;
- controle de 60 dias anuais;
- validação de períodos entre 10 e 30 dias;
- limite de até 6 períodos;
- identificação de sobreposição dentro da mesma Câmara de vinculação principal;
- controle de férias em janeiro, julho e dezembro;
- geração automática da escala anual do TJCE por rodízio;
- configuração do dia semanal de sessão por órgão;
- cadastro de datas sem sessão;
- tabela de substituições;
- verificação automática de coincidência entre escala e férias;
- painel específico por órgão;
- escala consolidada;
- exportação CSV;
- impressão/PDF;
- painel público interativo e somente leitura.

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
- 1ª Turma de Direito Privado: rodízio com todas as Procuradorias de Direito Privado
- 2ª Turma de Direito Privado: rodízio com todas as Procuradorias de Direito Privado

### Núcleo

- Núcleo de Justiça 4.0: rodízio com todas as Procuradorias cadastradas

## Como usar

1. Abra `index.html`.
2. Lance os períodos de férias.
3. Configure os dias de sessão dos órgãos.
4. Cadastre as substituições.
5. Informe datas sem sessão, quando necessário.
6. Gere a escala anual.
7. Consulte o painel por órgão e a escala consolidada.
8. Use o painel público para consulta sem edição.

## Armazenamento

Nesta versão, os dados ficam armazenados no navegador por meio de `localStorage`.

Para implantação institucional ou publicação em ambiente compartilhado, recomenda-se migrar para:

- banco de dados central;
- área administrativa autenticada;
- API de escrita protegida;
- painel público separado e somente leitura;
- trilha de auditoria das alterações.

## Versão atual

Versão 7.2 — inclui Seções de Direito Público e Privado, Núcleo de Justiça 4.0, 1ª Turma de Direito Privado e 2ª Turma de Direito Privado.
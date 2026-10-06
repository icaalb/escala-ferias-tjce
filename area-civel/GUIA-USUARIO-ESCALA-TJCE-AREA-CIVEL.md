# Guia do Usuário — Escala TJCE • Área Cível

## 1. Sobre o sistema

O sistema organiza férias, rodízio e atuação perante o TJCE para a Área Cível do Ministério Público do Estado do Ceará. Ele permite registrar períodos de férias, configurar sessões, gerar escalas, apontar conflitos e visualizar a atuação efetiva quando houver substituição.

O sistema utiliza somente o número da Procuradoria. Não são cadastrados nomes pessoais.

## 2. Como acessar

### Versão web da intranet

Abra o endereço fornecido pela TI do MPCE e faça o login institucional. A página deverá estar protegida pela autenticação da intranet.

### Aplicativo desktop

1. Baixe o instalador `Instalar-Escala-TJCE-Desktop-NoAdmin-v6.exe`.
2. Na pasta Downloads, clique duas vezes no arquivo.
3. Aguarde a instalação.
4. Abra o atalho **Escala TJCE** criado na Área de Trabalho ou no menu Iniciar.

O aplicativo desktop funciona de forma independente do Microsoft Edge e do Google Chrome.

## 3. Escolher o ano

No cabeçalho, selecione o ano de trabalho. O sistema inicia com 2027 e permite selecionar 2028. As férias, sessões e escalas são filtradas pelo ano escolhido.

## 4. Menu principal

- **Painel Público:** consulta resumida da escala, com filtros por área, Câmara e mês.
- **Painel geral:** visão geral dos períodos cadastrados e da situação anual.
- **Painel por Câmara:** reúne férias, sessões, substituições e alertas de uma Câmara.
- **Conflitos:** compara períodos de férias sobrepostos dentro da mesma Câmara.
- **Escala consolidada:** mostra a escala final, a Procuradoria nominal e a atuação efetiva.
- **Lançar férias:** registra e exclui períodos de férias.
- **Gerar escala de férias:** identifica cobertura disponível e situações de atenção ou conflito.
- **Gerador anual TJCE:** configura sessões, datas sem sessão e rodízio anual.
- **Escala TJCE anual:** permite gerar ou lançar manualmente datas de atuação.
- **Substituições:** cadastra quem substituirá cada Procuradoria.
- **Calendário:** apresenta os períodos de férias por mês.
- **Câmaras:** consulta a composição de cada Câmara.
- **Regras:** apresenta os critérios utilizados nos cálculos.

## 5. Ordem recomendada de uso

### Passo 1 — Conferir as Câmaras

Abra **Câmaras** e confirme a composição das unidades e as Procuradorias vinculadas a cada Câmara.

### Passo 2 — Configurar as sessões

1. Abra **Gerador anual TJCE**.
2. Em **Configuração das sessões**, escolha o dia semanal de sessão de cada Câmara.
3. Use **Não gerar** quando o dia oficial ainda não estiver definido.
4. Em **Datas sem sessão**, cadastre feriados, recessos ou outras datas que não devem gerar atuação.
5. Clique em **Gerar escala anual**.

### Passo 3 — Cadastrar as substituições

1. Abra **Substituições**.
2. Selecione a **Procuradoria titular**.
3. Selecione a **Procuradoria substituta**.
4. Clique em **Salvar substituição**.

Cadastre as substituições antes de analisar a escala final, para que o sistema consiga indicar a atuação efetiva.

### Passo 4 — Informar férias

1. Abra **Lançar férias**.
2. Selecione a Procuradoria.
3. Informe a data de início.
4. Informe a data de fim.
5. Clique em **Adicionar**.

Após o cadastro, o período aparece em **Períodos cadastrados**. Para remover um lançamento, use o botão de exclusão correspondente ao registro.

### Passo 5 — Gerar a cobertura

1. Abra **Gerar escala de férias**.
2. Clique em **Gerar / atualizar escala**.
3. Analise os indicadores:
   - **Cobertura regular:** há disponibilidade suficiente;
   - **Atenção:** o período precisa de conferência;
   - **Conflito:** há sobreposição ou indisponibilidade relevante.

### Passo 6 — Conferir conflitos

Abra **Conflitos** para comparar os pedidos que se sobrepõem dentro da mesma Câmara. A tela auxilia a análise, mas não toma decisão administrativa automaticamente.

### Passo 7 — Revisar e divulgar

Abra **Escala consolidada** para conferir a combinação de sessões, férias, Procuradoria nominal, substituição e atuação efetiva. Use o filtro da tela para consultar uma Procuradoria específica.

## 6. Lançamento manual de atuação

Em **Escala TJCE anual**, é possível registrar uma atuação manual informando:

- Procuradoria;
- data de atuação;
- órgão ou observação, como “sessão ordinária”.

O sistema verifica coincidências com férias e consulta a tabela de substituições cadastrada.

## 7. Critérios do sistema

- O total anual considerado é de 60 dias por Procuradoria.
- Cada período deve ter entre 10 e 30 dias.
- O sistema controla o limite máximo de 6 períodos.
- Há conflito quando mais de 50% dos membros da mesma Câmara ficam simultaneamente de férias.
- O sistema indica as Procuradorias da mesma Câmara que permanecem disponíveis para cobertura.
- Datas de atuação não devem coincidir com férias da Procuradoria escalada.
- A substituição altera a atuação efetiva, mas não altera a sequência nominal do rodízio.
- Feriados e recessos cadastrados em **Datas sem sessão** são excluídos da geração automática.

## 8. Exportar e imprimir

- **Exportar CSV:** gera um arquivo que pode ser aberto no Excel.
- **Exportar consolidada:** exporta a escala final consolidada.
- **Imprimir/PDF:** abre a janela de impressão do sistema para imprimir ou salvar como PDF.

Recomenda-se exportar a escala consolidada ao final de cada revisão para manter uma cópia de segurança.

## 9. Dados e cópias de segurança

Os dados são gravados localmente no perfil do aplicativo ou do navegador utilizado. Portanto, a versão atual não funciona como banco de dados central compartilhado entre todos os computadores.

Para preservar o trabalho:

1. Gere os arquivos CSV da escala e da escala consolidada.
2. Salve os arquivos em uma pasta institucional autorizada.
3. Mantenha uma cópia da versão final em PDF, quando necessário.

Se a intranet precisar de dados compartilhados em tempo real entre vários usuários, será necessário um banco de dados e uma etapa adicional de desenvolvimento.

## 10. Problemas comuns

### O instalador pede para substituir arquivos

Feche a janela, baixe a versão v6 e execute o arquivo com duplo clique. Não use “Extrair aqui” nem abra o instalador pelo 7-Zip.

### O endereço `127.0.0.1` não abre

Esse endereço é apenas para o servidor local de distribuição dos arquivos neste computador. Para uso institucional, a TI deve publicar a pasta `site` em um endereço da intranet do MPCE.

### O atalho não apareceu

Abra o menu Iniciar, procure **Escala TJCE**, clique com o botão direito e escolha **Mais → Abrir local do arquivo**. Depois use **Enviar para → Área de trabalho**.

### A escala não aparece atualizada

Confirme o ano selecionado, verifique se os dados foram cadastrados no mesmo perfil de usuário e clique em **Gerar / atualizar escala** ou **Gerar escala anual** conforme a tela utilizada.

## 11. Suporte e publicação na intranet

O pacote `Escala-TJCE-Pacote-Intranet-MPCE-Area-Civel.zip` contém a página, o instalador e o arquivo `web.config` para autenticação Windows no IIS. A publicação e a definição dos grupos autorizados devem ser realizadas pela equipe de TI do MPCE.


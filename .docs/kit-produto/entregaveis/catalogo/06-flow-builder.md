# Flow Builder

## Para que serve

Montar jornada visual (perguntas, menus, integrações) que atende sozinha ou encaminha para fila, com importação e exportação de fluxos em ZIP.

## Onde fica

`/flowbuilders`, editor `/flowbuilder/:id`, gatilhos `/phrase-lists`

## Status

**Implementado:** editor, importação/exportação ZIP, menu do fluxo no WhatsApp. Na **API Oficial**: botões (até 3 opções) ou lista (4 a 10). No **Baileys** (não oficial): texto numerado (`[1] …`). Menu e Pergunta têm conector **Outra resposta** (`aelse`): opção inválida / mensagem sem texto seguem esse caminho se estiver ligado. Nó **Abrir Ticket (Fila)** envia o atendimento para a fila (o fluxo deixa de atender sozinho). No **Conteúdo**, cada atividade interna tem cor própria (texto cinza, intervalo laranja, imagem azul, áudio teal, vídeo roxo). Mídia do Conteúdo (imagem, áudio, vídeo) é lida de `public/flowbuilder/` (com fallback na pasta da empresa). Opt-out de botões no modal do menu. Fluxo de boas-vindas da conexão (`flowIdWelcome`) inicia mesmo em ticket já existente, desde que sem fila e sem fluxo ativo. Palete de blocos permanece aberta ao passar o mouse no nome; o bloco Início não apaga o canvas.
**Condicional:** nós de IA, Typebot e serviços externos dependem de credenciais e infraestrutura.
**Sem rota:** a página `FlowDefault` existe no código, mas não integra a navegação atual.

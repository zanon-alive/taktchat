# Comercial — cliente final (longa)

Estende o [padrão](comercial-cliente-padrao.md) (slides 1–18, com ticket, CRM de conversa, Kanban e desfecho). Player: `/apresentacoes/comercial-cliente-longa`.

## Slides 1–18

Iguais ao padrão (capa até CTA).

## Slide 19 — Jornada do ticket com números

**Para falar:** pendente = ninguém pegou; aberto = tem dono; encerrado = acabou. Nas 6 colunas: Carla em Lead, João em Qualificado, Maria em Negociação, Ana aguardando, Mercado Central ganho, Pedro perdido.

- A fila define quem vê o ticket.
- Admin com “ver todos” vê o quadro da empresa.
- Há também status bot, lgpd, nps, grupo.

## Slide 20 — Funil em números

**Para falar:** `/kanban/stats` mostra quantos atendimentos estão em cada coluna e a idade média dos cards. Ajuda a encontrar acúmulo e demora, sem valor em reais, probabilidade ou previsão de receita.

- Acesso pelo botão Funil no Kanban.
- Quantidade e idade média por lane.
- Leitura operacional, não previsão comercial.

## Slide 21 — Contatos da atendente

**Para falar:** a atendente vê os contatos associados à sua tag pessoal `#`, como `#Beatriz`. Sem uma tag pessoal configurada, a tela mostra um empty state que explica a regra e orienta procurar o administrador.

- Admin e perfis autorizados administram a agenda da empresa.
- A regra evita expor toda a base para qualquer atendente.
- Sem tag `#`: lista vazia explicada, não erro de carregamento.

## Slide 22 — Cadastro comercial

**Para falar:** a ficha lateral do atendimento exibe situação, última compra e carteira. É contexto objetivo para conversar melhor, não um cadastro completo de oportunidade, pedido ou ERP.

- Situação comercial.
- Última compra.
- Carteira ou responsável.

## Slide 23 — Quando o cliente volta a falar

**Para falar:** atendimento encerrado + nova mensagem = **novo atendimento** para o mesmo contato. Ele entra na coluna inicial configurada, como Lead, sem carregar o andamento da conversa anterior.

- Enquanto está aberto, as mensagens continuam no mesmo atendimento.
- Depois de encerrado, a próxima mensagem gera um novo atendimento.
- Contato e histórico anterior continuam disponíveis.

## Slide 24 — A equipe fala primeiro

**Para falar:** Contatos → iniciar conversa. Costuma nascer aberto e atribuído. Um ticket aberto por contato naquela conexão.

- Saída: a empresa chama o contato.
- Atendente do seed pode não ter `tickets.create`.
- Sem WhatsApp `CONNECTED` a mensagem no celular não sai.

## Slide 25 — Papéis na empresa

**Para falar:** não inventar cargo. Código: admin, user (+ flags), supervisor via permissão, super só na plataforma.

## Slide 26 — Campanhas com responsabilidade

**Para falar:** lista, intervalo e validação. Oficial: template e janela de 24h.

## Slide 27 — IA com pé no chão

**Para falar:** plano + chave + RAG nos arquivos da empresa. Não substitui o humano no caso difícil.

## Slide 28 — Entradas além do WhatsApp

**Para falar:** landing, formulário e widget também viram ticket (EntrySource). O time trata igual: conversa na fila.

## Slide 29 — LGPD

**Para falar:** consentimento e ocultar número ligam nas settings. Controles no produto, não consultoria jurídica.

## Slide 30 — Planos (referência da landing)

**Para falar:** Básico / Premium / Enterprise na página pública são âncora. Proposta à parte.

## Slide 31 — Encerramento

**Para falar:** piloto mensurável. Se o pendente não vira resposta humana, o problema é fila, horário ou número.

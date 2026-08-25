# Comercial — cliente final (longa)

Estende o [padrão](comercial-cliente-padrao.md) (slides 1–17, com ticket, CRM de conversa e Kanban). Player: `/apresentacoes/comercial-cliente-longa`.

## Slides 1–17

Iguais ao padrão (capa até CTA).

## Slide 18 — Jornada do ticket com números

**Para falar:** pendente = ninguém pegou; aberto = tem dono; encerrado = acabou. Nas 6 colunas: Carla em Lead, João em Qualificado, Maria em Negociação, Ana aguardando, Mercado Central ganho, Pedro perdido.

- A fila define quem vê o ticket.
- Admin com “ver todos” vê o quadro da empresa.
- Há também status bot, lgpd, nps, grupo.

## Slide 19 — Quando o cliente volta a falar

**Para falar:** ticket encerrado não é reusado pelo FindOrCreate. Nova mensagem no mesmo número gera **outro ticket**. O contato continua o mesmo. Esse ticket novo **cai na lane de entrada** (Lead, se configurado em Tags Kanban).

- Aberto / pendente / bot: entra no mesmo ticket.
- Encerrado: ticket novo, na lane de entrada — sem herdar o rollback da conversa fechada.
- LGPD: pode nascer em `lgpd` até o consentimento.

## Slide 20 — A equipe fala primeiro

**Para falar:** Contatos → iniciar conversa. Costuma nascer aberto e atribuído. Um ticket aberto por contato naquela conexão.

- Saída: a empresa chama o contato.
- Atendente do seed pode não ter `tickets.create`.
- Sem WhatsApp `CONNECTED` a mensagem no celular não sai.

## Slide 21 — Papéis na empresa

**Para falar:** não inventar cargo. Código: admin, user (+ flags), supervisor via permissão, super só na plataforma.

## Slide 22 — Campanhas com responsabilidade

**Para falar:** lista, intervalo e validação. Oficial: template e janela de 24h.

## Slide 23 — IA com pé no chão

**Para falar:** plano + chave + RAG nos arquivos da empresa. Não substitui o humano no caso difícil.

## Slide 24 — Entradas além do WhatsApp

**Para falar:** landing, formulário e widget também viram ticket (EntrySource). O time trata igual: conversa na fila.

## Slide 25 — LGPD

**Para falar:** consentimento e ocultar número ligam nas settings. Controles no produto, não consultoria jurídica.

## Slide 26 — Planos (referência da landing)

**Para falar:** Básico / Premium / Enterprise na página pública são âncora. Proposta à parte.

## Slide 27 — Encerramento

**Para falar:** piloto mensurável. Se o pendente não vira resposta humana, o problema é fila, horário ou número.

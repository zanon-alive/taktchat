# Fluxo do ticket — guia para o kit

Este texto é a **base** do módulo mais importante para cliente novo. Validado na UI em 2026-08-22 (prints `f2`–`f7`). WhatsApp da Cliente Demo Kit está **CONNECTED** (envio e transferência persistida em 2026-08-23/24). Lanes Kanban alinhadas ao PR #21 (2026-08-25).

## O que é um ticket

Um ticket é **uma conversa em andamento** com um contato, em um canal (em geral WhatsApp), ligada a uma empresa, opcionalmente a uma **fila** e a um **atendente**.

Não é um chamado de helpdesk clássico com número de protocolo visível para o cliente no WhatsApp. Para o cliente, é a conversa. Para a equipe, é a ficha dessa conversa: status, fila, responsável, tags, histórico.

## Como um ticket nasce

Há dois caminhos principais.

### 1. O cliente fala primeiro (entrada)

1. Chega mensagem no WhatsApp (Baileys ou webhook da API Oficial) — ou no chat do site / lead.
2. O backend localiza ou cria o **contato**.
3. `FindOrCreateTicketService` procura ticket **ainda aberto** daquele contato naquela conexão (`open`, `pending`, `group`, `nps`, `lgpd`, `bot`).
4. Se existe, incrementa não lidas e reabre a mesma conversa.
5. Se não existe, cria outro ticket. Com LGPD ligado, pode nascer em status `lgpd` até o consentimento.
6. Com bot/fila automática, pode nascer em `bot` ou já em `pending` na fila.
7. O painel recebe o evento em tempo real (Socket.IO).

No ambiente local do kit o QR **já foi gerado** (print `f17`) e a sessão da Cliente Demo Kit está **CONNECTED**.

### 2. A equipe fala primeiro (saída)

1. Atendente ou admin abre **Contatos** (ou a lista de tickets) e inicia conversa.
2. `CreateTicketService` usa a conexão WhatsApp padrão do usuário ou a escolhida.
3. Impede dois tickets abertos do mesmo contato na mesma conexão.
4. O ticket costuma nascer `open` e já atribuído a quem criou (grupos podem ir para status `group`).

Este caminho **deve ser tentado na Fase 1** mesmo com conexão desconectada: anotar se a UI bloqueia, qual erro aparece, e fotografar.

## Estados que o time precisa conhecer

| Status | O que significa na operação | Quem age |
|--------|-----------------------------|----------|
| `pending` | Na fila, sem atendente (ou aguardando aceite) | Qualquer um da fila (ou quem vê a fila) aceita |
| `open` | Em atendimento, com responsável | Quem está com o ticket (e admin/supervisor conforme permissão) |
| `closed` | Encerrado; nova mensagem do cliente pode abrir de novo (conforme config da conexão) | — |
| `bot` | Automação/bot ainda conduz | Sistema; humano assume depois |
| `lgpd` | Esperando aceite de privacidade | Contato / regra da empresa |
| `nps` | Pesquisa ao final | Sistema |
| `group` | Conversa de grupo | Conforme `allowGroup` |

No seed do kit: Maria e Ana **open**, João **pending**, Pedro **closed**.

## Como se trabalha um ticket no dia a dia

Ordem típica (manual do atendente deve virar receita com prints):

1. **Ver a fila** — lista/colunas de tickets (pendentes vs. os seus vs. todos, se tiver permissão).
2. **Aceitar** o pendente — vira `open` e `userId` = você. João Oliveira no kit está assim de propósito.
3. **Ler o histórico** — mensagens, mídias, notas internas (se a UI tiver). Maria já tem 3 mensagens de exemplo.
4. **Responder** — texto, áudio, arquivo, resposta rápida (`/saudacao`, `/aguardar` no kit).
5. **Organizar** — tag (Urgente, VIP), fila certa, contato atualizado.
6. **Transferir** — para outra fila ou outro usuário (o código fecha ou mantém conforme `closeTicketOnTransfer`).
7. **Encerrar** — status `closed`; aplica a lane de encerrar se configurada em Tags Kanban (`closedKanbanTagId`); pode haver mensagem de despedida e NPS.
8. **Se o cliente voltar a falar** — o sistema reaproveita ticket aberto ou cria outro depois do tempo configurado na conexão (`timeCreateNewTicket`). O ticket **novo** recebe a lane de entrada (`defaultKanbanTagId`), não o rollback da conversa fechada.

## Kanban no ciclo do ticket

Com plano `useKanban` (ou empresa `platform`):

- Ticket novo (entrada ou saída) recebe a coluna de entrada, se ainda não tiver tag `kanban=1`.
- Arrastar no quadro **substitui** a coluna (uma lane por vez).
- Encerrar deixa o card `closed` visível na lane de encerrar (o quadro não lista `closed` sem lane).
- Cron `timeLane` avança pela `updatedAt` do ticket; não exige mensagem `fromMe`; não avança lane terminal (“Fechado…”).
- Rollback só no ticket **ainda aberto**.

Detalhe: [`.docs/funcionalidades/kanban-lanes.md`](../funcionalidades/kanban-lanes.md).

## O que o atendente vê vs. o admin

- **Atendente (Beatriz):** em geral só filas às quais está vinculada (no kit: **Suporte**). Não deveria gerenciar conexão nem usuários.
- **Supervisor (Diego):** mesmo `profile = user`, mas com dashboard, tempo real e `allTicket=enable` — tende a ver tickets de outras pessoas da empresa.
- **Admin (Carlos):** filas, usuários, conexão, settings, campanhas se o plano deixar.
- **Dono (`super`):** além disso, visão de outras empresas.

A matriz da Fase 2 confirma o que cada login realmente vê. Não afirmar o contrário antes.

## Relação com fila, conexão e canal

- **Conexão (`Whatsapps`)** — o número/API por onde a mensagem entra e sai. Sem conexão, não há conversa real.
- **Fila (`Queues`)** — time/assunto (Suporte, Vendas, Financeiro). Roteia quem pode pegar o ticket.
- **Canal / origem** — WhatsApp, e também lead, site, revenda quando `entrySource` existe. No banco local a coluna `entrySource` **ainda não está** nas `Tickets`; o código mais novo já usa. Documentar na UI se o filtro “origem” aparecer ou não.

## Pontos a fotografar na Fase 1 (obrigatório)

1. Lista de tickets (pendente / aberto / encerrado)
2. Chat aberto da Maria (histórico)
3. Modal ou ação de aceitar o João
4. Transferência (mesmo que só o modal)
5. Encerrar
6. Tags no ticket
7. Nova conversa a partir do contato
8. Mensagem de erro se a conexão estiver `DISCONNECTED`

## O que o kit ainda não demonstra

- Mensagem chegando ao vivo pelo WhatsApp
- Bot/Typebot conduzindo
- LGPD pedindo consentimento
- Chat do site gerando ticket
- API Oficial vs Baileys no mesmo atendimento

Esses fluxos entram no catálogo como “existe no produto / não exercitado localmente”, sem vender como se o print existisse.

# Pendências de produto — Kanban / CRM de conversa

Itens identificados na branch `docs/kit-documentacao-produto`. Atualizado em **2026-08-25** após o merge da `main` (PR #21) e os commits de overlay/token nesta branch.

Fonte: Tags (`kanban`, `timeLane`, `nextLaneId`, `rollbackLaneId`), `FindOrCreateTicketService`, `UpdateTicketService`, `queues.handleProcessLanes`, `wbotMessageListener`. Como o funil funciona hoje: [`.docs/funcionalidades/kanban-lanes.md`](../funcionalidades/kanban-lanes.md).

## Resolvido

### 1. Ticket novo na coluna de entrada — PR #21

Ticket novo (incluindo pós-`closed`) recebe a lane configurada em Tags Kanban (`defaultKanbanTagId`, ex.: Lead), se a empresa usa Kanban e o ticket ainda não tem tag `kanban=1`.

### 2. Encerrar aplica a lane configurada — PR #21

Ao encerrar, o ticket recebe a tag `closedKanbanTagId` (ex.: Fechado ganho). Quem quiser Fechado perdido arrasta no quadro. **Nuance:** a listagem `/ticket/kanban` ainda filtra só `open`/`pending`, então o card `closed` pode não aparecer na tela até o filtro incluir `closed` (resto do A3).

### 3. Cron de `timeLane` por `updatedAt` — PR #21

`handleProcessLanes` não exige `fromMe: true`. Avança com base em `ticket.updatedAt`. Não avança lanes terminais (`closedKanbanTagId` ou nome com “Fechado”).

### 4. Uma tag Kanban por ticket — PR #21

Ao aplicar lane (store do quadro, cron, helpers), as outras tags `kanban=1` daquele ticket são removidas. Arrastar no quadro substitui, não acumula.

### 5. Rollback só no ticket aberto — PR #21

Ticket **novo** após encerrar recebe a lane de entrada (item 1). Não aplica `rollbackLaneId` da conversa fechada.

### 8. Overlay “API indisponível” no first paint — esta branch (`0e2c051`)

Rotas montam durante o health; diálogo só se a API falhar; retry automático.

### 10. Token de signup hex que começa com dígito — esta branch (`0e2c051`)

`resolvePartnerFromTokenOrId` consulta `signupToken` primeiro; id numérico só se a string inteira for dígitos.

## Ainda aberto (não bloqueia o kit)

### 2b. Quadro mostrar tickets `closed`

`ListTicketsServiceKanban` ainda restringe a `pending`/`open`. Sem isso, a lane de encerrar existe no ticket, mas some da tela `/kanban`.

### 6. Pipeline nativo (CRM)

Valor, probabilidade, ganho/perdido, dono da oportunidade. Fora do recorte de tags. Análise: [16-demanda-crm-conversa-ou-mercado.md](16-demanda-crm-conversa-ou-mercado.md).

### 7. Aviso de excesso de colunas

Sem limite no código. Sugerir na UI se `kanban=1` > 8.

### 9. Contatos da atendente vazios

Tags hierárquicas `#`. Fora do Kanban.

## Já coberto nesta branch (não reabrir)

- Base **Cliente Demo Kit** com funil Lead → … → Fechado (seed **local**, não migration).
- Player `/apresentacoes` privado (login + permissão); prints fora de `public/`.
- `Route.js`: redirect de rota privada **só se o path casar** — senão `/signup-partner` caía no login sem sessão.
- Logins de teste documentados no deck (apenas empresa demo).

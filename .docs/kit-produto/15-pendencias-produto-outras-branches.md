# Pendências de produto — Kanban / CRM de conversa

Itens identificados na branch `docs/kit-documentacao-produto`. Atualizado em **2026-08-25** após o lote A6, desfecho ao Encerrar, A8, tags `#` e A7.

Fonte: Tags (`kanban`, `timeLane`, `nextLaneId`, `rollbackLaneId`), `FindOrCreateTicketService`, `UpdateTicketService`, `queues.handleProcessLanes`, `wbotMessageListener`. Como o funil funciona hoje: [`.docs/funcionalidades/kanban-lanes.md`](../funcionalidades/kanban-lanes.md).

## Resolvido

### 1. Ticket novo na coluna de entrada — PR #21

Ticket novo (incluindo pós-`closed`) recebe a lane configurada em Tags Kanban (`defaultKanbanTagId`, ex.: Lead), se a empresa usa Kanban e o ticket ainda não tem tag `kanban=1`.

### 2. Encerrar aplica a lane configurada — PR #21

Ao encerrar, o ticket recebe a tag `closedKanbanTagId` (ex.: Fechado ganho). Quem quiser Fechado perdido arrasta no quadro. O quadro lista o card `closed` se ele tiver lane Kanban (item 2b).

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

### 2b. Quadro mostrar tickets `closed` — esta branch

`ListTicketsServiceKanban` inclui `closed` quando o ticket tem tag `kanban=1`. Encerrar deixa o card visível na lane de encerrar; Pedro do seed aparece em Fechado perdido. `closed` sem lane continua fora do quadro.

### 6. Aviso de excesso de colunas — `feat/kanban-aviso-colunas`

Alert em Tags Kanban e no quadro se `kanban=1` > 8. Hint de tag operacional vs coluna.

### 7. Desfecho ao Encerrar — `feat/kanban-desfecho-encerrar`

Popup: lane Fechado* (ou a setting) ou sair do quadro. Backend: `kanbanCloseTagId` / `leaveKanbanBoard`.

### Cadastro comercial no drawer — `feat/ficha-cadastro-comercial`

Bloco **Cadastro comercial** (situação, última compra, carteira) no atendimento.

### 9. Contatos da atendente — `feat/contatos-tags-hierarquicas`

A regra `#` **não** foi relaxada. Empty state explica a tag pessoal. Seed: `#Beatriz` (Beatriz vê Maria/Carla) e `atendente.vazio@taktchat.local` (lista vazia).

### Relatório por lane — `feat/relatorio-lanes-kanban`

`GET /ticket/kanban/stats` e menu **Funil (lanes)** (`/kanban/stats`): quantidade e idade média. Sem R$. Atalho no quadro Kanban.

### Overlay no Painel — esta branch (v1.7)

Healthcheck não marca offline no primeiro timeout. `/moments` não renderiza até o usuário existir.

## Ainda aberto (não bloqueia o kit)

### Pipeline nativo (CRM de mercado)

Valor, probabilidade, ganho/perdido como entidade Deal. Fora do recorte de tags. Análise: [16-demanda-crm-conversa-ou-mercado.md](16-demanda-crm-conversa-ou-mercado.md).

### Captura real do celular

Print `pendente-whatsapp-celular.png` ainda é ilustração de IA.

## Já coberto nesta branch (não reabrir)

- Base **Cliente Demo Kit** com funil Lead → … → Fechado (seed **local**, não migration).
- Player `/apresentacoes` privado (login + permissão); prints fora de `public/`.
- `Route.js`: redirect de rota privada **só se o path casar** — senão `/signup-partner` caía no login sem sessão.
- Logins de teste documentados no deck (apenas empresa demo).

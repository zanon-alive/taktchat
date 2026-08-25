# Kanban: lanes de entrada e encerramento

## O que é uma lane

Uma **lane** é uma **coluna do quadro Kanban** — por exemplo Lead, Qualificado ou Fechado ganho. Cada ticket (atendimento) fica em **uma lane por vez**: ao arrastar o card, ele sai de uma coluna e entra na outra.

## Objetivo

Organizar o funil comercial nesse quadro: ticket novo entra na coluna configurada; ao encerrar, o card **permanece no funil** na lane escolhida (ex.: Fechado ganho). Uma tag de lane (`kanban=1`) por ticket.

## Onde configurar

Na tela **Tags Kanban** (`/tagsKanban` ou **Kanban → Adicionar colunas**), bloco **Lanes automáticas**:

| Campo | Setting (`Setting.key`) | Efeito |
| --- | --- | --- |
| Lane de entrada | `defaultKanbanTagId` | Ticket **novo** recebe essa coluna |
| Ao encerrar, mover para | `closedKanbanTagId` | Status `closed` move o card para essa coluna |

Valores vazios ou `0` = não aplicar. Sem migration: a tabela `Setting` já é por `companyId` + `key`.

Admin da empresa (ou super) altera os selects; o `PUT /settings/:settingKey` exige perfil admin.

## Comportamento

- **Criação de ticket** (`FindOrCreateTicketService`, Meta, `CreateTicketService`): se a empresa usa Kanban (`plan.useKanban` ou `company.type === "platform"`) e não há lane ainda, aplica a lane de entrada.
- **Encerrar**: após o ticket ir para `closed`, aplica a lane de encerrar (não remove o card do quadro).
- **Arrastar no quadro**: `PUT /ticket-tags/:ticketId/:tagId` substitui a tag kanban (não acumula colunas).
- **Cron `timeLane`**: usa `ticket.updatedAt`; não exige última mensagem `fromMe`; não avança lanes terminais (`closedKanbanTagId` ou nome com “Fechado”).
- **Nova conversa após encerrar**: o ticket novo recebe a lane de entrada; o rollback da lane da conversa fechada **não** é aplicado.

## Fora deste recorte

Pipeline CRM nativo, popup ganho/perdido no clique de Encerrar, aviso de limite de colunas.

## Referências de código

- `backend/src/helpers/kanbanTicketTags.ts`
- `frontend/src/pages/TagsKanban/index.js`

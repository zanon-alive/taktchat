# Pendências de produto — Kanban / CRM de conversa

Itens identificados na branch `docs/kit-documentacao-produto`. **Não implementar nesta branch de documentação** (exceto a base demo e o player). Abrir branch `feat/` própria.

Fonte: código de Tags (`kanban`, `timeLane`, `nextLaneId`, `rollbackLaneId`), `FindOrCreateTicketService`, `UpdateTicketService`, `queues.handleProcessLanes`, `wbotMessageListener`.

## 🔴 Alta

### 1. Ticket novo sem coluna Lead

**Hoje:** `FindOrCreateTicketService` não atribui tag Kanban. Depois de `closed`, a próxima mensagem cria **outro** ticket sem lane.

**Fazer:** setting da empresa `defaultKanbanTagId` (ou “Lead” pelo nome). Ao criar ticket de entrada, se o plano tiver `useKanban` e o ticket ainda não tiver tag `kanban=1`, aplicar a lane padrão.

### 2. Encerrar não move o funil

**Hoje:** o trecho que remove tags Kanban no `closed` está **comentado** em `UpdateTicketService`. Status `closed` ≠ coluna “Fechado”.

**Fazer:** ao encerrar, opção configurável: (a) ir para tag “Fechado — ganho/perdido” ou (b) tirar a lane. Uma tag Kanban por ticket.

## 🟡 Média

### 3. Cron de `timeLane` só com `fromMe: true`

**Hoje:** `handleProcessLanes` em `queues.ts` filtra ticket `fromMe: true`. Conversas em que a última interação é do cliente quase não avançam.

**Fazer:** avançar com base em `ticket.updatedAt` (ou última mensagem), independente de `fromMe`, com trava para não pular “Fechado”.

### 4. Uma tag Kanban por ticket

**Hoje:** o listener usa `TicketTag.findOne` sem filtrar `kanban=1`. Duas colunas no mesmo card quebram rollback/next.

**Fazer:** ao aplicar lane, remover as outras `kanban=1` daquele ticket. UI: ao arrastar no quadro, substituir, não acumular.

### 5. Rollback só no ticket aberto

**Hoje:** se `status === closed`, o listener retorna antes de aplicar `rollbackLaneId`.

**Fazer:** no ticket **novo** pós-encerramento, aplicar lane padrão (item 1), não o rollback da conversa morta.

## 🟢 Baixa / produto maior

### 6. Pipeline nativo

Valor, probabilidade, ganho/perdido, dono da oportunidade. Fora do recorte de tags. Só se o comercial exigir CRM de funil de verdade.

Demanda completa para análise (caminhos A e B, backlog e perguntas): [16-demanda-crm-conversa-ou-mercado.md](16-demanda-crm-conversa-ou-mercado.md).

### 7. Aviso de excesso de colunas

Sem limite no código. Sugerir na UI se `kanban=1` > 8.

### 8. Overlay “API indisponível” no first paint

Retry automático na landing/login. Fora do Kanban.

### 9. Contatos da atendente vazios

Tags hierárquicas `#`. Fora do Kanban.

### 10. Token de signup hex que começa com dígito

**Hoje:** `resolvePartnerFromTokenOrId` faz `parseInt` e, se o hex começa com 0–9, trata o valor como `companyId`. No kit local o token do Parceiro Demo Kit foi prefixado com letra só para a demo.

**Fazer:** resolver token opaco primeiro (igualdade com `signupToken`); id numérico só se a string inteira for dígitos.

## Já coberto nesta branch (não reabrir)

- Base **Cliente Demo Kit** com funil Lead → … → Fechado (seed **local**, não migration).
- Player `/apresentacoes` privado (login + permissão); prints fora de `public/`.
- `Route.js`: redirect de rota privada **só se o path casar** — senão `/signup-partner` caía no login sem sessão.
- Logins de teste documentados no deck (apenas empresa demo).

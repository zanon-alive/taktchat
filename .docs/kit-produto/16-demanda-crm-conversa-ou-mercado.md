# Demanda para análise — CRM de conversa estruturado vs. CRM de mercado

**Status:** caminho A (A1–A9) feito — núcleo na `main` (PR #21); 2b, A6–A8, desfecho ao Encerrar, tags `#` e relatório nesta branch. Resta o caminho B.  
**Data:** 2026-08-22 (atualizado 2026-08-25)  
**Origem:** pedido verbal nesta sessão (kit de produto)  
**Não implementar o caminho B nesta branch** (`docs/kit-documentacao-produto`). A1–A9 do caminho A já estão no código desta linha.

Classificação local (MCP Cerebro indisponível):

| Campo | Valor |
|-------|--------|
| Projeto | taktchat |
| Tipo | feature (com fatia improvement no Kanban já existente) |
| Escopo | major |
| Domínio | omni-chat |
| Capacidade | crm-conversa / (opcional) crm-pipeline |
| Reutilizável | projeto |
| Branch sugerida (caminho A) | `feat/crm-conversa-estruturado` |
| Branch sugerida (caminho B) | `feat/crm-pipeline` — só se o A não bastar |

---

## Por que esta demanda existe

O comercial e o kit posicionam o Taktchat como **CRM de conversa no WhatsApp**: a pessoa que fala vira **contato**; a conversa em andamento vira **ticket** (fila, dono, tags, histórico). Isso já diferencia o produto de “mais um WhatsApp Web”.

O que o mercado chama de CRM (Pipedrive, HubSpot Sales, RD Station CRM, Kommo) é outra coisa: **conta + oportunidade**, funil com valor e probabilidade, ganho/perdido, atividades e previsão de receita. Hoje o Taktchat **simula** um funil com tags Kanban em cima do ticket. Quem espera “CRM de mercado” sente o buraco; quem precisa só organizar o WhatsApp não precisa do buraco preenchido.

Esta demanda pede para **analisar** os dois destinos e só então implementar.

---

## O que o produto já é hoje

Núcleo operacional (já existe e deve permanecer):

- Contato por número (WhatsApp), ficha com nome, e-mail, tags, campos extras (`ContactCustomField`).
- Cadastro já tem cara de ERP/B2B: CPF/CNPJ, razão/fantasia, cidade, segmento, região, situação (Ativo / Ex-Cliente…), última compra, limite de crédito, carteira (`ContactWallet`).
- Ticket = conversa (`pending` / `open` / `closed` + bot, lgpd, nps, grupo), fila, responsável, histórico, transferência.
- Kanban = tags com `kanban = 1` viram colunas; o card é o **ticket**, não uma oportunidade. Plano precisa `useKanban`.
- Automação de lane: `timeLane` + `nextLaneId` + `rollbackLaneId`. Ticket novo recebe `defaultKanbanTagId`; Encerrar aplica `closedKanbanTagId`; uma tag `kanban=1` por ticket; cron por `updatedAt` (PR #21). Detalhe: [15](15-pendencias-produto-outras-branches.md) e [`.docs/funcionalidades/kanban-lanes.md`](../funcionalidades/kanban-lanes.md).
- Um contato não tem dois tickets **abertos** na mesma conexão; ticket `closed` **não é reusado** (nova mensagem = ticket novo).

O que **não** existe como entidade:

- Oportunidade / deal (valor, moeda, probabilidade, data prevista, motivo de perda).
- Funil nativo (estágio ≠ tag).
- Previsão de receita, meta por vendedor, ranking de pipeline.
- Empresa (account) como pai de vários contatos de WhatsApp — hoje o “CNPJ” vive **no contato**.
- Atividade de CRM (ligar, e-mail, reunião) desligada da mensagem WhatsApp.
- Relatório “quanto está em Negociação este mês”.

O quadro Kanban lista `pending`/`open` e também `closed` **com tag `kanban=1`**. Encerrar abre o popup de desfecho para escolher lane Fechado* ou sair do quadro; a setting permanece como fallback. `closed` sem lane não entra no quadro.

---

## Duas apostas de produto (escolher uma para a primeira branch)

### Caminho A — CRM de conversa bem estruturado (recomendado primeiro)

**Promessa:** o WhatsApp vira operação previsível. O funil é o **ciclo da conversa**, não o ciclo da venda em reais.

Fazer com que contato + ticket + Kanban se comportem como um único sistema:

1. ~~Ticket novo (inclusive pós-`closed`) cai na lane padrão (Lead), se o plano tiver Kanban.~~ **Feito (PR #21).**
2. ~~Uma tag `kanban = 1` por ticket; arrastar **substitui** a coluna.~~ **Feito (PR #21).**
3. ~~Encerrar tem regra visível (`closedKanbanTagId`); o quadro lista o card `closed` com lane.~~ **Feito (PR #21 + 2b + popup de desfecho).**
4. ~~Cron de lane não depende de `fromMe: true`; não avança coluna terminal.~~ **Feito (PR #21).**
5. Ficha do contato e ficha do ticket lado a lado no atendimento (o que já existe na ficha, **usado** de propósito: situação, última compra, carteira, tags operacionais ≠ colunas do funil).
6. Relatório operacional: volume por lane, tempo médio na coluna, tickets sem dono, sem inventar “R$ em pipeline”.
7. Glossário e UI: a palavra **funil** some ou vira “quadro de conversas”; **ganho/perdido** só se a empresa ligar o modo “desfecho ao encerrar”.

**Não fazer no A:** valor, probabilidade, forecast, entidade Deal, metas de vendedor.

Isso deixa o produto mais próximo do que o comercial já vende, sem competir com Pipedrive.

### Caminho B — aproximar de CRM de mercado

**Promessa:** além do WhatsApp, o time gerencia **oportunidades**.

Nova entidade `Deal` (ou `Opportunity`), ligada a contato e/ou a uma “conta” (CNPJ). Estágios nativos (não tags). Campos: valor, moeda, probabilidade, dono, data prevista, motivo de perda. Ticket WhatsApp vira **atividade/canal** da oportunidade, não o card do funil.

Implica:

- Modelo de dados novo, telas novas (`/deals`, funil de deals, ganho/perdido).
- Dois quadros: conversas (ticket) vs. vendas (deal) — ou um só, se o deal **for** o card e o ticket for aba.
- Relatórios de pipeline e, mais tarde, integração (webhooks, CSV, HubSpot/Pipedrive) se o cliente já tiver CRM e só quiser o canal WhatsApp.

**Risco:** dois produtos no mesmo app, onboarding mais pesado, divergência do posicionamento atual do kit.

---

## Lacuna vs. CRM de mercado (referência)

| Capacidade típica | Taktchat hoje | Caminho A | Caminho B |
|-------------------|---------------|-----------|-----------|
| Ficha da pessoa | Contato WhatsApp + campos B2B | Usar e destacar | Contato + Account |
| Histórico do canal | Ticket / mensagens | Melhorar desfecho e reabertura | Ticket como atividade do deal |
| Fila e dono da conversa | Sim | Sim | Continua |
| Funil visual | Tags Kanban no ticket | Funil de **conversa** coerente | Funil de **oportunidade** |
| Valor / probabilidade | Não | Não | Sim |
| Ganho / perdido | Tag ou status `closed`, desencontrados | Desfecho ao encerrar | Campos do deal |
| Previsão de receita | Não | Não | Sim (fase 2 do B) |
| Tarefas / follow-up | Agendamentos, lane por tempo | Tempo na coluna + lembrete | Atividades do deal |
| Conviver com HubSpot | Posicionamento atual | Mantém | Opcional (sync) |

---

## Backlog proposto (depois do OK)

### Caminho A — fatias (ordem)

Branch: `feat/crm-conversa-estruturado`.

| # | Item | Relação com [15](15-pendencias-produto-outras-branches.md) |
|---|------|--------------------------------------------------------------|
| A1 | Lane padrão no `FindOrCreateTicketService` (setting `defaultKanbanTagId`) | item 1 — **feito PR #21** |
| A2 | Uma lane Kanban por ticket (listener + arrastar no quadro) | item 4 — **feito PR #21** |
| A3 | Encerrar: setting “mover para tag X”; quadro lista `closed` | itens 2 e 2b — **feito** (tag no PR #21; listagem nesta branch) |
| A4 | Ticket novo pós-`closed` recebe Lead; não aplica rollback da conversa morta | itens 1 e 5 — **feito PR #21** |
| A5 | Cron `timeLane` por `updatedAt` / última mensagem, sem exigir `fromMe` | item 3 — **feito PR #21** |
| A6 | UI: separar **tag operacional** (Urgente, VIP) de **coluna** (Lead…); aviso se houver > 8 colunas | item 7 — **feito** |
| A7 | Relatório simples por lane (quantidade, idade média) — sem R$ | **feito** (`/kanban/stats`) |
| A8 | Ficha de atendimento: bloco “cadastro comercial” (situação, última compra, carteira) sempre visível | **feito** |
| A9 | Kit/glossário/player: linguagem alinhada (CRM de conversa, não pipeline) | docs — **feito** |

Estimativa grosseira: caminho A encerrado nesta geração. Caminho B continua opcional.

### Caminho B — só após A ou se o comercial exigir pipeline de verdade

Branch: `feat/crm-pipeline`.

| # | Item |
|---|------|
| B1 | Modelo `Deals` + estágios por empresa + `DealTickets` |
| B2 | Quadro de oportunidades (card = deal, não ticket) |
| B3 | Valor, probabilidade, dono, data prevista, motivo de perda |
| B4 | Ao ganhar/perder: regra sobre os tickets abertos daquele contato |
| B5 | Relatório de pipeline (R$ por estágio) |
| B6 | (depois) Account separado do contato WhatsApp, se B2B exigir vários números no mesmo CNPJ |

Não misturar B1–B6 na mesma PR que A1–A5.

---

## O que esta demanda **não** é

- Não é virar ERP (estoque, NF, boleto). Campos de última compra já existem; não ampliar isso aqui.
- Não é helpdesk com protocolo no celular do cliente.
- Não é desligar o ticket em favor do deal no caminho A.
- Não é ligar `useKanban` em todos os planos nem no plano 1 global.
- Não é a migration/demo do kit (isso é outra fatia da branch de documentação).

---

## Critérios de aceite (preencher depois da escolha)

### Se caminho A

- [x] Ticket de entrada em empresa com Kanban nasce na lane padrão. *(PR #21)*
- [x] Arrastar no quadro troca a coluna; não acumula duas `kanban=1`. *(PR #21)*
- [x] Encerrar segue a setting **e** o comercial vê o card na coluna Fechado. *(tag: PR #21; listagem: 2b nesta branch)*
- [x] Nova mensagem após `closed` abre ticket **novo** já no Lead (não no rollback antigo). *(PR #21)*
- [x] Relatório por lane sem campo de dinheiro (`/kanban/stats`; API `/ticket/kanban/stats`).
- [x] Docs e glossário usam “quadro de conversas” / CRM de conversa.

### Se caminho B

- [ ] Existe entidade oportunidade com valor e estágio nativo.
- [ ] O quadro de vendas não é a lista de tags Kanban do ticket.
- [ ] Ticket WhatsApp continua existindo e liga-se ao deal.
- [ ] Posicionamento comercial atualizado: o que é canal vs. o que é pipeline.

---

## Riscos

- Tratar tag Kanban como pipeline de vendas **para sempre** gera suporte eterno (“cadê o valor do negócio?”).
- Caminho B sem A deixa o Kanban atual incompleto **e** soma um segundo funil.
- Mostrar `closed` no Kanban: feito com filtro restrito a tickets que têm lane (`kanban=1`), para não encher a coluna “Em aberto” com histórico. Regressão possível se o recorte de data do quadro (mês corrente) esconder tickets antigos.
- Contatos da atendente vazios (tags `#`) continuam fora desta demanda; não misturar.
- Campos B2B no contato (CNPJ, última compra) já parecem CRM; se o A não os mostrar no chat, o time acha que “não tem cadastro”.

---

## Perguntas para travar antes de codar

1. **Qual caminho na primeira branch: só A, A+B em sequência, ou B direto?** (recomendação: só A.)
2. Ao **encerrar** o ticket, o padrão da empresa demo deve continuar “Fechado ganho” (setting), perguntar ganho/perdido no clique, ou sair do quadro? *(popup de desfecho implementado; setting continua como fallback.)*
3. O card do Kanban deve continuar sendo o **ticket** (A) ou passar a ser a **oportunidade** (B)?
4. Precisa relatório em R$ nesta geração do produto, ou volume/tempo basta?
5. Account (CNPJ pai de vários WhatsApp) é requisito de algum cliente nomeado, ou pode esperar?

---

## Decisão

Núcleo A1–A5 (lanes) na `main` via [PR #21](https://github.com/zanon-alive/taktchat/pull/21). Nesta branch: 2b, A6–A8, popup de desfecho, tags `#` da atendente, relatório por lane e copy A9. Caminho B (Deal/CRM de mercado) permanece fora desta geração.

---

> Análise gerada localmente (MCP telecontrol-docs / Cerebro indisponível). Não houve busca de demandas similares nem registro remoto.

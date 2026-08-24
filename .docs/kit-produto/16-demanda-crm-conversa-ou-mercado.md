# Demanda para análise — CRM de conversa estruturado vs. CRM de mercado

**Status:** draft — aguarda escolha de caminho  
**Data:** 2026-08-22  
**Origem:** pedido verbal nesta sessão (kit de produto)  
**Não implementar nesta branch** (`docs/kit-documentacao-produto`). Abrir `feat/` própria depois do OK.

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
- Automação de lane: `timeLane` + `nextLaneId` + `rollbackLaneId` (com falhas conhecidas — ver [15](15-pendencias-produto-outras-branches.md)).
- Um contato não tem dois tickets **abertos** na mesma conexão; ticket `closed` **não é reusado** (nova mensagem = ticket novo).

O que **não** existe como entidade:

- Oportunidade / deal (valor, moeda, probabilidade, data prevista, motivo de perda).
- Funil nativo (estágio ≠ tag).
- Previsão de receita, meta por vendedor, ranking de pipeline.
- Empresa (account) como pai de vários contatos de WhatsApp — hoje o “CNPJ” vive **no contato**.
- Atividade de CRM (ligar, e-mail, reunião) desligada da mensagem WhatsApp.
- Relatório “quanto está em Negociação este mês”.

O quadro Kanban **só lista tickets `open` e `pending`**. Encerrar some o card. Por isso “Fechado — ganho/perdido” como coluna de tag **mente** se o ticket já estiver `closed`. Isso é o coração da confusão comercial.

---

## Duas apostas de produto (escolher uma para a primeira branch)

### Caminho A — CRM de conversa bem estruturado (recomendado primeiro)

**Promessa:** o WhatsApp vira operação previsível. O funil é o **ciclo da conversa**, não o ciclo da venda em reais.

Fazer com que contato + ticket + Kanban se comportem como um único sistema:

1. Ticket novo (inclusive pós-`closed`) cai na lane padrão (Lead), se o plano tiver Kanban.
2. Uma tag `kanban = 1` por ticket; arrastar **substitui** a coluna.
3. Encerrar tem regra explícita e visível: mover para “Fechado — ganho” / “Fechado — perdido” **ou** tirar do quadro. O quadro passa a mostrar o que a regra mandar (incluindo `closed`, se essa for a escolha).
4. Cron de lane não depende de `fromMe: true`; não avança coluna terminal.
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
| A1 | Lane padrão no `FindOrCreateTicketService` (setting `defaultKanbanTagId`) | item 1 |
| A2 | Uma lane Kanban por ticket (listener + arrastar no quadro) | item 4 |
| A3 | Encerrar: setting “mover para tag X / Y” ou “sair do quadro”; quadro lista `closed` se a regra deixar o card | item 2 |
| A4 | Ticket novo pós-`closed` recebe Lead; não aplica rollback da conversa morta | itens 1 e 5 |
| A5 | Cron `timeLane` por `updatedAt` / última mensagem, sem exigir `fromMe` | item 3 |
| A6 | UI: separar **tag operacional** (Urgente, VIP) de **coluna** (Lead…); aviso se houver > 8 colunas | item 7 |
| A7 | Relatório simples por lane (quantidade, idade média) — sem R$ | novo |
| A8 | Ficha de atendimento: bloco “cadastro comercial” (situação, última compra, carteira) sempre visível | novo |
| A9 | Kit/glossário/player: linguagem alinhada (CRM de conversa, não pipeline) | docs |

Estimativa grosseira: várias PRs; A1–A5 são o núcleo de produto. A6–A9 podem ser PRs menores.

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

- [ ] Ticket de entrada em empresa com Kanban nasce na lane padrão.
- [ ] Arrastar no quadro troca a coluna; não acumula duas `kanban=1`.
- [ ] Encerrar segue a setting; o comercial consegue explicar o quadro em 30 segundos.
- [ ] Nova mensagem após `closed` abre ticket **novo** já no Lead (não no rollback antigo).
- [ ] Relatório por lane sem campo de dinheiro.
- [ ] Docs e glossário usam “quadro de conversas” / CRM de conversa.

### Se caminho B

- [ ] Existe entidade oportunidade com valor e estágio nativo.
- [ ] O quadro de vendas não é a lista de tags Kanban do ticket.
- [ ] Ticket WhatsApp continua existindo e liga-se ao deal.
- [ ] Posicionamento comercial atualizado: o que é canal vs. o que é pipeline.

---

## Riscos

- Tratar tag Kanban como pipeline de vendas **para sempre** gera suporte eterno (“cadê o valor do negócio?”).
- Caminho B sem A deixa o Kanban atual quebrado **e** soma um segundo funil.
- Mostrar `closed` no Kanban muda filtro em `ListTicketsServiceKanban` (`status` só `open`/`pending` hoje) — regressão possível na tela `/kanban`.
- Contatos da atendente vazios (tags `#`) continuam fora desta demanda; não misturar.
- Campos B2B no contato (CNPJ, última compra) já parecem CRM; se o A não os mostrar no chat, o time acha que “não tem cadastro”.

---

## Perguntas para travar antes de codar

1. **Qual caminho na primeira branch: só A, A+B em sequência, ou B direto?** (recomendação: só A.)
2. Ao **encerrar** o ticket, o padrão da empresa demo deve ser “Fechado — ganho”, perguntar ganho/perdido, ou sair do quadro?
3. O card do Kanban deve continuar sendo o **ticket** (A) ou passar a ser a **oportunidade** (B)?
4. Precisa relatório em R$ nesta geração do produto, ou volume/tempo basta?
5. Account (CNPJ pai de vários WhatsApp) é requisito de algum cliente nomeado, ou pode esperar?

---

## Decisão

Pendente de revisão do solicitante.

---

> Análise gerada localmente (MCP telecontrol-docs / Cerebro indisponível). Não houve busca de demandas similares nem registro remoto.

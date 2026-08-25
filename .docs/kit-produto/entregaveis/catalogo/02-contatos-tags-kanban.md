# Contatos, tags e Kanban

## Para que serve

Cadastro de pessoas/empresas que conversam com você; etiquetas para filtrar e um quadro Kanban por estágio da **conversa** (não é pipeline de oportunidade).

## Onde fica

`/contacts`, `/contacts/import`, `/tags`, `/kanban`, `/kanban/stats`, `/TagsKanban`

## Quem usa

Atendente (ver/editar o básico), admin (importação, regras, lanes).

## O que a pessoa faz

- Buscar, abrir ficha, iniciar conversa
- Importar planilha (admin)
- Criar tags operacionais (Urgente, VIP — `kanban=0`) e colunas (`kanban=1`)
- Mover cards no Kanban se o plano tiver `useKanban`
- Admin: em Tags Kanban, **lane de entrada** e **ao Encerrar, mover para** (settings `defaultKanbanTagId` / `closedKanbanTagId`)

## Comportamento atual (PR #21)

- Ticket novo recebe a lane de entrada, se a empresa usa Kanban.
- Encerrar pergunta a lane de desfecho (Fechado*) ou sair do quadro.
- Uma tag `kanban=1` por ticket; arrastar substitui a coluna.
- Atendente: precisa de tag pessoal `#` nos contatos. Beatriz tem `#Beatriz`; `atendente.vazio@taktchat.local` demonstra a lista vazia.
- Relatório por lane em `/kanban/stats` (atalho no quadro).
- Detalhe: [`.docs/funcionalidades/kanban-lanes.md`](../../../funcionalidades/kanban-lanes.md).

## Seed

Maria, João, Ana, Mercado Central, Pedro, Carla — números `551190000100x` (fictícios). Funil demo (6 colunas): Lead (Carla) → Qualificado (João) → Negociação (Maria) → Aguardando cliente (Ana) → Fechado ganho (Mercado Central) / Fechado perdido (Pedro).

## Status

Simulado no banco + WhatsApp da Cliente Demo Kit CONNECTED. Kanban: depende do plano `useKanban`.

# Roadmap do que foi feito nesta demanda

**Branch:** `docs/kit-documentacao-produto`  
**Data:** 2026-08-21 → 2026-08-25  
**Status:** kit **v1.8 documental** — inventário funcional e limites alinhados ao código; v1.7 permanece no histórico abaixo.

## Entregue

### Fase 0 — Guias

Pasta `.docs/kit-produto/` (plano, roles, checklist, fichas, tom, lacunas). Melhorias 1–12 aplicadas.

### Dados locais

- Logins `@taktchat.local` (senha `LocalTest#2026`) + `admin@admin.com`
- Empresas Parceiro Demo Kit e Cliente Demo Kit
- Filas, tags, contatos, tickets, mensagens, respostas rápidas
- Contato extra **Carla Mendes** (pending na Suporte) para aceite da atendente
- Script `scripts/seed-local-kit.sql`
- Tipos: platform / whitelabel / direct (cliente filho do parceiro)
- Licenças ativas até 2027; jornada 00:00–23:59
- Funil Kanban demo (6 lanes); fluxo **Boas-vindas Demo Kit**; plano **Revenda Starter Kit** (whitelabel)

### Fase 1–2 — Navegação

- Backend `:8080` (`dev:fast`) e frontend `:3000`
- Login UI: atendente, admin, parceiro, supervisor, dono
- Lista de tickets **funciona** quando a UI manda `queueIds`
- Jornada: chat Maria, `/saudacao`, aceite Carla, modal transferir
- WhatsApp CONNECTED; envio para `5514981812988`; transferência do ticket 14 persistida
- Parceiro: Minhas empresas + Licenças com Cliente Demo Kit
- Prints `f1`–`f26` e a maioria dos `pendente-*` em `backend/private/kit-apresentacoes/`

### Fase 3–5 — Documentos finais

- Catálogo 13 módulos
- Manuais: dono, parceiro, admin, atendente, supervisor
- Seis decks: comercial cliente/parceiro × padrão/longa + técnica padrão/longa
- Extras: matriz, demo, glossário, onboarding 15 min, Baileys vs Oficial, fluxo do ticket
- `15-pendencias-produto-outras-branches.md`, `16-demanda-crm-conversa-ou-mercado.md`

### Fase 6

Índice em `.docs/README.md` e este roadmap. README da raiz aponta o kit.

## Extra autorizado (v1.3) — `/apresentacoes`

Rota **privada** (login). Hub + slideshow. PNG em `backend/private/kit-apresentacoes/`, servidos pela API.

## v1.4 — WhatsApp e prints (2026-08-23/24)

QR escaneado; sessão CONNECTED; print `pendente-whatsapp-connected.png`; landing, flow, Kanban, health, billing, infra. Transferência persistida com canal conectado.

## v1.5 — alinhamento com a main (2026-08-25)

Merge da `main` (PR #21) nesta branch. Copy do kit deixa de descrever o Kanban antigo.

- Ticket novo recebe a lane de entrada (`defaultKanbanTagId`).
- Encerrar aplica `closedKanbanTagId`; uma tag `kanban=1` por ticket; cron por `updatedAt`; rollback não vale em ticket novo.
- Overlay de API e token hex: já em `0e2c051` (não são mais pegadinha da demo).
- Copy dos slides: login comercial, funil de **6 colunas**, deck técnico com QR CONNECTED e prints `pendente-*` já gravados (sem caixa “a gravar”).
- Quadro `/kanban` lista `closed` com lane Kanban (item 2b).

## v1.6 — lote A6–A8, desfecho, tags # e relatório (2026-08-25)

Branches mergeadas nesta linha: `feat/kanban-aviso-colunas`, `feat/kanban-desfecho-encerrar`, `feat/ficha-cadastro-comercial`, `feat/contatos-tags-hierarquicas`, `feat/relatorio-lanes-kanban`.

- Aviso se o quadro passa de 8 colunas; tag operacional vs lane.
- Encerrar pergunta ganho/perdido ou sair do quadro.
- Drawer: bloco Cadastro comercial.
- Empty state + seed `#Beatriz` para a atendente (regra `#` mantida).
- Relatório `/kanban/stats` (quantidade e idade média).
- Rota `/kanban` além de `/Kanban`.

## v1.7 — polish da demo (2026-08-25)

- Healthcheck: overlay só depois das 3 tentativas (8s); Painel `/moments` espera o usuário.
- Tags Kanban: texto de quando o aviso de 8 colunas aparece.
- Botão Funil no quadro.
- Login `atendente.vazio@taktchat.local` para mostrar lista de contatos vazia.
- Heap 4 GB no `npm start` do frontend.
- Roteiro: não encerrar a Maria.

## v1.8 — revisão funcional documental (2026-08-25)

- Inventário backend/frontend com estados implementado, condicional, stub e órfão.
- Mapa de rotas, menu, personas, permissões híbridas e gates de plano.
- Redis e `pgvector` registrados como dependências.
- Gateway genérico, Lead público, Facebook/Instagram e `QueueAdvanced` documentados com seus limites.
- Popup de desfecho e stats do Kanban confirmados como existentes.
- Pendências de segurança (`ticketsUsers`, `ticketsDay` e Helmet) registradas.
- Revisão documental; não confirma deploy em produção.

## Ainda aberto (não bloqueia o lote)

1. Captura real do WhatsApp no celular — hoje há **ilustração de IA** em `pendente-whatsapp-celular.png`
2. **Não** transformar o seed em migration Sequelize — seed só local (ver `scripts/README.md`)
3. Demanda 16 caminho B (CRM de mercado / Deal) — fora desta geração.

## Fora desta branch

Commit/PR desta leva: local já testado em 2026-08-25. Deploy — nunca automático. Seed **não** vai para o Postgres da VPS.

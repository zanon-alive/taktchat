# Técnica (padrão)

Audiência: dev / infra / integrador. 12–15 min. Player: `/apresentacoes/tecnica-padrao`.

## Slide 1 — Capa

**Para falar:** mapa de blocos, tenancy e canal WhatsApp. Não é tour de tela. Cuidado clássico: `.env` apontando para o lugar errado.

## Slide 2 — Produto em uma frase

**Para falar:** SPA React + API Node. O painel lê REST e recebe push por Socket.IO. Não é app nativo de WhatsApp.

## Slide 3 — Blocos

**Para falar:** as quatro peças precisam estar juntas. Sem Postgres o health denuncia. Sem Redis, Bull não anda.

- Frontend React 17 / MUI v5.
- Backend Node 22 / Express / Sequelize.
- PostgreSQL 15. Redis + Bull. Socket.IO.

## Slide 4 — Mensagem

**Para falar:** WhatsApp → adapter (Baileys ou Meta) → ticket/message no Postgres → Socket.IO → painel. Integrar por fora duplica conversa.

## Slide 5 — Do contato ao ticket

**Para falar:** a unidade não é a mensagem solta. `FindOrCreateTicketService` reusa ticket aberto do mesmo contato+conexão ou cria pending/bot/lgpd. `CreateTicketService` é a equipe iniciando.

- Duas abertas do mesmo par: o serviço bloqueia.

## Slide 6 — Multi-tenant

**Para falar:** `companyId` em quase toda tabela de negócio. Tipos platform / whitelabel / direct — um codebase, não três.

## Slide 7 — Auth

**Para falar:** JWT. `super` bypass; `profile` + `permissions[]` + flags. Licença vencida corta acesso mesmo com senha certa.

## Slide 8 — Dual channel

**Para falar:** `channelType` baileys | oficial. Baileys: QR + sessão em `private/sessions`. Oficial: Cloud API. Os dois podem coexistir.

## Slide 9 — Filas

**Para falar:** Bull no Redis (campanha, validação, jobs). Cron (tags, licenças). Fila de atendimento (`queues`) é outra entidade — não confundir.

## Slide 10 — Integrações

**Para falar:** REST, webhooks, `widget.js`, Typebot/flow. EntrySource marca lead, revenda, widget ou WhatsApp.

## Slide 11 — Local

**Para falar:** Compose (Postgres+Redis). Backend `:8080`, frontend `PORT=3000` (não herdar 8080). `GET /health`.

## Slide 12 — Produção (alto nível)

**Para falar:** Docker Swarm, volumes, Traefik. Detalhe em `.docs/infraestrutura/`. Não improvisar `.env` de prod no notebook.

## Slide 13 — Atenção

**Para falar:** sessão Baileys é estado em disco; job depende de Redis; **não** apontar `.env` para produção. Anti-ban é cadência, não botão.

## Slide 14 — Docs

**Para falar:** kit em `.docs/kit-produto/`. Legado em `visao-geral/` e `funcionalidades/`. Player: `/apresentacoes`.

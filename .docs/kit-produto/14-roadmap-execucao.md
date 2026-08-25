# Roadmap do que foi feito nesta demanda

**Branch:** `docs/kit-documentacao-produto`  
**Data:** 2026-08-21 → 2026-08-24  
**Status:** kit **v1.4** — lote fechado (player + prints + WhatsApp CONNECTED).

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

## Ainda aberto (não bloqueia o lote)

1. Captura real do WhatsApp no celular — hoje há **ilustração de IA** em `pendente-whatsapp-celular.png`
2. Copy dos slides (login comercial + 6 colunas) em MD/`decks.js`
3. **Não** transformar o seed em migration Sequelize — seed só local (ver `scripts/README.md`)
4. Demanda 16 (A ou B) e bugs Kanban (`15`) — **outra branch**. Overlay de API e token de signup: nesta branch.

## Fora desta branch

Commit/PR desta leva: local já testado em 2026-08-25. Deploy — nunca automático. Seed **não** vai para o Postgres da VPS.

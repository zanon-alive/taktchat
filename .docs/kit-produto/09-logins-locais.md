# Logins locais do kit

**Ambiente:** `localhost:5433`, banco `taktchat_database`. **Não usar em produção. Não aplicar via migration.**

Senha dos `@taktchat.local`:

```
LocalTest#2026
```

`admin@admin.com` — senha original (seed `123456`).

## Personas (API de login 200 em 2026-08-22)

| Persona | E-mail | Empresa | type |
|---------|--------|---------|------|
| Dono original | admin@admin.com | Empresa 01 | platform |
| Dono kit | dono@taktchat.local | Empresa 01 | platform |
| Parceiro | parceiro@taktchat.local | Parceiro Demo Kit | whitelabel |
| Admin empresa | admin.cliente@taktchat.local | Cliente Demo Kit | direct (filho do parceiro) |
| Atendente | atendente@taktchat.local | Cliente Demo Kit | direct |
| Supervisor | supervisor@taktchat.local | Cliente Demo Kit | direct |

Jornada dos users kit: `00:00`–`23:59` (senão `ERR_OUT_OF_HOURS`).  
Parceiro e cliente: licença `active` até 2027 (senão `ERR_ACCESS_BLOCKED_PLATFORM`).

**Player `/apresentacoes`:** `dono@taktchat.local` e `admin@admin.com` (empresa plataforma). Parceiro, admin da filha e atendente **não** entram.

## Seed

`scripts/seed-local-kit.sql` + adjustments (licenses, type, parent, hours).

## WhatsApp

Cliente Demo Kit: conexão Baileys **CONNECTED** em 2026-08-23 (número da sessão `(14) 99687-0843`). Print: `backend/private/kit-apresentacoes/pendente-whatsapp-connected.png`.

Mensagem de teste enviada para `5514981812988` (ticket **14**, contato “Teste Kit WhatsApp”).

**Transferência (2026-08-24):** ticket 14 persistiu `userId` Beatriz Atendente e fila **Vendas**. WhatsApp da sessão continuou CONNECTED. Não desconectar o celular enquanto os testes seguirem.

Empresa 01: sessão `teste` continua à parte.

## Demo extra gravada nesta sessão

- Fluxo **Boas-vindas Demo Kit** (company 5) com menu Suporte / Vendas / atendente.
- Lanes Kanban: Lead → Qualificado → Negociação → Aguardando cliente → Fechado ganho / Fechado perdido. Urgente/VIP/Resolvido voltaram a `kanban=0` (label, não coluna).
- Plano **Revenda Starter Kit** (`targetType=whitelabel`, `companyId=4`) para o cadastro da filha em `/signup-partner?partner=4`.
- Token de signup do Parceiro Demo Kit no banco local começa com **letra** (ajuste 2026-08-24). Hex que começa com dígito passa a resolver pelo `signupToken` primeiro.

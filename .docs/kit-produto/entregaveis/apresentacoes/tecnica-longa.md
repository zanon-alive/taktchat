# Técnica (longa)

Base: [padrão](tecnica-padrao.md). Player: `/apresentacoes/tecnica-longa`.

## Slides 1–14

Iguais ao padrão (inclui FindOrCreate / contato → ticket).

## Slide 15 — Ticket no código

**Para falar:** `FindOrCreateTicketService` (entrada), `CreateTicketService` (saída), `UpdateTicketService` (aceite/transfer/encerra). Sem WhatsApp `CONNECTED`, Update que manda no canal falha.

- Status: pending, open, closed, bot, lgpd, nps, group.

## Slide 16 — Permissões

**Para falar:** `PermissionAdapter` + `usePermissions`. Super bypass. Admin fallback. User: base + flags. 403 da atendente no dashboard é o adapter funcionando.

## Slide 17 — Licença

**Para falar:** `CompanyAccessService`: platform sempre ok; whitelabel/direct exigem License `active` com `endDate` futura. Bloqueio não precisa dropar banco.

## Slide 18 — LGPD e tenant

**Para falar:** flags nas CompaniesSettings. Mídia no volume da empresa. Não logar token, senha nem dado pessoal.

## Slide 19 — Schema

**Para falar:** migrations Sequelize. Kit local já tem `type`, parent, Licenses, `entrySource`. Drift de `SequelizeMeta`: ver recuperação em `.docs/operacao/`.

## Slide 20 — Pontos frágeis

**Para falar:** Baileys sem `creds.json`; frontend herdando `PORT` do backend; `/tickets` sem `queueIds` volta count 0 (filtro, não seed vazio). Overlay de health **não** bloqueia mais o first paint da landing.

## Slide 21 — Próximas rodadas técnicas

**Para falar:** escanear QR → `CONNECTED`. Prints ainda pendentes: campanhas, flow, billing do dono. Não “corrigir” o filtro de fila apagando `queueIds`.

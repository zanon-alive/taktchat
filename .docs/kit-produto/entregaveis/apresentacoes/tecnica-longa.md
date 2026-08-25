# Técnica (longa)

Base: [padrão](tecnica-padrao.md). Player: `/apresentacoes/tecnica-longa`.

## Slides 1–14

Iguais ao padrão (inclui FindOrCreate / contato → ticket).

## Slide 15 — Ticket no código

**Para falar:** `FindOrCreateTicketService` reaproveita atendimento ativo ou cria outro; `CreateTicketService` inicia a saída; `UpdateTicketService` aceita, transfere e encerra. Ao fechar, o desfecho define a tag Kanban terminal.

- Status: pending, open, closed, bot, lgpd, nps, group.
- `closed` com tag `kanban=1` continua no quadro; sem lane, fica fora.
- Nova mensagem após `closed` cria outro ticket na lane de entrada.
- Sem WhatsApp `CONNECTED`, Update que manda no canal falha.

## Slide 16 — Kanban no backend

**Para falar:** as colunas são tags `kanban=1`. O backend mantém uma única lane por ticket, inclui encerrados com desfecho e calcula o relatório por coluna. A configuração define avanço, retorno, entrada e fechamento padrão.

- `PUT /ticket-tags/:ticketId/:tagId` substitui a lane anterior.
- `GET /ticket/kanban` inclui pending/open e closed com tag Kanban.
- `GET /ticket/kanban/stats` devolve quantidade e idade média por lane.
- Tags Kanban configuram `timeLane`, `nextLaneId`, `rollbackLaneId` e desfecho padrão.

## Slide 17 — Permissões

**Para falar:** `PermissionAdapter` + `usePermissions`. Super bypass. Admin fallback. User: base + flags. 403 da atendente no dashboard é o adapter funcionando.

## Slide 18 — Licença

**Para falar:** `CompanyAccessService`: platform sempre ok; whitelabel/direct exigem License `active` com `endDate` futura. Bloqueio não precisa dropar banco.

## Slide 19 — LGPD e tenant

**Para falar:** flags nas CompaniesSettings. Mídia no volume da empresa. Não logar token, senha nem dado pessoal.

## Slide 20 — Schema

**Para falar:** migrations Sequelize. Kit local já tem `type`, parent, Licenses, `entrySource`. Drift de `SequelizeMeta`: ver recuperação em `.docs/operacao/`.

## Slide 21 — Pontos frágeis

**Para falar:** Baileys sem `creds.json` derruba a sessão; frontend herdando `PORT` do backend; `/tickets` sem `queueIds` volta count 0 (filtro, não seed vazio). O overlay de health só aparece após 3 falhas, em cerca de 8 segundos, e não bloqueia o first paint. A Cliente Demo Kit **já está CONNECTED**.

## Slide 22 — Próximas rodadas técnicas

**Para falar:** neste ambiente o QR já foi escaneado (CONNECTED, envio e transferência persistidos). Desfecho, stats, tags pessoais, cadastro comercial e configuração Kanban já têm capturas reais. Ainda é hardware: captura **real** do celular (hoje ilustração de IA). Não “corrigir” o filtro de fila apagando `queueIds`.

## Diagnóstico e correção de duplicidades

### Contexto

- Duplicidades podem ocorrer em `ContactListItems`, `Tickets`, `CampaignShipping` e registros associados.
- Problemas históricos catalogados nos documentos `legacy/DIAGNOSTIC-DUPLICATES.md`, `legacy/FIX-DUPLICATES-INTERFACE.md`, `legacy/FIX-VALIDATION-DUPLICATES.md`.

### Identificação rápida

```bash
# Consultas auxiliares
psql -d taktchat_database -f .docs/sql/diagnosticos/check-duplicates.sql
psql -d taktchat_database -f .docs/sql/diagnosticos/check-invalids.sql
```

- Verificar logs do backend em busca de erros `UniqueConstraint`.
- Conferir dashboards de campanhas (taxa de falha atípica).

### Correções disponíveis

- **Auditoria de contatos:** `npm run db:audit-contacts` (opcional `-- --company=1`). Totais por empresa e grupos duplicados (companyId + canonicalNumber). Script: `backend/src/database/scripts/auditContacts.ts`.
- **Deduplicação de contatos:** `npm run db:dedupe-contacts -- --company=1 [--apply] [--limit=n]`. Dry-run por padrão; `--apply` aplica alterações. Script: `backend/src/scripts/dedupeContacts.ts`.
- **Excluir contatos sem atendimentos:** `npm run db:delete-contacts-without-tickets -- --company=1 [--apply] [--limit=n]`. Remove contatos que não possuem nenhum ticket. Dry-run por padrão; `--apply` exige `--company` por segurança. Script: `backend/src/database/scripts/deleteContactsWithoutTickets.ts`.
- **API/UI:** `POST /contacts/duplicates/process` e botão "Deduplicar contatos" na listagem de contatos (`ProcessDuplicateContactsService`).
- `scripts/fix-contactlistitems-duplicates.ts`: remove duplicatas e reindexa contatos.
- `scripts/fixMissingAvatars.ts`: corrige inconsistências de mídia associadas.
- SQLs pontuais: `.docs/sql/correcoes/FIX-DUPLICATES.sql`, `.docs/sql/correcoes/QUICK-FIX-DUPLICATES-NOW.sql` (usar com cautela).

### Fluxo recomendado

1. Gerar backup antes de qualquer script.
2. Executar scripts em ambiente de staging para validar impacto.
3. Monitorar métricas após correção (taxa de envio, erros de validação).
4. Atualizar `anexos/incidentes.md` com detalhes da ocorrência.


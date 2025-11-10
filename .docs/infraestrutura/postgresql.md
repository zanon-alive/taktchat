## PostgreSQL

### Configuração

- Versão recomendada: 15.x.
- Charset/Tables: UTF8 (`utf8mb4` configurado via Sequelize para compatibilidade com emojis).
- Parâmetros ajustáveis via variáveis `DB_POOL_*` (pool Sequelize) e `DB_RETRY_MAX`.

### Estrutura de dados principal

- `Users`, `Companies`, `Tickets`, `Messages`, `Whatsapps`, `Campaigns`, `ContactLists`.
- Migrations organizadas em `backend/src/database/migrations` (mais de 300 arquivos). Utilize `sequelize-cli` para manutenção.

### Manutenção

- Rotina de `VACUUM ANALYZE` semanal recomendada.
- Monitorar crescimento das tabelas `Messages` e `CampaignShipping`. Considere políticas de retenção.
- Scripts auxiliares em `backend/scripts/*.sql` podem corrigir inconsistências.

### Segurança

- Habilite TLS (`DB_SSL=true`) para instâncias gerenciadas.
- Restrinja acesso à rede somente a serviços necessários.
- Utilize roles distintos para leitura e escrita se houver relatórios externos.

### Diagnósticos

- `backend/src/utils/database-diagnostic.ts` produz relatório resumido.
- Utilize `pg_stat_activity` para identificar queries longas.

### Backup

- Siga guia `operacao/backup-recuperacao.md` para rotinas de dump e restauração.


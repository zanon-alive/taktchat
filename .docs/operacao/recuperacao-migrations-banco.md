# Recuperação quando migrations falham no meio (Postgres + Sequelize)

## Contexto

Se uma migration **falha após alterar o schema** (ou houve ajuste manual), a tabela `SequelizeMeta` pode **não** refletir o que o banco realmente tem. Isso gera:

- `db:migrate` quebrando com *column already exists* ou *constraint* duplicada
- backend em runtime com *column does not exist* (código novo, schema parado em migration antiga)

## Princípios

1. **Produção:** preferir **backup/restore** para um estado conhecido quando a divergência for grande.
2. **Idempotência:** as migrations críticas devem checar coluna/constraint antes de criar (padrão adotado em `20260211131548` e `20260211140001`).
3. **Não editar `SequelizeMeta` à mão** sem entender o efeito: inserir/apagar linha sem alinhar o schema piora o drift.

## Diagnóstico rápido

- Listar o que o Sequelize acredita ter rodado:

  ```bash
  npx sequelize db:migrate:status
  ```

- Conferir colunas reais (exemplo `Plans`, `Companies`):

  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'Plans'
  ORDER BY ordinal_position;

  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'Companies'
  ORDER BY ordinal_position;
  ```

- Comparar com o esperado pela ordem das migrations em `backend/src/database/migrations/`.

## Fluxo recomendado após drift

1. Subir uma **imagem de backend** que contenha as migrations idempotentes (mesmo commit/tag do deploy).
2. Rodar:

   ```bash
   npx sequelize db:migrate --debug
   ```

   Com migrations idempotentes, reaplicar deve **completar** o que faltava sem falhar em *already exists*.
3. Se ainda falhar: capturar o nome da migration e o SQL exato do erro; avaliar restore ou correção pontual supervisionada pelo DBA.

## Erros comuns

| Sintoma | Causa provável |
|--------|----------------|
| `column ... already exists` | Coluna criada, migration não registrada |
| `column ... does not exist` | Código espera coluna de migration que nunca rodou |
| FK / constraint | Ordem ou dados inválidos na hora da constraint |

## Referência de migrations sensíveis (whitelabel / Companies)

- `20260211131548-add-column-companyId-to-Plans` — `Plans.companyId` + FK
- `20260211140001-add-accessBlockedByParent-to-Companies` — `Companies.accessBlockedByParent`

Model `Company` e serviços dependem de `accessBlockedByParent`; o schema deve estar alinhado antes de tráfego em produção.

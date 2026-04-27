# PR: `fix/migrations-idempotent-accessBlockedByParent` — Idempotência `Companies.accessBlockedByParent`

**Base sugerida:** `main`  
**Branch:** `fix/migrations-idempotent-accessBlockedByParent`  
**Commit:** `947c2e1` — *fix(db): migration idempotente accessBlockedByParent e doc de recuperação*

## Resumo

Torna a migration `20260211140001-add-accessBlockedByParent-to-Companies` **idempotente**: evita erro *column already exists* quando o schema já tem `accessBlockedByParent` mas o histórico em `SequelizeMeta` está inconsistente.

Inclui guia operacional em `.docs/operacao/recuperacao-migrations-banco.md` e links no `README.md` / hub `.docs/README.md`.

## Problema

- Drift entre coluna já criada no Postgres e registro da migration pode fazer `db:migrate` falhar ao repetir `addColumn`.

## O que mudou

- `20260211140001`: `up`/`down` consultam `describeTable("Companies")` e só alteram se a coluna não existir / existir conforme o caso.
- Nova doc: recuperação quando migrations falham ou há divergência `SequelizeMeta` × schema.

## Como testar no servidor

1. Build da imagem do backend a partir desta branch (ou merge em `main` + deploy).
2. Rodar migrate (ajuste rede, host e credenciais):

   ```bash
   docker build -t taktchat-backend-test ./backend
   docker run --rm --network <SUA_REDE_OVERLAY> \
     -e NODE_ENV=production \
     -e DB_HOST=<host do postgres no stack> \
     -e DB_PORT=5432 \
     -e DB_NAME=taktchat_database \
     -e DB_USER=... \
     -e DB_PASS=... \
     -e DB_DIALECT=postgres \
     taktchat-backend-test \
     sh -lc "npx sequelize db:migrate --debug"
   ```

3. Validar que em DB **com** a coluna já presente o migrate **completa sem erro** e em DB **sem** a coluna ela é criada normalmente.

## Referências

- Playbook: `.docs/operacao/recuperacao-migrations-banco.md`

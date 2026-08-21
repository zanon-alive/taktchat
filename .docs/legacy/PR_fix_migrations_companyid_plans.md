# PR: `fix/migrations-companyid-plans` — Migrations data-safe (Plans.companyId)

**Base sugerida:** `main`  
**Branch:** `fix/migrations-companyid-plans`  
**Commit:** `7fe0f8e` — *fix(db): tornar migrations idempotentes e data-safe*

## Resumo

Correção para `npx sequelize db:migrate` em **Postgres vazio** (e re-runs após falha parcial) na migration `20260211131548-add-column-companyId-to-Plans`, além de higienizar migrations antigas que usavam o operador `,` no `return` (agora `Promise.all`).

Inclui `backend/package-lock.json` para `npm ci` estável no build Docker.

## Problema

- Com banco vazio, após inserir planos (ex. `20250127220251-create-strategic-plans`), a migration `20260211131548` forçava `companyId = 1` sem garantir `Companies.id = 1`, violando a FK `Plans_companyId_fkey`.
- Reexecutar o migrate após falha parcial podia acusar coluna `companyId` já existente.

## O que mudou

- `20260211131548`: coluna adicionada de forma idempotente, `INSERT` de company plataforma `id=1` (se faltar), backfill seguro, FK criada só se ainda não existir.
- Várias migrations: `return a(), b()` → `Promise.all([a, b, ...])`.
- `package-lock.json` no `backend/`.

## Como testar no servidor

1. Fazer merge (ou build a partir desta branch) e gerar imagem do backend, **ou** fazer `docker build` no repositório no commit acima.
2. Rodar migrate (exemplo; ajuste rede, host e credenciais do seu stack):

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

3. **Critério de sucesso:** `db:migrate` termina com **exit code 0**; a migration `20260211131548` aparece como *migrated*.

## Observação de rede Docker

No host onde você roda `docker run`, use o nome da rede overlay que **existe** (`docker network ls`). Se aparecer `app_network not found`, o nome da rede no seu Swarm pode ser outro (ex. prefixo do stack).

## Link para abrir o PR no GitHub

https://github.com/zanon-alive/taktchat/compare/main...fix/migrations-companyid-plans?expand=1

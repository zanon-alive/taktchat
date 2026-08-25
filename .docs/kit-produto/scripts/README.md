# Seeds do kit — só ambiente local

**Não execute estes SQL no banco de produção.** Senha conhecida (`LocalTest#2026`) e empresas de demo não podem ir para o Postgres da VPS.

| Arquivo | Uso |
|---------|-----|
| `seed-local-kit.sql` | Personas, empresas, tickets de demonstração |
| `seed-demo-comercial-kanban.sql` | Funil Kanban + extras da demo comercial |

Rodar apenas em `localhost` (ex.: porta `5433`), depois de confirmar que o `.env` do backend aponta para banco local.

Não converter estes arquivos em migration Sequelize `.ts`. O deploy **não** deve aplicá-los.

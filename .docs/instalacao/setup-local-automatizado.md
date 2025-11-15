# Setup local automatizado

- **Data**: 2025-11-14  
- **Branch**: `main`  
- **Objetivo**: reproduzir em um único comando toda a preparação do ambiente local descrita em `.docs/branchs/main/configuracao-projeto.md`.

## Pré-requisitos mínimos

- Debian/Ubuntu com usuário normal (sem sudo obrigatório para tudo).
- `curl`, `tar`, `newuidmap`/`newgidmap` instalados (necessários para Docker rootless).
- Acesso à internet para baixar Node, Docker e dependências npm.
- Porta `5433` livre (Postgres local) e `6379` livre (Redis).

> Se já existir uma instalação do Docker ou do Node, o script apenas valida as versões e evita sobrescrever binários.

## Script

Arquivo: `scripts/setup-local-dev.sh`

```bash
cd /home/zanon/projetos/taktchat
./scripts/setup-local-dev.sh
```

O script é idempotente: pode ser executado novamente para garantir que dependências e infraestrutura estão no estado esperado.

## Etapas automatizadas

1. **PATH/NVM**: garante que `~/bin` esteja no `PATH`, instala/atualiza `nvm` e seleciona `Node.js 22.21.1` (npm 10.9.4).
2. **Docker rootless**: baixa os binários estáticos do Docker 27.3.1 + Compose v2.30.3 quando necessário; orienta a executar `dockerd-rootless-setuptool.sh install` na primeira vez e inicia `dockerd-rootless.sh` se nenhum daemon estiver ativo.
3. **Dependências npm**: roda `npm install --legacy-peer-deps` em `backend/` e `frontend/`.
4. **Infraestrutura**: executa `POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis`, verifica o status dos contêineres e aplica `CREATE EXTENSION IF NOT EXISTS vector;`.
5. **Backend**: compila (`npm run build`), executa migrations (`npx sequelize db:migrate`) e seeds padrão (`npx sequelize db:seed:all`).
6. **Resumo final**: apresenta próximos passos (start do backend/frontend e validação de login) e aponta pendências conhecidas (`npm audit`, avisos do Webpack Dev Server).

## Pós-execução obrigatória

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm start`
3. **Teste rápido** (opcional, mas recomendado):
   ```bash
   curl -X POST http://localhost:8080/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@admin.com","password":"123456"}'
   ```
   Esperado: HTTP 200 com `token` válido.

## Limitações conhecidas

- O script tenta subir o Docker rootless automaticamente; se o host não suportar namespaces de usuário, será necessário configurar manualmente (seguir dicas do log em `/tmp/dockerd-rootless.log`).
- Vulnerabilidades listadas por `npm audit` **não** são corrigidas automaticamente (há 59 no backend e 47 no frontend no momento desta documentação).
- Os avisos deprecados do Webpack Dev Server continuarão aparecendo até que as dependências sejam atualizadas em tarefa dedicada.
- Não há execução automática do frontend/backend em modo watch para evitar processos deixados em background; os passos pós-execução continuam manuais.

## Referências

- `.docs/branchs/main/configuracao-projeto.md` — histórico detalhado da configuração manual.
- `.docs/instalacao/passo-a-passo-local.md` — roteiro completo caso seja necessário validar cada comando individual.


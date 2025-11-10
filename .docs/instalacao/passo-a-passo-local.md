## Passo a passo para rodar o Taktchat em localhost

Este guia registra as ações executadas para subir todo o ambiente localmente. Cada etapa será validada manualmente durante o processo.

### Pré-requisitos a confirmar

- Node.js 22.x
- npm 10+
- Docker Engine + Docker Compose v2
- ffmpeg disponível no host (ou provido via container)

### Histórico de execuções

- (concluído) Checklist inicial de ferramentas instaladas  
  ```bash
  node -v        # v20.10.0
  npm -v         # 10.2.3
  docker --version          # Docker 28.3.3
  docker compose version    # Compose v2.39.1
  ffmpeg -version           # ffmpeg 6.1.1
  ```
- (concluído) Infraestrutura Docker (Postgres/Redis)  
  ```bash
  POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis
  docker compose ps
  ```
- (concluído) Configuração de variáveis do backend  
  - Arquivo `backend/.env` ajustado para:
    ```
    BACKEND_URL=http://localhost:8080
    FRONTEND_URL=http://localhost:3000
    DB_HOST=localhost
    DB_PORT=5433
    DB_NAME=taktchat_database
    DB_USER=postgres
    DB_PASS=efe487b6a861100fb704ad9f5c160cb8
    ```
- (concluído com ressalvas) Instalação de dependências  
  ```bash
  cd backend && npm install --legacy-peer-deps
  cd ../frontend && npm install --legacy-peer-deps
  ```
  > Melhorias pendentes: alinhar versões de `material-ui-color` x `material-ui-popup-state` e revisar vulnerabilidades reportadas por `npm audit`.
- (concluído com aviso) Inicialização do backend  
  ```bash
  # criar banco antes da primeira execução
  docker exec taktchat-postgres psql -U postgres -c "CREATE DATABASE taktchat_database;"

  cd backend
  npm run dev    # compila, roda migrations (sequelize) e sobe servidor em 8080
  ```
  > Advertência atual: habilitar `CREATE EXTENSION IF NOT EXISTS vector;` no Postgres para remover o aviso do pgvector.
- (concluído) População de dados padrão  
  ```bash
  cd backend
  npx sequelize db:seed:all
  ```
  > Cria a empresa inicial e o usuário `admin@admin.com` com senha `123456` para autenticação no frontend.
- (concluído) Validação de login  
  - Acesse `http://localhost:3000/login` e autentique com `admin@admin.com` / `123456`.
  - Confirme, no console do navegador, que as requisições a `POST /auth/login` retornam `200`.
- (concluído com avisos) Inicialização do frontend  
  ```bash
  cd frontend
  npm start
  ```
  > Frontend sobe em `http://localhost:3000` e reiniciará automaticamente a cada alteração. Build acusa diversos avisos do ESLint/React (imports não utilizados, dependências de hooks, chaves duplicadas em traduções, código inalcançável). Registrar limpeza técnica em tarefa futura.

### Próximos passos recomendados

1. Habilitar extensão `pgvector` no Postgres:
   ```bash
   docker exec taktchat-postgres apt-get update
   docker exec taktchat-postgres apt-get install -y postgresql-15-pgvector
   docker exec taktchat-postgres psql -U postgres -d taktchat_database -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```
2. Planejar limpeza dos warnings do frontend e ajuste de dependências `material-ui-color`.
3. Tratar vulnerabilidades reportadas por `npm audit` em backend e frontend.
4. Documentar eventuais usuários de teste criados durante a configuração.

> Observação geral: tanto backend quanto frontend exibiram vulnerabilidades no `npm audit`. Planejar correções específicas em sprint futura.



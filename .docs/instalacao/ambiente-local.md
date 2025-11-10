## Configuração de ambiente local (frontend + backend fora do Docker)

### 1. Preparar infraestrutura de suporte

```bash
# Clonar repositório
git clone git@github.com:seu-org/taktchat.git
cd taktchat

# Subir banco e cache
docker compose up -d postgres redis

# Se a porta 5432 já estiver em uso, defina POSTGRES_HOST_PORT=5433 (por exemplo)
POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis

# Confirmar status
docker compose ps
```

> Volumes persistidos: `postgres-data`, `redis-data`, `backend-private`, `backend-public`. Não remova com `docker compose down -v`.

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/` usando `.env.example` (se disponível) ou o template abaixo:

```
NODE_ENV=development
PORT=8080
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432   # Ajuste para 5433 se tiver usado POSTGRES_HOST_PORT=5433
DB_NAME=taktchat_database
DB_USER=postgres
DB_PASS=<senha>

REDIS_URI=redis://localhost:6379/0
REDIS_URI_ACK=redis://localhost:6379/1
SOCKET_FALLBACK_NS_BROADCAST=true

JWT_SECRET=<gera-um-secret>
JWT_REFRESH_SECRET=<gera-outro-secret>
```

> Ajuste credenciais conforme sua infraestrutura. Consulte `configuracao/variaveis-ambiente.md` para a lista completa.

### 3. Backend

```bash
cd backend
npm install

# Compila TS, roda migrations e inicia em modo watch
npm run dev
```

Scripts relevantes:
- `npm run dev:fast`: ignora build inicial para ciclos rápidos.
- `npm run db:migrate`: executa migrations manualmente.
- `npm run test`: executa testes com Jest (usa banco em `.env.test`).

### 4. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

O script `start` libera automaticamente a porta 3000 caso esteja ocupada.

### 5. URLs de acesso

- Frontend: http://localhost:3000
- Backend REST: http://localhost:8080/api
- Socket.IO: http://localhost:8080/socket.io/

### 6. Troubleshooting rápido

- **Portas 8080/3000 ocupadas**: identifique com `lsof -i :8080` e encerre processos.
- **Migrations falhando**: garanta que o container `postgres` esteja `Up` e revise logs com `docker compose logs postgres`.
- **Redis indisponível**: execute `docker compose restart redis` e teste com `docker exec taktchat-redis redis-cli ping`.
- **Sessão WhatsApp perdida**: verifique volume `taktchat_backend-private` e regenerate QR code via painel.


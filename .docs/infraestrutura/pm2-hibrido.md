# Alternativa: TaktChat com PM2 (híbrido)

> **NÃO É O PROCESSO DA VPS.** Produção usa Swarm/Portainer com imagens GHCR fixadas por digest, sem checkout ou bind mounts de código.
> Este guia descreve um desenho opcional: **Docker só para Postgres/Redis** (e Traefik, se já existir) + **PM2 para o Node**.

Arquivo de exemplo: `ecosystem.config.cjs` na raiz do repositório.

---

## O que o PM2 substitui (e o que não)

| Continua no Docker / Portainer | Sobe no PM2 |
|--------------------------------|-------------|
| PostgreSQL (`postgres_postgres`) | Backend `node dist/server.js` (porta 8080) |
| Redis (`redis_redis`) | Frontend `node server.js` (porta 3000), **opcional** |
| Traefik (TLS `taktchat.com.br` / `api.taktchat.com.br`) | — |

PM2 **não** substitui banco, cache nem certificado. O frontend estático fica melhor no **Nginx** (ou no próprio Traefik apontando para `frontend/build`); o app `taktchat-frontend` no ecosystem é só para manter o `server.js` atual.

---

## Restrição da VPS (importante)

Na stack de Postgres/Redis as portas **não estão publicadas** no host — só a rede overlay `app_network`. O Swarm resolve `postgres_postgres` e `redis_redis`. Um processo PM2 **no host não entra nessa rede**.

Antes de usar PM2, publique as portas **somente em localhost** nas stacks 03/04:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

```yaml
ports:
  - "127.0.0.1:6379:6379"
```

No `backend/.env` do host:

```
DB_HOST=127.0.0.1
DB_PORT=5432
REDIS_URI=redis://:SENHA@127.0.0.1:6379
REDIS_URI_ACK=redis://:SENHA@127.0.0.1:6379
REDIS_URI_MSG_CONN=redis://:SENHA@127.0.0.1:6379
BACKEND_URL=https://api.taktchat.com.br
FRONTEND_URL=https://taktchat.com.br
```

Não use `instances: auto` nem `exec_mode: cluster` no backend: a sessão Baileys fica em disco (`private/sessions`). Uma instância só.

---

## Traefik apontando para o host

Hoje o Traefik roteia para **serviços Swarm**. Com PM2, a API escuta em `127.0.0.1:8080`. Opções:

1. **File provider** no Traefik (recomendado): router `Host(api.taktchat.com.br)` → `http://172.17.0.1:8080` (bridge) ou IP do host na overlay.
2. Manter um container Nginx mínimo na `traefik_public` fazendo proxy para o host.
3. Rodar Caddy/Nginx **no host** e dispensar o Traefik só para o TaktChat (os outros serviços da VPS continuam no Traefik).

O frontend, se for Nginx no host, escuta 80/443 com `root /root/taktchat/frontend/build`.

---

## Subida (exemplo)

```bash
cd /root/taktchat
git pull origin main

cd backend
npm install --legacy-peer-deps
npm run build
npx sequelize db:migrate

cd ../frontend
npm install --legacy-peer-deps --include=dev
export DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=4096
npm run build

cd /root/taktchat
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # uma vez, para systemd
```

O `pm2 start` sobe **só** `taktchat-backend` (`autostart: false` no frontend). O backend lê `backend/.env` via `env_file` (copie de `backend/.env.example`).

Se o frontend for Nginx, ignore o app `taktchat-frontend`. Se for o `server.js`:

```bash
pm2 start taktchat-frontend
```

### Atualizar código

```bash
cd /root/taktchat
git pull origin main
cd backend && npm install --legacy-peer-deps && npm run build && npx sequelize db:migrate
cd ../frontend && npm install --legacy-peer-deps --include=dev && npm run build
pm2 restart taktchat-backend
# pm2 restart taktchat-frontend   # só se o app frontend estiver ativo
```

Logs: `pm2 logs taktchat-backend`. Health: `curl -s http://127.0.0.1:8080/health`.

---

## Nginx (frontend estático, opcional)

```nginx
server {
  listen 80;
  server_name taktchat.com.br;
  root /root/taktchat/frontend/build;
  index index.html;
  location / {
    try_files $uri /index.html;
  }
}
```

TLS pode continuar no Traefik ou passar para o Nginx (`certbot`).

---

## Quando não usar

- VPS atual com Swarm/Portainer e atualização por digest.
- Necessidade de `taktchat-label-sync` (Chromium) — esse serviço é da stack GHCR, não do PM2.
- Querer várias réplicas do backend com WhatsApp Baileys no mesmo disco.

O `backend/ecosystem.config.js` antigo (`multipremium-back`, cluster) **não deve ser usado**.

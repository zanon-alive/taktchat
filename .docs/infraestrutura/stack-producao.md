# Stack de Produção - Docker Swarm

Este documento descreve a stack final utilizada em produção com Portainer/Docker Swarm para o TaktChat.

## 📋 Visão Geral

A stack utiliza volumes montados para permitir atualizações rápidas sem necessidade de rebuild das imagens Docker. O código é montado diretamente do repositório clonado no servidor, permitindo atualizações em segundos com apenas `git pull` + restart dos serviços.

### Arquivo da Stack

A stack final utilizada em produção está disponível em:
- **`14_taktchat.yml`** (raiz deste repositório) — cópia da stack da VPS (`stacks_producao-main-server/14_taktchat.yml`): volumes montados, imagem local `taktchat-backend:latest`, frontend `node:20-bookworm-slim`.

Alternativas (não usadas na VPS hoje):
- `14_taktchat_ghcr.yml` — imagens GHCR + serviço `taktchat-label-sync`
- `14_taktchat_rapido.yml` — variante histórica (URLs alivesolucoes / porta 3000)

Exemplo **PM2 no host** (Postgres/Redis no Docker, Node fora do Swarm): `.docs/infraestrutura/pm2-hibrido.md` e `ecosystem.config.cjs`. Não substitui a stack da VPS.

## ⚠️ Pré-requisitos no Servidor VPS

### 1. Clonar Repositório Completo

```bash
git clone https://github.com/zanon-alive/taktchat.git /root/taktchat
```

### 2. Instalar Dependências do Backend

```bash
cd /root/taktchat/backend
npm install --legacy-peer-deps
```

### 3. Instalar Dependências do Frontend (opcional - será feito automaticamente)

```bash
cd /root/taktchat/frontend
npm install --legacy-peer-deps
```

### 4. Verificar Estrutura

```bash
ls -la /root/taktchat/backend/package.json
ls -la /root/taktchat/frontend/package.json
```

### 5. Scripts de Startup

Os scripts de startup devem estar em `/root/stacks/scripts/`:

- `taktchat-migrate-startup.sh` - Script de inicialização do serviço de migração
- `taktchat-backend-startup.sh` - Script de inicialização do backend
- `taktchat-frontend-startup.sh` - Script de inicialização do frontend

> **Nota:** Veja exemplos de scripts em `.docs/SCRIPTS_STARTUP_EXEMPLO.md`

## 🚀 Serviços da Stack

### taktchat-migrate

Serviço de migração e seed do banco de dados que executa uma vez:

- **Imagem:** `taktchat-backend:latest`
- **Função:** Executa migrações e seeds iniciais
- **Restart Policy:** `none` (não reinicia após conclusão)
- **Recursos:** 0.25 CPU, 768M RAM

### taktchat-backend

Serviço principal do backend:

- **Imagem:** `taktchat-backend:latest`
- **Porta:** 8080 (interno)
- **Volumes Montados:**
  - `/root/taktchat/backend:/usr/src/app` - Código do backend
  - `taktchat_node_modules` - Dependências isoladas
  - `taktchat_media` - Uploads e arquivos públicos
  - `taktchat_tsc_cache` - Cache de compilação TypeScript
- **Healthcheck:** Verifica endpoint `/health` (API, DB, etc)
- **Recursos:** 0.75 CPU, 1536M RAM
- **Roteamento Traefik:** `api.taktchat.com.br`

### taktchat-frontend

Serviço do frontend:

- **Imagem:** `node:20-bookworm-slim`
- **Porta:** 80 (interno)
- **Volumes Montados:**
  - `/root/taktchat/frontend:/usr/src/app` - Código do frontend
  - `taktchat_frontend_node_modules` - Dependências isoladas
- **Build:** Compilação React em runtime (`npm run build`)
- **Recursos:** 1.0 CPU, 4096M RAM (necessário para compilação React)
- **Roteamento Traefik:** `taktchat.com.br`

## 🔄 Atualizações Rápidas

Para atualizar o código em produção sem rebuild de imagens:

```bash
# 1. Atualizar código
cd /root/taktchat
git pull origin main

# 2. Instalar novas dependências (se houver)
cd backend
npm install --legacy-peer-deps  # Se houver novas dependências no backend

cd ../frontend
npm install --legacy-peer-deps  # Se houver novas dependências no frontend

# 3. Reiniciar serviços
docker service update --force taktchat_taktchat-backend
docker service update --force taktchat_taktchat-frontend  # Se houver mudanças no frontend
```

> **📖 Guia Completo:** Para o processo completo e detalhado de atualização, incluindo build do frontend, verificação de logs e troubleshooting, consulte `.docs/ATUALIZACAO_SERVIDOR.md` - **Guia Completo de Atualização do TaktChat no Servidor**

## 🌐 Variáveis de Ambiente Principais

### Backend

- `BACKEND_URL=https://api.taktchat.com.br`
- `FRONTEND_URL=https://taktchat.com.br`
- `DB_HOST=postgres_postgres`
- `DB_PORT=5432`
- `DB_NAME=taktchat_database`
- `DB_USER=taktchat_user`
- `DB_PASS` — senha do banco (não versionar o valor real; na VPS está no YAML da stack)
- `JWT_SECRET` e `JWT_REFRESH_SECRET` - Secrets de autenticação (na VPS, no YAML da stack)
- `REDIS_URI` - Conexão Redis para filas e Socket.IO

### Frontend

- `REACT_APP_BACKEND_URL=https://api.taktchat.com.br`
- `REACT_APP_SOCKET_URL=https://api.taktchat.com.br`
- `PUBLIC_URL=https://taktchat.com.br`
- `NODE_ENV=production`

## 📊 Redes e Volumes

### Redes

- `app_network` (external) - Rede interna para comunicação entre serviços
- `traefik_public` (external) - Rede para roteamento via Traefik

### Volumes

- `taktchat_media` - Uploads e arquivos públicos do backend
- `taktchat_node_modules` - Dependências do backend (isoladas)
- `taktchat_tsc_cache` - Cache de compilação TypeScript
- `taktchat_frontend_node_modules` - Dependências do frontend (isoladas)

## 🔍 Monitoramento e Healthcheck

O backend possui healthcheck configurado que verifica:

- Status da API (`/health`)
- Status do banco de dados
- Status do Redis

O healthcheck executa a cada 30 segundos com timeout de 10 segundos e 5 retries.

## ⚡ Benefícios desta Abordagem

- ✅ **Atualização em segundos** (apenas git pull + restart)
- ✅ **Não precisa fazer build de imagem Docker** para mudanças de código
- ✅ **Ideal para desenvolvimento e atualizações frequentes**
- ✅ **Consistência entre backend e frontend** (mesma abordagem com volumes)
- ✅ **Build em runtime** permite ajustes rápidos

## 📚 Documentação Relacionada

- **Scripts de Startup:** `.docs/SCRIPTS_STARTUP_EXEMPLO.md`
- **Atualização no Servidor:** `.docs/ATUALIZACAO_SERVIDOR.md`
- **Build e Deploy Docker (legado Docker Hub):** `.docs/DOCKER_BUILD_E_DEPLOY.md`
- **Comparação de Stacks:** `.docs/COMPARACAO_STACKS.md`
- **Stack GHCR (alternativa):** `.docs/infraestrutura/stack-producao-ghcr.md`

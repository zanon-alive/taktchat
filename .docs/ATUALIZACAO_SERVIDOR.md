# Atualização do Código TaktChat no Servidor

Este documento descreve o processo completo para atualizar o código TaktChat no servidor VPS ARM64 usando build nativo.

## 📋 Pré-requisitos

1. **Acesso SSH ao servidor VPS**
2. **Docker instalado e funcionando**
3. **Autenticação no Docker Hub configurada** (`docker login`)
4. **Repositório Git clonado no servidor** (ex: `/root/taktchat` ou `/home/zanonr/desenvolvimento/taktchat`)

---

## 🚀 Método 1: Script Automatizado (RECOMENDADO)

O script `deploy-vps-server.sh` automatiza todo o processo:

### Passo a passo:

```bash
# 1. Conectar ao servidor via SSH
ssh root@seu-servidor.com

# 2. Navegar para o diretório do repositório
cd /root/taktchat  # ou o caminho onde está o repositório

# 3. Verificar que está na branch correta (opcional)
git branch --show-current

# 4. Executar o script de deploy
./scripts/deploy-vps-server.sh latest main
```

### O que o script faz automaticamente:

1. ✅ **Atualiza o código do Git** (`git pull`)
2. ✅ **Faz build NATIVO das imagens Docker** (ARM64 - rápido!)
3. ✅ **Faz push para Docker Hub**
4. ✅ **Atualiza a stack Docker Swarm**

**Tempo estimado:** 8-15 minutos (build nativo é muito mais rápido que cross-compilation)

---

## 🔧 Método 2: Processo Manual (Passo a Passo)

Se preferir fazer manualmente ou entender cada etapa:

### Etapa 1: Conectar ao Servidor

```bash
ssh root@seu-servidor.com
```

### Etapa 2: Navegar para o Repositório

```bash
cd /root/taktchat  # Ajuste o caminho conforme sua configuração
# ou
cd /home/zanonr/desenvolvimento/taktchat
```

### Etapa 3: Atualizar Código do Git

```bash
# Verificar branch atual
git branch --show-current

# Atualizar código (branch main)
git fetch origin main
git pull origin main

# Verificar commit atual
git rev-parse --short HEAD
```

### Etapa 4: Configurar Variáveis de Ambiente (Opcional)

```bash
# Variáveis padrão (já estão no script, mas podem ser customizadas)
export FRONT_BACKEND_URL="https://api.taktchat.com.br"
export FRONT_PUBLIC_URL="https://taktchat.com.br"
export DOCKER_PLATFORM="linux/arm64"
export BUILD_MODE="load"  # nativo, não precisa push durante build
export USE_REGISTRY_CACHE="true"
```

### Etapa 5: Verificar Autenticação Docker Hub

```bash
# Verificar se está autenticado
docker info | grep Username

# Se não estiver autenticado:
docker login
# Username: zanonalivesolucoes
# Password: [seu token/password do Docker Hub]
```

### Etapa 6: Build Nativo das Imagens Docker

```bash
# Build de ambas as imagens (frontend + backend)
./scripts/build-docker-optimized.sh latest all

# Ou apenas frontend:
./scripts/build-docker-optimized.sh latest frontend-only

# Ou apenas backend:
./scripts/build-docker-optimized.sh latest backend-only
```

**Tempo estimado:**
- Frontend: 5-8 minutos (build nativo)
- Backend: 3-5 minutos (build nativo)
- **Total: 8-15 minutos** (vs 30-60 minutos em cross-compilation)

### Etapa 7: Push das Imagens para Docker Hub

```bash
# Push do frontend
docker push zanonalivesolucoes/taktchat-frontend:latest

# Push do backend
docker push zanonalivesolucoes/taktchat-backend:latest
```

### Etapa 8: Atualizar Stack Docker Swarm

```bash
# Atualizar a stack (pull das novas imagens)
docker stack deploy -c 14_taktchat.yml --with-registry-auth taktchat
```

### Etapa 9: Verificar Status dos Serviços

```bash
# Listar serviços da stack
docker stack services taktchat

# Ver logs do backend
docker service logs taktchat_taktchat-backend --tail 50 -f

# Ver logs do frontend
docker service logs taktchat_taktchat-frontend --tail 50 -f

# Verificar status dos serviços
docker stack ps taktchat
```

---

## 📊 Fluxo Completo (Resumo)

```
┌─────────────────────────────────────────┐
│ 1. SSH no servidor                      │
│    ssh root@seu-servidor.com            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. cd /root/taktchat                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. git pull origin main                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. ./scripts/deploy-vps-server.sh       │
│    latest main                           │
│    (ou processo manual)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Build nativo (8-15 min)              │
│    - Frontend: 5-8 min                  │
│    - Backend: 3-5 min                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Push para Docker Hub                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. docker stack deploy (atualiza stack) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. Verificar status dos serviços        │
└─────────────────────────────────────────┘
```

---

## 🔍 Verificação Pós-Atualização

Após atualizar, verifique se tudo está funcionando:

### 1. Verificar Status dos Serviços

```bash
docker stack services taktchat
```

Todos os serviços devem estar com status `Running` e replicas `1/1`.

### 2. Verificar Logs

```bash
# Backend
docker service logs taktchat_taktchat-backend --tail 100

# Frontend
docker service logs taktchat_taktchat-frontend --tail 100

# Migrate (se executou)
docker service logs taktchat_taktchat-migrate --tail 100
```

### 3. Verificar Healthcheck

```bash
# Backend healthcheck
docker service inspect taktchat_taktchat-backend --format '{{json .UpdateStatus}}' | jq
```

### 4. Testar Endpoints (Opcional)

```bash
# Healthcheck do backend
curl https://api.taktchat.com.br/health

# Frontend
curl -I https://taktchat.com.br
```

---

## 🐛 Solução de Problemas

### Problema: "Image not found" ou "pull access denied"

**Solução:**
```bash
# Re-autenticar no Docker Hub
docker login

# Verificar se as imagens foram publicadas
docker pull zanonalivesolucoes/taktchat-frontend:latest
docker pull zanonalivesolucoes/taktchat-backend:latest
```

### Problema: Serviço não inicia após atualização

**Solução:**
```bash
# Ver logs detalhados
docker service logs taktchat_taktchat-backend --tail 200

# Verificar se há problemas de recursos
docker stack ps taktchat --no-trunc

# Tentar forçar atualização do serviço
docker service update --force taktchat_taktchat-backend
```

### Problema: Build falha no servidor

**Solução:**
```bash
# Verificar espaço em disco
df -h

# Limpar cache do Docker (cuidado: remove cache)
docker builder prune -a

# Verificar logs do build
./scripts/build-docker-optimized.sh latest all 2>&1 | tee build.log
```

### Problema: Git pull falha (conflitos)

**Solução:**
```bash
# Ver status do Git
git status

# Se houver mudanças locais, fazer stash
git stash

# Tentar pull novamente
git pull origin main

# Se necessário, restaurar mudanças
git stash pop
```

---

## ⏱️ Tempo Estimado

| Etapa | Tempo Estimado |
|-------|---------------|
| Git pull | 10-30 segundos |
| Build frontend (nativo) | 5-8 minutos |
| Build backend (nativo) | 3-5 minutos |
| Push para Docker Hub | 1-3 minutos |
| Deploy stack | 30-60 segundos |
| **TOTAL** | **8-15 minutos** |

*Nota: Build nativo é 5-10x mais rápido que cross-compilation (que levaria 30-60 minutos)*

---

## 🔄 Atualizações Parciais

Se precisar atualizar apenas uma parte:

### Atualizar apenas Frontend:

```bash
cd /root/taktchat
git pull origin main
./scripts/build-docker-optimized.sh latest frontend-only
docker push zanonalivesolucoes/taktchat-frontend:latest
docker service update --image zanonalivesolucoes/taktchat-frontend:latest taktchat_taktchat-frontend
```

### Atualizar apenas Backend:

```bash
cd /root/taktchat
git pull origin main
./scripts/build-docker-optimized.sh latest backend-only
docker push zanonalivesolucoes/taktchat-backend:latest
docker service update --image zanonalivesolucoes/taktchat-backend:latest taktchat_taktchat-backend
```

---

## 📝 Notas Importantes

1. **Build Nativo**: O servidor VPS deve ser ARM64 para builds nativos rápidos
2. **Docker Hub**: Certifique-se de que as imagens são públicas ou que você tem autenticação configurada
3. **Stack Name**: A stack deve se chamar `taktchat` (ou ajuste o nome no comando)
4. **Rede Externa**: As redes `app_network` e `traefik_public` devem existir antes de fazer deploy
5. **Volume**: O volume `taktchat_media` será criado automaticamente se não existir

---

## 🔗 Referências

- [Build e Deploy Docker](.docs/DOCKER_BUILD_E_DEPLOY.md)
- Script de deploy: `scripts/deploy-vps-server.sh`
- Script de build: `scripts/build-docker-optimized.sh`
- Stack: `14_taktchat.yml`

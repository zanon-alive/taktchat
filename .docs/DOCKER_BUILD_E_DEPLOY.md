# Build e Deploy de Imagens Docker - TaktChat

Este documento descreve o processo completo para construir e publicar as imagens Docker do TaktChat no Docker Hub.

## 📋 Pré-requisitos

1. **Docker instalado e em execução**
   ```bash
   docker --version
   docker info
   ```

2. **Docker Hub: Autenticação configurada**
   ```bash
   docker login
   # Username: zanonalivesolucoes (ou seu usuário)
   # Password: [seu token/password do Docker Hub]
   ```

3. **Docker Buildx (opcional, mas recomendado para multi-platform)**
   ```bash
   docker buildx version
   # Se não estiver instalado: docker buildx install
   ```

4. **Acesso ao repositório Git**
   - Repositório clonado localmente
   - Branch `main` atualizada

---

## 🚀 Processo Completo

### Passo 1: Preparar o Ambiente

```bash
# Navegar para o diretório do projeto
cd /home/zanonr/desenvolvimento/taktchat

# Atualizar a branch main
git checkout main
git pull origin main

# Verificar que está na branch correta
git branch --show-current
```

### Passo 2: Autenticar no Docker Hub

```bash
# Fazer login no Docker Hub
docker login

# Verificar autenticação
docker info | grep Username
```

### Passo 3: Construir e Publicar as Imagens

#### Opção A: Script Otimizado (Recomendado)

O script `build-docker-optimized.sh` é o método recomendado, pois inclui otimizações para hardware limitado e suporte a multi-platform.

```bash
# Build e push de ambas as imagens (frontend + backend)
./scripts/build-docker-optimized.sh latest all

# Ou apenas frontend
./scripts/build-docker-optimized.sh latest frontend-only

# Ou apenas backend
./scripts/build-docker-optimized.sh latest backend-only
```

**Parâmetros:**
- `latest`: Tag da imagem (pode ser qualquer tag, ex: `v1.0.0`, `dev`)
- `all`: Construir ambas as imagens (ou `frontend-only`, `backend-only`)

**Variáveis de ambiente opcionais:**
```bash
# Configurar domínios (padrão: taktchat.com.br)
export FRONT_BACKEND_URL="https://api.taktchat.com.br"
export FRONT_PUBLIC_URL="https://taktchat.com.br"

# Plataforma (padrão: linux/arm64)
export DOCKER_PLATFORM="linux/arm64"

# Modo de build (auto, load, push)
export BUILD_MODE="push"

# Executar build
./scripts/build-docker-optimized.sh latest all
```

#### Opção B: Script Alternativo (update-docker-images.sh)

```bash
# Script mais simples, sem otimizações avançadas
./scripts/update-docker-images.sh latest
```

#### Opção C: Build Manual (não recomendado)

```bash
# Frontend
cd frontend
docker build \
  --build-arg REACT_APP_BACKEND_URL=https://api.taktchat.com.br \
  --build-arg REACT_APP_SOCKET_URL=https://api.taktchat.com.br \
  --build-arg PUBLIC_URL=https://taktchat.com.br \
  -t zanonalivesolucoes/taktchat-frontend:latest \
  .
docker push zanonalivesolucoes/taktchat-frontend:latest

# Backend
cd ../backend
docker build -t zanonalivesolucoes/taktchat-backend:latest .
docker push zanonalivesolucoes/taktchat-backend:latest
```

---

## 📊 O que o Script Faz

O script `build-docker-optimized.sh`:

1. ✅ Verifica autenticação no Docker Hub
2. ✅ Configura limites de recursos do Docker
3. ✅ Detecta e configura Docker Buildx (multi-platform)
4. ✅ Construi as imagens com cache otimizado
5. ✅ Publica as imagens no Docker Hub
6. ✅ Exibe logs de progresso e timing

---

## 🔧 Configurações de Build

### Variáveis de Ambiente do Frontend

As seguintes variáveis são usadas durante o build do frontend:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `FRONT_BACKEND_URL` | URL da API backend | `https://api.taktchat.com.br` |
| `FRONT_SOCKET_URL` | URL do Socket.IO | `https://api.taktchat.com.br` |
| `FRONT_PUBLIC_URL` | URL pública do frontend | `https://taktchat.com.br` |
| `FRONT_PRIMARY_COLOR` | Cor primária do tema | `#2563EB` |
| `FRONT_PRIMARY_DARK` | Cor primária (tema escuro) | `#1E3A8A` |

### Plataforma de Build

Por padrão, o script constrói para `linux/arm64` (compatível com servidor de produção).

Para alterar:
```bash
export DOCKER_PLATFORM="linux/amd64"  # Para servidor x86_64
export DOCKER_PLATFORM="linux/arm64"  # Para servidor ARM64 (padrão)
```

---

## ⚡ Otimizações do Script

O script inclui várias otimizações:

1. **Cache BuildKit**: Usa cache de dependências npm e apt
2. **Multi-platform**: Suporte a builds cross-platform via Buildx
3. **Logs de Timing**: Exibe tempo gasto em cada etapa
4. **Detecção Automática**: Detecta se é cross-compilation e ajusta estratégia
5. **Fallback**: Se Buildx não estiver disponível, usa docker build padrão

---

## 🐛 Solução de Problemas

### Erro: "401 Unauthorized" no Docker Hub

```bash
# Re-autenticar no Docker Hub
docker logout
docker login
```

### Erro: "exec format error" (cross-compilation)

Se estiver fazendo cross-compilation (ex: AMD64 → ARM64), configure binfmt:

```bash
# Instalar QEMU para emulação ARM64
docker run --privileged --rm tonistiigi/binfmt --install arm64

# Recriar builder Buildx
docker buildx rm multiarch 2>/dev/null || true
docker buildx create --name multiarch --use --bootstrap
```

### Build muito lento

- Use `BUILD_MODE=push` para cross-compilation (evita carregar imagem localmente)
- Ative cache do registry: `USE_REGISTRY_CACHE=true`
- Certifique-se de que Buildx está configurado corretamente

### Erro: "out of memory" ou "killed"

O build pode consumir muita memória. Soluções:
- Feche outras aplicações pesadas
- Aumente a memória disponível para Docker
- Use `BUILD_MODE=push` para não carregar imagens localmente

---

## ✅ Verificação Pós-Build

Após o build, verifique se as imagens foram publicadas:

```bash
# Listar imagens locais
docker images | grep taktchat

# Verificar no Docker Hub (via web ou API)
# https://hub.docker.com/r/zanonalivesolucoes/taktchat-frontend/tags
# https://hub.docker.com/r/zanonalivesolucoes/taktchat-backend/tags

# Ou testar pull
docker pull zanonalivesolucoes/taktchat-frontend:latest
docker pull zanonalivesolucoes/taktchat-backend:latest
```

---

## 📦 Imagens Geradas

O processo cria e publica as seguintes imagens:

- **Frontend**: `zanonalivesolucoes/taktchat-frontend:latest`
- **Backend**: `zanonalivesolucoes/taktchat-backend:latest`

Ambas as imagens são construídas para a plataforma especificada em `DOCKER_PLATFORM` (padrão: `linux/arm64`).

---

## 🔄 Deploy no Servidor

Após publicar as imagens, faça o deploy no servidor:

```bash
# No servidor VPS
./scripts/deploy-vps-server.sh latest main
```

Ou atualize o stack Docker Swarm manualmente:

```bash
docker stack deploy -c docker-stack-taktchat.yml --with-registry-auth taktchat
```

---

## 📝 Exemplo Completo

```bash
# 1. Preparar ambiente
cd /home/zanonr/desenvolvimento/taktchat
git checkout main
git pull origin main

# 2. Autenticar
docker login

# 3. Build e push (método recomendado)
./scripts/build-docker-optimized.sh latest all

# 4. Verificar (opcional)
docker images | grep taktchat

# 5. No servidor: fazer deploy
# ./scripts/deploy-vps-server.sh latest main
```

---

## 🔗 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `build-docker-optimized.sh` | Build otimizado com cache e multi-platform (RECOMENDADO) |
| `update-docker-images.sh` | Build simples, sem otimizações avançadas |
| `build-docker-safe.sh` | Build com limites de recursos (hardware limitado) |
| `deploy-vps-server.sh` | Deploy automatizado no servidor VPS |
| `deploy-docker.sh` | Deploy manual Docker/Docker Compose |

---

## 📚 Documentação Adicional

- [Configuração de Variáveis de Ambiente](.docs/configuracao/variaveis-ambiente.md)
- [Deploy no Servidor VPS](.docs/branchs/feature/build-arm64-support/DEPLOY_VPS_SERVER.md)
- [Troubleshooting Traefik](.docs/branchs/feature/build-arm64-support/TROUBLESHOOTING_TRAEFIK.md)

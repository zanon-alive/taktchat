#!/usr/bin/env bash
set -euo pipefail

#
# Script para DEPLOY no SERVIDOR VPS (ARM64)
# Este script deve ser executado NO SERVIDOR onde a aplicação está hospedada
# 
# Uso:
#   scripts/deploy-vps-server.sh [tag] [branch]
#
# Exemplo:
#   scripts/deploy-vps-server.sh latest main
#

# Configurações
REPO_DIR="${REPO_DIR:-/home/zanonr/desenvolvimento/taktchat}"
IMAGE_TAG="${1:-latest}"
GIT_BRANCH="${2:-main}"
DOCKER_USER="${DOCKER_USER:-zanonalivesolucoes}"
FRONT_IMAGE="${FRONT_IMAGE:-${DOCKER_USER}/taktchat-frontend}"
BACK_IMAGE="${BACK_IMAGE:-${DOCKER_USER}/taktchat-backend}"

# Variáveis de ambiente do frontend (produção)
export FRONT_BACKEND_URL="${FRONT_BACKEND_URL:-https://taktchat-api.alivesolucoes.com.br}"
export FRONT_SOCKET_URL="${FRONT_SOCKET_URL:-$FRONT_BACKEND_URL}"
export FRONT_PUBLIC_URL="${FRONT_PUBLIC_URL:-https://taktchat.alivesolucoes.com.br}"
export FRONT_PRIMARY_COLOR="${FRONT_PRIMARY_COLOR:-#2563EB}"
export FRONT_PRIMARY_DARK="${FRONT_PRIMARY_DARK:-#1E3A8A}"
export FRONT_VERSION="${FRONT_VERSION:-${IMAGE_TAG}}"

# Para build nativo no servidor ARM64, não precisa de cross-compilation
export DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/arm64}"
export BUILD_MODE="${BUILD_MODE:-load}"  # load porque é nativo, não precisa push durante build
export USE_REGISTRY_CACHE="${USE_REGISTRY_CACHE:-true}"
export DOCKER_PROGRESS="${DOCKER_PROGRESS:-auto}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

warn() {
  printf '\n[%s][WARN] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

error() {
  printf '\n[%s][ERRO] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

info() {
  printf '\n[%s][INFO] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

# Verificar se estamos no diretório correto
if [ ! -d "${REPO_DIR}/.git" ]; then
  error "Repositório Git não encontrado em ${REPO_DIR}"
  error "Configure REPO_DIR ou execute o script a partir do diretório do repositório"
  exit 1
fi

# Verificar se docker está disponível
if ! command -v docker >/dev/null 2>&1; then
  error "Docker não encontrado. Instale o Docker primeiro."
  exit 1
fi

# Verificar autenticação Docker Hub
if ! docker info 2>/dev/null | grep -q "Username"; then
  error "Não autenticado no Docker Hub. Execute: docker login"
  exit 1
fi

log "=========================================="
log "Deploy TaktChat - Servidor VPS (ARM64)"
log "=========================================="
log "Tag: ${IMAGE_TAG}"
log "Branch: ${GIT_BRANCH}"
log "Repositório: ${REPO_DIR}"
log "Plataforma: ${DOCKER_PLATFORM} (nativo - será rápido!)"
log ""

# Verificar arquitetura do servidor
SERVER_ARCH=$(uname -m 2>/dev/null || echo "unknown")
log "Arquitetura do servidor: ${SERVER_ARCH}"

if [ "${SERVER_ARCH}" != "aarch64" ] && [ "${SERVER_ARCH}" != "arm64" ]; then
  warn "Servidor não parece ser ARM64 (${SERVER_ARCH})"
  warn "Builds podem ser mais lentos se for cross-compilation"
else
  info "✓ Servidor ARM64 detectado - builds serão nativos (rápidos!)"
fi

log ""
log "=== ETAPA 1: Atualizar código do Git ==="
cd "${REPO_DIR}"

# Verificar se há mudanças locais não commitadas
if [ -n "$(git status --porcelain)" ]; then
  warn "Existem mudanças locais não commitadas:"
  git status --short
  read -p "Continuar mesmo assim? As mudanças locais serão mantidas. (s/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log "Deploy cancelado pelo usuário"
    exit 0
  fi
fi

# Atualizar código
log "Atualizando branch ${GIT_BRANCH}..."
git fetch origin "${GIT_BRANCH}" || {
  error "Falha ao fazer fetch da branch ${GIT_BRANCH}"
  exit 1
}

# Verificar se precisa fazer checkout
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "${CURRENT_BRANCH}" != "${GIT_BRANCH}" ]; then
  log "Mudando para branch ${GIT_BRANCH}..."
  git checkout "${GIT_BRANCH}" || {
    error "Falha ao fazer checkout da branch ${GIT_BRANCH}"
    exit 1
  }
fi

# Fazer pull
log "Fazendo pull da branch ${GIT_BRANCH}..."
git pull --ff-only origin "${GIT_BRANCH}" || {
  error "Falha ao fazer pull. Conflitos ou mudanças locais podem estar impedindo."
  error "Execute: git status"
  exit 1
}

GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log "✓ Código atualizado. Commit: ${GIT_COMMIT}"

log ""
log "=== ETAPA 2: Build das imagens Docker ==="
log "Build será NATIVO (ARM64) - muito mais rápido que cross-compilation!"

# Usar o script de build otimizado
"${REPO_DIR}/scripts/build-docker-optimized.sh" "${IMAGE_TAG}" "all" || {
  error "Build das imagens Docker falhou"
  exit 1
}

log ""
log "=== ETAPA 3: Push das imagens para Docker Hub ==="
log "Enviando imagens para o registry..."

# Push das imagens
docker push "${FRONT_IMAGE}:${IMAGE_TAG}" || {
  error "Falha ao fazer push do frontend"
  exit 1
}

docker push "${BACK_IMAGE}:${IMAGE_TAG}" || {
  error "Falha ao fazer push do backend"
  exit 1
}

log "✓ Imagens enviadas para o Docker Hub"

log ""
log "=== ETAPA 4: Atualizar stack Docker Swarm ==="

# Verificar se docker stack está em uso
if docker stack ls >/dev/null 2>&1; then
  STACK_NAME="${STACK_NAME:-taktchat}"
  STACK_FILE="${STACK_FILE:-${REPO_DIR}/docker-stack-taktchat.yml}"
  
  if [ -f "${STACK_FILE}" ]; then
    log "Atualizando stack Docker Swarm: ${STACK_NAME}"
    
    # Verificar se a stack existe
    if docker stack ls | grep -q "${STACK_NAME}"; then
      log "Stack ${STACK_NAME} existe, atualizando..."
      docker stack deploy -c "${STACK_FILE}" "${STACK_NAME}" || {
        error "Falha ao atualizar stack Docker Swarm"
        exit 1
      }
      log "✓ Stack atualizada"
    else
      log "Stack ${STACK_NAME} não existe, criando..."
      docker stack deploy -c "${STACK_FILE}" "${STACK_NAME}" || {
        error "Falha ao criar stack Docker Swarm"
        exit 1
      }
      log "✓ Stack criada"
    fi
    
    log "Aguardando serviços iniciarem..."
    sleep 5
    
    log "Status dos serviços:"
    docker stack services "${STACK_NAME}" || true
  else
    warn "Arquivo de stack não encontrado: ${STACK_FILE}"
    warn "Pule esta etapa ou ajuste STACK_FILE"
  fi
else
  warn "Docker Swarm não está ativo ou não está disponível"
  warn "Se usar docker-compose, atualize manualmente com: docker-compose up -d"
fi

log ""
log "=========================================="
log "✓ Deploy concluído com sucesso!"
log "=========================================="
log ""
log "Resumo:"
log "  - Branch: ${GIT_BRANCH}"
log "  - Commit: ${GIT_COMMIT}"
log "  - Tag: ${IMAGE_TAG}"
log "  - Frontend: ${FRONT_IMAGE}:${IMAGE_TAG}"
log "  - Backend: ${BACK_IMAGE}:${IMAGE_TAG}"
log ""
log "Imagens disponíveis no Docker Hub e stack atualizada!"
log ""


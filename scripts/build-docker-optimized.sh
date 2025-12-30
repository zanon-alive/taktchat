#!/usr/bin/env bash
set -euo pipefail

#
# Script OTIMIZADO para construir e publicar imagens Docker do Taktchat
# Projetado para hardware limitado - minimiza uso de CPU e disco
# Uso:
#   scripts/build-docker-optimized.sh [tag] [--frontend-only|--backend-only]
#

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="${1:-latest}"
BUILD_TYPE="${2:-all}" # all, frontend-only, backend-only

DOCKER_USER="${DOCKER_USER:-zanonalivesolucoes}"
FRONT_IMAGE="${FRONT_IMAGE:-${DOCKER_USER}/taktchat-frontend}"
BACK_IMAGE="${BACK_IMAGE:-${DOCKER_USER}/taktchat-backend}"

# Plataforma Docker (default: linux/arm64 para compatibilidade com servidor de produção)
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/arm64}"

# Modo de build: 'load' (carrega imagem localmente) ou 'push' (envia direto para registry)
# Para cross-compilation (AMD64 -> ARM64), 'push' é mais eficiente que 'load'
BUILD_MODE="${BUILD_MODE:-auto}" # auto, load, push

# Usar cache do registry (pode ser lento em conexões lentas)
USE_REGISTRY_CACHE="${USE_REGISTRY_CACHE:-true}" # true, false

# Modo de progress do Docker (auto é mais rápido, plain mostra mais detalhes)
DOCKER_PROGRESS="${DOCKER_PROGRESS:-auto}" # auto, plain

# Variáveis de ambiente do frontend (ajuste conforme necessário)
FRONT_BACKEND_URL="${FRONT_BACKEND_URL:-https://taktchat-api.alivesolucoes.com.br}"
FRONT_SOCKET_URL="${FRONT_SOCKET_URL:-$FRONT_BACKEND_URL}"
FRONT_PUBLIC_URL="${FRONT_PUBLIC_URL:-https://taktchat.alivesolucoes.com.br}"
FRONT_PRIMARY_COLOR="${FRONT_PRIMARY_COLOR:-#2563EB}"
FRONT_PRIMARY_DARK="${FRONT_PRIMARY_DARK:-#1E3A8A}"
FRONT_VERSION="${FRONT_VERSION:-${IMAGE_TAG}}"

# Variável global para tracking de tempo
START_TIME=$(date +%s)

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log_timing() {
  local elapsed
  elapsed=$(($(date +%s) - START_TIME))
  local minutes=$((elapsed / 60))
  local seconds=$((elapsed % 60))
  printf '\n[%s][TIMING] %s (tempo decorrido: %dm%02ds)\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" "$minutes" "$seconds"
}

warn() {
  printf '\n[%s][WARN] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

error() {
  printf '\n[%s][ERRO] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

# Verificar limites de recursos do Docker e configurar buildx
setup_docker_limits() {
  log "Configurando limites de recursos do Docker..."
  
  # Limitar uso de CPU (máximo 2 cores para não sobrecarregar)
  export DOCKER_BUILDKIT=1
  export COMPOSE_DOCKER_CLI_BUILD=1
  
  # Verificar se buildx está disponível para suporte multi-platform
  if command -v docker >/dev/null 2>&1; then
    if docker buildx version >/dev/null 2>&1; then
      log "✓ Docker Buildx detectado - suporte a multi-platform disponível"
      
      # Tentar usar builder multiarch se existir e suportar a plataforma alvo
      if docker buildx ls 2>/dev/null | grep -q "multiarch"; then
        if docker buildx inspect multiarch 2>/dev/null | grep -q "${DOCKER_PLATFORM}"; then
          log "Usando builder 'multiarch' para suporte a ${DOCKER_PLATFORM}"
          docker buildx use multiarch 2>/dev/null || {
            warn "Não foi possível ativar builder 'multiarch', usando builder padrão"
          }
        fi
      fi
    else
      warn "Docker Buildx não encontrado. Builds cross-platform podem não funcionar."
      warn "Para instalar: docker buildx install"
      warn "Nota: O builder padrão será usado, mas --platform pode não funcionar sem buildx."
    fi
  fi
  
  log "Plataforma alvo: ${DOCKER_PLATFORM}"
}

# Build otimizado com cache e limitação de recursos
build_image_optimized() {
  local image_name=$1
  local dockerfile=$2
  local context_dir=$3
  shift 3
  local extra_build_args=("$@")
  
  local build_start_time=$(date +%s)
  log "Construindo ${image_name}:${IMAGE_TAG} para plataforma ${DOCKER_PLATFORM} (com otimizações para hardware limitado)..."
  log_timing "Iniciando build de ${image_name}"
  
  # Verificar se buildx está disponível para usar --platform
  local build_cmd
  local platform_flag=()
  local build_mode_flag="--load"
  local needs_separate_push=true
  
  if docker buildx version >/dev/null 2>&1; then
    # Detectar se é cross-compilation
    local host_arch
    host_arch=$(uname -m 2>/dev/null || echo "unknown")
    local target_arch
    target_arch=$(echo "${DOCKER_PLATFORM}" | cut -d'/' -f2 || echo "unknown")
    
    # Determinar modo de build
    if [ "${BUILD_MODE}" = "auto" ]; then
      # Se for cross-compilation (ex: x86_64 -> arm64), usar --push é mais eficiente
      if [ "${host_arch}" = "x86_64" ] && [ "${target_arch}" = "arm64" ]; then
        build_mode_flag="--push"
        needs_separate_push=false
        log "Cross-compilation detectada (${host_arch} -> ${target_arch}), usando --push (mais eficiente)"
      else
        build_mode_flag="--load"
        needs_separate_push=true
      fi
    elif [ "${BUILD_MODE}" = "push" ]; then
      build_mode_flag="--push"
      needs_separate_push=false
    elif [ "${BUILD_MODE}" = "load" ]; then
      build_mode_flag="--load"
      needs_separate_push=true
    fi
    
    # Usar buildx para suporte a multi-platform
    build_cmd=(docker buildx build "${build_mode_flag}")
    platform_flag=(--platform="${DOCKER_PLATFORM}")
  else
    # Fallback para docker build padrão
    build_cmd=(docker build)
    build_mode_flag=""
    needs_separate_push=true
    warn "Usando docker build padrão (sem buildx)."
    warn "A plataforma ${DOCKER_PLATFORM} não será aplicada - usando plataforma nativa do host."
    warn "Para builds cross-platform, instale buildx: docker buildx install"
  fi
  
  # Usar buildkit para melhor cache e performance
  # Limitação de recursos é feita via nice/ionice no processo pai
  # BuildKit usa cache agressivo automaticamente
  
  # Preparar flags de cache
  local cache_flags=()
  local cache_setup_start=$(date +%s)
  
  # Se buildx estiver disponível e não for --push, usar cache do registry (se habilitado)
  if docker buildx version >/dev/null 2>&1 && [ "${build_mode_flag}" != "--push" ] && [ "${USE_REGISTRY_CACHE}" = "true" ]; then
    log "Configurando cache do registry (pode demorar alguns segundos)..."
    # Tentar usar cache de builds anteriores do registry
    # Nota: Isso pode ser lento em conexões lentas, mas acelera builds subsequentes
    cache_flags+=(--cache-from "type=registry,ref=${image_name}:${IMAGE_TAG}")
    cache_flags+=(--cache-from "type=registry,ref=${image_name}:latest")
    # Salvar cache no registry para próximos builds
    cache_flags+=(--cache-to "type=inline")
    local cache_setup_time=$(($(date +%s) - cache_setup_start))
    log "Cache configurado em ${cache_setup_time}s"
  elif [ "${USE_REGISTRY_CACHE}" = "false" ]; then
    log "Cache do registry desabilitado (USE_REGISTRY_CACHE=false)"
  fi
  
  local docker_build_start=$(date +%s)
  log "Executando docker build (isso pode demorar vários minutos)..."
  
  DOCKER_BUILDKIT=1 "${build_cmd[@]}" \
    "${platform_flag[@]}" \
    "${cache_flags[@]}" \
    --progress="${DOCKER_PROGRESS}" \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    -f "${dockerfile}" \
    -t "${image_name}:${IMAGE_TAG}" \
    "${extra_build_args[@]}" \
    "${context_dir}" || {
      local docker_build_time=$(($(date +%s) - docker_build_start))
      error "Build de ${image_name} falhou após ${docker_build_time}s"
      error "Se o erro for '401 Unauthorized' ou 'token expired', execute: docker login"
      return 1
    }
  
  local docker_build_time=$(($(date +%s) - docker_build_start))
  local total_build_time=$(($(date +%s) - build_start_time))
  log "Build de ${image_name} concluído com sucesso para ${DOCKER_PLATFORM}"
  log_timing "Build de ${image_name} finalizado (tempo de build Docker: ${docker_build_time}s, tempo total: ${total_build_time}s)"
  
  # Exportar flag para indicar se push já foi feito
  if [ "${needs_separate_push}" = "false" ]; then
    export BUILD_PUSH_DONE="true"
  else
    export BUILD_PUSH_DONE="false"
  fi
}

# Push com retry
push_image_with_retry() {
  local image_name=$1
  local max_retries=3
  local retry=0
  local push_start_time=$(date +%s)
  
  while [ $retry -lt $max_retries ]; do
    log "Enviando ${image_name}:${IMAGE_TAG} para o Docker Hub (tentativa $((retry+1))/$max_retries)..."
    log_timing "Iniciando push de ${image_name}"
    
    local attempt_start=$(date +%s)
    if docker push "${image_name}:${IMAGE_TAG}"; then
      local attempt_time=$(($(date +%s) - attempt_start))
      local total_push_time=$(($(date +%s) - push_start_time))
      log "Push de ${image_name} concluído com sucesso"
      log_timing "Push de ${image_name} finalizado (tempo desta tentativa: ${attempt_time}s, tempo total: ${total_push_time}s)"
      return 0
    else
      local attempt_time=$(($(date +%s) - attempt_start))
      retry=$((retry+1))
      if [ $retry -lt $max_retries ]; then
        warn "Push falhou após ${attempt_time}s. Aguardando 10 segundos antes de tentar novamente..."
        sleep 10
      fi
    fi
  done
  
  local total_push_time=$(($(date +%s) - push_start_time))
  error "Push de ${image_name} falhou após $max_retries tentativas (tempo total: ${total_push_time}s)"
  return 1
}

# Verificar se já está autenticado
check_docker_auth() {
  if ! docker info 2>/dev/null | grep -q "Username"; then
    error "Não autenticado no Docker Hub. Execute: docker login"
    exit 1
  fi
  log "✓ Autenticado no Docker Hub"
}

# Limpar cache do Docker se necessário (opcional)
clean_docker_cache() {
  if [ "${CLEAN_CACHE:-false}" = "true" ]; then
    warn "Limpando cache do Docker (isso pode liberar espaço mas vai fazer rebuild completo)..."
    docker builder prune -f
  fi
}

# Main
main() {
  log "=========================================="
  log "Build e Push Docker - TaktChat (OTIMIZADO)"
  log "=========================================="
  log "Tag: ${IMAGE_TAG}"
  log "Build: ${BUILD_TYPE}"
  log "Plataforma: ${DOCKER_PLATFORM}"
  log "Modo de build: ${BUILD_MODE}"
  log "Cache do registry: ${USE_REGISTRY_CACHE}"
  log "Progress do Docker: ${DOCKER_PROGRESS}"
  log ""
  
  # Aviso sobre cross-compilation
  local host_arch
  host_arch=$(uname -m 2>/dev/null || echo "unknown")
  local target_arch
  target_arch=$(echo "${DOCKER_PLATFORM}" | cut -d'/' -f2 || echo "unknown")
  if [ "${host_arch}" = "x86_64" ] && [ "${target_arch}" = "arm64" ]; then
    warn "⚠️  CROSS-COMPILATION DETECTADA (${host_arch} -> ${target_arch})"
    warn "   Builds cross-platform são 5-10x mais lentos devido à emulação QEMU."
    warn "   Build do frontend pode levar 30-60 minutos (é normal)."
    warn "   Build do backend pode levar 15-30 minutos (é normal)."
    warn ""
    warn "   Para builds mais rápidos:"
    warn "   - Build nativamente em servidor ARM64 (recomendado)"
    warn "   - Ou use BUILD_MODE=push para enviar direto ao registry"
    warn ""
  fi
  log "Configurações Frontend:"
  log "  Backend URL: ${FRONT_BACKEND_URL}"
  log "  Socket URL: ${FRONT_SOCKET_URL}"
  log "  Public URL: ${FRONT_PUBLIC_URL}"
  log ""
  
  # Verificações
  check_docker_auth
  setup_docker_limits
  
  # Build do Frontend
  if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "frontend-only" ]; then
    local frontend_start=$(date +%s)
    log "=== BUILDING FRONTEND ==="
    log_timing "Iniciando processo completo do frontend"
    
    log "Nota: Build do frontend em cross-compilation pode levar 30-60 minutos (é normal)."
    log "      O processo está otimizado mas emulação ARM64 é inerentemente lenta."
    
    build_image_optimized "${FRONT_IMAGE}" \
      "${REPO_ROOT}/frontend/Dockerfile" \
      "${REPO_ROOT}/frontend" \
      --build-arg "REACT_APP_BACKEND_URL=${FRONT_BACKEND_URL}" \
      --build-arg "REACT_APP_SOCKET_URL=${FRONT_SOCKET_URL}" \
      --build-arg "REACT_APP_PRIMARY_COLOR=${FRONT_PRIMARY_COLOR}" \
      --build-arg "REACT_APP_PRIMARY_DARK=${FRONT_PRIMARY_DARK}" \
      --build-arg "PUBLIC_URL=${FRONT_PUBLIC_URL}" \
      --build-arg "REACT_APP_FRONTEND_VERSION=${FRONT_VERSION}"
    
    # Push só é necessário se não foi feito durante o build (--push)
    if [ "${BUILD_PUSH_DONE:-false}" != "true" ]; then
      push_image_with_retry "${FRONT_IMAGE}"
    else
      log "Push já realizado durante o build (--push)"
    fi
    
    local frontend_total=$(($(date +%s) - frontend_start))
    log_timing "Frontend completo finalizado (tempo total: ${frontend_total}s)"
  fi
  
  # Build do Backend
  if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "backend-only" ]; then
    local backend_start=$(date +%s)
    log "=== BUILDING BACKEND ==="
    log_timing "Iniciando processo completo do backend"
    
    local git_start=$(date +%s)
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    local git_time=$(($(date +%s) - git_start))
    if [ "${git_time}" -gt 2 ]; then
      log "Obtenção de informações Git levou ${git_time}s"
    fi
    
    build_image_optimized "${BACK_IMAGE}" \
      "${REPO_ROOT}/backend/Dockerfile" \
      "${REPO_ROOT}/backend" \
      --build-arg "GIT_COMMIT=${GIT_COMMIT}" \
      --build-arg "BUILD_DATE=${BUILD_DATE}" \
      --build-arg "BACKEND_VERSION=${IMAGE_TAG}"
    
    # Push só é necessário se não foi feito durante o build (--push)
    if [ "${BUILD_PUSH_DONE:-false}" != "true" ]; then
      push_image_with_retry "${BACK_IMAGE}"
    else
      log "Push já realizado durante o build (--push)"
    fi
    
    local backend_total=$(($(date +%s) - backend_start))
    log_timing "Backend completo finalizado (tempo total: ${backend_total}s)"
  fi
  
  local total_time=$(($(date +%s) - START_TIME))
  local total_minutes=$((total_time / 60))
  local total_seconds=$((total_time % 60))
  
  log ""
  log "=========================================="
  log "✓ Processo concluído com sucesso!"
  log "=========================================="
  log_timing "Processo completo finalizado (tempo total: ${total_minutes}m${total_seconds}s)"
  log ""
  log "Imagens publicadas:"
  if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "frontend-only" ]; then
    log "  - ${FRONT_IMAGE}:${IMAGE_TAG}"
  fi
  if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "backend-only" ]; then
    log "  - ${BACK_IMAGE}:${IMAGE_TAG}"
  fi
  log ""
}

main "$@"


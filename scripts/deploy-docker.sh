#!/usr/bin/env bash
# Script FINAL para build e push Docker Hub - TaktChat
# Usa o modelo otimizado para hardware limitado

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

# Configurações padrão
IMAGE_TAG="${1:-latest}"
BUILD_TYPE="${2:-all}"  # all, frontend-only, backend-only

# URLs de produção (ajuste conforme necessário)
FRONT_BACKEND_URL="${FRONT_BACKEND_URL:-https://taktchat-api.alivesolucoes.com.br}"
FRONT_SOCKET_URL="${FRONT_SOCKET_URL:-$FRONT_BACKEND_URL}"
FRONT_PUBLIC_URL="${FRONT_PUBLIC_URL:-https://taktchat.alivesolucoes.com.br}"

# Funções auxiliares
log() {
    printf '\n${BLUE}[%s]${NC} %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

info() {
    printf '${GREEN}[INFO]${NC} %s\n' "$*"
}

warn() {
    printf '${YELLOW}[WARN]${NC} %s\n' "$*"
}

error() {
    printf '${RED}[ERROR]${NC} %s\n' "$*" >&2
}

# Banner
banner() {
    echo ""
    echo "=========================================="
    echo "  TaktChat - Build & Push Docker Hub"
    echo "=========================================="
    echo ""
}

# Verificações pré-build
preflight_checks() {
    info "Realizando verificações pré-build..."
    
    # Verificar Docker
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker não encontrado. Instale o Docker primeiro."
        exit 1
    fi
    
    # Verificar autenticação Docker Hub
    if ! docker info >/dev/null 2>&1; then
        error "Docker não está rodando ou não há permissão."
        exit 1
    fi
    
    # Verificar se está autenticado no Docker Hub (básico)
    if ! docker pull hello-world:latest >/dev/null 2>&1; then
        warn "Não foi possível verificar autenticação Docker Hub."
        warn "Certifique-se de estar autenticado: docker login"
    fi
    
    # Verificar se build-docker-optimized.sh existe
    if [ ! -f "${REPO_ROOT}/scripts/build-docker-optimized.sh" ]; then
        error "Script build-docker-optimized.sh não encontrado."
        exit 1
    fi
    
    # Verificar se está executável
    if [ ! -x "${REPO_ROOT}/scripts/build-docker-optimized.sh" ]; then
        chmod +x "${REPO_ROOT}/scripts/build-docker-optimized.sh"
    fi
    
    info "Verificações concluídas."
}

# Exibir configurações
show_config() {
    echo ""
    info "Configurações do Build:"
    echo "  Tag: ${IMAGE_TAG}"
    echo "  Tipo: ${BUILD_TYPE}"
    echo ""
    info "URLs de Produção:"
    echo "  Backend URL: ${FRONT_BACKEND_URL}"
    echo "  Socket URL: ${FRONT_SOCKET_URL}"
    echo "  Public URL: ${FRONT_PUBLIC_URL}"
    echo ""
}

# Confirmar antes de iniciar
confirm_build() {
    warn "⚠️  IMPORTANTE - Checklist Pré-Build:"
    echo "  [ ] Cursor está fechado"
    echo "  [ ] Anydesk está fechado"
    echo "  [ ] Servidor de desenvolvimento (npm start) está parado"
    echo "  [ ] Você está autenticado no Docker Hub (docker login)"
    echo ""
    echo "O build será executado com prioridade baixa para evitar sobrecarga."
    echo ""
    read -p "Continuar com o build? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        info "Build cancelado pelo usuário."
        exit 0
    fi
    echo ""
}

# Executar build otimizado
execute_build() {
    log "Iniciando build otimizado..."
    log "Este processo pode levar vários minutos..."
    echo ""
    
    # Exportar variáveis de ambiente
    export FRONT_BACKEND_URL
    export FRONT_SOCKET_URL
    export FRONT_PUBLIC_URL
    export IMAGE_TAG
    
    # Executar com prioridade baixa (nice/ionice)
    # nice -n 19: prioridade mais baixa do sistema
    # ionice -c 3: classe idle (só usa CPU quando não há outros processos)
    if nice -n 19 ionice -c 3 "${REPO_ROOT}/scripts/build-docker-optimized.sh" "${IMAGE_TAG}" "${BUILD_TYPE}"; then
        info "Build concluído com sucesso!"
        return 0
    else
        error "Build falhou. Verifique os logs acima."
        return 1
    fi
}

# Verificar imagens criadas
verify_images() {
    log "Verificando imagens criadas..."
    echo ""
    
    DOCKER_USER="${DOCKER_USER:-zanonalivesolucoes}"
    FRONT_IMAGE="${FRONT_IMAGE:-${DOCKER_USER}/taktchat-frontend}"
    BACK_IMAGE="${BACK_IMAGE:-${DOCKER_USER}/taktchat-backend}"
    
    echo "Imagens locais:"
    echo ""
    
    if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "frontend-only" ]; then
        if docker images "${FRONT_IMAGE}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null | grep -q "${FRONT_IMAGE}"; then
            info "✓ ${FRONT_IMAGE}:${IMAGE_TAG}"
            docker images "${FRONT_IMAGE}:${IMAGE_TAG}" --format "  {{.Repository}}:{{.Tag}} - {{.Size}}"
        else
            warn "✗ ${FRONT_IMAGE}:${IMAGE_TAG} não encontrada"
        fi
    fi
    
    if [ "${BUILD_TYPE}" = "all" ] || [ "${BUILD_TYPE}" = "backend-only" ]; then
        if docker images "${BACK_IMAGE}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null | grep -q "${BACK_IMAGE}"; then
            info "✓ ${BACK_IMAGE}:${IMAGE_TAG}"
            docker images "${BACK_IMAGE}:${IMAGE_TAG}" --format "  {{.Repository}}:{{.Tag}} - {{.Size}}"
        else
            warn "✗ ${BACK_IMAGE}:${IMAGE_TAG} não encontrada"
        fi
    fi
    
    echo ""
}

# Resumo final
show_summary() {
    echo ""
    echo "=========================================="
    echo "  ✓ Build e Push Concluídos!"
    echo "=========================================="
    echo ""
    info "Próximos passos:"
    echo "  1. Verificar imagens no Docker Hub"
    echo "  2. Atualizar containers no servidor"
    echo "  3. Verificar logs dos containers"
    echo ""
    
    DOCKER_USER="${DOCKER_USER:-zanonalivesolucoes}"
    echo "Imagens no Docker Hub:"
    echo "  • https://hub.docker.com/r/${DOCKER_USER}/taktchat-frontend/tags"
    echo "  • https://hub.docker.com/r/${DOCKER_USER}/taktchat-backend/tags"
    echo ""
}

# Help
show_help() {
    cat << EOF
Uso: $0 [TAG] [TIPO]

Argumentos:
  TAG    Tag da imagem Docker (padrão: latest)
  TIPO   Tipo de build (padrão: all)
         - all: Build completo (frontend + backend)
         - frontend-only: Apenas frontend
         - backend-only: Apenas backend

Variáveis de Ambiente:
  FRONT_BACKEND_URL    URL do backend (padrão: https://taktchat-api.alivesolucoes.com.br)
  FRONT_SOCKET_URL     URL do socket (padrão: mesma do backend)
  FRONT_PUBLIC_URL     URL pública do frontend (padrão: https://taktchat.alivesolucoes.com.br)
  DOCKER_USER          Usuário Docker Hub (padrão: zanonalivesolucoes)

Exemplos:
  # Build completo com tag latest
  $0

  # Build apenas frontend com tag v1.0.0
  $0 v1.0.0 frontend-only

  # Build completo com URLs customizadas
  FRONT_BACKEND_URL=https://api.exemplo.com \\
  FRONT_PUBLIC_URL=https://app.exemplo.com \\
  $0 latest all

  # Build apenas backend
  $0 latest backend-only

EOF
}

# Main
main() {
    # Se --help ou -h, mostrar ajuda
    if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    banner
    preflight_checks
    show_config
    confirm_build
    
    if execute_build; then
        verify_images
        show_summary
        exit 0
    else
        error "Falha no build. Verifique os logs acima."
        exit 1
    fi
}

# Executar main
main "$@"


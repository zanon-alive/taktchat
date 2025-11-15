#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NVM_DIR="${HOME}/.nvm"
DOCKER_VERSION="27.3.1"
DOCKER_TARBALL="docker-${DOCKER_VERSION}.tgz"
DOCKER_URL="https://download.docker.com/linux/static/stable/x86_64/${DOCKER_TARBALL}"
PATH_SNIPPET='export PATH="$HOME/bin:$PATH"'

log() {
  printf "\n\033[1;32m[setup]\033[0m %s\n" "$*"
}

warn() {
  printf "\n\033[1;33m[setup][warn]\033[0m %s\n" "$*"
}

run_step() {
  local description="$1"
  shift
  log "${description}"
  (cd "${PROJECT_ROOT}" && "$@")
}

ensure_nvm() {
  if [[ ! -s "${NVM_DIR}/nvm.sh" ]]; then
    log "Instalando nvm em ${NVM_DIR}"
    export NVM_DIR
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi

  # shellcheck source=/dev/null
  source "${NVM_DIR}/nvm.sh"
}

ensure_node() {
  ensure_nvm
  if ! nvm ls 22 >/dev/null 2>&1; then
    log "Instalando Node.js 22 (recomendado pelo projeto)"
    nvm install 22
  fi
  nvm alias default 22 >/dev/null
  nvm use 22 >/dev/null
  log "Node $(node -v) e npm $(npm -v) prontos"
}

ensure_path_snippet() {
  if ! grep -qx "${PATH_SNIPPET}" "${HOME}/.bashrc"; then
    log "Atualizando PATH em ~/.bashrc para incluir ~/bin"
    echo "${PATH_SNIPPET}" >> "${HOME}/.bashrc"
  fi
  export PATH="${HOME}/bin:${PATH}"
}

install_docker_binaries() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker já disponível em $(command -v docker)"
    return
  fi

  ensure_path_snippet
  mkdir -p "${HOME}/bin"
  local tmpdir
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "${tmpdir}"' EXIT

  log "Baixando Docker ${DOCKER_VERSION}"
  curl -fsSL "${DOCKER_URL}" -o "${tmpdir}/${DOCKER_TARBALL}"
  tar -xzf "${tmpdir}/${DOCKER_TARBALL}" -C "${tmpdir}"

  log "Instalando binários em ~/bin"
  for binary in containerd containerd-shim-runc-v2 ctr docker docker-init docker-proxy dockerd dockerd-rootless-setuptool.sh dockerd-rootless.sh rootlesskit runc vpnkit; do
    if [[ -x "${HOME}/bin/${binary}" ]]; then
      warn "Binário ${binary} já existe em ~/bin, mantendo versão atual"
      continue
    fi
    install -m 0755 "${tmpdir}/docker/${binary}" "${HOME}/bin/${binary}"
  done

  log "Docker instalado; finalize sua sessão ou carregue ~/.bashrc para atualizar o PATH"
  warn "Se ainda não configurou rootless Docker, execute: dockerd-rootless-setuptool.sh install"
}

check_or_install_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    install_docker_binaries
  fi

  if ! pgrep -f dockerd >/dev/null 2>&1; then
    warn "dockerd não está em execução. Iniciando rootless via dockerd-rootless.sh &"
    nohup dockerd-rootless.sh >/tmp/dockerd-rootless.log 2>&1 &
    sleep 5
  fi

  docker --version
  docker compose version
}

install_backend_dependencies() {
  run_step "Instalando dependências do backend" npm --prefix backend install --legacy-peer-deps
}

install_frontend_dependencies() {
  run_step "Instalando dependências do frontend" npm --prefix frontend install --legacy-peer-deps
}

start_infra() {
  run_step "Subindo Postgres/Redis via docker compose" env POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis
  run_step "Verificando serviços docker compose" docker compose ps
  run_step "Garantindo extensão pgvector" docker exec taktchat-postgres psql -U postgres -d taktchat_database -c "CREATE EXTENSION IF NOT EXISTS vector;"
}

prepare_database() {
  ensure_nvm
  run_step "Compilando backend (tsc)" npm --prefix backend run build
  run_step "Executando migrations" npx --prefix backend sequelize db:migrate
  run_step "Executando seeds padrão" npx --prefix backend sequelize db:seed:all
}

print_summary() {
  cat <<'EOF'

============================================================
Setup concluído!
- Dependências backend/frontend instaladas
- Postgres/Redis ativos (docker compose)
- Banco migrado e com seeds padrão

Próximos passos manuais:
1) Em um terminal: cd backend && npm run dev
2) Em outro terminal: cd frontend && npm start
3) Validar login em http://localhost:3000 (admin@admin.com / 123456)

Observações:
- Vulnerabilidades do npm permanecem pendentes (ver npm audit).
- Docker rootless pode precisar ser configurado manualmente na 1ª execução.
- Logs do dockerd rootless: /tmp/dockerd-rootless.log
============================================================
EOF
}

main() {
  log "Iniciando setup automatizado do ambiente local"
  ensure_path_snippet
  ensure_node
  check_or_install_docker
  install_backend_dependencies
  install_frontend_dependencies
  start_infra
  prepare_database
  print_summary
}

main "$@"


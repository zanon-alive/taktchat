#!/usr/bin/env bash
# Teste manual da landing de conversão (SPA).
# Rode da sua máquina local:
#   BASE_URL=http://localhost:3000 sh .docs/testes-manuais/landing-conversao.sh
#
# Esperado: HTML 200 nas rotas públicas. O redirect de "/" para "/landing"
# só aparece no browser (client-side). Sem sessão, "/" não deve exigir login
# no sentido de ficar na tela de login — confira no navegador.

set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"

ok() { echo "✅ $1"; }
fail() { echo "❌ $1"; exit 1; }

check_200() {
  local path="$1"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [ "$code" = "200" ]; then
    ok "${path} → ${code}"
  else
    fail "${path} → ${code} (esperado 200)"
  fi
}

echo "BASE_URL=${BASE_URL}"
check_200 "/"
check_200 "/landing"
check_200 "/landing/v1"
check_200 "/lgpd"
check_200 "/login"

echo
echo "Checklist no navegador (sem sessão):"
echo "  [ ] / cai em /landing (v2, print no hero visível no viewport, sem depoimentos)"
echo "  [ ] v2 sem 'Quero conhecer', 'Veja como resolver' nem 'Escolher este Plano'"
echo "  [ ] v2 sem '1 milhão de conversas' e sem 'Uptime 99.9%'"
echo "  [ ] /landing/v1 é a landing antiga e o HTML tem noindex"
echo "  [ ] /lgpd mostra aviso de revisão, sem DPO/prazos inventados"
echo "  [ ] /tickets cai em /login"
echo "  [ ] Cookie e rodapé apontam para /lgpd"
echo "  [ ] Seja revendedor no rodapé abre o modal"
echo
echo "Checklist logado:"
echo "  [ ] / continua o Dashboard"
echo "  [ ] /landing e /lgpd abrem sem bounce"

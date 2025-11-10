## Rotinas operacionais

### Diariamente

- Verificar saúde dos containers com `docker compose ps` ou monitor equivalente.
- Conferir filas Bull (rota `/admin/queues` se habilitada) e limpar jobs travados.
- Acompanhar logs críticos (`backend`, `redis`, `postgres`) em busca de erros recorrentes.
- Validar que sessões WhatsApp estão conectadas (dashboard administrativo).

### Semanalmente

- Executar `npm run diagnose` (backend) para checagens automatizadas.
- Revisar volume de armazenamento nos volumes `backend-public` e `backend-private`.
- Atualizar certificados ou tokens expiratórios (provedores externos, webhooks).

### Mensalmente

- Realizar teste de restauração de backup em ambiente isolado.
- Avaliar métricas de campanhas e ajustar limites por workspace.
- Rodar scripts de manutenção (`scripts/fix-contactlistitems-duplicates.ts`, etc.) conforme necessidade.

### Antes de releases

- Atualizar changelog em `anexos/notas-de-versao.md`.
- Executar testes automatizados (`npm run test` backend, `npm test` frontend).
- Validar builds (`npm run build` em ambos).
- Atualizar documentação impactada pela release.


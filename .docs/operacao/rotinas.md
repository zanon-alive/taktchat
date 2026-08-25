## Rotinas operacionais

Estas rotinas se aplicam à produção Docker Swarm/Portainer na VPS Contabo. `docker compose` é reservado ao desenvolvimento local.

### Diariamente

- Verificar réplicas e tarefas dos serviços Swarm `taktchat_taktchat-backend`, `taktchat_taktchat-frontend`, `taktchat_taktchat-label-sync` e, quando acionado, `taktchat_taktchat-migrate`.
- Conferir filas Bull (rota `/admin/queues` se habilitada) e limpar jobs travados.
- Acompanhar logs dos serviços Swarm de backend/frontend e dos serviços reais de Redis/PostgreSQL.
- Validar que sessões WhatsApp estão conectadas (dashboard administrativo).

### Semanalmente

- Executar `npm run diagnose` (backend) para checagens automatizadas.
- Revisar armazenamento em `taktchat_taktchat_media`, `taktchat_taktchat_private`, `postgres_postgres_data` e `redis_redis_data`.
- Atualizar certificados ou tokens expiratórios (provedores externos, webhooks).
- Verificar uso de disco/inodes e validade TLS no Traefik.
- Conferir se backups saíram da VPS e se os checksums foram registrados.

### Mensalmente

- Realizar teste de restauração de backup em ambiente isolado.
- Avaliar métricas de campanhas e ajustar limites por workspace.
- Rodar scripts de manutenção (`scripts/fix-contactlistitems-duplicates.ts`, etc.) conforme necessidade.
- Revisar acessos ao Portainer, VPS e registries.
- Revisar acessos e secrets da definição ativa no Portainer sem exportar valores.
- Verificar retenção dos digests necessários para rollback.

### Atualização do servidor de produção

**⚠️ IMPORTANTE:** Após fazer PR e merge na branch `main`, sempre siga o guia completo de atualização:

- **Guia obrigatório:** `release-deploy-rollback-swarm.md`
- O guia inclui:
  - Publicação das imagens pelos workflows GHCR
  - Confirmação de tag, SHA e digest
  - Atualização da stack no Portainer
  - Execução controlada de migrations
  - Verificação e monitoramento dos serviços
  - Rollback pelos digests anteriores

**Fluxo recomendado após PR/merge:**
1. ✅ PR aprovado e mergeado na branch `main`
2. ✅ Código commitado e enviado ao repositório
3. Consultar `release-deploy-rollback-swarm.md`
4. 🔄 Atualizar os digests no Portainer
5. ✅ Verificar logs e healthcheck dos serviços

### Antes de releases

- Atualizar changelog em `anexos/notas-de-versao.md`.
- Executar testes automatizados (`npm run test` backend, `npm test` frontend).
- Validar builds (`npm run build` em ambos).
- Atualizar documentação impactada pela release.
- Registrar SHA alvo e digests anterior/novo para rollback.
- Confirmar backup antes de migrations ou alterações de infraestrutura.
- Confirmar que nenhum secret será copiado para logs, tickets ou comandos compartilhados.


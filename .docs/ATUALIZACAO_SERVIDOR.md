# Atualização do TaktChat em produção

> **Documento de apoio.** O procedimento obrigatório é `.docs/operacao/release-deploy-rollback-swarm.md`.

**Atualizado em:** 2026-08-25

Produção usa Docker Swarm administrado pelo Portainer e imagens imutáveis do GHCR fixadas por digest. Não há checkout da aplicação, bind mounts de código ou `update-taktchat.sh` no fluxo confirmado.

## Resumo do fluxo

1. Abrir, revisar e aprovar o PR.
2. Fazer merge na `main`.
3. Aguardar builds GHCR. O `update-prod-stack` pinha digests no repo das stacks automaticamente após build verde (secret `STACKS_DEPLOY_TOKEN`).
4. Portainer aplica via GitOps (polling/webhook) ou **Pull and redeploy**; Prune off.
5. Executar `taktchat_taktchat-migrate` quando houver migration.
6. Aguardar convergência, validar health e smoke tests.
7. Rollback: revert no repo das stacks + pull/GitOps no Portainer.

**Incidente conhecido (resolvido em #25):** Node 20 + `@supabase/supabase-js` sem `ws` derrubava o backend no boot. Correção: `realtime.transport = ws` em `GetWhatsapp.ts`.

## Topologia relevante

- Backend: `ghcr.io/zanon-alive/taktchat-backend@sha256:<digest>`.
- Frontend: `ghcr.io/zanon-alive/taktchat-frontend@sha256:<digest>`.
- Label-sync: imagem backend-browser fixada por digest.
- Backend monta somente:
  - `taktchat_taktchat_private:/app/private`;
  - `taktchat_taktchat_media:/app/public`.
- Frontend não possui mounts.
- PostgreSQL e Redis ficam em stacks separadas.

## Verificação

```bash
curl --fail --show-error https://api.taktchat.com.br/health
curl --fail --show-error --head https://taktchat.com.br
```

No Portainer, confirmar tarefas, réplicas e logs de backend, frontend, label-sync e migrate. Não reproduzir digests completos ou secrets em documentação e tickets.

## Fonte da stack

A definição exibida no Portainer é a fonte operacional atual. O arquivo local `14_taktchat.yml` é referência/variante não confirmada em produção; não o aplicar diretamente.

Lacunas: exportar e versionar a stack ativa sem secrets e confirmar a política de tags/labels OCI.

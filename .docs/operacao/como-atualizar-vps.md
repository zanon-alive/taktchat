# Como atualizar o TaktChat em produção

> Resumo de apoio. Siga integralmente `release-deploy-rollback-swarm.md`.

Não existe checkout `/root/taktchat` nem script `update-taktchat.sh`. Produção usa GHCR por digest no Git `stacks_producao-main-server` (`15_taktchat_prod_ghcr.yml`).

## Passos

1. Merge na `main` (só alterações em `backend/**` e/ou `frontend/**` disparam build GHCR).
2. Aguardar builds GHCR. O workflow `update-prod-stack (GHCR digests)` roda **sozinho** após build verde (`workflow_run`; secret `STACKS_DEPLOY_TOKEN`). Merge só de docs/CI **não** pinha imagem.
3. Portainer: GitOps polling (ex.: 5m) ou webhook; Prune **off**. Sem GitOps: **Pull and redeploy**. Não editar o YAML na mão.
4. Aguardar backend, frontend e label-sync convergirem.
5. Executar e acompanhar `taktchat_taktchat-migrate` quando aplicável.
6. Validar:

```bash
curl --fail --show-error https://api.taktchat.com.br/health
curl --fail --show-error --head https://taktchat.com.br
```

7. Executar smoke tests de login, conversa, mensagem, tempo real e mídia/label-sync quando afetados.

## Rollback

Revert do commit no repo das stacks e pull no Portainer. Não remover a stack. Migration exige avaliação separada.

## Observações

- A definição ativa do Portainer é a fonte operacional.
- `14_taktchat.yml` local é referência/variante não confirmada.
- Não reproduzir digests completos ou secrets.
- Garantir no Portainer (env do backend): `LICENSE_SUPABASE_URL` e `LICENSE_SUPABASE_ANON_KEY` (sem isso a verificação de licença é pulada).
- Preferir webhook Portainer se o poll de 5m atrasar demais o deploy.

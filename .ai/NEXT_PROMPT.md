# Taktchat — continuidade de sessão

**Projeto:** Taktchat  
**Repositório:** https://github.com/zanon-alive/taktchat.git  
**Branch atual:** `feat/ci-atualiza-stack-prod`

## Estado

CI para pinagem automática de digest no repo `stacks_producao-main-server` (`15_taktchat_prod_ghcr.yml`) após builds GHCR na `main`. Workflow: `.github/workflows/update-prod-stack-ghcr.yml`.

## Ainda aberto neste fluxo

1. Criar secret `STACKS_DEPLOY_TOKEN` (escrita no repo das stacks).
2. Merge desta branch na `main`.
3. Ligar GitOps/webhook no Portainer **ou** continuar com Pull and redeploy.
4. Publicar release atual na Contabo (ainda nos digests antigos).
5. Login `ERR_INVALID_CREDENTIALS`; rotacionar JWTs.

## Próximo passo

Configurar o secret, abrir/mergear o PR desta branch, validar o workflow no próximo merge da `main`.

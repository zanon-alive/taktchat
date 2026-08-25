# Atualização do TaktChat em produção

> **Documento de apoio.** O procedimento obrigatório é `.docs/operacao/release-deploy-rollback-swarm.md`.

**Atualizado em:** 2026-08-25

Produção usa Docker Swarm administrado pelo Portainer e imagens imutáveis do GHCR fixadas por digest. Não há checkout da aplicação, bind mounts de código ou `update-taktchat.sh` no fluxo confirmado.

## Resumo do fluxo

1. Abrir, revisar e aprovar o PR.
2. Fazer merge na `main`.
3. Aguardar os workflows publicarem backend, frontend e backend-browser/label-sync no GHCR.
4. Confirmar tag, `<sha>` e digest de cada imagem.
5. Registrar os digests anteriores para rollback.
6. Atualizar as referências por digest no editor da stack Taktchat no Portainer.
7. Executar `taktchat_taktchat-migrate` quando houver migration.
8. Aguardar convergência, validar health e executar smoke tests.
9. Se necessário, restaurar os digests anteriores no Portainer.

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

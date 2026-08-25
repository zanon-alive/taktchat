# Como atualizar o TaktChat em produção

> Resumo de apoio. Siga integralmente `release-deploy-rollback-swarm.md`.

Não existe checkout `/root/taktchat` nem script `update-taktchat.sh` no fluxo confirmado. Produção usa imagens GHCR fixadas por digest e a stack é atualizada no Portainer.

## Passos

1. Aprovar PR e fazer merge na `main`.
2. Aguardar os workflows GHCR.
3. Confirmar que tags, `<sha>` e digests correspondem à release.
4. Registrar os digests anteriores.
5. Atualizar as imagens por digest no editor da stack Taktchat no Portainer.
6. Aguardar backend, frontend e label-sync convergirem.
7. Executar e acompanhar `taktchat_taktchat-migrate` quando aplicável.
8. Validar:

```bash
curl --fail --show-error https://api.taktchat.com.br/health
curl --fail --show-error --head https://taktchat.com.br
```

9. Executar smoke tests de login, conversa, mensagem, tempo real e mídia/label-sync quando afetados.

## Rollback

Restaurar no Portainer os digests anteriores dos serviços afetados. Não remover a stack. Migration exige avaliação separada.

## Observações

- A definição ativa do Portainer é a fonte operacional.
- `14_taktchat.yml` local é referência/variante não confirmada.
- Não reproduzir digests completos ou secrets.
- Falta exportar/versionar a stack sanitizada e confirmar a política de tags/labels.

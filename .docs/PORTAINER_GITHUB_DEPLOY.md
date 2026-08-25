# Portainer, GitHub e GHCR

Produção usa Docker Swarm administrado pelo Portainer. A aplicação é distribuída por imagens GHCR fixadas por digest; o servidor não mantém checkout do repositório Taktchat.

## Responsabilidades

- **GitHub:** revisão por PR e histórico da `main`.
- **GitHub Actions:** build e publicação das imagens no GHCR.
- **GHCR:** armazenamento de backend, frontend e backend-browser/label-sync.
- **Portainer:** fonte operacional da definição ativa e atualização da stack.
- **Swarm:** convergência e execução dos serviços.

## Atualização

1. Fazer merge do PR na `main`.
2. Aguardar os workflows.
3. Confirmar tags, `<sha>`, labels OCI disponíveis e digest.
4. Registrar os digests implantados antes da mudança.
5. Em **Stacks → taktchat → Editor**, atualizar somente as imagens afetadas:

```text
ghcr.io/zanon-alive/taktchat-backend@sha256:<digest>
ghcr.io/zanon-alive/taktchat-frontend@sha256:<digest>
ghcr.io/zanon-alive/<imagem-backend-browser>@sha256:<digest>
```

6. Revisar o diff do Portainer e atualizar a stack.
7. Executar migrate quando aplicável.
8. Validar health, tarefas, logs e smoke tests.

Não registrar digests completos ou secrets em documentos e tickets.

## Persistência confirmada

- Backend:
  - `taktchat_taktchat_private:/app/private`;
  - `taktchat_taktchat_media:/app/public`.
- Frontend: sem mounts.
- PostgreSQL: stack separada, volume `postgres_postgres_data`.
- Redis: stack separada, volume `redis_redis_data`.

## Fonte da definição

Não existe `/root/stacks/14_taktchat.yml` na VPS auditada. A pasta `/root/stacks` contém somente YAMLs `01`–`06` e não contém a stack Taktchat. Portanto, a definição do Portainer é a fonte operacional até sua exportação.

`14_taktchat.yml` local é referência/variante não confirmada e não deve ser colado no Portainer como se fosse a definição vigente.

## Rollback

Restaurar no editor do Portainer os digests anteriores dos serviços afetados, atualizar a stack e repetir health/smoke tests. Rollback de imagem não desfaz migration.

## Lacunas

- Exportar e versionar a stack atual sem secrets.
- Confirmar política de tags, labels OCI e retenção de digests.
- Documentar credencial de pull do GHCR apenas em repositório operacional restrito, sem copiar valores.

Runbook completo: `.docs/operacao/release-deploy-rollback-swarm.md`.

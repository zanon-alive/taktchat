# Produção com imagens GHCR

> **Estado atual confirmado em 25/08/2026.** Produção já usa GHCR por digest. O arquivo local `14_taktchat_ghcr.yml` é uma referência/variante não confirmada como export da definição ativa.

## Serviços

- backend: `ghcr.io/zanon-alive/taktchat-backend@sha256:<digest>`;
- frontend: `ghcr.io/zanon-alive/taktchat-frontend@sha256:<digest>`;
- label-sync: imagem backend-browser por digest;
- migrate: imagem compatível com a release, executada como serviço one-shot.

## Persistência observada

- backend: `taktchat_taktchat_private:/app/private`;
- backend: `taktchat_taktchat_media:/app/public`;
- frontend: sem mounts;
- PostgreSQL e Redis: stacks separadas.

## Atualização

1. Merge na `main`.
2. Workflows publicam as imagens.
3. Confirmar `<sha>`, tag, labels e digest.
4. Atualizar os digests no Portainer.
5. Executar migrate quando aplicável.
6. Validar health e smoke tests.
7. Fazer rollback restaurando os digests anteriores.

Não usar `latest` como identidade da release e não reproduzir digests completos ou secrets em documentação.

## Lacuna de governança

Exportar e versionar a stack ativa sem secrets. Até isso ocorrer, a definição no Portainer é a fonte operacional e os YAMLs locais não devem ser apresentados como cópia da produção.

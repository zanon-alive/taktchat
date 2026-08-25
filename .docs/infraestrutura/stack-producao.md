# Stack de produção — Docker Swarm e Portainer

## Estado confirmado em 25/08/2026

A produção na VPS Contabo usa Docker Swarm administrado pelo Portainer e imagens GHCR imutáveis por digest. Os digests implantados observados são de abril de 2026; não são reproduzidos neste documento.

### Serviços Taktchat

- `taktchat_taktchat-backend`: `ghcr.io/zanon-alive/taktchat-backend@sha256:<digest>`;
- `taktchat_taktchat-frontend`: `ghcr.io/zanon-alive/taktchat-frontend@sha256:<digest>`;
- `taktchat_taktchat-label-sync`: backend-browser por digest;
- `taktchat_taktchat-migrate`: serviço one-shot, observado em `0/1`.

### Mounts e persistência

O backend monta somente:

- `taktchat_taktchat_private` em `/app/private`;
- `taktchat_taktchat_media` em `/app/public`.

O frontend não possui mounts.

PostgreSQL e Redis estão em stacks separadas:

- PostgreSQL: volume `postgres_postgres_data`;
- Redis: volume `redis_redis_data`.

## Fonte da verdade

A definição ativa no Portainer é a fonte operacional atual. Não existe `/root/taktchat`; `/root/stacks` contém apenas YAMLs `01`–`06`, não é repositório Git e não possui `14_taktchat.yml`.

Os arquivos locais `14_taktchat.yml`, `14_taktchat_ghcr.yml` e outras variantes servem somente como referências para comparação. Nenhum está confirmado como export fiel da produção.

## Releases

O fluxo é:

`commit/PR → main → workflows GHCR → confirmar tag/SHA/digest → Portainer → migrate → health/smoke`

Rollback é realizado restaurando os digests anteriores no Portainer. Consulte `../operacao/release-deploy-rollback-swarm.md`.

## Segurança

- Não reproduzir digests completos nem secrets na documentação.
- Não substituir referências por digest por `latest`.
- Não exportar a stack do Portainer para repositório sem sanitizar secrets.
- Rollback de imagem não desfaz migration.

## Pendências

1. Exportar a stack ativa.
2. Remover/redigir secrets.
3. Comparar com as variantes locais.
4. Versionar a definição sanitizada após revisão.
5. Confirmar política de tags, labels OCI e retenção de digests.

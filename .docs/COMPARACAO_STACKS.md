# Comparação das definições de stack

## Produção confirmada em 25/08/2026

| Aspecto | Produção observada |
|---|---|
| Orquestração | Docker Swarm administrado pelo Portainer |
| Artefatos | Imagens GHCR imutáveis por digest |
| Backend | `taktchat-backend@sha256:<digest>` |
| Frontend | `taktchat-frontend@sha256:<digest>`, sem mounts |
| Label-sync | backend-browser por digest |
| Persistência da aplicação | volumes nomeados `taktchat_taktchat_private` e `taktchat_taktchat_media` no backend |
| Banco/cache | stacks separadas; volumes `postgres_postgres_data` e `redis_redis_data` |
| Fonte operacional | definição ativa no Portainer |

## Referências locais

- `14_taktchat.yml`: referência/variante local **não confirmada em produção**.
- `14_taktchat_ghcr.yml`: referência útil para comparar a arquitetura GHCR, mas não substitui a definição ativa exportada do Portainer.
- `14_taktchat_rapido.yml`: variante histórica com bind mounts.
- `docker-stack-taktchat.yml` e fluxos Docker Hub: legados.

Não existe `/root/stacks/14_taktchat.yml` no servidor auditado. `/root/stacks` contém somente YAMLs `01`–`06` e não é repositório Git. Também não existe checkout em `/root/taktchat`.

## Fluxos

### Atual

`PR → main → workflows GHCR → confirmar tag/SHA/digest → atualizar stack no Portainer → migrate → health/smoke → rollback por digest`

### Legados ou refutados

- `git pull` no servidor;
- build de frontend no host;
- `update-taktchat.sh`;
- bind mounts de código;
- build/push manual para Docker Hub.

## Lacuna

Exportar a definição ativa do Portainer, sanitizar secrets, revisar e versionar. Até isso ocorrer, nenhum YAML local deve ser descrito como cópia canônica da produção.

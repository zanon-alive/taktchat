# Backup e recuperação

## Escopo de produção

A produção atual roda em Docker Swarm/Portainer na VPS Contabo, com imagens GHCR por digest. Antes de qualquer backup, confirme no Portainer os serviços e volumes vinculados.

Itens mínimos:

- dump lógico do PostgreSQL;
- PostgreSQL em `postgres_postgres_data`;
- Redis em `redis_redis_data`;
- mídia em `taktchat_taktchat_media`;
- dados privados/sessões em `taktchat_taktchat_private`;
- export sanitizado da definição ativa do Portainer, quando disponível;
- SHA e digests implantados, armazenados em registro operacional restrito;
- inventário dos secrets por nome, sem exportar valores para documentação ou logs.

## Procedimento seguro

1. Registrar data, operador, SHA, digests atuais e motivo.
2. Descobrir o container ativo do PostgreSQL pelo serviço Swarm.
3. Gerar dump lógico para diretório protegido e fora dos volumes da aplicação.
4. Validar que o arquivo não está vazio e registrar checksum.
5. Copiar backups para destino externo à VPS, com criptografia e controle de acesso.
6. Para volumes, confirmar nome, ponto de montagem e consistência antes da cópia.
7. Não incluir secrets em tickets, documentação ou saída compartilhada.

Exemplo de modelo, a ser preenchido somente após confirmar nomes no servidor:

```bash
PG_CONTAINER="<container-postgres-confirmado>"
BACKUP_FILE="<diretorio-protegido>/taktchat_<data>.sql"
docker exec "$PG_CONTAINER" pg_dump -U "<usuario-confirmado>" "<banco-confirmado>" > "$BACKUP_FILE"
test -s "$BACKUP_FILE"
sha256sum "$BACKUP_FILE"
```

## Recuperação

Restauração é operação destrutiva e exige confirmação explícita, backup do estado corrente e janela aprovada.

1. Abrir incidente e definir RPO/RTO.
2. Restaurar primeiro em ambiente isolado.
3. Validar autenticação, empresas, tickets, mensagens, campanhas, mídia e sessões.
4. Confirmar compatibilidade entre banco restaurado e os digests da aplicação.
5. Planejar promoção ou sincronização; não sobrescrever produção por impulso.
6. Registrar evidências e resultado em `../anexos/incidentes.md`.

## Política

- Backups diários com retenção definida pela operação; confirmar no servidor o valor vigente.
- Cópia externa à Contabo e acesso restrito.
- Teste mensal de restauração.
- Backup obrigatório antes de migration potencialmente incompatível ou intervenção destrutiva.
- `docker stack rm`, remoção de volume, truncamento ou restauração sobre produção são último recurso.

## Desenvolvimento local

`docker compose` é aceito apenas no ambiente local. Nomes como `postgres` e volumes de Compose não devem ser transportados automaticamente para a produção Swarm.


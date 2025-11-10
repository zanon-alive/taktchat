## Backup e recuperação

### Banco de dados (PostgreSQL)

#### Backup

```bash
# Dump completo
docker exec postgres pg_dump -U postgres taktchat_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Apenas schema
docker exec postgres pg_dump -U postgres --schema-only taktchat_database > schema_backup.sql

# Apenas dados
docker exec postgres pg_dump -U postgres --data-only taktchat_database > data_backup.sql
```

#### Restauração

```bash
cat backup_20250101_120000.sql | docker exec -i postgres psql -U postgres -d taktchat_database
```

> Execute restauração em ambiente isolado antes de aplicar em produção.

### Volumes Docker

```bash
# PostgreSQL
docker run --rm -v taktchat_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_data_backup.tar.gz /data

# Sessões do WhatsApp
docker run --rm -v taktchat_backend-private:/data -v $(pwd):/backup ubuntu tar czf /backup/backend_private_backup.tar.gz /data

# Uploads públicos
docker run --rm -v taktchat_backend-public:/data -v $(pwd):/backup ubuntu tar czf /backup/backend_public_backup.tar.gz /data
```

### Plano de recuperação

1. Identificar extensão do incidente (dados, sessões, indisponibilidade).
2. Restaurar volumes críticos em ambiente temporário.
3. Validar consistência (logins, tickets, campanhas).
4. Promover ambiente restaurado para produção ou sincronizar dados necessários.

### Boas práticas

- Automatize backups diários e guarde no mínimo 7 versões.
- Teste restauração mensalmente.
- Documente cada recuperação em `anexos/incidentes.md` (criar se necessário).


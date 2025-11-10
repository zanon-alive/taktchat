## Implantação com Docker

### Perfis suportados

- `default`: sobe somente PostgreSQL e Redis (suporta desenvolvimento local).
- `production`: sobe backend, frontend, Redis e PostgreSQL dentro do compose.

### Comandos essenciais

```bash
# Subir infraestrutura básica
docker compose up -d postgres redis

# Subir stack completa (produção)
docker compose --profile production up -d

# Verificar saúde dos serviços
docker compose ps

# Acompanhar logs em tempo real
docker compose logs -f backend

# Reconstruir imagens
docker compose build

# Encerrar serviços preservando dados
docker compose down

# ATENÇÃO: remove volumes e dados
docker compose down -v
```

### Variáveis para produção

- Configure arquivos `.env` específicos para backend e frontend antes do build.
- Utilize secrets para credenciais sensíveis (PostgreSQL, JWT, provedores externos).

### Volumes críticos

| Volume | Uso | Observações |
| --- | --- | --- |
| `taktchat_postgres_data` | Base de dados | Backup periódico obrigatório |
| `taktchat_redis-data` | Cache/filas | Pode ser recriado, mas impacta jobs em andamento |
| `taktchat_backend-private` | Sessões WhatsApp (Baileys) | Necessário para manter conexões ativas |
| `taktchat_backend-public` | Uploads e mídias públicas | Sincronizar com storage externo, se houver |

### Ajustes comuns

- **ffmpeg**: já incluído na imagem do backend; instale manualmente se rodar fora dos containers.
- **Rede externa**: crie a rede `nobreluminarias` (ou ajuste no compose) antes de subir os containers.
- **Reinício automático**: habilite `restart: always` para backend, frontend e Redis.

### Monitoramento pós-deploy

- Validar readiness do backend com `curl http://localhost:8080/health` (implemente endpoint se necessário).
- Conferir que sockets respondem em `/socket.io/`.
- Disparar campanha de teste para garantir filas e notificações funcionando.


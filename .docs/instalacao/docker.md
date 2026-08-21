## Implantação com Docker (desenvolvimento local)

O `docker-compose.yml` da raiz **não usa profiles**. Os serviços `postgres`, `redis`, `backend` e `frontend` sobem com `docker compose up`. Para desenvolver com API/UI no host, suba só banco e cache:

```bash
# Infraestrutura local (recomendado para `npm run dev` / `npm start`)
docker compose up -d postgres redis

# Stack compose completa (backend + frontend em container — não é a stack da VPS)
docker compose up -d

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

Produção na VPS usa Docker Swarm (`14_taktchat.yml`), não este compose.

### Variáveis para produção

- Configure arquivos `.env` a partir de `backend/.env.example` e `frontend/.env.example`.
- Utilize secrets para credenciais sensíveis (PostgreSQL, JWT, provedores externos). Na VPS os valores ficam no YAML da stack / Portainer.

### Volumes críticos

| Volume | Uso | Observações |
| --- | --- | --- |
| `postgres-data` | Base de dados | Backup periódico obrigatório |
| `redis-data` | Cache/filas | Pode ser recriado, mas impacta jobs em andamento |
| `backend-private` | Sessões WhatsApp (Baileys) | Necessário para manter conexões ativas |
| `backend-public` | Uploads e mídias públicas | Sincronizar com storage externo, se houver |

### Ajustes comuns

- **ffmpeg**: já incluído na imagem do backend; instale manualmente se rodar fora dos containers.
- **Rede**: o compose cria a rede `nobreluminarias`.
- **Reinício automático**: `restart: always` já está nos serviços do compose.
- **Porta do Postgres no host**: `POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis` se 5432 estiver ocupada.

### Monitoramento pós-deploy

- Validar readiness do backend com `curl http://localhost:8080/health`.
- Conferir que sockets respondem em `/socket.io/`.
- Disparar campanha de teste para garantir filas e notificações funcionando.

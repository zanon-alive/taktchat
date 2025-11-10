## Variáveis de ambiente

### Backend (obrigatórias)

| Variável | Descrição | Valor exemplo |
| --- | --- | --- |
| `NODE_ENV` | Ambiente atual | `development` / `production` |
| `PORT` | Porta HTTP do backend | `8080` |
| `BACKEND_URL` | URL pública da API | `https://api.seudominio.com` |
| `FRONTEND_URL` | URL do frontend | `https://app.seudominio.com` |
| `JWT_SECRET` | Segredo para tokens de acesso | `gera-um-secret` |
| `JWT_REFRESH_SECRET` | Segredo para refresh tokens | `gera-outro-secret` |
| `DB_DIALECT` | Dialeto Sequelize | `postgres` |
| `DB_HOST` | Host do banco | `postgres` |
| `DB_PORT` | Porta do banco | `5432` |
| `DB_NAME` | Nome do banco | `taktchat_database` |
| `DB_USER` | Usuário | `postgres` |
| `DB_PASS` | Senha | `******` |
| `REDIS_URI` | Redis principal (filas/socket) | `redis://redis:6379/0` |
| `REDIS_URI_ACK` | Redis secundário para ack sockets | `redis://redis:6379/1` |

### Backend (opcionais importantes)

| Variável | Uso |
| --- | --- |
| `SOCKET_FALLBACK_NS_BROADCAST` | Ativa broadcast de fallback em produção (`true`). |
| `SOCKET_DEBUG` | Verbosidade de logs de socket. |
| `REDIS_SECRET_KEY` | Chave para criptografar payloads armazenados. |
| `REDIS_OPT_LIMITER_MAX` / `REDIS_OPT_LIMITER_DURATION` | Limites de rate para filas Bull. |
| `DB_SSL` / `DB_SSL_REJECT_UNAUTHORIZED` | Ativa TLS com banco gerenciado. |
| `DB_RETRY_MAX` | Tentativas de reconexão ao banco. |
| `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_ACQUIRE`, `DB_POOL_IDLE` | Ajustes no pool Sequelize. |
| `SENTRY_DSN` | Integração com Sentry (logs). |
| `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Integrações Dialogflow/Gemini. |
| `OPENAI_API_KEY` | Integrações com OpenAI. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Notificações por email. |
| `STORAGE_PROVIDER`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | Upload externo opcional. |
| `PUPPETEER_EXECUTABLE_PATH` | Customização do binário do Chromium. |

### Frontend

| Variável | Descrição | Valor padrão/exemplo |
| --- | --- | --- |
| `REACT_APP_BACKEND_URL` | Endpoint base da API | `https://api.seudominio.com` |
| `REACT_APP_SOCKET_URL` | URL do Socket.IO (quando diferente) | `https://api.seudominio.com` |
| `REACT_APP_PRIMARY_COLOR` | Cor principal exibida quando não houver personalização vinda do backend | `#2563EB` |
| `REACT_APP_PRIMARY_DARK` | Variante escura da cor principal | `#1E3A8A` |
| `REACT_APP_SENTRY_DSN` | Observabilidade opcional | |
| `PUBLIC_URL` | URL pública usada pelo build | |

### Boas práticas

- Versione arquivos `.env.example` com placeholders.
- Nunca commite `.env` reais; confirme se `.gitignore` está configurado.
- Em produção, prefira secrets do provedor (Docker Swarm, Kubernetes, etc.).
- Registre mudanças relevantes em `anexos/notas-de-versao.md`.


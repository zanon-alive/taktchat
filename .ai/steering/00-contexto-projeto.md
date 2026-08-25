---
inclusion: auto
---

# Contexto do Projeto — Taktchat

## Identificacao

| Campo | Valor |
|-------|-------|
| Nome | Taktchat |
| Repositorio | https://github.com/zanon-alive/taktchat.git |
| Stack backend | Node.js 22 / TypeScript / Express / Sequelize |
| Stack frontend | React 17 / CRACO / Material UI v5 / Zustand |
| Banco de dados | PostgreSQL 15 |
| Cache/Filas | Redis 6.2 + Bull |
| Deploy | Docker Swarm + Portainer + GHCR (digest no Git `15_taktchat_prod_ghcr.yml`) |
| Versao | 2.2.2v-26 |

Plataforma de mensageria omnichannel (WhatsApp), multi-tenant e whitelabel (plataforma → parceiros → clientes). Dual channel: Baileys e WhatsApp Business API Oficial.

## Como Executar Localmente

Infra de suporte (Postgres + Redis):

```bash
docker compose up -d postgres redis
# Se a porta 5432 estiver ocupada:
POSTGRES_HOST_PORT=5433 docker compose up -d postgres redis
```

Não usar `docker compose down -v` — os volumes (`postgres-data`, `redis-data`, `backend-private`, `backend-public`) são persistentes.

### Backend

```bash
cp backend/.env.example backend/.env   # se o example existir; senão copiar de um .env local
# Ajustar DB_HOST=localhost, DB_PORT (5432 ou 5433), JWT_SECRET, BACKEND_URL, FRONTEND_URL
cd backend
npm install --legacy-peer-deps
npm run dev
```

- `npm run dev:fast` — ignora build inicial
- `npm run db:migrate` — migrations manuais
- Testes usam `NODE_ENV=test` e `.env.test`

### Frontend

```bash
cp frontend/.env.example frontend/.env   # se existir
cd frontend
npm install --legacy-peer-deps
npm start
```

O `npm start` libera a porta 3000 se estiver ocupada.

### Banco de dados

- Container `taktchat-postgres` (imagem `postgres:15`)
- Banco: `taktchat_database` / usuário `postgres`
- Porta no host: `5432` (ou `POSTGRES_HOST_PORT`, frequentemente `5433` neste ambiente)

## URLs e Portas

| Ambiente | URL |
|----------|-----|
| Backend local | http://localhost:8080/api |
| Socket.IO local | http://localhost:8080/socket.io/ |
| Health local | http://localhost:8080/health |
| Frontend local | http://localhost:3000 |
| Backend producao | https://api.taktchat.com.br |
| Frontend producao | https://taktchat.com.br |

## Variaveis de Ambiente Importantes

Lista completa: `.docs/configuracao/variaveis-ambiente.md`. **Nunca colar secrets no chat nem commitar `.env`.**

| Variavel | Descricao | Exemplo local |
|----------|-----------|---------------|
| `PORT` | Porta HTTP do backend | `8080` |
| `BACKEND_URL` | URL pública da API | `http://localhost:8080` |
| `FRONTEND_URL` | URL do frontend | `http://localhost:3000` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Postgres | `localhost` / `5432` ou `5433` / `taktchat_database` |
| `REDIS_URI` | Redis (filas/socket) | `redis://localhost:6379/0` |
| `REDIS_URI_ACK` | Redis ack | `redis://localhost:6379/1` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Tokens | string local qualquer |
| `REACT_APP_BACKEND_URL` | API no frontend | `http://localhost:8080` |
| `REACT_APP_SOCKET_URL` | Socket no frontend | `http://localhost:8080` |

## Servidor de Producao

| Campo | Valor |
|-------|-------|
| Host | VPS com Traefik (`taktchat.com.br` / `api.taktchat.com.br`) |
| Código | `/root/taktchat` |
| Acesso | SSH (agente NUNCA conecta nem executa comandos no servidor) |
| Processo | Docker Swarm — stack `14_taktchat.yml` |
| Atualizacao | `git pull origin main` + `/root/stacks/update-taktchat.sh` (ver `.docs/ATUALIZACAO_SERVIDOR.md`) |
| Restart | `docker service update --force taktchat_taktchat-backend` (e frontend se necessário) |
| Logs | `docker service logs -f taktchat_taktchat-backend` |

**IMPORTANTE:** O agente NUNCA executa deploy nem comandos no servidor. Apenas sugere.

## Estrutura de Pastas (resumo)

```
taktchat/
├── backend/                 # API Express, Socket.IO, Bull, Baileys, WABA
├── frontend/                # SPA React 17 + MUI v5
├── .docs/                   # documentação versionada do produto
├── .docs/branchs/           # análises locais por branch (gitignored)
├── .ai/                     # continuidade de sessão e contexto do agente
├── .cursor/rules/           # rules Telecontrol (Cursor)
├── 14_taktchat.yml          # stack Swarm da VPS (volumes montados)
├── docker-compose.yml       # Postgres/Redis/app local
├── lib/  scripts/  utils/   # provisionamento e diagnósticos
└── README.md
```

## Particularidades

- Projeto grande: não analisar o repositório inteiro sem pedido; seguir a demanda da branch e `.docs/`.
- Documentação de branch em `.docs/branchs/<tipo>/<nome>/` (gitignored). Convenção do usuário: pasta com o nome da branch atual.
- Produção atual é Swarm com **volumes montados**, não a stack GHCR (`14_taktchat_ghcr.yml` é alternativa).
- Dual channel WhatsApp: Baileys (sessões em volume `backend-private`) e API Oficial (webhooks Meta).
- Whitelabel: plataforma → parceiros → clientes.
- `npm install` costuma precisar de `--legacy-peer-deps`.
- Seeds e comandos destrutivos de banco: só em ambiente local, com confirmação explícita. Antes de migration/seed, perguntar se o `.env` aponta para local ou produção.
- Testes Jest do backend usam banco de `.env.test`; `posttest` desfaz migrations de teste.
- Frontend **não** usa tema TeleCX/`VITE_UI_THEME`; é React + Material UI v5.
- Responder sempre em português brasileiro.

## Integrações Externas

| Servico | Uso | Docs |
|---------|-----|------|
| WhatsApp Baileys | Sessões, QR, mensagens | `.docs/diagnosticos/logs-whatsapp-baileys.md` |
| WhatsApp Business API | Webhooks Meta, templates | `.docs/funcionalidades/whatsapp-api-oficial.md` |
| Google Generative AI / Dialogflow | Assistentes | `.docs/infraestrutura/servicos-externos.md` |
| OpenAI | Automações de resposta | `OPENAI_API_KEY` |
| Gerencianet / Mercado Pago | Pagamentos | `backend/src/services` |
| Nodemailer | Email | `MAIL_*` |
| S3 compatível | Storage opcional | `STORAGE_PROVIDER` |
| Sentry | Observabilidade | `SENTRY_DSN` |
| Facebook/Instagram | Integração opcional | `.docs/legacy/raiz/INTEGRACAO_FACEBOOK_INSTAGRAM.md` |

## Comandos Uteis

| Acao | Comando |
|------|---------|
| Rodar testes backend | `cd backend && npm test` |
| Testes unitários (sem integração) | `cd backend && npm run test:unit` |
| Lint backend | `cd backend && npm run lint` |
| Migrations | `cd backend && npm run db:migrate` |
| Build backend | `cd backend && npm run build` |
| Build frontend | `cd frontend && npm run build` |
| Health | `curl http://localhost:8080/health` |
| Diagnóstico DB | `cd backend && npm run db:diagnostic` |

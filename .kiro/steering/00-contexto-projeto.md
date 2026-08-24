---
inclusion: auto
---

# Contexto do Projeto — TaktChat

## Identificacao

| Campo | Valor |
|-------|-------|
| Nome | taktchat |
| Repositorio | [A PREENCHER — URL do Git remoto] |
| Stack backend | Express + TypeScript + Sequelize ORM |
| Stack frontend | React 17 + Material UI + CRACO + Tailwind CSS |
| Banco de dados | PostgreSQL 15 |
| Cache/Filas | Redis 6.2 + Bull (filas de mensagens/campanhas) |
| Mensageria | Baileys (WhatsApp via WebSocket) + API Oficial Meta (WABA) |
| Deploy | Docker Compose (produção) / PM2 (cluster mode) |

## Como Executar Localmente

### Backend
```bash
cd backend
npm install
npm run dev
# Roda na porta 8080 — compila TS, executa migrations e inicia com ts-node-dev
```

### Frontend
```bash
cd frontend
npm install
npm start
# Roda na porta 3000
```

### Banco de dados + Redis (Docker)
```bash
docker-compose up -d postgres redis
# PostgreSQL na porta 5433 (mapeamento local)
# Redis na porta 6379
```

## URLs e Portas

| Ambiente | URL |
|----------|-----|
| Backend local | http://localhost:8080 |
| Frontend local | http://localhost:3000 |
| Backend producao | https://taktchat-api.alivesolucoes.com.br |
| Frontend producao | https://taktchat.alivesolucoes.com.br |

## Variaveis de Ambiente Importantes

| Variavel | Descricao | Observacao |
|----------|-----------|------------|
| DB_PORT | Porta do PostgreSQL | **5433 no local** (nao 5432!) |
| DB_NAME | Nome do banco | taktchat_database |
| REDIS_URI | Conexao Redis | redis://127.0.0.1:6379/0 |
| JWT_SECRET | Segredo para tokens | configurado no .env |
| SESSIONS_DRIVER | Driver de sessoes WhatsApp | fs (filesystem) |
| FRONTEND_URL | URL do frontend | http://localhost:3000 |
| BACKEND_URL | URL do backend | http://localhost:8080 |

## Servidor de Producao

| Campo | Valor |
|-------|-------|
| Host | [A PREENCHER — IP ou dominio SSH] |
| Acesso | [A PREENCHER — SSH] |
| Processo | PM2 (cluster mode, nome: multipremium-back) |
| Restart | pm2 restart multipremium-back |
| Logs | pm2 logs multipremium-back |

**IMPORTANTE:** O agente NUNCA executa comandos no servidor. Apenas sugere.

## Estrutura de Pastas (resumo)

```
taktchat/
├── backend/
│   ├── src/           # Codigo fonte TypeScript
│   ├── dist/          # Build compilado
│   ├── private/       # Sessoes WhatsApp (Baileys)
│   ├── public/        # Uploads e arquivos publicos
│   └── .env           # Variaveis de ambiente local
├── frontend/
│   ├── src/           # Codigo fonte React
│   ├── public/        # Assets estaticos
│   └── .env.local     # Variaveis de ambiente local
├── docker-compose.yml # Infra completa (postgres, redis, backend, frontend)
├── scripts/           # Scripts auxiliares
├── lib/               # Bibliotecas compartilhadas
└── .docs/             # Documentacao por branch
```

## Particularidades

- O banco local usa porta **5433** (nao 5432) — mapeamento customizado
- O frontend usa CRACO (Create React App Configuration Override) como bundler
- Sessions do WhatsApp sao armazenadas em `backend/private/sessions/`
- O projeto suporta multi-tenant (SaaS) com onboarding automatico
- PM2 em producao roda em modo cluster com restart diario as 00:05
- Sequelize (v5) com migrations manuais (`npx sequelize db:migrate`)
- Socket.IO v4 para comunicacao real-time (tickets, mensagens)
- Integracao com API oficial Meta (WABA) alem do Baileys

## Integracoes Externas

| Servico | Uso | Docs |
|---------|-----|------|
| WhatsApp (Baileys) | Mensageria principal via WebSocket | @whiskeysockets/baileys |
| Meta WABA | API oficial WhatsApp Business | Graph API v18.0 |
| OpenAI | IA/Chatbot | openai SDK |
| Google Dialogflow | Bot NLU | @google-cloud/dialogflow |
| Google Gemini | IA generativa | @google/generative-ai |
| MercadoPago | Pagamentos | mercadopago SDK |
| Sentry | Monitoramento de erros | @sentry/node |

## Comandos Uteis

| Acao | Comando |
|------|---------|
| Rodar backend dev | `cd backend && npm run dev` |
| Rodar frontend dev | `cd frontend && npm start` |
| Rodar testes | `cd backend && npm test` |
| Rodar lint | `cd backend && npm run lint` |
| Gerar migration | `cd backend && npx sequelize migration:generate --name nome` |
| Build backend | `cd backend && npm run build` |
| Build frontend | `cd frontend && npm run build` |
| Subir infra local | `docker-compose up -d postgres redis` |

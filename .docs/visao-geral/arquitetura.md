## Arquitetura de alto nível

### Camadas

1. **Interface (Frontend)**
   - React 17, Material UI v5, CRACO.
   - Consome REST (`/api`) e Socket.IO (`/socket.io/`), com autenticação JWT.
   - Build distribuído via nginx em produção (ver `frontend/Dockerfile`).

2. **Aplicação (Backend)**
   - Node.js 22, TypeScript, Express.
   - Sequelize + PostgreSQL como fonte primária de dados.
   - Bull/Redis para filas de envio de mensagens, sincronização de contatos e processamento pesado.
   - Serviços auxiliares: Baileys e WhatsApp Business API Oficial (adapters), Puppeteer/ffmpeg, OCR, gateways de pagamento.

3. **Infraestrutura compartilhada**
   - PostgreSQL 15 (Docker ou serviço gerenciado).
   - Redis 6.2 para cache, filas e adaptação Socket.IO.
   - Armazenamento de mídias/sessões em volumes Docker; em produção: `taktchat_taktchat_media` e `taktchat_taktchat_private`.

### Fluxo principal de mensagens

```mermaid
flowchart LR
  ClienteWA[Cliente WhatsApp] -->|Baileys ou API Oficial| Canal[Adapter de canal]
  ClienteSite[Visitante do site] -->|widget.js| SiteChat[API publica site-chat]
  Canal --> Backend[API Backend]
  SiteChat --> Backend
  Backend --> RedisFilas[Filas Bull]
  RedisFilas --> Workers[Workers/Jobs]
  Workers --> Postgres[(PostgreSQL)]
  Backend --> SocketIO[Socket.IO]
  SocketIO --> Frontend[Frontend React]
  Frontend --> Usuario[Equipe de Atendimento]
```

Produção atual: Swarm/Portainer com imagens GHCR por digest. Backend monta os volumes de mídia e dados privados; frontend não tem mounts. O serviço `taktchat_taktchat-label-sync` está ativo com imagem backend-browser.

### Integrações essenciais

- **Baileys**: gerencia sessões WhatsApp, eventos de mensagens e QRCode.
- **WhatsApp Business API Oficial**: webhooks Meta (`/webhooks/whatsapp`) e templates.
- **Socket.IO**: comunicação em tempo real com front (namespaces `workspace-<companyId>`).
- **Redis**: adapter Socket.IO, filas Bull e cache de sessões.
- **ffmpeg**: transcodificação de mídia (áudio, vídeo, imagens).
- **Google Generative AI / OpenAI**: assistentes inteligentes (ver `backend/src/services` para implementações específicas).

### Segurança

- JWTs com segredos configuráveis (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
- TLS opcional para banco (`DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`).
- Rate limiting em Redis (`REDIS_OPT_LIMITER_MAX`, `REDIS_OPT_LIMITER_DURATION`).

### Observabilidade

- Logs estruturados via `pino` e `winston`.
- Scripts de diagnóstico em `backend/src/utils/`.
- Recomenda-se integrar com Sentry (já previsto em dependências) e utilizar métricas do Redis/PostgreSQL.


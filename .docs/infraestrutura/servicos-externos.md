## Serviços externos e integrações

### Mensageria

- **WhatsApp (Baileys)**: gerencia sessões e eventos de mensagens.
- Requer volume persistente (`taktchat_backend-private`) e atualização periódica do QR code.

### IA e Assistentes

- **Google Generative AI** (`@google/generative-ai`) e Dialogflow.
- **OpenAI** (`openai` SDK) para automações de resposta.
- Configure chaves nas variáveis `GOOGLE_*` e `OPENAI_API_KEY`.

### Pagamentos

- Integração com **Gerencianet** (`gn-api-sdk-typescript`) e **Mercado Pago** (`mercadopago`).
- Verifique credenciais e webhooks específicos em `backend/src/services`.

### Email/SMS

- Envios via `nodemailer`; defina variáveis `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`.

### Armazenamento de arquivos

- Suporte a provedores S3 compatíveis (ajustar `STORAGE_PROVIDER`).
- Caso seja necessário, habilite CDN para arquivos públicos.

### Observabilidade

- Integração com **Sentry** (`@sentry/node`/`@sentry/react`).
- Configure `SENTRY_DSN` nos ambientes onde a coleta for obrigatória.


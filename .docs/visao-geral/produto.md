## Visão geral do produto

O Taktchat é uma plataforma de mensageria omnichannel com foco em operações de atendimento via WhatsApp. O sistema combina um backend Node.js/TypeScript com Sequelize, um frontend React/CRACO e infraestrutura baseada em PostgreSQL, Redis e serviços de processamento de mídia.

### Objetivos principais

- Centralizar conversas de múltiplas empresas em uma única instância multi-tenant.
- Automatizar campanhas ativas, funis e interações automáticas com clientes.
- Oferecer ferramentas operacionais para equipes de atendimento (fila, tags, dashboards, permissões avançadas).
- Garantir resiliência contra bloqueios de conta (anti-ban) e preservar integridade dos dados.

### Componentes macro

- **Backend** (`backend/`): API REST, Socket.IO, filas Bull, Jobs agendados (cron) e integrações externas.
- **Frontend** (`frontend/`): SPA React 17 com Material UI, gerenciamento de estado via hooks e `zustand`.
- **Infraestrutura**: PostgreSQL 15, Redis 6.2, armazenamento local (volumes Docker) para mídias e sessões do WhatsApp.
- **Automação**: Scripts em `lib/` e `utils/` para provisionamento, diagnósticos e integrações.

### Público-alvo

- Equipes de atendimento e suporte.
- Times de marketing responsáveis por campanhas e disparos em massa.
- Operadores técnicos responsáveis pela manutenção da infraestrutura.

### Roadmap resumido

- Consolidar métricas em dashboards unificados (campanhas, atendimento, performance).
- Expandir integrações com provedores de IA (OpenAI, Google Generative AI) já provisionados no backend.
- Evoluir controles de acesso (perfis, permissões, limites por workspace).
- Otimizar pipelines de processamento de mídia e resiliência de filas.


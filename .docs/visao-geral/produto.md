## Visão geral do produto

O Taktchat é uma plataforma de mensageria omnichannel com foco em operações de atendimento via WhatsApp. O sistema combina um backend Node.js/TypeScript com Sequelize, um frontend React/CRACO (Material UI v5) e infraestrutura baseada em PostgreSQL, Redis e serviços de processamento de mídia.

Suporta **dual channel** (Baileys e WhatsApp Business API Oficial), landing de vendas, chat do site e governança **whitelabel** (plataforma → parceiros → clientes).

### Objetivos principais

- Centralizar conversas de múltiplas empresas em uma única instância multi-tenant.
- Automatizar campanhas ativas, funis e interações automáticas com clientes.
- Oferecer ferramentas operacionais para equipes de atendimento (fila, tags, dashboards, permissões avançadas).
- Garantir resiliência contra bloqueios de conta (anti-ban) e preservar integridade dos dados.
- Permitir revenda (whitelabel) com licenças, planos e cobrança por parceiro.

### Componentes macro

- **Backend** (`backend/`): API REST, Socket.IO, filas Bull, Jobs agendados (cron) e integrações externas.
- **Frontend** (`frontend/`): SPA React 17 com Material UI v5, gerenciamento de estado via hooks e `zustand`.
- **Infraestrutura**: PostgreSQL 15, Redis 6.2, armazenamento local (volumes Docker) para mídias e sessões do WhatsApp.
- **Produção (VPS atual)**: Docker Swarm/Portainer com imagens GHCR imutáveis por digest; apenas o backend monta volumes de mídia e dados privados.
- **Automação**: Scripts em `lib/` e `utils/` para provisionamento, diagnósticos e integrações.

### Público-alvo

- Equipes de atendimento e suporte.
- Times de marketing responsáveis por campanhas e disparos em massa.
- Parceiros whitelabel (revenda) e o dono da plataforma.
- Operadores técnicos responsáveis pela manutenção da infraestrutura.

### Roadmap resumido

Itens em aberto (detalhe em `visao-geral/roadmap.md`): dashboards unificados, validação de números antes de campanha, 2FA, cobertura de testes.  
Já entregues: dual channel, landing + cookies/reCAPTCHA, EntrySource/chat do site, whitelabel Fase 1 e 2, MUI v5.


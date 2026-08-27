Copyright

## Taktchat

Plataforma de mensageria omnichannel voltada para operações de atendimento e campanhas no WhatsApp. Este repositório reúne backend (Node.js/TypeScript), frontend (React/CRACO) e automações de infraestrutura.

### Stack principal

- **Backend**: Node.js 22, Express, Sequelize, Bull/Redis, Socket.IO.
- **Frontend**: React 17, Material UI, CRACO.
- **Infraestrutura**: PostgreSQL 15, Redis 6.2, Docker Compose.

### Funcionalidades em alto nível

- Atendimento omnichannel com múltiplas filas, Kanban (lane de entrada, lane ao encerrar e cards `closed` visíveis na coluna), tags e automações anti-ban.
- Campanhas segmentadas, Flow Builder visual, integrações com bots/IA e controle de cadência.
- Contatos, listas, arquivos inteligentes, dashboards e relatórios operacionais.
- **Validação i18n**: mensagens de validação de formulários em pt-BR, en, es e tr (campo obrigatório, muito curto, etc.).
- Multi-empresa nativa, perfis e permissões granulares, painel financeiro e billing.
- Webhooks, APIs externas, monitoramento (audit logs, announcements) e recursos de AI/RAG.
- **WhatsApp Dual Channel**: Suporte simultâneo a Baileys (gratuito) e WhatsApp Business API Oficial (Meta, pago).
- **Atendimento no celular**: em `/tickets` no viewport estreito (e no PWA na tela inicial) o atendente vê só conversas, sem o menu administrativo. No login há o link **Baixar app Android** (`/downloads/taktchat.apk`). iOS nativo fica para quando houver Mac.
- **Landing Page de Vendas**: Página pública de apresentação do produto com coleta de leads, formulário de revendedor e integração WhatsApp.
- **EntrySource e Chat do Site**: Rastreamento de origem nos tickets (lead, revendedor, site_chat, whatsapp); canais configuráveis; widget de chat embarcável para sites externos; API pública e token por empresa.
- **Governança Multi-Empresa e Whitelabel**: Hierarquia plataforma → whitelabels → clientes; visibilidade e CRUD por nível (empresas, planos, licenças); dashboards e menus por perfil; relatório de cobrança por parceiro (`/partner-billing-report`) e registro de snapshots; cadastro direto na landing e cadastro por link do parceiro (`/signup-partner`); bloqueio por cobrança (plataforma suspende parceiro; parceiro bloqueia/libera empresas-filhas). Fase 1 e Fase 2 concluídas.

> **Documentação funcional v1.8:** `.docs/kit-produto/README.md` — revisão do código atual, sem afirmar implantação em produção.
> **Mapa real do frontend:** `.docs/funcionalidades/mapa-frontend.md` — rotas, menu, personas, permissões e gates de plano.
> Visão funcional consolidada: `.docs/visao-geral/funcionalidades.md`.
> WhatsApp API Oficial: `.docs/funcionalidades/whatsapp-api-oficial/`
> Arquitetura Whitelabel (Fase 2): `.docs/visao-geral/whitelabel-architecture.md`

### Início rápido

```bash
git clone <repo>
cd taktchat

# Subir banco e cache (caso já exista Postgres local, use POSTGRES_HOST_PORT=5433)
docker compose up -d postgres redis

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Ajuste DB_PORT no backend/.env se usar porta alternativa

# Backend
cd backend
npm install
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
# Webpack do CRA pode estourar memória; o start-dev já define 4 GB
npm start
```

Consulte `.docs/instalacao/` para requisitos e variações (Docker completo, produção, etc.).

### Landing Page de Vendas

A vitrine pública está em `/landing` (`https://taktchat.com.br/landing`):
- **Funil:** hero com print real do produto visível no viewport, galeria (tickets, kanban, fluxos), proposta, funcionalidades, planos, cadastro (se habilitado) + lead, FAQ
- **Tour:** `/tour` (5 slides, sem login, pitch de problema/para quem); `/p/tour` redireciona para `/tour`. Links na v2: hero **Ver em 1 min**, menu **Tour**, galeria e rodapé
- **CTAs (v2):** nav “Começar”, hero **Falar no WhatsApp** + “Ver em 1 min” + “Começar agora”, formulário de lead, FAB WhatsApp (também no `/tour`) e “Seja revendedor” no rodapé — sem botões extras no meio da página. O WhatsApp abre o número de suporte (`REACT_APP_NUMBER_SUPPORT`) com mensagem de interesse, sem exigir o formulário.
- **Copy (v2):** sem números inventados (“centenas de empresas”, “1 milhão de conversas”, “Uptime 99.9%”); a v1 arquivada pode manter o texto antigo
- **Histórico:** a landing anterior permanece em `/landing/v1` com `noindex`
- **Entrada:** visitante sem login que abre `/` vai para `/landing`; quem já entrou segue no Dashboard. No app Android (Capacitor) a raiz sem sessão abre `/login`.
- **Formulários:** cadastro direto (quando a API `direct-signup` está ligada) e lead; revendedor abre modal no rodapé
- **Legal:** `/lgpd` (texto genérico, em revisão); cookie e rodapé apontam para essa rota
- **Widgets:** FAB WhatsApp e, se habilitado nas configurações, Chat do Site
- **SEO:** canonical em `/landing`; sem prova social inventada (depoimentos/nota); sem Google Analytics até existir ID real (`react-ga4` não está no frontend)

> Detalhes: `.docs/funcionalidades/mapa-frontend.md` e `.docs/pendencias/termos-privacidade-lgpd.md`.

### Documentação

Toda a documentação foi reorganizada em `.docs/`. Principais pontos de entrada:

- **🚀 Guia de Onboarding:** `.docs/onboarding.md` - Documentação completa explicando todas as funcionalidades e como utilizá-las
- **📚 Documentação Admin:** `.docs/docs_admin.md` - Guia completo para administradores (Super Admin)
- **🗺️ Roadmap e Melhorias Futuras:** `.docs/visao-geral/roadmap.md` - Documento centralizado com todas as melhorias futuras do projeto
- **🏢 Arquitetura Whitelabel:** `.docs/visao-geral/whitelabel-architecture.md` - Hierarquia plataforma → parceiros → clientes (Fases 1 e 2 concluídas)
- Visão geral do produto: `.docs/visao-geral/produto.md`
- Arquitetura e fluxos críticos: `.docs/visao-geral/arquitetura.md` e `.docs/visao-geral/fluxos-criticos.md`
- Instalação e ambientes: `.docs/instalacao/`
- Variáveis de ambiente e segurança: `.docs/configuracao/`
- Infraestrutura e stack de produção: `.docs/infraestrutura/` (inclui stack Docker Swarm em produção)
- Operação, monitoramento e suporte: `.docs/operacao/`
- Funcionalidades por módulo: `.docs/funcionalidades/`
  - **Mapa de rotas e acesso do frontend:** `.docs/funcionalidades/mapa-frontend.md`
  - **Assets estáticos (public vs src, evitar 404 em produção):** `.docs/funcionalidades/frontend-assets-estaticos.md`
  - **WhatsApp Business API Oficial:** `.docs/funcionalidades/whatsapp-api-oficial/` - Documentação completa da integração
  - **Kanban (lanes de entrada e encerramento):** `.docs/funcionalidades/kanban-lanes.md`
  - **EntrySource e Chat do Site:** `.docs/funcionalidades/widget-chat-site.md` - Canais de entrada, widget e API pública
- Procedimentos de diagnóstico: `.docs/diagnosticos/` (inclui auditoria e deduplicação de contatos: `npm run db:audit-contacts`, `npm run db:dedupe-contacts`, `npm run db:delete-contacts-without-tickets`)
- Diagnóstico de banco (erros DB_* do backend): `.docs/diagnosticos/banco.md`
- Recuperação quando migrations falham ou há drift (`SequelizeMeta` vs schema): `.docs/operacao/recuperacao-migrations-banco.md`
- Checklists e histórico: `.docs/anexos/`
- Scripts SQL organizados: `.docs/sql/`
- Build/publicação de imagens Docker: `.docs/DOCKER_BUILD_E_DEPLOY.md` (guia completo passo a passo)
- **Atualização de produção:** `.docs/operacao/release-deploy-rollback-swarm.md` (resumo: `.docs/ATUALIZACAO_SERVIDOR.md`). Imagens GHCR por digest; YAML `15_taktchat_prod_ghcr.yml` no repo das stacks, aplicado pelo Portainer.
- Stack local de referência: `14_taktchat.yml` (não é o arquivo da VPS).
- Variante GHCR no repo Taktchat: `.docs/infraestrutura/stack-producao-ghcr.md` e `14_taktchat_ghcr.yml`
- PM2 híbrido (exemplo, não é a VPS): `.docs/infraestrutura/pm2-hibrido.md` e `ecosystem.config.cjs`

Documentos anteriores permanecem disponíveis como referência em `.docs/legacy/`.

### Contribuição

- Utilize arquivos de análise em `.docs/branchs/<nome-da-branch>/` para descrever escopo antes de desenvolver.
- Siga convenções de código (ESLint/Prettier) e mantenha testes atualizados.
- Atualize a documentação ao entregar novas funcionalidades ou processos.

#### Processo de deploy após Pull Request

Após merge na `main` com mudanças em `backend/**` ou `frontend/**`:

1. Workflows GHCR publicam as imagens.
2. `update-prod-stack` grava os digests em `15_taktchat_prod_ghcr.yml` no repo das stacks.
3. Portainer (GitOps ou Pull and redeploy) aplica a stack — **sem** `git pull` da app na VPS.

Guia: `.docs/operacao/release-deploy-rollback-swarm.md` (resumo: `.docs/ATUALIZACAO_SERVIDOR.md`).

### Contato e suporte

- Em caso de incidentes, registre em `.docs/anexos/incidentes.md` e comunique os responsáveis pela operação.
- Para dúvidas sobre arquitetura ou integrações externas, consulte `.docs/infraestrutura/`.
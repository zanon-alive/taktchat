Copyright

## Taktchat

Plataforma de mensageria omnichannel voltada para operações de atendimento e campanhas no WhatsApp. Este repositório reúne backend (Node.js/TypeScript), frontend (React/CRACO) e automações de infraestrutura.

### Stack principal

- **Backend**: Node.js 22, Express, Sequelize, Bull/Redis, Socket.IO.
- **Frontend**: React 17, Material UI, CRACO.
- **Infraestrutura**: PostgreSQL 15, Redis 6.2, Docker Compose.

### Funcionalidades em alto nível

- Atendimento omnichannel com múltiplas filas, Kanban (lane de entrada e lane ao encerrar), tags e automações anti-ban.
- Campanhas segmentadas, Flow Builder visual, integrações com bots/IA e controle de cadência.
- Contatos, listas, arquivos inteligentes, dashboards e relatórios operacionais.
- **Validação i18n**: mensagens de validação de formulários em pt-BR, en, es e tr (campo obrigatório, muito curto, etc.).
- Multi-empresa nativa, perfis e permissões granulares, painel financeiro e billing.
- Webhooks, APIs externas, monitoramento (audit logs, announcements) e recursos de AI/RAG.
- **WhatsApp Dual Channel**: Suporte simultâneo a Baileys (gratuito) e WhatsApp Business API Oficial (Meta, pago).
- **Landing Page de Vendas**: Página pública de apresentação do produto com coleta de leads, formulário de revendedor e integração WhatsApp.
- **EntrySource e Chat do Site**: Rastreamento de origem nos tickets (lead, revendedor, site_chat, whatsapp); canais configuráveis; widget de chat embarcável para sites externos; API pública e token por empresa.
- **Governança Multi-Empresa e Whitelabel**: Hierarquia plataforma → whitelabels → clientes; visibilidade e CRUD por nível (empresas, planos, licenças); dashboards e menus por perfil; relatório de cobrança por parceiro (`/partner-billing-report`) e registro de snapshots; cadastro direto na landing e cadastro por link do parceiro (`/signup-partner`); bloqueio por cobrança (plataforma suspende parceiro; parceiro bloqueia/libera empresas-filhas). Fase 1 e Fase 2 concluídas.

> **Kit por audiência (v1.5):** `.docs/kit-produto/README.md` — player em `/apresentacoes` (login obrigatório), execução em `.docs/kit-produto/14-roadmap-execucao.md`.
> Detalhamento técnico legado: `.docs/visao-geral/funcionalidades.md`.
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
npm start
```

Consulte `.docs/instalacao/` para requisitos e variações (Docker completo, produção, etc.).

### Landing Page de Vendas

A plataforma inclui uma landing page pública de vendas acessível em `/landing` que apresenta:
- **Design moderno**: Hero com gradiente escuro, tipografia aprimorada e elementos visuais abstratos
- **Componentes essenciais**:
  - FAQ com accordion (6 perguntas frequentes)
  - ChatWidget flutuante para contato WhatsApp
  - Widget Chat do Site (opcional, em Configurações > Opções)
  - CookieBanner para conformidade LGPD
- **Planos dinâmicos**: Cards modernizados com destaque visual para plano recomendado
- **Formulário de leads**: Validação aprimorada com Yup, feedback visual e máscara de telefone
- **SEO otimizado**:
  - Meta tags avançadas (Open Graph, Twitter Cards, Mobile)
  - Dados estruturados Schema.org (SoftwareApplication, Organization, FAQPage)
  - Lazy loading com React.lazy para melhor performance
- **Performance**: Code splitting, lazy load de componentes pesados (PDF) e carregamento sob demanda
- **Responsivo**: Design adaptado para todos os dispositivos

> Detalhes da implementação da landing: `.docs/visao-geral/funcionalidades.md` (seção Landing).

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
- **🔄 Atualização do servidor de produção:** `.docs/ATUALIZACAO_SERVIDOR.md` - **GUIA OBRIGATÓRIO para atualizar o servidor após PR/merge na branch `main`** (stack atual: volumes em `14_taktchat.yml`)
- Stack de produção (VPS atual): `.docs/infraestrutura/stack-producao.md` e `14_taktchat.yml`
- Stack GHCR (alternativa): `.docs/infraestrutura/stack-producao-ghcr.md` e `14_taktchat_ghcr.yml`
- PM2 híbrido (exemplo, não é a VPS): `.docs/infraestrutura/pm2-hibrido.md` e `ecosystem.config.cjs`

Documentos anteriores permanecem disponíveis como referência em `.docs/legacy/`.

### Contribuição

- Utilize arquivos de análise em `.docs/branchs/<nome-da-branch>/` para descrever escopo antes de desenvolver.
- Siga convenções de código (ESLint/Prettier) e mantenha testes atualizados.
- Atualize a documentação ao entregar novas funcionalidades ou processos.

#### 🔄 Processo de Deploy após Pull Request

**Após fazer merge do PR na branch `main`, siga o guia de atualização do servidor:**

1. ✅ **PR aprovado e mergeado na branch `main`**
2. ✅ **Código commitado e enviado ao repositório**
3. 📖 **Seguir o guia completo:** `.docs/ATUALIZACAO_SERVIDOR.md` - **Guia Completo de Atualização do TaktChat no Servidor**

O guia inclui:
- Atualização do código no servidor (`git pull`)
- Atualização do backend (com dependências e compilação TypeScript)
- Build e atualização do frontend (recomendado: build fora do container)
- Verificação e monitoramento dos serviços
- Troubleshooting de problemas comuns
- Checklist de atualização

> **📌 Importante:** Sempre consulte o guia `.docs/ATUALIZACAO_SERVIDOR.md` antes de atualizar o servidor de produção. Este processo garante que as atualizações sejam feitas corretamente e de forma segura.

### Contato e suporte

- Em caso de incidentes, registre em `.docs/anexos/incidentes.md` e comunique os responsáveis pela operação.
- Para dúvidas sobre arquitetura ou integrações externas, consulte `.docs/infraestrutura/`.
# 🗺️ Roadmap e Melhorias Futuras - TaktChat

**Última atualização:** 2026-08-24  
**Status:** Documento centralizado de melhorias futuras do projeto

---

## 📋 Visão Geral

Este documento centraliza todas as melhorias futuras, funcionalidades pendentes e itens de roadmap do projeto TaktChat. As melhorias estão organizadas por área/módulo e prioridade.

> **Nota:** Análises por branch ficam em `.docs/branchs/<nome-da-branch>/` **nesta máquina** (pasta no gitignore; não vai no clone). O roadmap versionado é este arquivo.

---

## 🎯 Roadmap Geral do Produto

### Consolidação de Métricas
- [ ] Dashboards unificados (campanhas, atendimento, performance)
- [ ] Relatórios consolidados por período
- [ ] Métricas de custo por canal (Baileys vs API Oficial)
- [ ] Analytics avançado com gráficos interativos

### Integrações de IA
- [ ] Expandir integrações com provedores de IA (OpenAI, Google Generative AI)
- [ ] Melhorar RAG (Retrieval-Augmented Generation)
- [ ] Chatbot mais inteligente com contexto
- [ ] Análise de sentimento em mensagens

### Controles de Acesso
- [ ] Evoluir perfis e permissões granulares
- [ ] Limites por workspace mais flexíveis
- [ ] Auditoria avançada de ações
- [ ] SSO (Single Sign-On)

### Otimizações de Frontend (Bundle)
- [x] Remoção de dependências não usadas (socket.io/admin-ui)
- [x] Migração de ícones Font Awesome para lucide-react
- [x] Lazy load de react-pdf e html2pdf (carregamento sob demanda)
- [x] Migração Material-UI v4 para MUI v5 (opcional, alto esforço)
- [ ] Substituição gradual de lodash/moment por alternativas leves

### Otimizações de Infraestrutura
- [ ] Otimizar pipelines de processamento de mídia
- [ ] Melhorar resiliência de filas (Bull/Redis)
- [ ] Cache inteligente de adapters
- [ ] Pool de conexões otimizado
- [ ] Retry automático com backoff exponencial

---

## 📱 Landing Page de Vendas

**Documentação completa:** este roadmap (seção Landing) e `.docs/funcionalidades/widget-chat-site.md`.

### Prioridade Alta
- [x] LGPD Compliance (banner de cookies, política de privacidade, termos de uso)
- [x] Proteção contra Spam (CAPTCHA - reCAPTCHA v3 ou hCaptcha)

### Prioridade Média
- [ ] Integração com Google Analytics
- [x] SEO avançado (Open Graph, Schema.org, sitemap.xml, robots.txt)
- [ ] A/B Testing de variações da landing page
- [ ] Formulário multi-etapas
- [x] Chat ao vivo integrado com sistema de tickets (Chat do Site – branch `feature/entrysource-canal-e-chat-site`)

### Prioridade Baixa
- [ ] Vídeo demonstrativo na hero section
- [ ] Calculadora de ROI interativa
- [ ] Integração com CRM externo (Salesforce, HubSpot, Pipedrive)
- [ ] Integração com Email Marketing (Mailchimp, RD Station, ActiveCampaign)
- [ ] Webhooks para integrações customizadas
- [ ] Otimização de imagens (lazy loading, WebP, CDN)
- [ ] Code splitting avançado
- [ ] Progressive Web App (PWA)

---

## 📲 WhatsApp Business API Oficial

**Documentação completa:** `.docs/funcionalidades/whatsapp-api-oficial/`

### Funcionalidades Avançadas
- [ ] Templates de mensagem (API Oficial)
- [ ] Suporte a listas longas
- [ ] Carrinho de compras (e-commerce)
- [ ] Localização compartilhada
- [ ] Mensagens de voz (PTT)
- [ ] Status/Stories
- [ ] Stickers, locations, polls
- [ ] Suporte a grupos WhatsApp
- [ ] Múltiplos admins em grupos

### Otimizações
- [ ] Cache de adapters (já parcialmente implementado)
- [ ] Pool de conexões
- [ ] Retry automático com backoff exponencial
- [ ] Filas de envio otimizadas
- [ ] Rate limiting inteligente

### Analytics e Monitoramento
- [ ] Dashboard de uso
- [ ] Relatórios de custo em tempo real
- [ ] Métricas de entrega
- [ ] Quality rating tracking
- [ ] Alertas de limite de custo
- [ ] Alertas de token próximo ao vencimento
- [ ] Métricas de performance por conexão

### Testes e Qualidade
- [ ] Testes unitários automatizados completos
- [ ] Testes de integração (webhooks, adapters)
- [ ] Testes E2E
- [ ] Testes de carga (alta carga de mensagens)
- [ ] Testes de segurança (credenciais inválidas, webhook malicioso)
- [ ] CI/CD para deploy automático

### Deploy e Produção
- [ ] Configuração de ambiente de produção
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Webhook Meta configurado e testado
- [ ] Monitoramento de logs (Winston, PM2, Nginx)
- [ ] Alertas de uptime (UptimeRobot ou similar)
- [ ] Métricas de performance (Grafana, Prometheus)

---

## 📊 Campanhas

**Documentação:** `.docs/legacy/raiz/MELHORIAS_CAMPANHAS_IMPLEMENTACAO.md`, `.docs/legacy/raiz/RESUMO_MELHORIAS_CAMPANHAS.md`

### Validação e Economia (🔴 ALTA PRIORIDADE)
- [ ] Validação de números antes do envio usando API Meta (economia de R$ 500+ por campanha)
- [ ] Validação em lote (até 100 números por requisição)
- [ ] Relatório de números inválidos
- [ ] Endpoint `/contacts/validate-whatsapp` no backend
- [ ] Método `validateNumbers` no `OfficialAPIAdapter`

### Interface e UX
- [ ] Rodízio visual de conexões melhorado (badges Baileys/API Oficial)
- [ ] Configurações separadas por tipo de canal (Baileys vs API Oficial)
  - [ ] Tab Baileys: intervalos, limites, perfis (conservador/balanceado/agressivo)
  - [ ] Tab API Oficial: rate limit, custos, quality rating, controle de custos
  - [ ] Tab Geral: supressão, horários, fuso horário
- [ ] Relatório expandido com métricas detalhadas
  - [ ] Cards de custo
  - [ ] Divisão por canal (Baileys vs API)
  - [ ] Análise de falhas por tipo
  - [ ] Gráficos (taxa/hora, velocidade, custo)
  - [ ] Performance por conexão
- [ ] Exportação melhorada (CSV com canal/custo, Excel com múltiplas abas, PDF com gráficos)

### Funcionalidades
- [ ] Seleção flexível de conexões por campanha (rodízio personalizado)
- [ ] Identificação visual de canal (badges 📱 Baileys / ✅ API Oficial)
- [ ] Filtros avançados por status e canal
- [ ] Histórico completo de campanhas
- [ ] Botão "Atualizar Tags" no modal de importação de contatos
- [ ] Endpoint `/contacts/device-tags/refresh` para atualizar tags do WhatsApp

---

## 🎫 Tickets e Atendimento

### Melhorias de Interface
- [ ] Kanban mais intuitivo
- [ ] Lane padrão Lead em ticket novo; encerrar alinhado ao funil (ver kit-produto/15-pendencias-produto-outras-branches.md)
- [ ] Drag and drop entre colunas
- [ ] Atalhos de teclado
- [ ] Busca avançada com múltiplos filtros
- [ ] Filtros salvos e reutilizáveis

### Automações
- [ ] Auto-atribuição inteligente de tickets
- [ ] SLA automático por tipo de ticket
- [ ] Respostas automáticas baseadas em IA
- [ ] Escalação automática
- [ ] Regras de roteamento automático

### Relatórios
- [ ] Dashboard de performance por atendente
- [ ] Tempo médio de resposta
- [ ] Taxa de resolução
- [ ] Satisfação do cliente (NPS)
- [ ] Análise de tempo de atendimento
- [ ] Métricas de produtividade

---

## 👥 Contatos e Listas

### Gestão de Contatos
- [ ] Importação em massa otimizada
- [ ] Deduplicação automática melhorada
- [ ] Sincronização com WhatsApp Labels
- [ ] Segmentação avançada
- [ ] Normalização automática de números
- [ ] Validação de números em lote

### Listas de Contatos
- [ ] Filtros salvos e reutilizáveis
- [ ] Sincronização automática de listas
- [ ] Compartilhamento de listas entre usuários
- [ ] Histórico de alterações
- [ ] Exportação de listas (CSV, Excel)

### Formulário de Leads
- [ ] Criar funcionalidade de "Formulário de leads" para ser embedado ou usado pela empresa cliente
- [ ] Integração com backend `/leads` existente
- [ ] Geração automática de Contacts a partir dos leads
- [ ] Componente React reutilizável e configurável
- [ ] Suporte a embed via iframe ou script
- [ ] Customização de campos do formulário
- [ ] Validação de dados (Yup schema configurável)
- [ ] Integração com reCAPTCHA
- [ ] Redirecionamento configurável após envio (WhatsApp, página de agradecimento, etc.)
- [ ] Dashboard de leads na área administrativa
- [ ] Notificações para administradores quando novo lead é criado
- [ ] Sistema de status de leads (novo, contatado, qualificado, convertido, perdido)
- [ ] Histórico de conversões de leads em contatos
- [ ] Analytics de origem dos leads (UTM, referrer, etc.)
- [ ] API para gerenciar formulários e leads
- [ ] Múltiplos formulários por empresa
- [ ] Templates de formulários pré-configurados

---

## 🤖 Chatbots e Automação

### Flow Builder
- [ ] Editor visual mais intuitivo
- [ ] Mais tipos de nós e ações
- [ ] Testes de fluxo antes de publicar
- [ ] Versionamento de flows
- [ ] Analytics de fluxo
- [ ] Preview de fluxo

### Integrações
- [ ] Mais provedores de IA
- [ ] Integração com Dialogflow
- [ ] Webhooks customizados
- [ ] APIs externas
- [ ] Integração com sistemas de CRM

---

## 🔐 Segurança e Compliance

### Segurança
- [ ] Autenticação de dois fatores (2FA)
- [ ] Logs de auditoria mais detalhados
- [ ] Criptografia de dados sensíveis
- [ ] Rate limiting por IP
- [ ] Proteção contra DDoS
- [ ] Validação de webhooks (verify token)
- [ ] Proteção contra payloads maliciosos

### Compliance
- [ ] LGPD/GDPR completo
- [ ] Exportação de dados do usuário
- [ ] Exclusão de dados (right to be forgotten)
- [ ] Consentimento de cookies
- [ ] Política de privacidade integrada
- [ ] Logs de consentimento

---

## 📈 Analytics e Relatórios

### Dashboards
- [ ] Dashboard executivo consolidado
- [ ] Métricas em tempo real
- [ ] Comparativos de períodos
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Dashboard de campanhas expandido
- [ ] Dashboard de atendimento

### Métricas Avançadas
- [ ] Funil de conversão
- [ ] Análise de coorte
- [ ] Previsão de demanda
- [ ] Alertas inteligentes
- [ ] Análise de custos por canal
- [ ] ROI de campanhas

---

## 🚀 Performance e Escalabilidade

### Backend
- [ ] Otimização de queries SQL
- [ ] Índices de banco de dados
- [ ] Cache distribuído (Redis)
- [ ] Load balancing
- [ ] Microserviços (se necessário)
- [ ] Otimização de processamento de mídia
- [ ] Melhor resiliência de filas (Bull/Redis)

### Frontend
- [ ] Code splitting avançado (já parcialmente implementado)
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens (lazy loading, WebP, compressão)
- [ ] Service Workers (PWA)
- [ ] Bundle size otimizado (vendor bundle < 800KB gzipado)
- [ ] Limpeza completa de console.logs em produção (290+ restantes)
- [ ] Correção gradual de warnings ESLint (200+ variáveis não utilizadas, 50+ hooks dependencies)
- [ ] Debounce/Throttle em todas as buscas
- [ ] Memoização de componentes pesados (React.memo, useMemo, useCallback)
- [ ] Virtualização de listas longas (react-window ou react-virtualized)

---

## 🧪 Testes e Qualidade

### Cobertura de Testes
- [ ] Aumentar cobertura de testes unitários
- [ ] Testes de integração completos
- [ ] Testes E2E automatizados
- [ ] Testes de performance
- [ ] Testes de segurança
- [ ] Testes de carga (alta carga de mensagens)
- [ ] Testes de múltiplas conexões simultâneas

### CI/CD
- [ ] Pipeline de CI/CD completo
- [ ] Deploy automático em staging
- [ ] Deploy automático em produção
- [ ] Rollback automático
- [ ] Monitoramento de deploys
- [ ] Testes automatizados antes de merge

---

## 📚 Documentação

### Melhorias de Documentação
- [ ] Tutoriais em vídeo
- [ ] Guias interativos
- [ ] Documentação de API completa (Swagger/OpenAPI)
- [ ] Exemplos de código
- [ ] FAQ expandido
- [ ] Manual do usuário final
- [ ] Vídeos tutoriais (criar conexão Baileys, API Oficial, enviar mensagens, configurar filas)
- [ ] Documentação de arquitetura com diagramas
- [ ] Changelog automático

### Kit de produto e apresentações (branch `docs/kit-documentacao-produto`)

Player: `/apresentacoes` (**login obrigatório** — super, admin da plataforma ou permissão `apresentacoes.view`). Lote v1.4 fechado em 2026-08-24: WhatsApp CONNECTED, transferência persistida, maioria dos `pendente-*.png`.

- [x] **WhatsApp real no ambiente local** — QR Baileys da Cliente Demo Kit escaneado; sessão **CONNECTED**; envio de teste e transferência persistida. Print: `pendente-whatsapp-connected.png`.
- [x] **Prints comerciais do player** — landing, planos, Flow Builder, campanhas, Kanban/funil, IA, widget, health, billing, infra (lista em `backend/private/kit-apresentacoes/README.md`).
- [x] **Prints do player (signup da filha)** — captura real de `pendente-signup-partner.png` e `pendente-signup-token.png`. Celular continua ilustração de IA (`pendente-whatsapp-celular.png`).
- [x] **Seed demo não vai para produção** — SQL só em `.docs/kit-produto/scripts/` (não é migration).

Detalhe do que é **código de produto** (outras branches): [kit-produto/15-pendencias-produto-outras-branches.md](../kit-produto/15-pendencias-produto-outras-branches.md).

## 🎫 Tickets, tags e Kanban (produto — outras branches)

Lista completa: `.docs/kit-produto/15-pendencias-produto-outras-branches.md`.

- [ ] Ticket novo (pós-`closed`) receber lane padrão Lead
- [ ] Encerrar ticket mover/remover coluna Kanban (hoje o trecho está comentado)
- [ ] Cron `timeLane` não depender de `fromMe: true`
- [ ] Garantir uma tag `kanban=1` por ticket (arrastar substitui)
- [ ] Rollback de lane não correr em ticket já `closed`
- [ ] **Demanda (análise):** CRM de conversa estruturado vs. CRM de mercado — [kit-produto/16-demanda-crm-conversa-ou-mercado.md](../kit-produto/16-demanda-crm-conversa-ou-mercado.md). Sem código até escolher caminho A ou B.

---

### Organização
- [ ] Sincronização automática de documentação entre `.docs/` e frontend
- [ ] Script de sincronização docs (`scripts/sync-docs-frontend.sh`)
- [ ] Consolidação de documentação WhatsApp API Oficial (já parcialmente feito)
- [ ] Padronização de commits (Conventional Commits)
- [ ] Code review checklist

---

## 🔧 Melhorias Técnicas e Manutenção

### Limpeza e Organização
- [ ] Limpeza completa de console.logs (290+ restantes)
- [ ] Correção de warnings ESLint
  - [ ] Variáveis não utilizadas (~200+)
  - [ ] Hooks dependencies (~50+)
  - [ ] Equality checks (~10+)
  - [ ] DOM nesting (~5+)
- [ ] Remoção de código morto
- [ ] Refatoração de componentes grandes
- [ ] Padronização de código

### Monitoramento e Observabilidade
- [ ] Configuração de logs estruturados (Winston)
- [ ] Rotação de logs
- [ ] PM2 logs configurado
- [ ] Nginx logs configurado
- [ ] Uptime monitoring (UptimeRobot ou similar)
- [ ] Alertas de erros críticos
- [ ] Dashboard de métricas (Grafana, Prometheus)
- [ ] Análise de tráfego

### WhatsApp Session Persistence
- [ ] Melhorias no período silencioso de 2 minutos após conexão
- [ ] Monitoramento detalhado do evento `registered`
- [ ] Otimização de operações pesadas durante conexão inicial
- [ ] Melhor tratamento de `registered: undefined`

---

## 🔄 Como Contribuir com Melhorias

### Processo Sugerido

1. **Identificar a melhoria:**
   - Pode ser uma nova funcionalidade, correção ou otimização

2. **Criar análise:**
   - Criar arquivo em `.docs/branchs/<nome-da-branch>/analise.md` (local, gitignore)
   - Atualizar também o documento versionado correspondente em `.docs/` (este roadmap, `funcionalidades/`, etc.)
   - Descrever o problema/necessidade
   - Propor solução
   - Estimar complexidade e tempo

3. **Desenvolver:**
   - Seguir padrões do projeto
   - Escrever testes
   - Atualizar documentação

4. **Atualizar este roadmap:**
   - Mover item de "Pendente" para "Em Desenvolvimento"
   - Após conclusão, mover para seção de "Concluído" ou remover

### Priorização

- **🔴 Alta:** Impacto direto no negócio, segurança ou performance crítica
- **🟡 Média:** Melhoria significativa na UX ou funcionalidade importante
- **🟢 Baixa:** Nice to have, melhorias incrementais

---

## 📝 Histórico de Atualizações

- **2026-08-24:** Player `/apresentacoes` exige login; PNG fora de `public/`. Seed do kit não vai para produção.
- **2026-08-24:** Ilustração de IA para o celular (`pendente-whatsapp-celular.png`). Não é print do aparelho.
- **2026-08-24:** Kit v1.4: WhatsApp CONNECTED, transferência persistida, maioria dos prints `pendente-*` gravados. Restam captura real do celular/signup e migration Sequelize do seed.
- **2026-08-22:** Kit de produto: prints pendentes do player `/apresentacoes` e jornada WhatsApp com QR escaneado registrados como melhorias futuras (não bloqueiam o fechamento da branch).
- **2026-08-21:** Revisão: CookieBanner, reCAPTCHA, SEO da landing, MUI v5 e Chat do Site marcados como feitos; GHCR deixou de ser descrito como deploy atual (VPS usa volumes).
  - Funcionalidade para ser embedada ou usada por empresas clientes
  - Integração com backend `/leads` e geração automática de Contacts
  - Baseada na implementação existente em `/landing` do TaktChat

- **2025-01-27:** Consolidação completa de todas as melhorias futuras
  - Análise de todos os documentos das branches
  - Análise de arquivos .md do projeto
  - Consolidação de melhorias da landing page
  - Consolidação de melhorias do WhatsApp API Oficial
  - Consolidação de melhorias de campanhas
  - Consolidação de melhorias da branch main
  - Consolidação de melhorias técnicas e de performance
  - Estruturação por área/módulo e prioridade

---

## 🔗 Referências

- **Landing Page:** landing em `/landing` (cookies, reCAPTCHA, SEO). Widget: `.docs/funcionalidades/widget-chat-site.md`
- **WhatsApp API Oficial:** `.docs/funcionalidades/whatsapp-api-oficial/status-completo.md`
- **Campanhas:** `.docs/legacy/raiz/MELHORIAS_CAMPANHAS_IMPLEMENTACAO.md`, `.docs/legacy/raiz/RESUMO_MELHORIAS_CAMPANHAS.md`
- **Pendências gerais:** este arquivo (`visao-geral/roadmap.md`)
- **Visão Geral do Produto:** `.docs/visao-geral/produto.md`

---

## 📊 Resumo por Prioridade

### 🔴 Alta Prioridade (Implementar Primeiro)
- Validação de números WhatsApp antes do envio (economia de custos)
- Notificação para administradores (leads)
- Dashboard de leads
- LGPD Compliance
- Testes completos WhatsApp API Oficial
- Deploy e configuração de produção

### 🟡 Média Prioridade (Implementar Depois)
- Captura real do WhatsApp no celular (hoje só ilustração de IA) e migration Sequelize do seed demo (kit de produto)
- Configurações separadas por canal (campanhas)
- Relatório expandido de campanhas
- Google Analytics (landing page)
- SEO avançado
- Chat ao vivo
- Limpeza de console.logs
- Otimização de bundle vendor

### 🟢 Baixa Prioridade (Nice to Have)
- Vídeo demonstrativo
- Calculadora de ROI
- A/B Testing
- Integrações com CRM
- PWA
- Tutoriais em vídeo

---

**Nota:** Este documento deve ser atualizado sempre que:
- Uma nova melhoria for identificada
- Uma melhoria for concluída
- Prioridades mudarem
- Novas funcionalidades forem planejadas

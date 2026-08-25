## Fluxos críticos do sistema

### 1. Onboarding de empresa

1. Super Admin cria empresa (plataforma, whitelabel ou cliente) ou o cadastro ocorre na landing / `/signup-partner`.
2. Backend provisiona `Companies`, `Users`, licença trial quando aplicável.
3. Conexão WhatsApp: QR Baileys **ou** credenciais da API Oficial.
4. Sessão Baileys persiste no volume nomeado `taktchat_taktchat_private`, montado em `/app/private` no backend.

### 2. Atendimento em tempo real

1. Cliente envia mensagem → Baileys **ou** webhook da API Oficial.
2. Backend normaliza payload e grava `Messages` no banco (`entrySource` quando originado de lead/site/revendedor).
3. Notificação em tempo real via Socket.IO (`company-<id>-appMessage`).
4. Frontend atualiza chat ativo e incrementa contadores de fila.

### 6. Chat do site

1. Página externa carrega `widget.js` (ver `.docs/funcionalidades/widget-chat-site.md`).
2. Visitante abre o widget e envia dados → `POST /public/site-chat/submit`.
3. Ticket criado com `entrySource: site_chat`; polling de mensagens a cada 3s.

### 7. Cadastro e bloqueio whitelabel

1. Lead/parceiro cadastra empresa na landing ou `/signup-partner`.
2. Licença trial e usuário admin são criados.
3. Plataforma pode suspender o parceiro; o parceiro pode bloquear empresas-filhas (`CompanyAccessService`).

### 3. Disparo de campanhas

1. Usuário cadastra campanha com lista segmentada.
2. Job gera fila de envios (Bull + Redis) e dispara mensagens assíncronas.
3. Workers acompanham status (enviado, entregue, falha) e registram métricas.
4. Dashboard consome agregados via endpoints específicos (`/campaigns/:id/stats`).

### 4. Gestão de permissões

1. Perfis são configurados com escopo granular (`Roles`, `Permissions`).
2. Middleware de autorização (backend `src/middleware/isAuth.ts`) valida tokens e escopos.
3. Frontend oculta funcionalidades com base em permissões carregadas no login.

### 5. Recuperação pós-incidente

1. Acesso à rotina de backup (ver `operacao/backup-recuperacao.md`).
2. Restauração de banco via `pg_dump`/`psql` ou scripts prontos em `utils/_system.sh`.
3. Validação de consistência: checar filas ativas e reconectar instâncias Socket.IO.


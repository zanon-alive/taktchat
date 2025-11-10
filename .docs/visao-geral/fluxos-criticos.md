## Fluxos críticos do sistema

### 1. Onboarding de empresa

1. Administrador cria empresa e usuários via painel (`frontend/src/pages/Companies`).
2. Backend provisiona registros em `Companies`, `Users`, `WhatsApps`.
3. Sistema gera QR code para pareamento do WhatsApp (`/session/:id/qrcode`).
4. Após leitura do QR code, a sessão Baileys é persistida no volume `backend-private`.

### 2. Atendimento em tempo real

1. Cliente envia mensagem → evento chega ao serviço Baileys.
2. Backend normaliza payload e grava `Messages` no banco.
3. Notificação em tempo real via Socket.IO (`company-<id>-appMessage`).
4. Frontend atualiza chat ativo e incrementa contadores de fila.

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


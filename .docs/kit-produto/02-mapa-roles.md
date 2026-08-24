# Mapa de roles e personas

## Como o acesso funciona de verdade

Não há um único campo “role” no produto. O que a pessoa vê é o cruzamento de:

| Camada | Campo | Valores típicos |
|--------|--------|-----------------|
| Plataforma | `user.super` | `true` só na empresa `platform` |
| Perfil clássico | `user.profile` | `admin` ou `user` |
| Tipo de empresa | `user.company.type` | `platform`, `whitelabel`, `direct` |
| Permissões novas | `user.permissions[]` | ex.: `tickets.view`, `campaigns.create` |
| Flags legadas | no usuário | `showDashboard`, `allowRealTime`, `allowConnections`, `allTicket` |
| Plano / empresa | flags de recurso | campanhas, Kanban, OpenAI, API externa, chat interno, agendamentos |

Fallback em `usePermissions.js`: se não há `permissions[]`, admin vê quase tudo (exceto empresas globais e “todas as conexões”); user depende das flags.

## Personas para o kit

Cada persona abaixo deve ter **manual próprio**, salvo a marcada como opcional.

### 1. Dono da plataforma

- **Quem é:** operador da instância Taktchat.
- **Como identificar:** `super = true`.
- **Logins locais:** `dono@taktchat.local` (senha do kit) e `admin@admin.com` (já existia).
- **Vê a mais:** empresas, licenças, todas as conexões, anúncios, relatório de cobrança por parceiro.
- **Manual:** sim. Foco em governança, whitelabel, billing de parceiro — não em atender ticket.

### 2. Parceiro (admin whitelabel)

- **Quem é:** revenda.
- **Como identificar:** `profile = admin` e `company.type = whitelabel`.
- **Login local:** `parceiro@taktchat.local` na empresa Parceiro Demo Kit. Neste banco **ainda não há** `company.type` — a Fase 2 vai mostrar o menu real, que pode ser só o de admin de empresa.
- **Vê a mais:** empresas-filhas, licenças e planos do próprio grupo. Não vê a plataforma inteira.
- **Manual:** sim. Foco em cadastrar cliente, licença, bloqueio de acesso, marca/planos.

### 3. Administrador da empresa

- **Quem é:** dono ou gestor do cliente final.
- **Como identificar:** `profile = admin` e `company.type = direct` (ou admin da empresa plataforma sem super — raro).
- **Vê:** operação completa da própria empresa (conexões, filas, usuários, campanhas se o plano permitir, financeiro da empresa).
- **Manual:** sim. É o manual mais longo. Cobre setup inicial.

### 4. Atendente

- **Quem é:** quem fecha ticket.
- **Como identificar:** `profile = user` com permissões padrão de atendimento.
- **Vê:** tickets, contatos, respostas rápidas; o restante só se o admin liberar.
- **Manual:** sim. Curto, tarefa a tarefa.

### 5. Supervisor operacional (opcional)

- **Quem é:** líder de fila. **Não existe** `profile = supervisor` no código atual.
- **Como identificar:** `profile = user` com flags/permissões extras (`showDashboard`, `allowRealTime`, campanhas, etc.) **ou** um role granular equivalente.
- **Manual:** só se a Fase 2 encontrar um padrão real no ambiente. Senão, vira seção no manual do admin (“como montar um supervisor”).

### Personas que **não** devem virar profile inventado

| Nome antigo em docs | Realidade |
|---------------------|-----------|
| Supervisor | Combinação de flags/permissões |
| Financeiro / Relatórios | Permissão `financeiro.view` / `reports.view` ou admin |
| Administrador global | É o **Dono da plataforma** (`super`) |

## Relação empresa × persona

```
platform          → Dono (super) + eventualmente admins da plataforma
  └─ whitelabel   → Parceiro (admin) + usuários internos do parceiro
       └─ direct  → Administrador da empresa + atendentes
  └─ direct       → Cliente direto da plataforma (mesmo par admin + atendente)
```

## O que cada manual deve cobrir (mínimo)

| Persona | Primeiro dia | Rotina | Fora do escopo do manual |
|---------|--------------|--------|---------------------------|
| Dono | Empresas, planos, licenças | Cobrança parceiro, anúncios, saúde das conexões globais | Atender chat do cliente |
| Parceiro | Criar empresa-filha, trial, plano | Bloquear/liberar cliente, cobrança do grupo | Código, servidor |
| Admin empresa | Conexão WhatsApp, filas, usuários | Campanhas, tags, relatórios, settings | Criar outra empresa |
| Atendente | Login, filas, aceitar ticket | Responder, transferir, tags, notas internas | Configurar conexão, planos |

## Credenciais (Fase 2)

Lista completa, senha e seed: **`09-logins-locais.md`**.

| Persona | E-mail | Empresa | Status |
|---------|--------|---------|--------|
| Dono (original) | admin@admin.com | Empresa 01 | existia |
| Dono (kit) | dono@taktchat.local | Empresa 01 | criado |
| Parceiro | parceiro@taktchat.local | Parceiro Demo Kit | criado; sem `company.type` no banco |
| Admin empresa | admin.cliente@taktchat.local | Cliente Demo Kit | criado |
| Atendente | atendente@taktchat.local | Cliente Demo Kit | criado |
| Supervisor | supervisor@taktchat.local | Cliente Demo Kit | criado (flags, não profile) |

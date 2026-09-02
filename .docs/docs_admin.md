# Documentação do Administrador - TaktChat

**Versão:** 1.1  
**Data:** 2026-08-21  
**Público:** Administradores da Plataforma (Super Admin)

---

## Índice

1. [Introdução](#introdução)
2. [Acesso e Permissões](#acesso-e-permissões)
3. [Gestão de Super Admins](#gestão-de-super-admins)
4. [Gestão de Empresas](#gestão-de-empresas)
   - [Conceito de Workspace](#conceito-de-workspace)
5. [Gestão de Planos](#gestão-de-planos)
6. [Gestão de Conexões Globais](#gestão-de-conexões-globais)
7. [Comunicados e Anúncios](#comunicados-e-anúncios)
8. [Monitoramento e Diagnósticos](#monitoramento-e-diagnósticos)
9. [Financeiro e Assinaturas](#financeiro-e-assinaturas)
10. [Troubleshooting Administrativo](#troubleshooting-administrativo)
11. [Boas Práticas](#boas-práticas)

---

## Introdução

### O que é um Super Admin?

O **Super Admin** é o administrador da plataforma TaktChat com acesso total ao sistema. Diferente dos administradores de empresas (que gerenciam apenas sua própria empresa), o Super Admin pode:

- ✅ Gerenciar todas as empresas cadastradas
- ✅ Criar, editar e deletar planos
- ✅ Visualizar todas as conexões WhatsApp
- ✅ Criar comunicados globais
- ✅ Acessar informações financeiras
- ✅ Monitorar o sistema como um todo

### Diferença entre Super Admin e Admin de Empresa

| Aspecto | Super Admin | Admin de Empresa |
|---------|------------|------------------|
| **Acesso** | Todas as empresas | Apenas sua empresa |
| **Empresas** | Pode criar/editar/deletar | Não pode criar empresas |
| **Planos** | Pode criar/editar planos | Apenas visualiza planos |
| **Conexões** | Vê todas as conexões | Vê apenas conexões da empresa |
| **Usuários** | Vê usuários de todas empresas | Vê apenas usuários da empresa |

---

## Acesso e Permissões

### Como Identificar se Você é Super Admin

1. **No Menu Lateral:**
   - Se você vê o item "Empresas" no menu, você é Super Admin
   - Se você vê o item "Todas as Conexões", você é Super Admin

2. **No Banco de Dados:**
   - Campo `super: true` na tabela `Users`

3. **No Código:**
   ```javascript
   if (user.super === true) {
     // Acesso de Super Admin
   }
   ```

### Permissões do Super Admin

O Super Admin possui **todas as permissões** do sistema automaticamente:

```javascript
// Super admin sempre tem tudo
if (user.super === true) {
  return true; // Todas as permissões
}
```

**Permissões Específicas:**
- `companies.view` - Ver empresas
- `companies.create` - Criar empresas
- `companies.edit` - Editar empresas
- `companies.delete` - Deletar empresas
- `all-connections.view` - Ver todas as conexões
- `announcements.*` - Todas as permissões de anúncios

---

## Gestão de Super Admins

### Criar Novo Super Admin

**Rota:** `/users`  
**Menu:** "Usuários" (apenas para Super Admin)

**Passo a Passo:**

1. Acesse a tela de **Usuários** no menu lateral
2. Clique no botão **"+"** ou **"Novo Usuário"** no cabeçalho
3. Preencha o formulário:
   - **Nome** (obrigatório)
   - **Email** (obrigatório, único)
   - **Senha** (obrigatória, mínimo 5 caracteres)
   - **Profile** - Selecione "Admin" ou "User"
   - **Super Admin** - Marque o checkbox (⚠️ **apenas Super Admins veem esta opção**)
4. Configure outras opções conforme necessário (filas, horários, etc.)
5. Clique em **"Salvar"**

**O que acontece:**
- ✅ Usuário é criado no banco de dados
- ✅ Campo `super: true` é definido
- ✅ Usuário recebe **todas as permissões** automaticamente
- ✅ Usuário pode acessar todas as empresas
- ✅ Menu "Empresas" e "Todas as Conexões" aparecem para o novo Super Admin

**Validações:**
- ⚠️ **Apenas Super Admins podem criar outros Super Admins**
- ⚠️ Se um usuário não-Super Admin tentar criar um Super Admin, receberá erro 403
- Email: formato válido, único no sistema
- Senha: mínimo 5 caracteres

### Editar Usuário para Super Admin

**Passo a Passo:**

1. Acesse a tela de **Usuários**
2. Clique no ícone de **lápis** na linha do usuário que deseja tornar Super Admin
3. No modal de edição, role até o campo **"Super Admin"**
4. Marque o checkbox **"Super Admin"**
5. Clique em **"Salvar"**

**O que acontece:**
- ✅ Campo `super` do usuário é atualizado para `true`
- ✅ Usuário recebe todas as permissões automaticamente
- ✅ Usuário pode acessar todas as empresas
- ✅ Menu administrativo é atualizado

**Validações:**
- ⚠️ **Apenas Super Admins podem alterar o campo `super` de outros usuários**
- ⚠️ Se um usuário não-Super Admin tentar alterar, receberá erro 403

### Remover Status de Super Admin

**Passo a Passo:**

1. Acesse a tela de **Usuários**
2. Clique no ícone de **lápis** na linha do Super Admin
3. No modal de edição, desmarque o checkbox **"Super Admin"**
4. Clique em **"Salvar"**

**O que acontece:**
- ✅ Campo `super` do usuário é atualizado para `false`
- ✅ Usuário perde acesso a funcionalidades de Super Admin
- ✅ Menu "Empresas" e "Todas as Conexões" desaparecem
- ✅ Usuário volta a ter permissões baseadas em seu `profile` e `permissions`

**⚠️ ATENÇÃO:**
- Remover o status de Super Admin de um usuário pode limitar significativamente seu acesso
- Certifique-se de que o usuário não precisa mais de acesso administrativo global
- Considere atribuir permissões específicas via campo `permissions` se necessário

### Segurança e Boas Práticas

**Recomendações:**

1. **Limitar número de Super Admins:**
   - Ter muitos Super Admins aumenta o risco de segurança
   - Recomenda-se ter apenas 2-3 Super Admins ativos

2. **Auditoria:**
   - Monitore quem são os Super Admins no sistema
   - Revise periodicamente se todos ainda precisam desse acesso

3. **Senhas fortes:**
   - Super Admins devem ter senhas muito fortes
   - Considere implementar 2FA (se disponível)

4. **Backup de acesso:**
   - Sempre mantenha pelo menos 1 Super Admin ativo
   - Evite deletar o último Super Admin do sistema

5. **Documentação:**
   - Mantenha registro de quem são os Super Admins
   - Documente quando e por que um usuário foi promovido/removido

### Verificar Super Admins no Sistema

**Via Banco de Dados:**
```sql
SELECT id, name, email, super, companyId 
FROM "Users" 
WHERE super = true;
```

**Via Interface:**
- Acesse a tela de Usuários
- Super Admins podem ser identificados visualmente (se houver indicador)
- Ou verifique o campo `super` ao editar o usuário

### Campos do Formulário de Usuário (Super Admin)

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| Nome | Texto | Sim | Nome completo do usuário |
| Email | Email | Sim | Email único, usado para login |
| Senha | Senha | Sim | Mínimo 5 caracteres |
| Profile | Select | Sim | "admin" ou "user" |
| **Super Admin** | Boolean | Não | ⚠️ Apenas Super Admins veem/alteram |
| Filas | Multi-select | Não | Filas de atendimento |
| Horário de Trabalho | Hora | Não | Início e fim do expediente |

---

## Gestão de Empresas

### Acessar a Tela de Empresas

**Rota:** `/companies`  
**Menu:** "Empresas" (apenas para Super Admin)

### Funcionalidades Disponíveis

#### 1. Listar Empresas

A tela exibe uma tabela com todas as empresas cadastradas:

**Colunas:**
- **ID** - Identificador único da empresa
- **Status** - Ativo/Inativo
- **Nome** - Nome da empresa
- **Email** - Email principal
- **Plano** - Plano contratado
- **Valor** - Valor do plano (R$)
- **Data de Criação** - Quando foi criada
- **Data de Vencimento** - Próxima cobrança
- **Último Login** - Último acesso ao sistema
- **Tamanho da Pasta** - Espaço usado em arquivos
- **Total de Arquivos** - Quantidade de arquivos
- **Último Update** - Última atualização de arquivos
- **Ações** - Editar/Deletar

**Recursos:**
- ✅ Busca por nome/email
- ✅ Paginação automática
- ✅ Scroll infinito
- ✅ Indicadores visuais:
  - Amarelo: Vencimento em 1-5 dias
  - Vermelho: Vencido

#### 2. Criar Nova Empresa

**Passo a Passo:**

1. Clicar no botão "+" no cabeçalho
2. Preencher o formulário:
   - **Nome** (obrigatório)
   - **Status** (Ativo/Inativo)
   - **Email** (obrigatório, único)
   - **Senha** (obrigatória)
   - **Licença** — **Plano**, **Início** (hoje) e **Término** (hoje + 30 dias, editável); todos obrigatórios; término ≥ início
3. Clicar em "Adicionar"

**O que acontece:**
- ✅ Empresa e licença `active` são gravadas na mesma transação
- ✅ `dueDate` da empresa = data de término da licença
- ✅ Primeiro usuário admin é criado automaticamente
- ✅ Email do usuário = Email da empresa
- ✅ Senha = senha informada
- ✅ Empresa aparece na lista (sem F5)

**Validações:**
- Nome: mínimo 2 caracteres
- Email: formato válido, único no sistema
- Senha: obrigatória
- Plano, início e término: obrigatórios; término não pode ser anterior ao início
- Falha ao criar a licença: rollback (empresa não persiste)

#### 3. Editar Empresa

**Passo a Passo:**

1. Clicar no ícone de lápis na linha da empresa
2. Modal abre com dados preenchidos
3. Se **não** houver licença vigente, o bloco de licença aparece e o save cria a licença
4. Se **já** houver licença vigente, o modal só informa “Licença vigente até…” (alterar período em `/licenses`)
5. Clicar em "Salvar"

**Campos Editáveis:**
- Nome
- Email (validação de duplicidade)
- Documento
- Plano
- Senha padrão (atualiza senha do usuário admin)
- Número de atendentes
- Número de conexões
- Status

**Importante:**
- ⚠️ Alterar o email atualiza o email do usuário admin
- ⚠️ Alterar a senha atualiza a senha do usuário admin
- ⚠️ Email não pode estar em uso em outra empresa

#### 4. Deletar Empresa

**Passo a Passo:**

1. Clicar no ícone de lixeira na linha da empresa
2. Modal de confirmação aparece
3. Confirmar a exclusão

**⚠️ ATENÇÃO:**
- A exclusão é **irreversível**
- Todos os dados da empresa serão deletados:
  - Usuários
  - Tickets
  - Contatos
  - Mensagens
  - Conexões WhatsApp
  - Arquivos
  - Configurações

**Recomendação:**
- Fazer backup antes de deletar
- Desativar empresa (Status: Inativo) ao invés de deletar
- Verificar se há dados importantes

### Campos do Formulário de Empresa

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| Nome | Texto | Sim | Nome da empresa |
| Email | Email | Sim | Email único, usado para login do admin |
| Documento | Texto | Não | CPF/CNPJ |
| Plano | Select | Sim | Plano contratado |
| Senha Padrão | Senha | Sim | Senha do usuário admin |
| Número Atendentes | Número | Não | Limite de usuários |
| Número Conexões | Número | Não | Limite de conexões WhatsApp |
| Status | Boolean | Sim | Ativo/Inativo |

### Conceito de Workspace

#### O que é um Workspace?

No **TaktChat**, **Workspace e Company (Empresa) são conceitos idênticos (1:1)**. Cada empresa cadastrada no sistema corresponde a um workspace isolado e independente.

**Importante:**
- ✅ **1 Company = 1 Workspace**
- ✅ Cada Company **é** um workspace completo
- ✅ Não existe entidade separada "Workspace" no banco de dados
- ✅ Não é possível ter múltiplas empresas dentro do mesmo workspace

#### Arquitetura Multi-Tenant

O TaktChat é uma **plataforma multi-tenant nativa**, onde:

- **Uma única instalação** suporta múltiplas empresas (workspaces)
- Cada empresa possui seus próprios dados **completamente isolados**
- Múltiplos usuários de diferentes empresas podem estar **logados simultaneamente**
- O isolamento é garantido através do `companyId` em todas as entidades

#### Como Funciona o Isolamento?

**1. Isolamento de Dados:**
- Todas as entidades principais possuem `companyId` como chave estrangeira:
  - `Users` → `companyId`
  - `Tickets` → `companyId`
  - `Contacts` → `companyId`
  - `Messages` → `companyId`
  - `Queues` → `companyId`
  - `Whatsapps` → `companyId`
  - `Chats` → `companyId`
  - E todas as outras entidades...

**2. Isolamento de Comunicação (Socket.IO):**
- Cada empresa possui seu próprio **namespace Socket.IO**
- Padrão: `/workspace-${companyId}`
- Usuários conectam usando `user.companyId` do token JWT
- Eventos são emitidos apenas para o workspace da empresa específica

**Exemplo:**
```javascript
// Frontend conecta ao namespace da empresa
const nsUrl = `${backendUrl}/workspace-${companyId}`;
socket = io(nsUrl, { query: { token, userId } });

// Backend emite eventos apenas para a empresa correta
io.of(`/workspace-${companyId}`).emit(`company-${companyId}-ticket`, data);
```

**3. Isolamento de Arquivos:**
- Mídias organizadas por empresa: `/public/company{companyId}/`
- Uploads isolados por empresa
- Backups podem ser feitos por empresa

#### Estrutura da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│              INSTALAÇÃO ÚNICA DO TAKTCHAT                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Empresa 1   │  │  Empresa 2   │  │  Empresa 3   │ │
│  │ Workspace 1  │  │ Workspace 2  │  │ Workspace 3  │ │
│  │  (ID: 1)     │  │  (ID: 2)     │  │  (ID: 3)     │ │
│  │              │  │              │  │              │ │
│  │  Usuários:   │  │  Usuários:   │  │  Usuários:   │ │
│  │  - admin@1   │  │  - admin@2   │  │  - admin@3   │ │
│  │  - user1@1   │  │  - user1@2   │  │  - user1@3   │ │
│  │              │  │              │  │              │ │
│  │  Dados:      │  │  Dados:      │  │  Dados:      │ │
│  │  - Tickets   │  │  - Tickets   │  │  - Tickets   │ │
│  │  - Contatos  │  │  - Contatos  │  │  - Contatos  │ │
│  │  - Mensagens │  │  - Mensagens │  │  - Mensagens │ │
│  │  - WhatsApps │  │  - WhatsApps │  │  - WhatsApps │ │
│  │              │  │              │  │              │ │
│  │ Namespace:   │  │ Namespace:   │  │ Namespace:   │ │
│  │ /workspace-1 │  │ /workspace-2 │  │ /workspace-3 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  Todos isolados por companyId no mesmo banco de dados  │
└─────────────────────────────────────────────────────────┘
```

#### Perguntas Frequentes

**Q: Posso ter múltiplas empresas dentro do mesmo workspace?**  
❌ **Não.** Workspace e Company são a mesma coisa (1:1). Cada empresa é um workspace isolado.

**Q: Como criar um novo workspace?**  
✅ Criando uma nova empresa através do menu "Empresas" (apenas Super Admin). Cada empresa criada automaticamente recebe seu próprio workspace.

**Q: Empresas podem compartilhar dados?**  
❌ **Não.** Cada empresa tem seus dados completamente isolados. Não há compartilhamento de dados entre empresas diferentes.

**Q: Um usuário pode acessar múltiplos workspaces?**  
⚠️ **Não diretamente.** Cada usuário pertence a uma única empresa (`user.companyId`). Apenas Super Admins podem acessar dados de múltiplas empresas através da interface administrativa.

**Q: Como funciona o isolamento de eventos Socket.IO?**  
✅ Cada empresa possui seu namespace dedicado (`/workspace-${companyId}`). Eventos são emitidos apenas para os usuários daquela empresa específica, garantindo isolamento completo.

#### Implicações para Administradores

1. **Ao criar uma nova empresa:**
   - Um novo workspace é criado automaticamente
   - Namespace Socket.IO `/workspace-{companyId}` é disponibilizado
   - Dados são isolados desde o início

2. **Ao deletar uma empresa:**
   - Todo o workspace é removido
   - Todos os dados isolados são deletados
   - Namespace Socket.IO é desativado

3. **Isolamento é automático:**
   - Não é necessário configurar isolamento manualmente
   - O sistema garante isolamento em todos os níveis (banco, Socket.IO, arquivos)

#### Referências Técnicas

- **Modelo Company:** `backend/src/models/Company.ts`
- **Socket.IO Namespace:** `backend/src/libs/socket.ts` (linha 10: `ALLOWED_NAMESPACES = /^\/workspace-\d+$/`)
- **Frontend Connection:** `frontend/src/services/SocketWorker.js` (linha 47: `workspace-${companyId}`)
- **Documentação Completa:** `.docs/visao-geral/whitelabel-architecture.md` e `.docs/visao-geral/arquitetura.md`

---

## Governança Whitelabel

Além do Super Admin global, a plataforma opera em hierarquia:

| Nível | Quem é | O que vê |
|-------|--------|----------|
| Plataforma | Empresa `type = platform`, usuários `super` | Todas as empresas, planos, licenças, relatório de cobrança |
| Whitelabel | Parceiro revendedor | Só empresas-filhas, planos próprios, bloqueio das filhas |
| Cliente direto | Empresa final | A própria empresa |

- Relatório de cobrança: `/partner-billing-report` (apenas super).
- Cadastro na landing e cadastro por link `/signup-partner`.
- Bloqueio: plataforma suspende parceiro; parceiro bloqueia/libera filhas (`accessBlockedByParent`).

Documentação: `.docs/visao-geral/whitelabel-architecture.md`.

---

## Gestão de Planos

### O que são Planos?

Planos definem os **limites e recursos** disponíveis para cada empresa:

- Limite de usuários
- Limite de conexões WhatsApp
- Limite de filas
- Funcionalidades habilitadas (Campanhas, Kanban, etc.)
- Valor da assinatura
- Período de recorrência

### Acessar Gestão de Planos

**Rota:** Configurações → Planos  

**Abas em Configurações:**
- **Opções**: Parâmetros gerais, Widget Chat do Site na Landing (`enableSiteChatWidget`)
- **Canais de entrada**: Configure fila padrão, tag, WhatsApp e mensagem de boas-vindas para Lead, Revendedor e Chat do site
- **Widget Chat do Site**: Obtenha o código de integração e o token para embutir o widget em sites externos

### Criar Novo Plano

**Campos do Plano:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome | Texto | Ex: "Básico", "Premium", "Enterprise" |
| Usuários | Número | Limite máximo de usuários |
| Conexões | Número | Limite de conexões WhatsApp |
| Filas | Número | Limite de filas de atendimento |
| Valor | Decimal | Preço da assinatura (R$) |
| Recorrência | Texto | "mensal", "anual", etc. |
| Trial | Boolean | Permite período de teste |
| Dias de Trial | Número | Quantos dias de teste |
| WhatsApp | Boolean | Habilita WhatsApp |
| Facebook | Boolean | Habilita Facebook |
| Instagram | Boolean | Habilita Instagram |
| Campanhas | Boolean | Habilita campanhas |
| Kanban | Boolean | Habilita Kanban |
| Agendamentos | Boolean | Habilita agendamentos |
| Chat Interno | Boolean | Habilita chat interno |
| API Externa | Boolean | Habilita API externa |
| Integrações | Boolean | Habilita integrações |
| OpenAI | Boolean | Habilita IA |
| Chat do Site | Boolean | Habilita widget e API do chat do site |
| Público | Boolean | Aparece no signup |

### Exemplo de Plano

```json
{
  "name": "Premium",
  "users": 20,
  "connections": 5,
  "queues": 10,
  "amount": "299.00",
  "recurrence": "mensal",
  "trial": true,
  "trialDays": 14,
  "useWhatsapp": true,
  "useFacebook": false,
  "useInstagram": false,
  "useCampaigns": true,
  "useKanban": true,
  "useSchedules": true,
  "useInternalChat": true,
  "useExternalApi": true,
  "useIntegrations": true,
  "useOpenAi": true,
  "useSiteChat": true,
  "isPublic": true
}
```

### Editar Plano

**Importante:**
- ⚠️ Alterar limites pode afetar empresas que já usam o plano
- ⚠️ Desabilitar funcionalidades remove acesso das empresas
- ⚠️ Alterar valor não afeta assinaturas ativas (apenas novas)

### Deletar Plano

**Validações:**
- ❌ Não pode deletar se houver empresas usando o plano
- ❌ Migrar empresas para outro plano antes de deletar

---

## Gestão de Conexões Globais

### Acessar Todas as Conexões

**Rota:** `/allConnections`  
**Menu:** "Todas as Conexões" (apenas Super Admin)

### Funcionalidades

#### Visualizar Todas as Conexões

A tela exibe **todas as conexões WhatsApp** de **todas as empresas**:

**Informações Exibidas:**
- Empresa (nome)
- Nome da conexão
- Status (Conectado/Desconectado)
- Última atualização
- Tipo (WhatsApp, Facebook, Instagram)
- Ações (Editar, Deletar, QR Code)

**Recursos:**
- ✅ Filtros por empresa
- ✅ Filtros por status
- ✅ Busca
- ✅ Indicadores visuais de status

#### Monitoramento

**Status das Conexões:**
- 🟢 **Conectado** - Funcionando normalmente
- 🟡 **Desconectando** - Em processo de desconexão
- 🔴 **Desconectado** - Não conectado
- ⚪ **Pendente** - Aguardando QR Code

**Ações Disponíveis:**
- Ver QR Code (para reconectar)
- Editar conexão
- Deletar conexão
- Forçar desconexão
- Reconectar

### Diferença: Conexões vs. Todas as Conexões

| Aspecto | `/connections` | `/allConnections` |
|---------|----------------|-------------------|
| **Acesso** | Admin de empresa | Super Admin |
| **Escopo** | Apenas empresa logada | Todas as empresas |
| **Uso** | Gerenciar conexões próprias | Monitorar todo o sistema |

---

## Comunicados e Anúncios

### Acessar Anúncios

**Rota:** `/announcements`  
**Menu:** "Anúncios" (disponível para Super Admin e alguns admins)

### Funcionalidades

#### Criar Anúncio

**Passo a Passo:**

1. Clicar no botão "+" no cabeçalho
2. Preencher o formulário:
   - **Título** (obrigatório)
   - **Texto** (obrigatório)
   - **Prioridade** (Alta, Média, Baixa)
   - **Data de Início** (quando aparecer)
   - **Data de Fim** (quando desaparecer)
3. Clicar em "Salvar"

**O que acontece:**
- ✅ Anúncio aparece para todos os usuários
- ✅ Aparece no topo da tela
- ✅ Pode ser fechado pelo usuário
- ✅ Desaparece automaticamente na data de fim

#### Editar Anúncio

1. Clicar no ícone de lápis
2. Alterar campos
3. Salvar

#### Deletar Anúncio

1. Clicar no ícone de lixeira
2. Confirmar exclusão

### Tipos de Anúncios

**Anúncios Globais:**
- Aparecem para **todos os usuários** de **todas as empresas**
- Úteis para comunicados da plataforma

**Anúncios por Empresa:**
- Aparecem apenas para usuários de uma empresa específica
- Úteis para comunicados internos

---

## Monitoramento e Diagnósticos

### Informações do Sistema

**No Menu Lateral:**
- Versão do Backend
- Versão do Frontend
- Data do Build
- Commit (hash)

### Métricas Importantes

#### 1. Empresas Ativas

- Total de empresas cadastradas
- Empresas ativas vs. inativas
- Empresas por plano

#### 2. Usuários Totais

- Total de usuários no sistema
- Usuários por empresa
- Usuários online vs. offline

#### 3. Conexões

- Total de conexões
- Conexões ativas vs. inativas
- Conexões por empresa

#### 4. Uso de Recursos

- Espaço em disco usado
- Total de arquivos
- Mensagens processadas

### Logs e Auditoria

**Audit Logs:**
- Registram ações importantes:
  - Criação/edição de empresas
  - Alterações de planos
  - Logins de super admin
  - Alterações de configurações

**Acessar Logs:**
- Via banco de dados (tabela `AuditLogs`)
- Via interface (se disponível)

---

## Financeiro e Assinaturas

### Acessar Financeiro

**Rota:** `/financeiro`  
**Menu:** "Financeiro" (requer permissão `financeiro.view`)

### Funcionalidades

#### Visualizar Assinaturas

A tela exibe informações financeiras de todas as empresas:

**Informações:**
- Empresa
- Plano atual
- Valor do plano
- Status do pagamento
- Data de vencimento
- Histórico de pagamentos
- Invoices (faturas)

#### Invoices (Faturas)

**Informações da Fatura:**
- Número da fatura
- Empresa
- Valor
- Data de emissão
- Data de vencimento
- Status (Pago, Pendente, Vencido)
- Método de pagamento

#### Gerenciar Assinaturas

**Ações Disponíveis:**
- ✅ Visualizar histórico
- ✅ Gerar nova fatura
- ✅ Marcar como pago
- ✅ Alterar plano da empresa
- ✅ Cancelar assinatura

### Relatórios Financeiros

**Métricas:**
- Receita total
- Receita por período
- Empresas por plano
- Taxa de conversão
- Churn (cancelamentos)

---

## Troubleshooting Administrativo

### Problemas Comuns

#### 1. Empresa não consegue fazer login

**Verificações:**
1. ✅ Status da empresa está "Ativo"?
2. ✅ Email está correto?
3. ✅ Senha foi definida?
4. ✅ Usuário admin existe?

**Soluções:**
- Verificar status em `/companies`
- Resetar senha do usuário admin
- Verificar logs de autenticação

#### 2. Empresa excedeu limite do plano

**Sintomas:**
- Não consegue criar novos usuários
- Não consegue criar novas conexões
- Funcionalidades bloqueadas

**Soluções:**
- Verificar uso atual vs. limite do plano
- Atualizar plano da empresa
- Aumentar limites do plano (se necessário)

#### 3. Conexão WhatsApp não conecta

**Verificações:**
1. ✅ Status da conexão em `/allConnections`
2. ✅ QR Code foi gerado?
3. ✅ Sessão expirou?

**Soluções:**
- Forçar desconexão e reconectar
- Gerar novo QR Code
- Verificar logs do Baileys

#### 4. Empresa com dados corrompidos

**Sintomas:**
- Erros ao acessar tickets
- Dados inconsistentes
- Performance degradada

**Soluções:**
- Verificar integridade do banco
- Executar scripts de correção
- Restaurar backup (se necessário)

### Scripts Úteis

**Localização:** `backend/scripts/`

**Scripts Disponíveis:**
- Correção de duplicidades
- Validação de dados
- Limpeza de dados antigos
- Migração de dados

### Contato com Suporte Técnico

**Informações para Suporte:**
- ID da empresa
- Descrição do problema
- Logs relevantes
- Screenshots (se aplicável)

---

## Boas Práticas

### Gestão de Empresas

1. **Sempre verificar antes de deletar:**
   - Fazer backup
   - Verificar se há dados importantes
   - Considerar desativar ao invés de deletar

2. **Manter dados atualizados:**
   - Email de contato correto
   - Data de vencimento atualizada
   - Status correto

3. **Comunicar mudanças:**
   - Avisar antes de alterar planos
   - Notificar sobre manutenções
   - Informar sobre novas funcionalidades

### Gestão de Planos

1. **Testar antes de publicar:**
   - Criar plano de teste
   - Verificar limites
   - Testar funcionalidades

2. **Documentar planos:**
   - Nome claro
   - Descrição das funcionalidades
   - Valor e recorrência

3. **Monitorar uso:**
   - Verificar empresas próximas do limite
   - Sugerir upgrade quando necessário
   - Ajustar limites se necessário

### Segurança

1. **Proteger acesso Super Admin:**
   - Senha forte
   - Não compartilhar credenciais
   - Usar 2FA (se disponível)

2. **Auditar ações:**
   - Revisar logs regularmente
   - Verificar ações suspeitas
   - Manter histórico

3. **Backups regulares:**
   - Fazer backup antes de mudanças importantes
   - Testar restauração
   - Manter múltiplas cópias

### Performance

1. **Monitorar recursos:**
   - Espaço em disco
   - Uso de memória
   - Performance do banco

2. **Otimizar quando necessário:**
   - Limpar dados antigos
   - Otimizar queries
   - Escalar recursos

### Comunicação

1. **Anúncios claros:**
   - Título descritivo
   - Texto objetivo
   - Data de expiração

2. **Manter documentação atualizada:**
   - Atualizar este guia
   - Documentar mudanças
   - Compartilhar conhecimento

---

## Resumo Rápido

### Ações Mais Comuns

| Ação | Rota | Menu |
|------|------|------|
| Listar empresas | `/companies` | Empresas |
| Criar empresa | `/companies` → "+" | Empresas |
| Criar Super Admin | `/users` → "+" → Marcar "Super Admin" | Usuários |
| Ver conexões | `/allConnections` | Todas as Conexões |
| Criar anúncio | `/announcements` → "+" | Anúncios |
| Ver financeiro | `/financeiro` | Financeiro |

### Permissões Necessárias

- ✅ `companies.*` - Gestão de empresas
- ✅ `all-connections.view` - Ver todas conexões
- ✅ `announcements.*` - Gestão de anúncios
- ✅ `financeiro.view` - Acesso financeiro

### Checklist Diário

- [ ] Verificar empresas com vencimento próximo
- [ ] Verificar conexões desconectadas
- [ ] Revisar logs de erros
- [ ] Verificar uso de recursos
- [ ] Responder a solicitações

### Checklist Semanal

- [ ] Revisar empresas inativas
- [ ] Analisar métricas financeiras
- [ ] Verificar performance do sistema
- [ ] Atualizar documentação
- [ ] Planejar melhorias

---

## Conclusão

Esta documentação cobre as principais funcionalidades administrativas do TaktChat. Para mais detalhes sobre funcionalidades específicas, consulte:

- `.docs/visao-geral/funcionalidades.md` - Funcionalidades gerais
- `.docs/operacao/` - Operação e manutenção
- `.docs/configuracao/` - Configurações avançadas

**Última atualização:** 2025-01-27 (Adicionada seção de Gestão de Super Admins)

---

## Apêndice: Gestão de Super Admins

### Resumo da Funcionalidade

A partir da versão atual, é possível criar e gerenciar múltiplos Super Admins através da interface do sistema. Esta funcionalidade está disponível **apenas para Super Admins existentes**, garantindo segurança e controle de acesso.

**Características:**
- ✅ Interface visual no modal de usuários
- ✅ Validação de segurança no backend
- ✅ Campo visível apenas para Super Admins
- ✅ Permite criar, editar e remover status de Super Admin
- ✅ Auditoria e controle de acesso

**Restrições de Segurança:**
- ⚠️ Apenas Super Admins podem criar outros Super Admins
- ⚠️ Apenas Super Admins podem editar o campo `super` de outros usuários
- ⚠️ Validações no backend impedem bypass via API direta



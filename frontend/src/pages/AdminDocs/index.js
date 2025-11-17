import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Paper,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import { Link as RouterLink } from "react-router-dom";
import Markdown from "markdown-to-jsx";
import { Helmet } from "react-helmet";

const drawerWidth = 280;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  appBar: {
    backgroundColor: "#fff",
    color: "#333",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "#fafafa",
    borderRight: "1px solid #e0e0e0",
  },
  drawerHeader: {
    padding: theme.spacing(2),
    backgroundColor: "#d32f2f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  paper: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: theme.spacing(2),
    color: "#d32f2f",
    fontWeight: 600,
  },
  section: {
    marginBottom: theme.spacing(4),
    scrollMarginTop: "80px",
  },
  heading1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: "#d32f2f",
    paddingBottom: theme.spacing(1),
    borderBottom: "3px solid #d32f2f",
  },
  heading2: {
    fontSize: "2rem",
    fontWeight: 600,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: "#333",
  },
  heading3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
    color: "#555",
  },
  heading4: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: "#666",
  },
  paragraph: {
    marginBottom: theme.spacing(2),
    lineHeight: 1.8,
    fontSize: "1rem",
    color: "#444",
  },
  list: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    lineHeight: 1.8,
  },
  code: {
    backgroundColor: "#f5f5f5",
    padding: "2px 6px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "0.9em",
    color: "#d63384",
  },
  codeBlock: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
    borderRadius: "8px",
    marginBottom: theme.spacing(2),
    overflowX: "auto",
    fontFamily: "monospace",
    fontSize: "0.9em",
    border: "1px solid #e0e0e0",
  },
  link: {
    color: "#d32f2f",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.5rem",
    textDecoration: "none",
    color: "#d32f2f",
  },
  tocItem: {
    paddingLeft: theme.spacing(2),
    "&:hover": {
      backgroundColor: "#ffebee",
    },
  },
  tocItemActive: {
    backgroundColor: "#ffebee",
    borderLeft: "3px solid #d32f2f",
  },
  badge: {
    marginLeft: theme.spacing(1),
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: theme.spacing(2),
  },
  tableCell: {
    border: "1px solid #e0e0e0",
    padding: theme.spacing(1),
    textAlign: "left",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: 600,
  },
}));

const AdminDocs = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Conteúdo completo do docs_admin.md
  const markdownContent = `# Documentação do Administrador - TaktChat

**Versão:** 1.0  
**Data:** 2025-01-27  
**Público:** Administradores da Plataforma (Super Admin)

---

## Índice

1. [Introdução](#introdução)
2. [Acesso e Permissões](#acesso-e-permissões)
3. [Gestão de Empresas](#gestão-de-empresas)
4. [Gestão de Planos](#gestão-de-planos)
5. [Gestão de Conexões Globais](#gestão-de-conexões-globais)
6. [Comunicados e Anúncios](#comunicados-e-anúncios)
7. [Monitoramento e Diagnósticos](#monitoramento-e-diagnósticos)
8. [Financeiro e Assinaturas](#financeiro-e-assinaturas)
9. [Troubleshooting Administrativo](#troubleshooting-administrativo)
10. [Boas Práticas](#boas-práticas)

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
   - Campo \`super: true\` na tabela \`Users\`

3. **No Código:**
   \`\`\`javascript
   if (user.super === true) {
     // Acesso de Super Admin
   }
   \`\`\`

### Permissões do Super Admin

O Super Admin possui **todas as permissões** do sistema automaticamente:

\`\`\`javascript
// Super admin sempre tem tudo
if (user.super === true) {
  return true; // Todas as permissões
}
\`\`\`

**Permissões Específicas:**
- \`companies.view\` - Ver empresas
- \`companies.create\` - Criar empresas
- \`companies.edit\` - Editar empresas
- \`companies.delete\` - Deletar empresas
- \`all-connections.view\` - Ver todas as conexões
- \`announcements.*\` - Todas as permissões de anúncios

---

## Gestão de Empresas

### Acessar a Tela de Empresas

**Rota:** \`/companies\`  
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
   - **Email** (obrigatório, único)
   - **Documento** (CPF/CNPJ)
   - **Plano** (selecionar do dropdown)
   - **Senha Padrão** (obrigatória)
   - **Número de Atendentes** (limite)
   - **Número de Conexões** (limite)
   - **Status** (Ativo/Inativo)
3. Clicar em "Salvar"

**O que acontece:**
- ✅ Empresa é criada no banco de dados
- ✅ Primeiro usuário admin é criado automaticamente
- ✅ Email do usuário = Email da empresa
- ✅ Senha = Senha padrão informada
- ✅ Empresa aparece na lista

**Validações:**
- Nome: mínimo 2 caracteres
- Email: formato válido, único no sistema
- Senha: obrigatória
- Plano: deve existir

#### 3. Editar Empresa

**Passo a Passo:**

1. Clicar no ícone de lápis na linha da empresa
2. Modal abre com dados preenchidos
3. Alterar os campos desejados
4. Clicar em "Salvar"

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

**Rota:** Configurações → Planos (via API/Backend)  
**Nota:** A interface de gestão de planos pode estar no backend ou em uma rota específica.

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
| Público | Boolean | Aparece no signup |

### Exemplo de Plano

\`\`\`json
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
  "isPublic": true
}
\`\`\`

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

**Rota:** \`/allConnections\`  
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

| Aspecto | \`/connections\` | \`/allConnections\` |
|---------|----------------|-------------------|
| **Acesso** | Admin de empresa | Super Admin |
| **Escopo** | Apenas empresa logada | Todas as empresas |
| **Uso** | Gerenciar conexões próprias | Monitorar todo o sistema |

---

## Comunicados e Anúncios

### Acessar Anúncios

**Rota:** \`/announcements\`  
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
- Via banco de dados (tabela \`AuditLogs\`)
- Via interface (se disponível)

---

## Financeiro e Assinaturas

### Acessar Financeiro

**Rota:** \`/financeiro\`  
**Menu:** "Financeiro" (requer permissão \`financeiro.view\`)

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
- Verificar status em \`/companies\`
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
1. ✅ Status da conexão em \`/allConnections\`
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

**Localização:** \`backend/scripts/\`

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
| Listar empresas | \`/companies\` | Empresas |
| Criar empresa | \`/companies\` → "+" | Empresas |
| Ver conexões | \`/allConnections\` | Todas as Conexões |
| Criar anúncio | \`/announcements\` → "+" | Anúncios |
| Ver financeiro | \`/financeiro\` | Financeiro |

### Permissões Necessárias

- ✅ \`companies.*\` - Gestão de empresas
- ✅ \`all-connections.view\` - Ver todas conexões
- ✅ \`announcements.*\` - Gestão de anúncios
- ✅ \`financeiro.view\` - Acesso financeiro

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

- \`.docs/visao-geral/funcionalidades.md\` - Funcionalidades gerais
- \`.docs/operacao/\` - Operação e manutenção
- \`.docs/configuracao/\` - Configurações avançadas

**Última atualização:** 2025-01-27`;

  const tocItems = [
    { id: "introdução", title: "Introdução", level: 1 },
    { id: "acesso-e-permissões", title: "Acesso e Permissões", level: 1 },
    { id: "gestão-de-empresas", title: "Gestão de Empresas", level: 1 },
    { id: "gestão-de-planos", title: "Gestão de Planos", level: 1 },
    { id: "gestão-de-conexões-globais", title: "Gestão de Conexões Globais", level: 1 },
    { id: "comunicados-e-anúncios", title: "Comunicados e Anúncios", level: 1 },
    { id: "monitoramento-e-diagnósticos", title: "Monitoramento e Diagnósticos", level: 1 },
    { id: "financeiro-e-assinaturas", title: "Financeiro e Assinaturas", level: 1 },
    { id: "troubleshooting-administrativo", title: "Troubleshooting Administrativo", level: 1 },
    { id: "boas-práticas", title: "Boas Práticas", level: 1 },
    { id: "resumo-rápido", title: "Resumo Rápido", level: 1 },
    { id: "conclusão", title: "Conclusão", level: 1 },
  ];

  const markdownOptions = {
    overrides: {
      h1: {
        component: Typography,
        props: { className: classes.heading1, variant: "h1" },
      },
      h2: {
        component: Typography,
        props: { className: classes.heading2, variant: "h2" },
      },
      h3: {
        component: Typography,
        props: { className: classes.heading3, variant: "h3" },
      },
      h4: {
        component: Typography,
        props: { className: classes.heading4, variant: "h4" },
      },
      p: {
        component: Typography,
        props: { className: classes.paragraph, variant: "body1" },
      },
      ul: {
        component: "ul",
        props: { className: classes.list },
      },
      ol: {
        component: "ol",
        props: { className: classes.list },
      },
      li: {
        component: "li",
        props: { className: classes.listItem },
      },
      code: {
        component: "code",
        props: { className: classes.code },
      },
      pre: {
        component: "pre",
        props: { className: classes.codeBlock },
      },
      table: {
        component: "table",
        props: { className: classes.table },
      },
      th: {
        component: "th",
        props: { className: `${classes.tableCell} ${classes.tableHeader}` },
      },
      td: {
        component: "td",
        props: { className: classes.tableCell },
      },
      a: {
        component: ({ href, children, ...props }) => {
          if (href?.startsWith("#")) {
            return (
              <a
                href={href}
                className={classes.link}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(href);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                {...props}
              >
                {children}
              </a>
            );
          }
          return (
            <a href={href} className={classes.link} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
      },
      strong: {
        component: Typography,
        props: { component: "strong", style: { fontWeight: 600 } },
      },
    },
  };

  const drawer = (
    <div>
      <div className={classes.drawerHeader}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          🔐 Admin Docs
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} style={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        )}
      </div>
      <Divider />
      <List>
        {tocItems.map((item) => (
          <ListItem
            key={item.id}
            button
            component="a"
            href={`#${item.id}`}
            className={`${classes.tocItem} ${activeSection === item.id ? classes.tocItemActive : ""}`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector(`#${item.id}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveSection(item.id);
              }
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            style={{ paddingLeft: theme.spacing(item.level * 2) }}
          >
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box p={2}>
        <Chip
          label="Versão 1.0"
          color="secondary"
          size="small"
          style={{ width: "100%" }}
        />
      </Box>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Documentação do Administrador - Taktchat</title>
        <meta name="description" content="Guia completo para administradores da plataforma TaktChat" />
      </Helmet>
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap className={classes.logo} component={RouterLink} to="/">
              Taktchat
            </Typography>
            <Box flexGrow={1} />
            <Typography variant="body2" color="textSecondary">
              Documentação Admin
            </Typography>
          </Toolbar>
        </AppBar>

        <nav className={classes.drawer} aria-label="navigation">
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </nav>

        <main className={classes.content} style={{ marginTop: "64px" }}>
          <Container maxWidth="lg">
            <Paper className={classes.paper} elevation={0}>
              <Markdown options={markdownOptions}>{markdownContent}</Markdown>
            </Paper>
          </Container>
        </main>
      </div>
    </>
  );
};

export default AdminDocs;


import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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
    backgroundColor: "#1976d2",
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
    color: "#1976d2",
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
    color: "#1976d2",
    paddingBottom: theme.spacing(1),
    borderBottom: "3px solid #1976d2",
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
    color: "#1976d2",
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
    color: "#1976d2",
  },
  tocItem: {
    paddingLeft: theme.spacing(2),
    "&:hover": {
      backgroundColor: "#e3f2fd",
    },
  },
  tocItemActive: {
    backgroundColor: "#e3f2fd",
    borderLeft: "3px solid #1976d2",
  },
  badge: {
    marginLeft: theme.spacing(1),
  },
}));

const OnboardingDocs = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Conteúdo completo do onboarding.md (carregado inline)
  // Em produção, poderia ser carregado via API ou arquivo estático
  const markdownContent = `# Guia de Onboarding - Taktchat

Bem-vindo ao Taktchat! Este guia irá ajudá-lo a entender todas as funcionalidades da plataforma e como utilizá-las.

## Visão Geral

O Taktchat é uma plataforma omnichannel de mensageria focada em atendimento e campanhas via WhatsApp. O sistema permite:

- **Atendimento em tempo real** com múltiplas filas e organização Kanban
- **Campanhas segmentadas** com controle de cadência e métricas
- **Automações inteligentes** com Flow Builder e IA
- **Multi-empresa** com permissões granulares
- **Integrações** com sistemas externos via APIs e Webhooks

### Arquitetura Técnica

- **Backend:** Node.js 22 + TypeScript + Express + Sequelize
- **Frontend:** React 17 + Material UI
- **Banco de Dados:** PostgreSQL 15
- **Cache/Filas:** Redis 6.2 + Bull
- **WebSocket:** Socket.IO para comunicação em tempo real
- **WhatsApp:** Suporte dual channel:
  - **Baileys** (não oficial, gratuito) - Via QR Code
  - **WhatsApp Business API Oficial** (Meta, pago) - Via credenciais Meta

## Primeiros Passos

### 1. Acesso ao Sistema

1. Acesse a URL do sistema
2. Faça login com suas credenciais
3. Se for o primeiro acesso, você será redirecionado para o dashboard

### 2. Configuração Inicial

#### 2.1. Conectar WhatsApp

O TaktChat suporta **dois tipos de conexão WhatsApp**:

##### Opção A: Baileys (Gratuito, Recomendado para Início)

1. Acesse **Conexões** no menu lateral
2. Clique em **Nova Conexão**
3. Selecione **"Baileys"** como tipo de canal
4. Preencha o nome da conexão
5. Clique em **Iniciar Sessão**
6. Escaneie o QR Code com seu WhatsApp
7. Aguarde a conexão ser estabelecida (status mudará para "CONECTADO")

**Como funciona:**
- O sistema utiliza a biblioteca Baileys para criar uma sessão WhatsApp Web
- O QR Code é gerado e atualizado a cada 45 segundos
- Após escanear, a sessão é salva em \`backend/private/sessions/\`
- A conexão é monitorada continuamente e reconecta automaticamente em caso de queda

**Vantagens:**
- ✅ Gratuito
- ✅ Setup rápido (2 minutos)
- ✅ Ideal para empresas pequenas (< 150 mensagens/dia)

**Limitações:**
- ⚠️ Risco moderado de banimento
- ⚠️ Limite de mensagens por dia (~150-500 com anti-ban)
- ⚠️ Multi-agente pode ser problemático

##### Opção B: WhatsApp Business API Oficial (Pago, Profissional)

1. Acesse **Conexões** no menu lateral
2. Clique em **Nova Conexão**
3. Selecione **"API Oficial"** como tipo de canal
4. Preencha:
   - **Nome da conexão**
   - **Phone Number ID** (obtido na Meta Business)
   - **Access Token** (obtido na Meta Business)
   - **Business Account ID** (obtido na Meta Business)
   - **Webhook Verify Token** (token secreto de sua escolha)
5. Clique em **Salvar**
6. Configure o webhook na Meta Business usando a URL exibida
7. Aguarde a conexão ser estabelecida (status mudará para "CONECTADO")

**Como funciona:**
- Integração com WhatsApp Business API Oficial da Meta
- Comunicação via REST API (envio de mensagens)
- Recebimento de mensagens via Webhooks HTTP
- Validação de webhook garantida pela Meta

**Vantagens:**
- ✅ Sem risco de banimento
- ✅ Uptime 99.9% garantido pela Meta
- ✅ Ilimitado (dentro dos limites de cobrança)
- ✅ Multi-agente nativo
- ✅ Templates aprovados para marketing
- ✅ Botões e listas interativas completos
- ✅ Webhooks nativos
- ✅ Suporte oficial da Meta

**Custos:**
- R$ 0,17 por conversa de serviço
- R$ 0,34 por conversa de marketing
- **1.000 primeiras conversas/mês GRÁTIS**

**Documentação Completa:**
- 📘 [Guia Completo WhatsApp API Oficial](../funcionalidades/whatsapp-api-oficial/index.md)
- ⚡ [Quick Start (30 min)](../funcionalidades/whatsapp-api-oficial/WHATSAPP_API_QUICKSTART.md)
- 📚 [Tutorial de Integração Meta](../funcionalidades/whatsapp-api-oficial/tutorial-integracao-meta.md)

**Quando usar cada opção:**
- **Baileys:** Pequenas empresas, baixo volume, custo zero importante
- **API Oficial:** Empresas médias/grandes, alto volume, necessidade de confiabilidade, marketing via templates

#### 2.2. Criar Fila de Atendimento

1. Acesse **Filas** no menu
2. Clique em **Nova Fila**
3. Preencha:
   - Nome da fila
   - Cor (para identificação visual)
   - Horário de funcionamento (opcional)
   - Mensagem de boas-vindas (opcional)
4. Salve

**Como funciona:**
- Filas organizam tickets por departamento/área
- Cada ticket pertence a uma fila
- Usuários podem ser atribuídos a filas específicas
- Filas podem ter horários de funcionamento e mensagens automáticas

## Funcionalidades Principais

### 1. Sistema de Atendimento (Tickets)

#### 1.1. O que são Tickets?

Tickets são conversas com clientes. Cada ticket representa uma thread de mensagens com um contato específico.

**Status dos Tickets:**
- **pending:** Aguardando atendimento
- **open:** Em atendimento
- **closed:** Finalizado

#### 1.2. Visualização de Tickets

O sistema oferece diferentes visualizações:

**Tickets (Padrão):**
- Lista de tickets em colunas por status
- Filtros por fila, usuário, tags, período
- Atualização em tempo real via Socket.IO

**Kanban:**
- Visualização em colunas (como Trello)
- Arraste e solte para mudar status
- Filtros avançados

**Como funciona:**
- Quando uma mensagem chega, um ticket é criado ou atualizado
- O ticket é associado a uma fila (automática ou manual)
- Atendentes podem pegar tickets da fila
- Mudanças são sincronizadas em tempo real via Socket.IO

### 2. Conexões WhatsApp

#### 2.1. Gerenciando Conexões

**Página de Conexões:**
- Lista todas as conexões da empresa
- Status: CONECTADO, DESCONECTADO, PENDING, OPENING
- Ações: Iniciar, Parar, Deletar

**Como funciona:**
- Cada conexão pode ser Baileys ou API Oficial
- Conexões Baileys: sessões são salvas em \`backend/private/sessions/\`
- Conexões API Oficial: autenticação via credenciais Meta
- O sistema monitora a conexão e reconecta automaticamente
- Em caso de bloqueio (403), a sessão é removida automaticamente

### 3. Campanhas

#### 3.1. O que são Campanhas?

Campanhas são disparos massivos de mensagens para listas de contatos, com controle de cadência e métricas.

#### 3.2. Criando uma Campanha

**Passo 1: Criar Lista de Contatos**
1. Acesse **Listas de Contatos**
2. Clique em **Nova Lista**
3. Importe contatos via CSV ou adicione manualmente
4. Valide números (sistema faz validação automática)

**Passo 2: Configurar Campanha**
1. Acesse **Campanhas**
2. Clique em **Nova Campanha**
3. Preencha:
   - Nome da campanha
   - Lista de contatos
   - Conexão WhatsApp
   - Mensagens (até 5 diferentes - sistema escolhe aleatoriamente)
   - Mensagens de confirmação (opcional)
   - Mídia (opcional)
   - Data/hora de agendamento

**Passo 3: Configurar Cadência**
1. Na aba **Configurações**, defina:
   - Intervalo entre mensagens (ex: 30 segundos)
   - Intervalo maior após X mensagens (ex: 5 minutos após 10 mensagens)
   - Limite por hora (cap)

**Como funciona:**
- A campanha é processada por filas Bull (Redis)
- Cada contato é adicionado à fila com um delay calculado
- O sistema respeita os intervalos configurados
- Mensagens são enviadas assincronamente
- Status é atualizado em tempo real

### 4. Flow Builder

#### 4.1. O que é Flow Builder?

Flow Builder é um editor visual para criar automações e jornadas de atendimento.

#### 4.2. Criando um Flow

1. Acesse **Flow Builder**
2. Clique em **Novo Flow**
3. Arraste nodes para o canvas:
   - **Start:** Início do fluxo
   - **Message:** Enviar mensagem
   - **Question:** Fazer pergunta
   - **Condition:** Condicional (if/else)
   - **OpenAI:** Integração com IA
   - **Typebot:** Integração com Typebot
   - **Menu:** Menu de opções
   - **Ticket:** Criar/atualizar ticket

4. Conecte os nodes com arestas
5. Configure cada node
6. Salve e ative

**Como funciona:**
- Flows são executados quando um ticket é criado ou quando acionados manualmente
- Cada node processa uma ação
- Condicionais permitem ramificações
- Integrações com IA permitem respostas inteligentes

### 5. Inteligência Artificial

#### 5.1. Assistente com IA

O sistema suporta integração com:
- **OpenAI** (GPT-3.5, GPT-4)
- **Google Generative AI**

#### 5.2. Configurando IA

1. Acesse **Prompts**
2. Crie um prompt:
   - Nome
   - Prompt base (instruções para a IA)
   - Modelo a usar
   - Temperatura (criatividade)

3. Use em Flows ou respostas automáticas

**Como funciona:**
- O sistema envia contexto (mensagens, dados do contato) para a IA
- A IA gera resposta baseada no prompt
- Resposta é enviada ao cliente
- Uso é registrado para métricas

#### 5.3. RAG (Smart Files)

RAG permite que a IA use documentos internos:

1. Acesse **Smart Files**
2. Faça upload de documentos (PDF, DOCX, TXT, etc.)
3. Sistema indexa automaticamente
4. Em Flows, use node OpenAI com RAG ativado

**Como funciona:**
- Documentos são processados e indexados
- Quando IA precisa de informação, busca nos documentos
- Respostas são enriquecidas com conhecimento interno

### 6. Gestão de Contatos

#### 6.1. Importação de Contatos

1. Acesse **Contatos**
2. Clique em **Importar**
3. Selecione arquivo CSV
4. Mapeie colunas
5. Importe

**Formato CSV:**
\`\`\`csv
name,number,email
João Silva,5511999999999,joao@email.com
\`\`\`

**Como funciona:**
- Sistema valida números
- Remove duplicatas
- Cria ou atualiza contatos
- Associa à empresa atual

### 7. Tags e Regras

#### 7.1. Sistema de Tags

Tags categorizam contatos e tickets:
1. Acesse **Tags**
2. Crie tags com nome e cor
3. Aplique manualmente ou via regras

#### 7.2. Regras Automáticas

Regras aplicam tags automaticamente:

1. Acesse **Regras de Tags**
2. Crie regra:
   - Condição (ex: contato contém palavra "vip")
   - Ação (aplicar tag "VIP")
   - Horário de execução

**Como funciona:**
- Regras são executadas por cron jobs
- Verificam condições em contatos/tickets
- Aplicam tags automaticamente
- Podem ser agendadas

### 8. Dashboards e Relatórios

#### 8.1. Dashboard Principal

O dashboard mostra:
- Tickets por status
- Métricas de atendimento
- Gráficos de evolução
- Top atendentes
- Filas mais ativas

#### 8.2. Relatórios de Campanhas

1. Acesse **Relatórios de Campanhas**
2. Selecione campanha
3. Veja:
   - Total enviado/entregue/falhou
   - Taxa de sucesso
   - Evolução temporal
   - Detalhamento por contato

### 9. Permissões e Multi-empresa

#### 9.1. Multi-tenant

O sistema é multi-tenant nativo:
- Cada empresa tem isolamento completo
- Dados são segmentados por \`companyId\`
- Usuários pertencem a uma empresa

#### 9.2. Perfis e Permissões

**Perfis disponíveis:**
- **Super Admin:** Acesso total (todas as empresas)
- **Admin:** Administrador da empresa
- **Atendente:** Pode atender tickets
- **Supervisor:** Pode ver relatórios e gerenciar filas

### 10. Integrações

#### 10.1. Webhooks

Configure webhooks para receber eventos:

1. Acesse **Webhooks**
2. Crie webhook:
   - URL de destino
   - Eventos a escutar (ticket criado, mensagem recebida, etc.)
   - Método HTTP (POST)

**Eventos disponíveis:**
- \`ticket.created\`
- \`ticket.updated\`
- \`message.received\`
- \`message.sent\`
- \`campaign.started\`
- \`campaign.finished\`

#### 10.2. APIs Externas

O sistema expõe APIs REST:
- \`/api/messages\` - Enviar mensagens
- \`/api/contacts\` - Gerenciar contatos
- \`/api/tickets\` - Gerenciar tickets
- \`/api/campaigns\` - Gerenciar campanhas

**Autenticação:**
- Token JWT
- Headers: \`Authorization: Bearer {token}\`

## Fluxos de Trabalho

### Fluxo 1: Atendimento Básico

1. Cliente envia mensagem no WhatsApp
2. Sistema cria/atualiza ticket
3. Ticket aparece na fila
4. Atendente pega o ticket
5. Atendente responde
6. Cliente recebe resposta
7. Ticket é finalizado

### Fluxo 2: Campanha Completa

1. Importar lista de contatos
2. Criar campanha com mensagens
3. Configurar cadência
4. Agendar disparo
5. Sistema processa em filas
6. Mensagens são enviadas respeitando intervalos
7. Monitorar dashboard
8. Analisar resultados

### Fluxo 3: Automação com Flow Builder

1. Criar flow no editor visual
2. Configurar nodes (mensagem, pergunta, condição)
3. Ativar flow em uma fila
4. Quando ticket é criado, flow inicia
5. Sistema executa nodes sequencialmente
6. Cliente interage com o flow
7. Flow pode criar ticket ou finalizar

## Boas Práticas

### Atendimento

1. **Responda rapidamente:** Clientes esperam resposta rápida
2. **Use mensagens rápidas:** Acelere respostas comuns
3. **Aplique tags:** Organize tickets com tags
4. **Adicione notas:** Documente informações importantes
5. **Finalize tickets:** Mantenha a fila organizada

### Campanhas

1. **Valide números:** Sempre valide antes de enviar
2. **Respeite cadência:** Configure intervalos adequados
3. **Teste primeiro:** Envie para pequeno grupo antes
4. **Monitore métricas:** Acompanhe taxa de sucesso
5. **Respeite opt-out:** Remova contatos que pediram para sair

### Anti-ban

1. **Não envie spam:** Respeite políticas do WhatsApp
2. **Use cadência:** Configure intervalos entre mensagens
3. **Valide contatos:** Remova números inválidos
4. **Monitore bloqueios:** Fique atento a desconexões
5. **Rotacione conexões:** Use múltiplas conexões

### Segurança

1. **Proteja credenciais:** Não compartilhe tokens/APIs
2. **Use permissões:** Dê apenas permissões necessárias
3. **Monitore logs:** Revise logs regularmente
4. **Faça backups:** Mantenha backups do banco
5. **Atualize sistema:** Mantenha versões atualizadas

## Suporte e Recursos

### Documentação Adicional

- **Arquitetura:** \`.docs/visao-geral/arquitetura.md\`
- **Fluxos Críticos:** \`.docs/visao-geral/fluxos-criticos.md\`
- **Instalação:** \`.docs/instalacao/\`
- **Configuração:** \`.docs/configuracao/\`
- **Funcionalidades:** \`.docs/funcionalidades/\`

### Troubleshooting

- **Conexão não conecta:** Verifique QR Code, rede, firewall
- **Mensagens não enviam:** Verifique status da conexão, limites
- **Campanha falha:** Verifique logs, validação de números
- **Performance lenta:** Verifique Redis, banco, filas

---

**Última atualização:** 2025-01-27`;

  const tocItems = [
    { id: "visao-geral", title: "Visão Geral", level: 1 },
    { id: "primeiros-passos", title: "Primeiros Passos", level: 1 },
    { id: "funcionalidades-principais", title: "Funcionalidades Principais", level: 1 },
    { id: "sistema-de-atendimento", title: "Sistema de Atendimento", level: 2 },
    { id: "conexoes-whatsapp", title: "Conexões WhatsApp", level: 2 },
    { id: "campanhas", title: "Campanhas", level: 2 },
    { id: "flow-builder", title: "Flow Builder", level: 2 },
    { id: "inteligencia-artificial", title: "Inteligência Artificial", level: 2 },
    { id: "gestao-de-contatos", title: "Gestão de Contatos", level: 2 },
    { id: "tags-e-regras", title: "Tags e Regras", level: 2 },
    { id: "dashboards-e-relatorios", title: "Dashboards e Relatórios", level: 2 },
    { id: "permissoes-e-multi-empresa", title: "Permissões e Multi-empresa", level: 2 },
    { id: "integracoes", title: "Integrações", level: 2 },
    { id: "fluxos-de-trabalho", title: "Fluxos de Trabalho", level: 1 },
    { id: "boas-praticas", title: "Boas Práticas", level: 1 },
    { id: "suporte-e-recursos", title: "Suporte e Recursos", level: 1 },
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
          📚 Documentação
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
          label="Versão 2.2.2"
          color="primary"
          size="small"
          style={{ width: "100%" }}
        />
      </Box>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Documentação - Taktchat</title>
        <meta name="description" content="Guia completo de onboarding e documentação do Taktchat" />
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
              Documentação
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
              keepMounted: true, // Better open performance on mobile.
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

export default OnboardingDocs;


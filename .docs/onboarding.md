# Guia de Onboarding - Taktchat

Bem-vindo ao Taktchat! Este guia irá ajudá-lo a entender todas as funcionalidades da plataforma e como utilizá-las.

## Índice

1. [Visão Geral](#visão-geral)
2. [Primeiros Passos](#primeiros-passos)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Fluxos de Trabalho](#fluxos-de-trabalho)
5. [Integrações](#integrações)
6. [Boas Práticas](#boas-práticas)

---

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
- **WhatsApp:** Baileys para conexão com WhatsApp

---

## Primeiros Passos

### 1. Acesso ao Sistema

1. Acesse a URL do sistema
2. Faça login com suas credenciais
3. Se for o primeiro acesso, você será redirecionado para o dashboard

### 2. Configuração Inicial

#### 2.1. Conectar WhatsApp

1. Acesse **Conexões** no menu lateral
2. Clique em **Nova Conexão**
3. Preencha o nome da conexão
4. Clique em **Iniciar Sessão**
5. Escaneie o QR Code com seu WhatsApp
6. Aguarde a conexão ser estabelecida (status mudará para "CONECTADO")

**Como funciona:**
- O sistema utiliza a biblioteca Baileys para criar uma sessão WhatsApp Web
- O QR Code é gerado e atualizado a cada 45 segundos
- Após escanear, a sessão é salva em `backend/private/sessions/`
- A conexão é monitorada continuamente e reconecta automaticamente em caso de queda

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

#### 2.3. Criar Usuários

1. Acesse **Usuários** (requer permissão de admin)
2. Clique em **Novo Usuário**
3. Preencha dados e permissões
4. Salve

**Como funciona:**
- Sistema multi-tenant: cada usuário pertence a uma empresa (`companyId`)
- Permissões são granulares por recurso
- Usuários podem ter perfis diferentes (admin, atendente, supervisor)

---

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

#### 1.3. Atendendo um Ticket

1. Abra um ticket clicando nele
2. Visualize o histórico de mensagens
3. Digite sua resposta e envie
4. Use **Mensagens Rápidas** para respostas pré-definidas
5. Adicione **Notas Internas** (visíveis apenas para a equipe)
6. Aplique **Tags** para categorizar

**Recursos do Chat:**
- Envio de mídias (imagens, vídeos, áudios, documentos)
- Visualização de mídias recebidas
- Informações do contato no painel lateral
- Histórico completo de interações

#### 1.4. Transferência de Tickets

1. No ticket aberto, clique em **Transferir**
2. Selecione a fila ou usuário destino
3. Adicione uma mensagem (opcional)
4. Confirme

**Como funciona:**
- O ticket é movido para a nova fila/usuário
- O histórico é preservado
- Uma mensagem de transferência pode ser enviada ao cliente
- O ticket volta para status "pending" na nova fila

#### 1.5. Tags em Tickets

Tags ajudam a categorizar e filtrar tickets.

1. No ticket, clique em **Tags**
2. Selecione ou crie novas tags
3. Use tags para filtrar tickets

**Como funciona:**
- Tags são globais por empresa
- Podem ter cores para identificação visual
- Regras automáticas podem aplicar tags baseadas em condições
- Tags aparecem no Kanban para organização

---

### 2. Conexões WhatsApp

#### 2.1. Gerenciando Conexões

**Página de Conexões:**
- Lista todas as conexões da empresa
- Status: CONECTADO, DESCONECTADO, PENDING, OPENING
- Ações: Iniciar, Parar, Deletar

**Como funciona:**
- Cada conexão é uma instância Baileys independente
- Sessões são salvas em `backend/private/sessions/{companyId}/{whatsappId}/`
- O sistema monitora a conexão e reconecta automaticamente
- Em caso de bloqueio (403), a sessão é removida automaticamente

#### 2.2. Múltiplas Conexões

Você pode ter várias conexões WhatsApp:
- Diferentes números para diferentes departamentos
- Distribuição de carga em campanhas
- Backup em caso de bloqueio

**Como funciona:**
- Cada conexão tem seu próprio QR Code
- Campanhas podem usar rotação automática de conexões
- O sistema escolhe a melhor conexão disponível para envio

#### 2.3. Monitoramento

O sistema monitora:
- Status de conexão
- Última desconexão
- Erros e tentativas de reconexão
- Métricas de envio por conexão

---

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

#### 3.3. Variáveis em Mensagens

Você pode personalizar mensagens com variáveis:

```
Olá {{name}}, seu pedido {{order}} foi confirmado!
```

Variáveis disponíveis:
- `{{name}}` - Nome do contato
- `{{number}}` - Número do contato
- Campos customizados do contato

#### 3.4. Monitoramento de Campanhas

**Dashboard de Campanha:**
- Total de contatos
- Enviados, entregues, falhas
- Taxa de sucesso
- Gráficos de evolução
- Detalhamento por status

**Status dos Envios:**
- **pending:** Aguardando envio
- **processing:** Sendo processado
- **sent:** Enviado
- **delivered:** Entregue
- **read:** Lido (se disponível)
- **failed:** Falhou
- **suppressed:** Suprimido (opt-out/blacklist)

#### 3.5. Anti-ban em Campanhas

O sistema implementa várias proteções:

- **Cadência controlada:** Intervalos entre mensagens
- **Cap por hora:** Limite máximo de envios
- **Validação de números:** Remove números inválidos
- **Supressão:** Respeita lista de opt-out
- **Rotação de conexões:** Distribui carga entre múltiplas conexões

---

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

#### 4.3. Nodes Disponíveis

**Message Node:**
- Envia mensagem ao cliente
- Suporta variáveis e mídias

**Question Node:**
- Faz pergunta ao cliente
- Aguarda resposta
- Salva resposta em variável

**Condition Node:**
- Avalia condição (ex: resposta contém "sim")
- Ramifica para caminhos diferentes

**OpenAI Node:**
- Envia contexto para OpenAI
- Recebe resposta gerada
- Pode usar RAG (Smart Files)

**Typebot Node:**
- Integra com Typebot externo
- Passa controle para o bot
- Recebe resultado

**Menu Node:**
- Exibe menu de opções
- Cliente escolhe opção
- Ramifica conforme escolha

#### 4.4. Variáveis em Flows

Flows podem usar variáveis:
- Dados do contato
- Respostas de perguntas anteriores
- Dados do ticket
- Resultados de nodes de IA

---

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

#### 5.4. Transcrição de Áudio

O sistema transcreve áudios recebidos:
- Usa serviços de transcrição (OpenAI Whisper, Google Speech)
- Transcrição aparece junto com o áudio
- Pode ser usado em análises e respostas automáticas

---

### 6. Gestão de Contatos

#### 6.1. Importação de Contatos

1. Acesse **Contatos**
2. Clique em **Importar**
3. Selecione arquivo CSV
4. Mapeie colunas
5. Importe

**Formato CSV:**
```csv
name,number,email
João Silva,5511999999999,joao@email.com
```

**Como funciona:**
- Sistema valida números
- Remove duplicatas
- Cria ou atualiza contatos
- Associa à empresa atual

#### 6.2. Enriquecimento de Dados

Contatos podem ter campos customizados:
- Email, telefone, endereço
- Campos específicos do negócio
- Tags
- Histórico de interações

#### 6.3. Listas de Contatos

Listas agrupam contatos para campanhas:
1. Crie uma lista
2. Adicione contatos manualmente ou importe
3. Use em campanhas

**Como funciona:**
- Listas são dinâmicas (podem ter filtros)
- Contatos podem estar em múltiplas listas
- Listas podem ser atualizadas automaticamente

#### 6.4. Validação de Números

O sistema valida números:
- Formato correto
- Números válidos (não bloqueados)
- Remove inválidos automaticamente

---

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

#### 7.3. Kanban por Tags

Visualize tickets organizados por tags:
1. Acesse **Kanban de Tags**
2. Veja tickets agrupados por tag
3. Arraste entre colunas

---

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

#### 8.3. Relatórios de Atendimento

1. Acesse **Relatórios**
2. Filtre por:
   - Período
   - Fila
   - Usuário
   - Status
3. Exporte para CSV/PDF

**Métricas disponíveis:**
- Tickets atendidos
- Tempo médio de resposta
- Taxa de resolução
- Satisfação do cliente (se houver avaliação)

---

### 9. Permissões e Multi-empresa

#### 9.1. Multi-tenant

O sistema é multi-tenant nativo:
- Cada empresa tem isolamento completo
- Dados são segmentados por `companyId`
- Usuários pertencem a uma empresa

#### 9.2. Perfis e Permissões

**Perfis disponíveis:**
- **Super Admin:** Acesso total (todas as empresas)
- **Admin:** Administrador da empresa
- **Atendente:** Pode atender tickets
- **Supervisor:** Pode ver relatórios e gerenciar filas

**Permissões granulares:**
- Criar/editar/delete tickets
- Gerenciar campanhas
- Acessar relatórios
- Gerenciar usuários
- Configurar integrações

#### 9.3. Planos e Limites

Cada empresa tem um plano com limites:
- Número de usuários
- Número de conexões
- Número de filas
- Recursos disponíveis (IA, Flow Builder, etc.)

---

### 10. Integrações

#### 10.1. Webhooks

Configure webhooks para receber eventos:

1. Acesse **Webhooks**
2. Crie webhook:
   - URL de destino
   - Eventos a escutar (ticket criado, mensagem recebida, etc.)
   - Método HTTP (POST)

**Eventos disponíveis:**
- `ticket.created`
- `ticket.updated`
- `message.received`
- `message.sent`
- `campaign.started`
- `campaign.finished`

#### 10.2. APIs Externas

O sistema expõe APIs REST:
- `/api/messages` - Enviar mensagens
- `/api/contacts` - Gerenciar contatos
- `/api/tickets` - Gerenciar tickets
- `/api/campaigns` - Gerenciar campanhas

**Autenticação:**
- Token JWT
- Headers: `Authorization: Bearer {token}`

#### 10.3. Queue Integration

Integre com sistemas externos via filas:
1. Configure integração
2. Sistema envia eventos para fila externa
3. Sistema recebe comandos da fila externa

---

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

### Fluxo 4: Integração com IA

1. Configurar prompt de IA
2. Criar flow com node OpenAI
3. Flow envia contexto para IA
4. IA gera resposta
5. Resposta é enviada ao cliente
6. Se necessário, busca em Smart Files (RAG)

---

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

---

## Suporte e Recursos

### Documentação Adicional

- **Arquitetura:** `.docs/visao-geral/arquitetura.md`
- **Fluxos Críticos:** `.docs/visao-geral/fluxos-criticos.md`
- **Instalação:** `.docs/instalacao/`
- **Configuração:** `.docs/configuracao/`
- **Funcionalidades:** `.docs/funcionalidades/`

### Troubleshooting

- **Conexão não conecta:** Verifique QR Code, rede, firewall
- **Mensagens não enviam:** Verifique status da conexão, limites
- **Campanha falha:** Verifique logs, validação de números
- **Performance lenta:** Verifique Redis, banco, filas

### Contato

Para suporte técnico ou dúvidas, consulte a documentação em `.docs/` ou entre em contato com a equipe de desenvolvimento.

---

**Última atualização:** 2025-01-27


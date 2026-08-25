# Funcionalidades do Taktchat

Mapa funcional da revisão documental v1.8. Os estados abaixo descrevem o código encontrado, não uma confirmação de deploy ou disponibilidade em produção.

## Atendimento e Kanban

- Tickets por status, fila, atendente, tags e origem (`entrySource`), com mensagens de texto, mídia, áudio e mensagens especiais.
- Chat em tempo real, transferência, respostas rápidas e histórico por empresa.
- Kanban de **conversas**: `/ticket/kanban`, quadro `/kanban`, popup de desfecho ao encerrar e estatísticas em `/ticket/kanban/stats` e `/kanban/stats`.
- Lanes automáticas de entrada e encerramento; uma tag `kanban=1` por ticket. Não é pipeline financeiro de oportunidades.

## Contatos

- Cadastro enriquecido, campos comerciais, carteira (`ContactWallet`) e tags.
- Importação assíncrona, importação de contatos do dispositivo e deduplicação.
- Regras automáticas de tags e filtros. Processamentos em fila exigem Redis.

## WhatsApp dual channel

- Baileys por QR e WhatsApp Business API Oficial por credenciais Meta.
- Labels do WhatsApp Web têm integração separada do sistema de tags.
- API Oficial suporta webhooks e templates conforme configuração Meta.
- Baileys é canal não oficial e **não possui garantia anti-ban**. Cadência reduz risco, mas não elimina bloqueios.

## Campanhas, filas e automações

- Campanhas com listas, filtros salvos, custo, cadência/controles anti-ban, agendamento e relatório detalhado.
- Filas humanas, bots, Typebot e integrações por fila.
- Flow Builder visual com importação e exportação em ZIP.
- Controllers `QueueAdvanced` sem ligação ao fluxo ativo são classificados como **órfãos**, não como recurso entregue.
- Campanhas e jobs dependem de Redis e dos gates de plano/permissão.

## IA

- Provedores OpenAI e Gemini, prompts, orquestração e transcrição de áudio.
- RAG com indexação e busca semântica exige PostgreSQL com extensão `pgvector`.
- `SmartFilesDashboard` existe como página, mas não possui rota no frontend; a capacidade técnica não equivale a uma tela entregue.

## Chat do site e entradas públicas

- Widget e API de site chat com `useSiteChat` e token por empresa.
- Canais de entrada configuram fila, tag, conexão e mensagem inicial.
- Lead, revendedor, site chat e WhatsApp alimentam `entrySource`.
- Limitação: o fluxo público de Lead escolhe a primeira empresa quando não há seleção explícita; não prometer roteamento público multiempresa.

## Whitelabel, licenças e cobrança

- Hierarquia `platform` → `whitelabel` → `direct`, planos, licenças, bloqueios, crons e registro de pagamento (`register-payment`).
- Relatório de cobrança do parceiro e snapshots para `super`.
- Mercado Pago possui integração funcional.
- O gateway de pagamento genérico permanece **manual/stub**; não representa cobrança automática multi-gateway.

## APIs e autenticação

As APIs combinam três superfícies:

1. rotas autenticadas por sessão/JWT;
2. APIs externas com token ou chave de empresa;
3. rotas públicas explicitamente destinadas a signup, landing, webhooks e site chat.

Cada integração deve documentar sua camada; “API disponível” não significa endpoint público sem autenticação.

## Agendamentos

Existem dois conceitos distintos:

- agendamento de mensagens/ações em `/schedules`;
- horários e jornada de atendimento configurados na empresa.

Ambos dependem de plano, permissão e execução dos jobs correspondentes.

## Frontend, perfis e planos

- O mapa completo está em [mapa-frontend.md](../funcionalidades/mapa-frontend.md).
- O acesso combina `super`, `profile` (`admin`/`user`), `permissions[]`, wildcards, flags legadas e gates de plano.
- Não há `Role` central que represente supervisor: supervisor é uma persona montada por permissões e flags.
- `/apresentacoes` é privado e restrito à empresa `platform`.
- `/reports`, `/todolist` e `/TagsKanban` têm rota, mas não item de menu; `/TagsKanban` é case-sensitive.
- `AuditLogs`, `SmartFilesDashboard`, `FlowDefault`, `CampaignReport` e `Subscription` têm páginas sem rota.
- `/financeiro-aberto` não existe.

## Operação e observabilidade

- Health check, Bull Board, filas Bull/Redis, crons e diagnósticos operacionais.
- Redis é requisito para filas; indisponibilidade afeta jobs e automações.
- Facebook/Instagram possuem implementação parcial e **não são canais maduros para promessa comercial**.

## Pendências de segurança

- Dashboards/endpoints `ticketsUsers` e `ticketsDay` estão sem autenticação.
- Helmet está comentado.
- Esses itens são pendências de hardening, não funcionalidades.

## Legado

Documentos em `.docs/legacy/` preservam histórico e podem divergir do estado atual. Afirmações de “pronto para produção”, garantia de uptime/anti-ban ou telas não roteadas não devem ser reutilizadas sem nova validação.


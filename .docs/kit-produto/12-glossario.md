# Glossário (v1 — completar na Fase 1)

Atualizar assim que a UI usar outro nome. Não deixar para a Fase 5.

| Termo | Significado no Taktchat |
|-------|-------------------------|
| Ticket | Conversa em atendimento (não é protocolo de helpdesk para o cliente no WhatsApp) |
| Fila | Grupo/assunto que recebe tickets (Suporte, Vendas…) |
| Conexão | Número ou API Oficial por onde as mensagens entram e saem |
| Baileys | Canal não oficial, em geral via QR Code |
| API Oficial / WABA | WhatsApp Business API da Meta |
| Dual channel | Os dois tipos de conexão no mesmo produto |
| Contato | Pessoa ou empresa no cadastro; um contato pode ter vários tickets ao longo do tempo |
| Pendente | Ticket na fila, sem atendente responsável |
| Aberto | Ticket com atendente |
| Encerrado | Ticket fechado; o cliente pode gerar outro ao falar de novo |
| Transferir | Passar o ticket de fila e/ou de pessoa |
| Tag | Etiqueta (Urgente, VIP); pode alimentar Kanban |
| CRM de conversa | Contato + ticket (fila, dono, histórico) no WhatsApp — posicionamento atual; ver demanda 16 |
| CRM de mercado / pipeline | Oportunidade com valor e estágio nativo (Pipedrive/HubSpot). O Taktchat **não** tem isso; tags Kanban só simulam o quadro |
| Atendente | `profile = user` focado em conversa |
| Admin da empresa | `profile = admin` da empresa cliente |
| Parceiro / whitelabel | Revenda; `company.type = whitelabel` (neste local já migrado) |
| Dono / super | `user.super = true` na empresa plataforma |
| Supervisor | Não é profile; é user com flags/permissões a mais |
| Plano | Limites (usuários, conexões, filas, campanhas, IA…) |
| Licença | Direito de uso da empresa no tempo |
| EntrySource | Origem do ticket (WhatsApp, site, lead…) — coluna criada na migration local |
| Widget | Chat embarcável no site do cliente |
| Landing | Página pública de marketing/cadastro |
| Multi-tenant | Várias empresas no mesmo sistema, dados separados por `companyId` |
| Campanha | Disparo em massa para listas |
| Flow Builder | Editor visual de jornada/bot |

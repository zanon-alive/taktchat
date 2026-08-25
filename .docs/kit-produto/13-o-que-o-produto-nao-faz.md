# O que o produto não faz (rascunho)

Usar na comercial e no catálogo para não superestimar. Confirmar na navegação.

## Limites honestos

- **Não é CRM completo de pipeline** (oportunidades genéricas, billing de ERP, estoque). **É CRM de conversa no WhatsApp:** contato fala → ticket com fila, dono, tags e histórico. Pode conviver com HubSpot/Pipedrive. Não é helpdesk com protocolo visível para o cliente no celular. Evolução possível (conversa estruturada vs. pipeline nativo): [16-demanda-crm-conversa-ou-mercado.md](16-demanda-crm-conversa-ou-mercado.md).
- **Não é WhatsApp oficial só porque usa WhatsApp.** Baileys não é a API da Meta. Risco de bloqueio de conta pessoal existe nesse canal.
- **API Oficial não significa “dispare o que quiser”.** Templates, janela de 24h e política da Meta continuam valendo.
- **Não garante 100% de uptime da sessão Baileys.** QR, celular ligado e sessão em disco importam.
- **Omnichannel** no produto é sobretudo WhatsApp + entradas (site/lead). Não assumir Instagram/Facebook/Telegram sem ver a UI.
- **IA** depende de chave, plano e configuração; não vem “pronta” em todo tenant.
- **Whitelabel** exige hierarquia de empresas no banco. Neste ambiente local os tipos já foram migrados; prints de menu de filhas ficam para a rodada do parceiro.
- **Multi-empresa** isola por `companyId`; não é um produto separado por cliente na infra (é o mesmo sistema).
- **Atendimento sem conexão WhatsApp** não entrega mensagem real. O seed mostra a UI com conexão desconectada de propósito.

Atualizar este arquivo na Fase 1 se a UI contradisser algum item.

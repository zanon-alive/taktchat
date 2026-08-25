# Financeiro e dashboards

- Dashboard `/` — admin/supervisor com `dashboard.view`. Atendente: 403.
- Relatórios `/reports` — rota existente, sem item de menu
- Financeiro `/financeiro` — faturas e plano; `/financeiro-aberto` não existe
- Cobrança de parceiro `/partner-billing-report` — dono

`CampaignReport` e `Subscription` existem como páginas, mas não têm rota. Mercado Pago é funcional quando configurado; o gateway genérico é manual/stub.

Status: home da atendente exercitada (403). Demais telas não percorridas nesta versão.

## Pendência de segurança

Os dashboards/endpoints `ticketsUsers` e `ticketsDay` estão sem autenticação e não devem ser apresentados como relatórios seguros até correção.

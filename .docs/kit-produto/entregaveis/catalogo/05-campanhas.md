# Campanhas

## Para que serve

Disparo em massa para listas, com custo, cadência, filtros salvos, agendamento e relatório detalhado.

## Onde fica

`/campaigns`, `/contact-lists`, `/campaigns-config` — se o plano tiver campanhas (`useCampaigns` / `cshow`).

## Quem usa

Admin / marketing. Atendente em geral não dispara.

## Status

**Implementado/condicional:** depende de `useCampaigns`, permissão, conexão e Redis para filas. Não foi exercitado nesta versão do demo.

## Limite comercial

Controles de cadência e anti-ban reduzem risco; não garantem que Baileys ou a conta Meta nunca sejam bloqueados. O uso precisa respeitar consentimento e políticas do canal.

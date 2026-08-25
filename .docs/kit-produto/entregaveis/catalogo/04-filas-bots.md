# Filas e bots

## Para que serve

Separar o trabalho (Suporte, Vendas, Financeiro) e opcionalmente atender com bot/Typebot/Flow antes do humano.

## Onde fica

`/queues`, opções de bot na fila, `/queue-integration`

## Seed (Cliente Demo Kit)

- Suporte (Beatriz só nesta)
- Vendas
- Financeiro
- Parceiro Demo Kit: Atendimento Parceiro

## Status

**Implementado/condicional:** filas, bots, Typebot e integração por fila; processamento assíncrono exige Redis e credenciais externas quando aplicável.
**Não exercitado no demo:** Bot/Typebot.
**Órfão:** controllers `QueueAdvanced` sem ligação confirmada a rota/fluxo ativo não são funcionalidade entregue.

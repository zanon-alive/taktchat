## Estratégias anti-ban

### Objetivo

- Reduzir risco de bloqueio de contas WhatsApp utilizadas pelas empresas.
- Monitorar padrões de uso e ajustar parâmetros de envio em tempo real.

### Medidas implementadas

- Limite dinâmico de mensagens por minuto com base em histórico do número.
- Rotação de templates e mídias para evitar repetição excessiva.
- Monitoramento de erros retornados pela API Baileys/WhatsApp e tratamento automático.
- Filas com rate limiter configurável (`REDIS_OPT_LIMITER_*`).

### Rotina de configuração

1. Validar que o número está em bom estado (sem histórico recente de bloqueio).
2. Utilizar campanhas piloto com lotes pequenos.
3. Ajustar parâmetros conforme retorno (erros de spam, 429, etc.).

### Indicadores de alerta

- Aumento de status `failed` sem erro aparente.
- Respostas automáticas do WhatsApp indicando comportamento suspeito.
- Sessões desconectadas com frequência.

### Referências detalhadas

- `ANTI-BAN-REPORT.md`
- `PROTECTION-SUMMARY.md`
- `DUPLICATE-PROTECTION-COMPLETE.md`
- `QUICK-START-ANTI-BAN.md`


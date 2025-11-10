## Campanhas

### Visão geral

- Ferramenta para disparo massivo de mensagens com acompanhamento em tempo real.
- Suporta segmentação por listas e personalização de conteúdo.
- Métricas consolidadas em dashboard detalhado (`/campaign/:id/detailed-report`).

### Fluxo operacional

1. Criar lista de contatos (importação CSV ou seleção manual).
2. Registrar campanha informando template, parâmetros e janela de envio.
3. Agendar disparo e monitorar progresso nas filas Bull.
4. Acompanhar métricas de entrega e falha via dashboard.

### Métricas principais

- Total de contatos, entregues, pendentes e falhas.
- Taxa de sucesso e falha (cards com gradientes e gráficos Recharts).
- Evolução em tempo real com barra de progresso e detalhamento por status.

### Boas práticas

- Limitar lotes para evitar bloqueios (utilizar rate conforme políticas do WhatsApp).
- Utilizar tags para identificar campanhas específicas.
- Monitorar filas `Campaign` e `SendMessage` para garantir throughput.

### Testes recomendados

- Ambiente de homologação com contatos de teste.
- Validação do dashboard após disparo (gráficos, filtros, exportações).
- Checagem de logs em caso de falhas (`CampaignShipping` e workers correspondentes).

### Referências históricas

- Documentos detalhados arquivados em `legacy/`:
  - `DASHBOARD_CAMPANHAS.md`
  - `DASHBOARD_CAMPANHAS_FINAL.md`
  - `MELHORIAS_CAMPANHAS.md`
  - `OTIMIZACAO_PERFORMANCE_CAMPANHAS.md`
  - `COMO_TESTAR_CAMPANHAS.md`
  - `RESUMO_FINAL_MELHORIAS.md`


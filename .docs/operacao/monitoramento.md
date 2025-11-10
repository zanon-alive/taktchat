## Monitoramento e observabilidade

### Métricas recomendadas

- **Backend**: requisições por minuto, taxa de erro 4xx/5xx, tempo de resposta médio.
- **Socket.IO**: conexões ativas, eventos emitidos, filas de retransmissão.
- **Fila Bull/Redis**: jobs ativos, concluídos, falhos e tempo médio de processamento.
- **PostgreSQL**: conexões ativas, tempo de queries, tamanho das tabelas `Messages`, `Tickets`, `Campaigns`.
- **WhatsApp Sessions**: status online/offline, tempo desde última sincronização.

### Ferramentas sugeridas

- **Sentry**: captura de exceções frontend/backend.
- **Grafana + Prometheus**: dashboards integrando métricas do Docker, Redis e PostgreSQL.
- **Bull Board** ou UI similar: visualização das filas em tempo real.
- **Elastic Stack**: centralização de logs (opcional).

### Alertas

- Erros 5xx acima de 5% por 5 minutos.
- Jobs Bull em estado `waiting` acima de 1000.
- Falhas de login consecutivas (indicativo de problemas com banco ou redis).
- Sessões WhatsApp desconectadas por mais de 15 minutos.

### Logs importantes

- Backend: disponíveis via `pino`, armazenar em `/var/log/taktchat/backend.log` (se configurado).
- Redis: `docker compose logs redis` para identificar bloqueios.
- PostgreSQL: `docker compose logs postgres` para erros de conexão/migrations.

### Diagnósticos auxiliares

- Scripts em `backend/src/utils`: `diagnose.ts`, `database-diagnostic.ts`, `auth-type-diagnostics.ts`.
- Recomenda-se agendar execuções periódicas e manter resultados arquivados.


# Monitoramento e observabilidade

## Ambiente atual

A produção roda em Docker Swarm/Portainer na VPS Contabo, com imagens GHCR fixadas por digest. Portainer oferece visão operacional, mas não substitui alertas externos.

### Métricas recomendadas

- **Backend**: requisições por minuto, taxa de erro 4xx/5xx, tempo de resposta médio.
- **Socket.IO**: conexões ativas, eventos emitidos, filas de retransmissão.
- **Fila Bull/Redis**: jobs ativos, concluídos, falhos e tempo médio de processamento.
- **PostgreSQL**: conexões ativas, tempo de queries, tamanho das tabelas `Messages`, `Tickets`, `Campaigns`.
- **WhatsApp Sessions**: status online/offline, tempo desde última sincronização.
- **Swarm**: réplicas desejadas/ativas, tarefas `Rejected`/`Failed`, reinícios e duração da convergência.
- **Host Contabo**: CPU, memória, swap, disco, inode e disponibilidade.
- **Traefik**: respostas 4xx/5xx, TLS e latência dos routers de frontend/backend.

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

- Backend: `docker service logs taktchat_taktchat-backend`.
- Frontend: `docker service logs taktchat_taktchat-frontend`.
- Label-sync: `docker service logs taktchat_taktchat-label-sync`.
- Migrations: `docker service logs taktchat_taktchat-migrate`.
- Redis e PostgreSQL: observar nas stacks separadas; volumes confirmados `redis_redis_data` e `postgres_postgres_data`.
- Não registrar nem encaminhar valores de secrets.

### Sondas essenciais

- API pública: `https://api.taktchat.com.br/health`.
- Frontend público: `https://taktchat.com.br`.
- Réplicas dos serviços `taktchat_taktchat-backend`, `taktchat_taktchat-frontend` e `taktchat_taktchat-label-sync`.
- Conclusão sem erro de `taktchat_taktchat-migrate` quando acionado.

### Pós-release

Observar continuamente durante a janela definida no runbook:

1. convergência dos serviços;
2. health da API;
3. carregamento do frontend;
4. taxa de erros e filas;
5. conexão de sessões WhatsApp;
6. crescimento anormal de CPU, memória e disco.

### Diagnósticos auxiliares

- Scripts em `backend/src/utils`: `diagnose.ts`, `database-diagnostic.ts`, `auth-type-diagnostics.ts`.
- Execute diagnósticos que acessam banco apenas após confirmar ambiente e impacto.

## Desenvolvimento local

`docker compose logs` é válido apenas para o Compose de desenvolvimento local. Produção deve ser observada pelos serviços Swarm e pelo Portainer.


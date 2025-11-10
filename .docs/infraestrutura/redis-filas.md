## Redis e filas Bull

### Uso principal

- Adapter do Socket.IO (`@socket.io/redis-adapter`).
- Filas Bull para campanhas, importação de contatos, sincronização de mídias e jobs agendados.
- Cache de dados sensíveis (ex.: tokens temporários).

### Configuração

- Versão recomendada: Redis 6.2 em modo standalone.
- Variáveis principais: `REDIS_URI`, `REDIS_URI_ACK`, `REDIS_SECRET_KEY`.
- Ajuste de limiter: `REDIS_OPT_LIMITER_MAX`, `REDIS_OPT_LIMITER_DURATION`.

### Filas relevantes

- `SendMessage`, `Campaign`, `SyncContacts`, `VerifySession`, entre outras (ver `backend/src/queues.ts`).
- Jobs processados em `backend/src/jobs/` e `backend/src/services/*QueueService.ts`.

### Monitoramento

- Habilite interface `bull-board` para visibilidade (endpoints configuráveis).
- Métricas chave: quantidade de jobs `waiting`, `failed`, `delayed`.
- Configure alertas para filas com acumulo acima de thresholds definidos.

### Manutenção

- Evite executar `FLUSHALL` em produção (limpará sessões e jobs em andamento).
- Utilize `redis-cli --bigkeys` para identificar crescimento anormal.
- Automatize limpeza de jobs concluídos (Bull permite configurações de `removeOnComplete`).

### Resiliência

- Configure politicas de retry nos jobs (ver serviços específicos).
- Forneça persistência (AOF) se necessário para recuperação pós-falha.


## Configuração do Socket.IO

### Namespaces e salas

- Backend expõe namespaces no formato `/workspace-<companyId>`.
- Cada ticket utiliza `ticket.uuid` como sala para eventos (`company-<companyId>-appMessage`).

### Redis adapter

- Utilize `REDIS_URI_ACK` (ou `REDIS_URI`) para sincronizar múltiplas instâncias.
- Exemplo: `redis://redis:6379/0`.

### Fallback de broadcast

- Ative `SOCKET_FALLBACK_NS_BROADCAST=true` em produção para mitigar race conditions entre `joinChatBox` e primeiro `emit`.

### Debug

- `SOCKET_DEBUG=true` habilita logs detalhados (`[SOCKET EMIT]`, contagem de sala). Desative em produção para evitar verbosidade.

### Diagnóstico rápido

- Frontend: inspecione console do navegador e utilize `window.__SOCKET_IO__?.onAny(...)` para listar eventos.
- Backend: verifique logs ao emitir eventos e confirme `count` da sala.

### Requisitos

- Certifique-se de que o adapter utilize o mesmo Redis do backend/filas (ou instância dedicada) para garantir consistência.


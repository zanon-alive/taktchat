## Troubleshooting rápido

### Backend não conecta ao banco

- Verifique status com `docker compose ps postgres`.
- Confira logs: `docker compose logs postgres`.
- Teste conexão manual: `docker exec postgres pg_isready -U postgres`.
- Validar variáveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`.

### Redis indisponível

- `docker compose logs redis` para identificar erros.
- Reinicie serviço: `docker compose restart redis`.
- Teste ping: `docker exec taktchat-redis redis-cli ping` (esperado `PONG`).

### Portas ocupadas (8080/3000)

- Identifique processo: `lsof -i :8080` (mac/Linux) ou `netstat -ano | findstr :8080` (Windows).
- Finalize processo e reinicie serviços.

### Migrations falhando

- Garanta que PostgreSQL esteja `Up` e com credenciais corretas.
- Revise migration específica em `backend/src/database/migrations`.
- Execute novamente: `cd backend && npx sequelize db:migrate`.

### Sessão WhatsApp expirada

- Acesse painel → `Configurações > Conexões`.
- Gere novo QR code e escaneie com o dispositivo.
- Verifique volume `taktchat_backend-private` para garantir persistência.

### Campanhas travadas

- Conferir filas em `/admin/queues` ou via CLI `bull-board`.
- Verificar logs de workers em `backend/src/services/CampaignService`.
- Reiniciar workers: `pm2 restart ecosystem.config.js` (se em produção) ou reiniciar backend.

### Falha no envio de mídias

- Confirmar instalação do `ffmpeg` (`ffmpeg -version`).
- Verificar permissões de escrita no volume `backend-public`.
- Checar logs de erros específicos (mensagens com status `failed`).


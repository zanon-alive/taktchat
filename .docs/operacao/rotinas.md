## Rotinas operacionais

### Diariamente

- Verificar saúde dos containers com `docker compose ps` ou monitor equivalente.
- Conferir filas Bull (rota `/admin/queues` se habilitada) e limpar jobs travados.
- Acompanhar logs críticos (`backend`, `redis`, `postgres`) em busca de erros recorrentes.
- Validar que sessões WhatsApp estão conectadas (dashboard administrativo).

### Semanalmente

- Executar `npm run diagnose` (backend) para checagens automatizadas.
- Revisar volume de armazenamento nos volumes `backend-public` e `backend-private`.
- Atualizar certificados ou tokens expiratórios (provedores externos, webhooks).

### Mensalmente

- Realizar teste de restauração de backup em ambiente isolado.
- Avaliar métricas de campanhas e ajustar limites por workspace.
- Rodar scripts de manutenção (`scripts/fix-contactlistitems-duplicates.ts`, etc.) conforme necessidade.

### Atualização do servidor de produção

**⚠️ IMPORTANTE:** Após fazer PR e merge na branch `main`, sempre siga o guia completo de atualização:

- **📖 Guia obrigatório:** `../ATUALIZACAO_SERVIDOR.md` - **Guia Completo de Atualização do TaktChat no Servidor**
- O guia inclui:
  - Atualização do código (`git pull`)
  - Atualização do backend (dependências, compilação TypeScript, migrations)
  - Build e atualização do frontend (recomendado: build fora do container)
  - Verificação e monitoramento dos serviços
  - Troubleshooting de problemas comuns
  - Checklist de atualização

**Fluxo recomendado após PR/merge:**
1. ✅ PR aprovado e mergeado na branch `main`
2. ✅ Código commitado e enviado ao repositório
3. 📖 **Consultar:** `../ATUALIZACAO_SERVIDOR.md`
4. 🔄 Seguir processo de atualização no servidor
5. ✅ Verificar logs e healthcheck dos serviços

### Antes de releases

- Atualizar changelog em `anexos/notas-de-versao.md`.
- Executar testes automatizados (`npm run test` backend, `npm test` frontend).
- Validar builds (`npm run build` em ambos).
- Atualizar documentação impactada pela release.


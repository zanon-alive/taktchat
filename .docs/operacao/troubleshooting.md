# Troubleshooting da produção Swarm

Produção usa Docker Swarm/Portainer na VPS Contabo. Comece sempre por evidências e evite reinícios em cascata.

## Triagem inicial

```bash
docker service ls
docker service ps taktchat_taktchat-backend --no-trunc
docker service ps taktchat_taktchat-frontend --no-trunc
docker service ps taktchat_taktchat-label-sync --no-trunc
docker service ps taktchat_taktchat-migrate --no-trunc
docker service logs --tail 200 taktchat_taktchat-backend
docker service logs --tail 200 taktchat_taktchat-frontend
```

Registre horário, commit implantado, mudança recente e mensagens de erro sem copiar secrets.

## Backend sem health

- Confirmar tarefas `Running` e ausência de `Rejected`/`Failed`.
- Verificar logs do serviço e `https://api.taktchat.com.br/health`.
- Confirmar que o serviço usa `taktchat-backend@sha256:<digest>`.
- Confirmar os mounts `taktchat_taktchat_private:/app/private` e `taktchat_taktchat_media:/app/public`.
- Validar conectividade com PostgreSQL e Redis pelos nomes efetivos da rede Swarm.
- Não imprimir variáveis sensíveis.

## Frontend indisponível ou desatualizado

- Confirmar que o serviço usa `taktchat-frontend@sha256:<digest>` e não possui mounts.
- Confirmar a tarefa de `taktchat_taktchat-frontend`.
- Verificar logs e o roteamento Traefik para a porta interna `80`.
- Distinguir cache do navegador/CDN de build antigo.
- Comparar o digest implantado com o digest esperado no GHCR.

## Migrations falhando

- Interromper a release e preservar logs.
- Confirmar backup e compatibilidade da migration com a versão anterior.
- Verificar o serviço `taktchat_taktchat-migrate`; não rodar seed.
- Não repetir migration cegamente nem aplicar correção destrutiva.
- Se houver risco de dados, restaurar primeiro em ambiente isolado.

## Redis, filas e campanhas

- Identificar o serviço Redis real no Swarm e consultar seus logs.
- Conferir filas e jobs falhos pela interface habilitada.
- Reiniciar somente o serviço afetado após identificar a causa.
- PM2 não faz parte da produção Swarm atual.

## WhatsApp e mídia

- Confirmar persistência e permissões dos volumes efetivos de sessões e mídia.
- Para sessão expirada, reconectar pelo painel somente após excluir indisponibilidade de storage.
- Não remover diretórios de sessão como tentativa inicial.
- Conferir disponibilidade do `ffmpeg` dentro da tarefa do backend quando houver erro de conversão.

## Rollback

Siga `.docs/operacao/release-deploy-rollback-swarm.md` e restaure o digest anterior pelo Portainer. `docker stack rm` não é rollback normal; remoções e restaurações exigem confirmação explícita e backup.

## Desenvolvimento local

Somente no ambiente local, `docker compose ps/logs/restart` pode ser usado para Postgres e Redis. Não use esses nomes/comandos como diagnóstico da VPS sem confirmar a topologia.


## Checklists disponíveis

O checklist executável completo está em `../operacao/release-deploy-rollback-swarm.md`.

### Pré-deploy

- [ ] PR aprovado e mergeado na `main`.
- [ ] Workflows GHCR concluídos.
- [ ] Tag, `<sha>` e digest de backend, frontend e label-sync confirmados.
- [ ] Digests anteriores registrados para rollback.
- [ ] Migrations e compatibilidade classificadas.
- [ ] Backup confirmado quando necessário.
- [ ] Nenhum secret ou digest completo copiado para documentação/ticket.

### Atualização no Portainer

- [ ] Editar a definição ativa da stack Taktchat.
- [ ] Atualizar somente as imagens afetadas por digest.
- [ ] Preservar `taktchat_taktchat_private:/app/private`.
- [ ] Preservar `taktchat_taktchat_media:/app/public`.
- [ ] Confirmar que o frontend permanece sem mounts.
- [ ] Revisar o diff e atualizar a stack.
- [ ] Executar migrate quando aplicável.

### Pós-deploy

- [ ] Backend, frontend e label-sync convergiram.
- [ ] Migrate concluiu sem erro, quando acionado.
- [ ] Health da API e frontend aprovados.
- [ ] Login, conversa, mensagem e tempo real testados.
- [ ] Mídia e label-sync testados quando afetados.
- [ ] Logs, filas e recursos observados.

### Rollback

- [ ] Restaurar os digests anteriores no Portainer.
- [ ] Não usar remoção de stack como rollback.
- [ ] Tratar migration separadamente.
- [ ] Repetir health e smoke tests.

### Governança pendente

- [ ] Exportar e versionar a stack ativa sem secrets.
- [ ] Confirmar política de tags, labels OCI e retenção de digests.
- [ ] Manter `14_taktchat.yml` classificado como referência/variante não confirmada.

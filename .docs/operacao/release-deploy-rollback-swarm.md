# Runbook canônico — release, deploy e rollback no Swarm

## Fonte operacional

Produção roda na VPS Contabo em Docker Swarm, administrado pelo Portainer. Os serviços usam imagens GHCR imutáveis por digest. Não há checkout da aplicação nem bind mounts de código no servidor.

Serviços observados:

- `taktchat_taktchat-backend`;
- `taktchat_taktchat-frontend`;
- `taktchat_taktchat-label-sync`;
- `taktchat_taktchat-migrate` (one-shot, normalmente `0/1`).

A definição exibida no Portainer é a fonte operacional atual. `14_taktchat.yml` local é referência/variante não confirmada até a exportação sanitizada da stack.

Nunca registre digests completos ou secrets em documentação pública, chat ou ticket. Use `<digest>` e `<sha>`.

## 1. Commit, PR e merge

- [ ] Mudança revisada e aprovada por PR.
- [ ] Testes e builds aprovados.
- [ ] PR integrado à `main`.
- [ ] SHA alvo registrado como `<sha>`.
- [ ] Migrations identificadas e compatibilidade com a versão anterior avaliada.
- [ ] Backup confirmado quando houver risco de alteração de dados.

## 2. Publicação no GHCR

Após o merge, acompanhe os workflows responsáveis pelas imagens:

- backend: `ghcr.io/zanon-alive/taktchat-backend`;
- frontend: `ghcr.io/zanon-alive/taktchat-frontend`;
- label-sync: variante backend com navegador.

Antes do deploy:

- [ ] workflows concluíram com sucesso;
- [ ] tags apontam para o `<sha>` esperado;
- [ ] arquitetura/plataforma da imagem está correta;
- [ ] digest de cada imagem foi obtido no GHCR;
- [ ] labels OCI, se disponíveis, relacionam imagem e commit;
- [ ] digests atualmente implantados foram registrados em local operacional restrito para rollback.

Não use `latest` como identidade de release. O Portainer deve receber referências por digest, por exemplo `ghcr.io/zanon-alive/taktchat-backend@sha256:<digest>`.

## 3. Atualização da stack no Portainer

1. Acessar **Stacks → taktchat → Editor**.
2. Exportar ou copiar a definição vigente para registro restrito da janela, sem divulgar secrets.
3. Alterar somente as imagens dos serviços afetados para os novos digests.
4. Conferir que:
   - backend mantém `taktchat_taktchat_private:/app/private`;
   - backend mantém `taktchat_taktchat_media:/app/public`;
   - frontend continua sem mounts;
   - PostgreSQL e Redis continuam nas stacks separadas;
   - nenhuma variável ou secret foi removido acidentalmente.
5. Revisar o diff apresentado pelo Portainer.
6. Acionar **Update the stack**.
7. Aguardar convergência dos serviços antes de continuar.

Não aplicar `/root/stacks/14_taktchat.yml`: esse arquivo não existe no servidor auditado.

## 4. Migration

Se a release inclui migration:

1. confirmar backup e compatibilidade;
2. acionar o serviço `taktchat_taktchat-migrate` pelo Portainer;
3. acompanhar tarefa e logs;
4. exigir término sem erro antes da validação funcional.

O estado `0/1` é esperado para um serviço one-shot depois da conclusão. Diferencie conclusão bem-sucedida de falha pelos detalhes da tarefa e logs.

Seeds não fazem parte do release normal. Rollback das imagens não desfaz migration.

## 5. Health e smoke tests

Confirmar no Portainer:

- [ ] backend, frontend e label-sync convergiram;
- [ ] não há tarefas `Rejected`/`Failed` recorrentes;
- [ ] logs não apresentam regressão crítica;
- [ ] conexão com as stacks PostgreSQL e Redis está saudável.

Validar externamente:

```bash
curl --fail --show-error https://api.taktchat.com.br/health
curl --fail --show-error --head https://taktchat.com.br
```

Smoke tests mínimos:

1. autenticar com usuário autorizado;
2. abrir lista e conversa;
3. enviar e receber uma mensagem controlada;
4. validar atualização em tempo real;
5. validar upload/mídia quando afetado;
6. validar label-sync quando afetado;
7. observar filas, CPU, memória, disco e taxa de erros.

## 6. Rollback por digest

Iniciar rollback em indisponibilidade, perda funcional crítica, erro persistente ou degradação sem correção segura na janela.

1. Preservar logs e interromper novas alterações.
2. No editor da stack do Portainer, restaurar os digests anteriores dos serviços afetados.
3. Revisar o diff e atualizar a stack.
4. Aguardar convergência.
5. Repetir health e smoke tests.
6. Registrar o `<sha>` e os pares de digest anterior/novo em local operacional restrito.

Se houve migration incompatível, não improvisar down migration ou restauração. Abrir procedimento específico com backup do estado corrente e confirmação explícita.

`docker stack rm taktchat`, remoção de volumes e restauração sobre produção não são rollback normal.

## 7. Encerramento

- [ ] SHA e digests implantados registrados de forma restrita.
- [ ] Migration, quando aplicável, concluída.
- [ ] Health e smoke tests aprovados.
- [ ] Logs e métricas observados pelo período definido.
- [ ] Resultado e desvios comunicados.

## Lacunas operacionais

- Exportar e versionar a stack ativa sem secrets.
- Confirmar a política de tags e labels OCI das imagens.
- Formalizar retenção dos digests anteriores necessários para rollback.

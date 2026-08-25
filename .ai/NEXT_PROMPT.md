# Taktchat — continuidade de sessão

**Projeto:** Taktchat  
**Repositório:** https://github.com/zanon-alive/taktchat.git  
**Branch atual:** `main`

## Estado

PR [#22](https://github.com/zanon-alive/taktchat/pull/22) mesclado na `main`. Kit v1.7, Kanban e correções de CSS/Socket.IO estão no remoto. PR [#23](https://github.com/zanon-alive/taktchat/pull/23) (documentação v1.8) estava em conflito só em `.ai/NEXT_PROMPT.md` e foi resolvido localmente para merge.

Produção na Contabo usa Docker Swarm/Portainer e imagens GHCR por digest. Não há checkout da aplicação no servidor. Runbook: `.docs/operacao/release-deploy-rollback-swarm.md`.

Este repositório **não** é projeto Telecontrol.

## Validação concluída

- Backend: 59 testes; frontend: 44 testes; builds aprovados.
- Handshake Socket.IO com token em `auth`, não na URL.
- CSS de produção sem diretivas `@tailwind` residuais.
- Documentação alinhada à stack GHCR observada.

## Ainda aberto

1. Publicar na Contabo: workflows GHCR → digests → Update stack no Portainer (agente não executa deploy).
2. Investigar `ERR_INVALID_CREDENTIALS` do login `zanon@taktchat.com.br` (base não foi perdida).
3. Rotacionar `JWT_SECRET` / `JWT_REFRESH_SECRET` na janela de manutenção.
4. Captura real do celular (ainda ilustração de IA).
5. Caminho B (Deal / CRM de mercado).
6. Exportar a stack do Portainer sem secrets.

## Próximo passo

Após o merge do PR 23, atualizar a `main` local e orientar a publicação manual na Contabo.

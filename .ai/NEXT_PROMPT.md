# Taktchat — continuidade de sessão

**Projeto:** Taktchat  
**Repositório:** https://github.com/zanon-alive/taktchat.git  
**Branch atual:** `fix/producao-supabase-ws-node20`

## Encerrado

PR [#24](https://github.com/zanon-alive/taktchat/pull/24): pin automático de digest nas stacks. Validado com `workflow_dispatch` e commit do bot. Portainer aplicou a imagem `b3d853e`.

## Produção

Backend **fora** de propósito até este fix: crash `@supabase/realtime-js` em Node 20 sem `ws`. Sem rollback para a imagem de abril.

## Em andamento

`GetWhatsapp.ts`: `ws` no transport do Realtime + client lazy. Depois: testes, PR, build GHCR, pin, Pull and redeploy.

## Ainda aberto (não desta branch)

Login `ERR_INVALID_CREDENTIALS`; rotacionar JWTs.

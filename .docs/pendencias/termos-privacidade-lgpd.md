# Pendência: revisão de Termos, Privacidade e LGPD

**Status:** aberta (fase 2 — revisão jurídica)  
**Prioridade:** alta (depois do ar no ar)  
**Registrado em:** 2026-08-26  
**Origem:** `feat/landing-conversao`

## O que a branch de conversao entrega (fase 1)

Pagina publica **genérica** em `/lgpd`, para a landing nao subir com link morto. Conteudo informativo (controlador, dados tratados de forma generica, cookies, direitos do titular, contato). Cookie e rodape apontam para essa rota.

Essa pagina **nao** e parecer juridico. Aviso no texto de que os termos serao revisados. Nao afirmar DPO, base legal especifica (ex.: “legitimo interesse no artigo X”) nem prazos de atendimento se isso nao estiver definido na operacao.

## O que continua pendente (fase 2 — esta atividade)

Revisao por responsavel legal, em portugues, de:

- Termos de uso (se virar pagina propria `/termos` ou secao)
- Politica de privacidade (detalhe de bases legais, encarregado, operadores, WhatsApp/Meta)
- LGPD (direitos, prazos, DPO se houver)

Depois: atualizar o HTML de `/lgpd` (e rotas extras se existirem), `funcionalidades/mapa-frontend.md` e o item no `visao-geral/roadmap.md`.

Nao registrar no MCP/Cerebro: a atividade vive **neste repositorio**, em `.docs/`.

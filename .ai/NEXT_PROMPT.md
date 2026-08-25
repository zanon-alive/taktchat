# Taktchat — continuidade de sessão

**Projeto:** Taktchat  
**Repositório:** https://github.com/zanon-alive/taktchat.git  
**Branch atual:** `docs/documentacao-completa-v1.8`

## Estado

Revisão aprovada das seis apresentações **v1.8** implementada no player e nos seis Markdown. Foram incorporados desfecho ao encerrar, relatório `/kanban/stats`, tags pessoais/empty state, cadastro comercial, roteiro de parceiro v1.8 e fluxo técnico de Kanban/`closed`.

Validações focadas concluídas: ESLint do `decks.js`, diagnósticos do editor, contagens player × Markdown, existência das 44 imagens referenciadas, buscas de consistência funcional e `git diff --check` restrito aos documentos alterados.

A documentação de infraestrutura/operação foi corrigida após auditoria ao vivo em 25/08/2026: produção usa Docker Swarm/Portainer e imagens GHCR imutáveis por digest, sem checkout ou bind mounts de código. A definição ativa do Portainer é a fonte operacional; `14_taktchat.yml` local é referência não confirmada. O runbook canônico está em `.docs/operacao/release-deploy-rollback-swarm.md`; a auditoria local está em `.docs/branchs/docs/documentacao-completa-v1.8/02-AUDITORIA-INFRA-OPERACAO.md`.

A revisão funcional v1.8 também foi concluída: inventário em `.docs/branchs/docs/documentacao-completa-v1.8/01-INVENTARIO-FUNCIONALIDADES.md`, mapa real do frontend em `.docs/funcionalidades/mapa-frontend.md`, visão geral/permissões, catálogo 01–09 e 11–13, manuais afetados, README e notas de versão alinhados. Dependências, stubs, órfãos e pendências de segurança foram registrados sem afirmar deploy em produção.

Nenhum commit, merge ou deploy foi feito.

Este repositório **não** é projeto Telecontrol.

## Ainda aberto (não é código desta branch)

1. Captura **real** do celular (print ainda é ilustração de IA e ficou fora da v1.8).
2. Seed **não** vira migration / não vai para a VPS.
3. Caminho B (Deal / CRM de mercado).
4. PR — o usuário decide. Deploy — nunca automático.
5. Exportar/versionar a stack ativa do Portainer sem secrets; confirmar política de tags/labels OCI, retenção de digests e política real de backup/monitoramento.

## Próximo passo

Confirmar com o usuário se a demanda está finalizada. Não commitar, fazer merge, push ou PR sem solicitação explícita.

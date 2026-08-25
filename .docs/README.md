# Documentação do Taktchat

Bem-vindo ao hub oficial de documentação do projeto **Taktchat**. Esta pasta centraliza guias, procedimentos operacionais e referências técnicas para desenvolvimento, implantação e suporte da plataforma.

## Como navegar

- `kit-produto/`: **kit por audiência (v1.8 documental)** — catálogo, manuais por persona, comercial/técnica, screenshots e player privado em `/apresentacoes`. Esta revisão descreve o código e **não confirma deploy em produção**.
- `visao-geral/`: contexto do produto, arquitetura, fluxos críticos e roadmap.
  - **Roadmap centralizado:** `visao-geral/roadmap.md` - Melhorias futuras e funcionalidades pendentes do projeto
- `instalacao/`: requisitos, preparação de ambiente, passo a passo para rodar localmente e via Docker.
- `configuracao/`: variáveis de ambiente, parâmetros sensíveis e políticas de segurança.
- `operacao/`: rotinas diárias, monitoramento, backup/restore e troubleshooting.
  - **Release/deploy/rollback:** `operacao/release-deploy-rollback-swarm.md` — GHCR por digest e atualização da stack no Portainer.
  - **Drift Sequelize / Postgres:** `operacao/recuperacao-migrations-banco.md` — quando `SequelizeMeta` não reflete o schema real.
- `infraestrutura/`: detalhes de banco de dados, cache/filas, stack de produção (Docker Swarm) e integrações externas.
- `funcionalidades/`: guias funcionais por módulo (campanhas, permissões, tags, anti-ban, etc.).
  - **Mapa real de rotas, menu, personas e gates:** `funcionalidades/mapa-frontend.md`
  - **Frontend — assets em `public/` vs imports:** `funcionalidades/frontend-assets-estaticos.md`
  - **Kanban (lanes automáticas):** `funcionalidades/kanban-lanes.md` – Lane de entrada, Encerrar no funil, uma tag por card.
  - **EntrySource e Chat do Site:** `funcionalidades/widget-chat-site.md` – Widget, API e canais de entrada.
- `diagnosticos/`: procedimentos de investigação e correção para cenários recorrentes.
  - **Logs WhatsApp (Baileys):** `diagnosticos/logs-whatsapp-baileys.md` – Erros esperados (decrypt, SessionError, sessões).
- `anexos/`: checklists, templates, roteiros e notas complementares.
- `sql/`: coleção organizada de scripts SQL (diagnósticos, correções e migrações).
- `legacy/`: acervo histórico dos documentos anteriores à reestruturação (somente referência).
- `branchs/`: análises e decisões específicas de cada branch (não versionado).

## Convenções gerais

- Todos os arquivos utilizam Markdown (`.md`) em português e seguem convenções de título com `##`.
- Links internos devem ser relativos, ancorando em `.docs` para facilitar leitura no repositório e no portal.
- Scripts, comandos e env vars devem aparecer dentro de blocos de código e, quando possível, com sistemas operacionais indicados.
- Sempre que atualizar um processo, registre o racional e o histórico em `anexos/notas-de-versao.md`.

## Guias essenciais

### Para desenvolvedores

- **🔄 Atualização do servidor:** `ATUALIZACAO_SERVIDOR.md` - imagens GHCR por digest via Portainer
- **📦 Stack de produção (VPS):** `infraestrutura/stack-producao.md`
- **🏗️ Imagens GHCR atuais:** `infraestrutura/stack-producao-ghcr.md`
- **⚙️ PM2 híbrido (exemplo, não é a VPS):** `infraestrutura/pm2-hibrido.md`

### Para produto, venda e operação por persona

- **Kit por audiência (v1.8 documental):** `kit-produto/README.md` — catálogo, manuais e player privado `/apresentacoes`.

### Para operação

- **🔧 Operação e monitoramento:** `operacao/` - Rotinas diárias, monitoramento, backup/restore e troubleshooting
- **🔍 Diagnósticos:** `diagnosticos/` - Procedimentos para investigação e correção de problemas

## Próximos passos sugeridos

- Mantenha o `README.md` da raiz alinhado a esta estrutura, destacando as entradas principais.
- Antes de implementar novas funcionalidades, atualize o arquivo de análise em `.docs/branchs/<branch>/`.
- **Após fazer merge do PR na branch `main`, sempre consulte `ATUALIZACAO_SERVIDOR.md` para atualizar o servidor de produção.**
- Consulte `diagnosticos/` para reproduzir e solucionar incidentes reportados anteriormente.


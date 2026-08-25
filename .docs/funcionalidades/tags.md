## Tags e automações

### Objetivo

- Classificar tickets, contatos e campanhas para facilitar filtros e automações.
- Permitir disparos dirigidos e segmentação dinâmica.

### Funcionalidades principais

- Criação e edição de tags via painel administrativo.
- Associação manual ou automática durante fluxos de atendimento.
- Regras de automação frontend (ver `legacy/AUTOMACAO_TAGS_FRONTEND.md`).
- Exportação/Importação preservando mapeamento de tags.
- **Lanes Kanban** (`kanban=1`): uma coluna por ticket; lane de entrada e lane ao encerrar configuráveis em Tags Kanban. Ver `kanban-lanes.md`.

### Boas práticas

- Definir convenção de nomenclatura (`categoria:subcategoria`).
- Limitar número de tags por ticket para evitar poluição.
- Utilizar tags de status temporário (ex.: `follow-up`) com processos de limpeza programados.

### Referências

- `TAG_RULES_README.md`
- `AUTOMACAO_TAGS_FRONTEND.md`


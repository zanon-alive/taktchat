# Biblioteca de scripts SQL

Esta pasta reúne scripts auxiliares utilizados para diagnósticos, correções e migrações pontuais no projeto.

## Estrutura

- `diagnosticos/`: consultas que ajudam a identificar inconsistências ou métricas especiais.
- `correcoes/`: scripts que aplicam ajustes nos dados existentes.
- `migracoes/`: scripts de suporte a alterações estruturais que não fazem parte do fluxo automatizado de migrations.

> Scripts necessários em tempo de execução permanecem nos diretórios originais (ex.: `backend/src/database/scripts`). Ao utilizar qualquer arquivo daqui em produção, registre a operação em `.docs/anexos/incidentes.md`.


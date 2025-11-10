## Scripts de suporte a migrações

Scripts auxiliares para ajustes estruturais que não passaram pelo fluxo padrão de migrations.

### Conteúdo

- `fix-whatsappid-column.sql`: adequa o tipo/conteúdo da coluna `whatsappId`.
- `manual-fix-migration.sql`: script manual utilizado em cenários específicos de atualização.

> Sempre que possível, converta ajustes estruturais em migrations TypeScript. Utilize os scripts desta pasta apenas em situações controladas e com registro em `.docs/anexos/incidentes.md`.


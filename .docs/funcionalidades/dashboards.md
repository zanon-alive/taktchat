## Dashboards e relatórios

### Painéis disponíveis

- **Campanhas**: resumo por status, gráficos Recharts, métricas de sucesso (ver `funcionalidades/campanhas.md`).
- **Atendimento**: indicadores de fila, tempo de resposta, distribuição por agente.
- **Memória/Performance**: métricas de consumo de recursos conforme ajustes documentados em `legacy/CORRECAO_MEMORIA_DASHBOARD.md` e `legacy/CORRECOES_FINAIS.md`.

### Boas práticas de uso

- Utilize filtros por período e empresa antes de exportar relatórios.
- Configure atualizações automáticas (socket) para dashboards críticos.
- Validar consistência entre dados do painel e queries no banco (auditoria periódica).

### Evoluções planejadas

- Comparativos históricos (dia, semana, mês).
- Exportações em CSV/Excel direto do painel.
- Widgets customizáveis por usuário.

### Referências

- `legacy/DASHBOARD_CAMPANHAS_FINAL.md`
- `legacy/CORRECAO_MEMORIA_DASHBOARD.md`
- `legacy/CORRECOES_FINAIS.md`


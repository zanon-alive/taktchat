/**
 * Header de listagens HTML alinhado ao tema MUI (claro e escuro).
 * Evita grey[100] + text.secondary, que fica ilegível no dark.
 */
export function listTableHead(theme) {
  return {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.action.hover
        : theme.palette.background.paper,
    "& th": {
      padding: theme.spacing(1.5),
      textAlign: "left",
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${theme.palette.divider}`,
    },
  };
}

/** Linha de listagem legada (Flowbuilder / campanhas de fluxo): papel + acento primary. */
export function legacyListRowSx(theme) {
  return {
    padding: "8px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 2,
    marginTop: 0.5,
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  };
}


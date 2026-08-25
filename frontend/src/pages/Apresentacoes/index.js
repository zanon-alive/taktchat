import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import { DECKS } from "./decks";
import usePermissions from "../../hooks/usePermissions";
import ForbiddenPage from "../../components/ForbiddenPage";

const NAVY = "#0b1f33";
const ACCENT = "#065183";

const styles = {
  root: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${NAVY} 0%, #0e3a5c 55%, ${ACCENT} 100%)`,
    color: "#fff",
    padding: "48px 24px 64px",
    boxSizing: "border-box",
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
  },
  wrap: {
    maxWidth: 1080,
    margin: "0 auto",
  },
  kicker: {
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 8,
  },
  title: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 700,
    margin: "0 0 12px",
  },
  lead: {
    fontSize: 18,
    lineHeight: 1.5,
    opacity: 0.9,
    maxWidth: 640,
    margin: "0 0 36px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    display: "block",
    textDecoration: "none",
    color: "#fff",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: "22px 22px 20px",
    minHeight: 168,
    boxSizing: "border-box",
  },
  cardAudience: {
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.7,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 8px",
    lineHeight: 1.25,
  },
  cardUsage: {
    fontSize: 14,
    lineHeight: 1.45,
    opacity: 0.88,
    margin: "0 0 12px",
  },
  cardMeta: {
    fontSize: 13,
    opacity: 0.65,
  },
  footer: {
    marginTop: 40,
    fontSize: 13,
    opacity: 0.65,
  },
};

const ApresentacoesHub = () => {
  const { canViewKitApresentacoes, loading } = usePermissions();

  useEffect(() => {
    document.title = "Apresentações — Taktchat";
  }, []);

  if (loading) {
    return null;
  }

  if (!canViewKitApresentacoes()) {
    return <ForbiddenPage />;
  }

  return (
    <div style={styles.root}>
      <Helmet>
        <title>Apresentações — Taktchat</title>
      </Helmet>
      <div style={styles.wrap}>
        <div style={styles.kicker}>Kit de produto</div>
        <h1 style={styles.title}>Apresentações</h1>
        <p style={styles.lead}>
          Escolha o deck pelo momento da conversa. Setas do teclado avançam os slides. Onde
          faltar print, a caixa amarela diz o arquivo a gravar.
        </p>
        <div style={styles.grid}>
          {DECKS.map((deck) => (
            <RouterLink
              key={deck.id}
              to={`/apresentacoes/${deck.id}`}
              style={styles.card}
            >
              <div style={styles.cardAudience}>{deck.audience}</div>
              <div style={styles.cardTitle}>{deck.title}</div>
              <p style={styles.cardUsage}>{deck.usage}</p>
              <div style={styles.cardMeta}>
                {deck.size} · {deck.slides.length} slides · {deck.duration}
              </div>
            </RouterLink>
          ))}
        </div>
        <p style={styles.footer}>
          Login obrigatório. Prints saem da API autenticada — não ficam em pasta pública.
          <br />
          <RouterLink to="/" style={{ color: "#fff" }}>
            Voltar ao painel
          </RouterLink>
        </p>
      </div>
    </div>
  );
};

export default ApresentacoesHub;

import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getDeck } from "./decks";
import api from "../../services/api";
import usePermissions from "../../hooks/usePermissions";
import ForbiddenPage from "../../components/ForbiddenPage";

const NAVY = "#071525";
const ACCENT = "#3db4e6";

function SlideMedia({ image, imageCaption, placeholder }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    setBlobUrl(null);
    setFailed(false);

    if (!image) {
      return undefined;
    }

    api
      .get(`/kit-apresentacoes/${encodeURIComponent(image)}`, { responseType: "blob" })
      .then((response) => {
        if (cancelled) return;
        const type = response.data?.type || "";
        if (type && !type.startsWith("image/")) {
          setFailed(true);
          return;
        }
        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  const fileName = image || "print.png";
  const showImage = Boolean(blobUrl);
  const showPlaceholder = Boolean(placeholder) && (failed || !image);

  return (
    <>
      {showImage ? (
        <figure style={mediaStyles.figure}>
          <img src={blobUrl} alt={imageCaption || ""} style={mediaStyles.img} />
          {imageCaption ? <figcaption style={mediaStyles.caption}>{imageCaption}</figcaption> : null}
        </figure>
      ) : null}
      {showPlaceholder || (failed && !placeholder) ? (
        <div style={mediaStyles.todo} role="note">
          <div style={mediaStyles.todoKicker}>{failed ? "Print indisponível" : "Print a gravar"}</div>
          <div style={mediaStyles.todoFile}>{fileName}</div>
          <p style={mediaStyles.todoText}>
            {placeholder || "Arquivo não encontrado no kit privado."}
          </p>
          <p style={mediaStyles.todoHint}>
            Salve o PNG em <code>backend/private/kit-apresentacoes/</code> com este nome.
          </p>
        </div>
      ) : null}
    </>
  );
}

const ApresentacaoDeck = () => {
  const { deckId } = useParams();
  const history = useHistory();
  const { canViewKitApresentacoes, loading } = usePermissions();
  const deck = getDeck(deckId);
  const [index, setIndex] = useState(0);
  const total = deck ? deck.slides.length : 0;
  const slide = deck ? deck.slides[index] : null;

  const go = useCallback(
    (delta) => {
      if (!deck) return;
      setIndex((current) => Math.min(total - 1, Math.max(0, current + delta)));
    },
    [deck, total]
  );

  useEffect(() => {
    setIndex(0);
  }, [deckId]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(-1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        setIndex(total - 1);
      }
      if (event.key === "Escape") {
        history.push("/apresentacoes");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, history, total]);

  if (loading) {
    return null;
  }

  if (!canViewKitApresentacoes()) {
    return <ForbiddenPage />;
  }

  if (!deck || !slide) {
    return (
      <div style={layout.root}>
        <p>Deck não encontrado.</p>
        <RouterLink to="/apresentacoes" style={layout.back}>
          Voltar
        </RouterLink>
      </div>
    );
  }

  return (
    <div style={layout.root}>
      <Helmet>
        <title>
          {deck.title} ({deck.size}) — Taktchat
        </title>
      </Helmet>

      <header style={layout.top}>
        <RouterLink to="/apresentacoes" style={layout.back}>
          ← Decks
        </RouterLink>
        <RouterLink to="/" style={layout.back}>
          Painel
        </RouterLink>
        <div style={layout.meta}>
          {deck.audience} · {deck.size}
        </div>
        <div style={layout.counter}>
          {index + 1} / {total}
        </div>
      </header>

      <main style={layout.stage}>
        <section style={layout.slide}>
          <style>{`
            .kit-slide-grid { display: grid; gap: 28px; align-items: start; }
            @media (min-width: 960px) {
              .kit-slide-grid { grid-template-columns: minmax(280px, 1.15fr) minmax(260px, 0.95fr); }
            }
          `}</style>
          <div className="kit-slide-grid">
            <div>
              {slide.kicker ? <div style={layout.kicker}>{slide.kicker}</div> : null}
              <h1 style={layout.title}>{slide.title}</h1>
              {slide.lead ? <p style={layout.lead}>{slide.lead}</p> : null}
              <ul style={layout.bullets}>
                {slide.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <SlideMedia
              image={slide.image}
              imageCaption={slide.imageCaption}
              placeholder={slide.placeholder}
            />
          </div>
        </section>
      </main>

      <footer style={layout.bottom}>
        <button type="button" style={layout.navBtn} onClick={() => go(-1)} disabled={index === 0}>
          Anterior
        </button>
        <div style={layout.dots}>
          {deck.slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir ao slide ${i + 1}`}
              onClick={() => setIndex(i)}
              style={{
                ...layout.dot,
                background: i === index ? ACCENT : "rgba(255,255,255,0.28)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          style={layout.navBtn}
          onClick={() => go(1)}
          disabled={index === total - 1}
        >
          Próximo
        </button>
      </footer>
    </div>
  );
};

const layout = {
  root: {
    minHeight: "100vh",
    background: NAVY,
    color: "#f4f7fb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 20px",
    fontSize: 13,
    opacity: 0.9,
  },
  back: {
    color: ACCENT,
    textDecoration: "none",
    fontWeight: 600,
  },
  meta: {
    flex: 1,
    textAlign: "center",
    opacity: 0.75,
  },
  counter: {
    minWidth: 72,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  stage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 24px 12px",
  },
  slide: {
    width: "min(1180px, 100%)",
    background: "#0d2438",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "36px 40px 28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
    maxHeight: "calc(100vh - 120px)",
    overflow: "auto",
  },
  kicker: {
    color: ACCENT,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 10,
  },
  title: {
    margin: "0 0 12px",
    fontSize: "clamp(26px, 3.6vw, 40px)",
    lineHeight: 1.15,
  },
  lead: {
    margin: "0 0 16px",
    fontSize: "clamp(15px, 1.45vw, 18px)",
    lineHeight: 1.5,
    opacity: 0.92,
    color: "#d7e6f2",
  },
  bullets: {
    margin: "0",
    paddingLeft: 22,
    fontSize: "clamp(14px, 1.35vw, 17px)",
    lineHeight: 1.45,
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 20px 16px",
  },
  navBtn: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 14,
  },
  dots: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    maxWidth: "60%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: 0,
    padding: 0,
    cursor: "pointer",
  },
};

const mediaStyles = {
  figure: {
    margin: 0,
  },
  img: {
    display: "block",
    width: "100%",
    maxHeight: "min(52vh, 420px)",
    objectFit: "contain",
    background: "#050d16",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  caption: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.7,
  },
  todo: {
    background: "linear-gradient(180deg, #3a2f12 0%, #2a2414 100%)",
    border: "2px dashed #e6c35c",
    borderRadius: 14,
    padding: "20px 22px",
    color: "#ffe9a8",
  },
  todoKicker: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 6,
    opacity: 0.85,
  },
  todoFile: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff6d0",
    marginBottom: 10,
  },
  todoText: {
    margin: "0 0 10px",
    fontSize: 16,
    lineHeight: 1.45,
    color: "#fff",
  },
  todoHint: {
    margin: 0,
    fontSize: 13,
    opacity: 0.8,
  },
};

export default ApresentacaoDeck;

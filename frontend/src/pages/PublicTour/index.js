import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Box, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatWidget from "../landing-shared/ChatWidget";
import { getSupportWhatsAppUrl } from "../landing-shared/supportWhatsApp";
import {
  LANDING_FAQ_PATH,
  LANDING_PATH,
  LANDING_PLANS_PATH,
  parseTourSlideParam,
  tourSearchForIndex,
  tourSlides,
  TOUR_OG_DESCRIPTION,
  TOUR_OG_IMAGE,
  TOUR_OG_TITLE,
  TOUR_PATH,
} from "./slides";

const SWIPE_PX = 50;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    minHeight: "100vh",
    maxHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #1e293b 100%)",
    color: "#ffffff",
  },
  header: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5, 2),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(1.5, 4),
    },
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  logo: {
    height: 36,
    cursor: "pointer",
    display: "block",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  backButton: {
    "&&": {
      textTransform: "none",
      fontWeight: 700,
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  loginButton: {
    "&&": {
      textTransform: "none",
      fontWeight: 600,
      color: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.7)",
      "&:hover": {
        borderColor: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  stage: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1, 2, 2),
    touchAction: "manipulation",
    [theme.breakpoints.down("sm")]: {
      alignItems: "flex-start",
      paddingTop: theme.spacing(0.5),
    },
  },
  slide: {
    width: "min(1100px, 100%)",
    maxHeight: "100%",
    overflow: "auto",
  },
  kicker: {
    margin: 0,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.75rem",
    opacity: 0.8,
    fontWeight: 700,
  },
  title: {
    margin: "8px 0 12px",
    fontWeight: 800,
    fontSize: "clamp(1.45rem, 3.6vw, 2.35rem)",
    lineHeight: 1.15,
  },
  lead: {
    margin: "0 0 16px",
    fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
    lineHeight: 1.5,
    opacity: 0.95,
    maxWidth: 720,
  },
  audience: {
    margin: "0 0 12px",
    fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
    lineHeight: 1.5,
    opacity: 0.92,
    maxWidth: 720,
  },
  oneLiner: {
    margin: "0 0 20px",
    fontSize: "clamp(1rem, 2vw, 1.2rem)",
    fontWeight: 700,
    lineHeight: 1.4,
    maxWidth: 720,
  },
  grid: {
    display: "grid",
    gap: theme.spacing(2.5),
    alignItems: "start",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "minmax(220px, 0.85fr) minmax(260px, 1.15fr)",
    },
  },
  pains: {
    display: "grid",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  pain: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: theme.spacing(2),
  },
  painTitle: {
    margin: "0 0 8px",
    fontWeight: 700,
    fontSize: "1.05rem",
  },
  painText: {
    margin: 0,
    opacity: 0.9,
    lineHeight: 1.45,
  },
  shot: {
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "#0f172a",
    lineHeight: 0,
    width: "100%",
  },
  img: {
    display: "block",
    width: "100%",
    height: "auto",
    maxHeight: "min(52vh, 480px)",
    objectFit: "contain",
    objectPosition: "top left",
    [theme.breakpoints.down("sm")]: {
      maxHeight: "38vh",
    },
  },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  ctaButton: {
    "&&": {
      textTransform: "none",
      fontWeight: 700,
      backgroundColor: "#25D366",
      color: "#ffffff",
      padding: theme.spacing(1.5, 4),
      borderRadius: 12,
      fontSize: "1.05rem",
      "&:hover": {
        backgroundColor: "#20BA5A",
      },
    },
  },
  secondaryCta: {
    "&&": {
      textTransform: "none",
      fontWeight: 700,
      color: "#ffffff",
      borderColor: "rgba(255,255,255,0.85)",
      padding: theme.spacing(1.5, 4),
      borderRadius: 12,
      fontSize: "1.05rem",
      "&:hover": {
        borderColor: "#ffffff",
        backgroundColor: "rgba(255,255,255,0.1)",
      },
    },
  },
  whatsappFab: {
    bottom: theme.spacing(11),
    [theme.breakpoints.down("md")]: {
      bottom: theme.spacing(16),
    },
  },
  footer: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2, 2.5),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(1.5, 4, 3),
    },
  },
  footerNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  footerShortcuts: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  meta: {
    fontVariantNumeric: "tabular-nums",
    opacity: 0.85,
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  navBtn: {
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.35)",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    "&.Mui-disabled": {
      color: "rgba(255,255,255,0.35)",
      borderColor: "rgba(255,255,255,0.15)",
    },
  },
}));

const PublicTour = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const history = useHistory();
  const location = useLocation();
  const total = tourSlides.length;
  const [index, setIndex] = useState(() => parseTourSlideParam(location.search, total));
  const touchStartX = useRef(null);

  const goTo = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      history.replace({ pathname: TOUR_PATH, search: tourSearchForIndex(clamped) });
    },
    [history, total]
  );

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      history.push(LANDING_PATH);
      return;
    }
    goTo(index + 1);
  }, [goTo, history, index, total]);

  useEffect(() => {
    const fromUrl = parseTourSlideParam(location.search, total);
    setIndex((current) => (current === fromUrl ? current : fromUrl));
  }, [location.search, total]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        history.push(LANDING_PATH);
        return;
      }
      if (event.key === "ArrowRight") {
        goNext();
      } else if (event.key === "ArrowLeft") {
        goTo(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goTo, history, index]);

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) {
      return;
    }
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta <= -SWIPE_PX) {
      goNext();
    } else if (delta >= SWIPE_PX) {
      goTo(index - 1);
    }
  };

  const slide = tourSlides[index];

  return (
    <>
      <Helmet>
        <html lang="pt-BR" />
        <title>{TOUR_OG_TITLE}</title>
        <meta name="description" content={TOUR_OG_DESCRIPTION} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://taktchat.com.br/landing" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://taktchat.com.br/tour" />
        <meta property="og:title" content={TOUR_OG_TITLE} />
        <meta property="og:description" content={TOUR_OG_DESCRIPTION} />
        <meta property="og:image" content={TOUR_OG_IMAGE} />
        <meta property="og:site_name" content="TaktChat" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TOUR_OG_TITLE} />
        <meta name="twitter:description" content={TOUR_OG_DESCRIPTION} />
        <meta name="twitter:image" content={TOUR_OG_IMAGE} />
        <meta name="theme-color" content="#1E3A8A" />
      </Helmet>
      <Box className={classes.root}>
        <header className={classes.header}>
          <Box className={classes.headerLeft}>
            <RouterLink to={LANDING_PATH} aria-label="TaktChat — ir para a landing">
              <img src="/logo_quadrado.png" alt="TaktChat" className={classes.logo} />
            </RouterLink>
            <Button
              color="inherit"
              className={classes.backButton}
              component={RouterLink}
              to={LANDING_PATH}
            >
              Voltar
            </Button>
          </Box>
          <Box className={classes.headerRight}>
            {!isMobile ? (
              <>
                <Button
                  color="inherit"
                  className={classes.backButton}
                  component={RouterLink}
                  to={LANDING_PLANS_PATH}
                >
                  Planos
                </Button>
                <Button
                  color="inherit"
                  className={classes.backButton}
                  component={RouterLink}
                  to={LANDING_FAQ_PATH}
                >
                  FAQ
                </Button>
              </>
            ) : null}
            <Button
              variant="outlined"
              color="inherit"
              className={classes.loginButton}
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          </Box>
        </header>

        <Box
          className={classes.stage}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <section className={classes.slide} aria-live="polite">
            <p className={classes.kicker}>Tour do produto</p>
            {slide.image ? (
              <div className={classes.grid}>
                <div>
                  <h1 className={classes.title}>{slide.title}</h1>
                  <p className={classes.lead}>{slide.lead}</p>
                </div>
                <div className={classes.shot}>
                  <img src={slide.image} alt={slide.imageAlt} className={classes.img} />
                </div>
              </div>
            ) : (
              <>
                <h1 className={classes.title}>{slide.title}</h1>
                <p className={classes.lead}>{slide.lead}</p>
                {slide.audience ? <p className={classes.audience}>{slide.audience}</p> : null}
                {slide.oneLiner ? <p className={classes.oneLiner}>{slide.oneLiner}</p> : null}
                {slide.pains ? (
                  <div className={classes.pains}>
                    {slide.pains.map((pain) => (
                      <div className={classes.pain} key={pain.title}>
                        <p className={classes.painTitle}>{pain.title}</p>
                        <p className={classes.painText}>{pain.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {slide.ctaTo ? (
                  <Box className={classes.ctaRow}>
                    <Button
                      className={classes.ctaButton}
                      component="a"
                      href={getSupportWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<WhatsAppIcon />}
                    >
                      Falar no WhatsApp
                    </Button>
                    <Button
                      className={classes.secondaryCta}
                      variant="outlined"
                      color="inherit"
                      component={RouterLink}
                      to={slide.ctaTo}
                    >
                      {slide.ctaLabel}
                    </Button>
                  </Box>
                ) : null}
              </>
            )}
          </section>
        </Box>

        <footer className={classes.footer}>
          <Box className={classes.footerNav}>
            <IconButton
              className={classes.navBtn}
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Slide anterior"
            >
              <ChevronLeftIcon />
            </IconButton>
            <span className={classes.meta}>
              {index + 1} / {total} · ±1 min
            </span>
            {index >= total - 1 ? (
              <IconButton
                className={classes.navBtn}
                component={RouterLink}
                to={LANDING_PATH}
                aria-label="Ir para a landing"
              >
                <ChevronRightIcon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.navBtn}
                onClick={goNext}
                aria-label="Próximo slide"
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </Box>
          {isMobile ? (
            <Box className={classes.footerShortcuts}>
              <Button
                color="inherit"
                className={classes.backButton}
                component={RouterLink}
                to={LANDING_PLANS_PATH}
              >
                Planos
              </Button>
              <Button
                color="inherit"
                className={classes.backButton}
                component={RouterLink}
                to={LANDING_FAQ_PATH}
              >
                FAQ
              </Button>
            </Box>
          ) : null}
        </footer>
        <ChatWidget className={classes.whatsappFab} />
      </Box>
    </>
  );
};

export default PublicTour;

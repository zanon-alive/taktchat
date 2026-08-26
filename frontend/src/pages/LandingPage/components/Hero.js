import React from "react";
import { makeStyles } from "@mui/styles";
import { Container, Button, Box, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const useStyles = makeStyles((theme) => ({
  hero: {
    minHeight: "auto",
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
    padding: theme.spacing(5, 0, 6),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    padding: theme.spacing(2, 0),
  },
  title: {
    margin: 0,
    fontWeight: 800,
    marginBottom: theme.spacing(3),
    fontSize: "2.75rem",
    lineHeight: 1.15,
    color: "#ffffff",
    [theme.breakpoints.down("md")]: {
      fontSize: "2.6rem",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.1rem",
      textAlign: "center",
    },
  },
  subtitle: {
    margin: 0,
    fontSize: "1.35rem",
    marginBottom: theme.spacing(2),
    opacity: 0.95,
    maxWidth: "560px",
    lineHeight: 1.6,
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.1rem",
      textAlign: "center",
      margin: "0 auto",
      marginBottom: theme.spacing(2),
    },
  },
  pitch: {
    margin: 0,
    fontSize: "1.1rem",
    marginBottom: theme.spacing(4),
    opacity: 0.95,
    maxWidth: "560px",
    lineHeight: 1.5,
    fontWeight: 600,
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
      textAlign: "center",
      margin: "0 auto",
      marginBottom: theme.spacing(3),
    },
  },
  ctaButton: {
    padding: theme.spacing(1.5, 5),
    fontSize: "1.1rem",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 700,
    background: "linear-gradient(45deg, #25D366 30%, #128C7E 90%)",
    color: "#ffffff",
    boxShadow: "0 4px 14px 0 rgba(0,0,0,0.25)",
    "&:hover": {
      background: "linear-gradient(45deg, #20BA5A 30%, #0E7A6E 90%)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  screenshotWrap: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "#0f172a",
    lineHeight: 0,
  },
  screenshot: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "contain",
    objectPosition: "top center",
  },
  caption: {
    margin: 0,
    marginTop: theme.spacing(1.5),
    fontSize: "0.9rem",
    opacity: 0.85,
    textAlign: "center",
  },
  ctaContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  secondaryCta: {
    padding: theme.spacing(1.5, 4),
    fontSize: "1.1rem",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 700,
    color: "#ffffff",
    borderColor: "rgba(255,255,255,0.85)",
    "&:hover": {
      borderColor: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));

const Hero = ({ ctaTargetId = "lead-form" }) => {
  const classes = useStyles();

  const scrollToCta = () => {
    const formElement = document.getElementById(ctaTargetId);
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box className={classes.hero} id="inicio">
      <Container className={classes.heroContent}>
        <Grid container spacing={6} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <h1 className={classes.title}>
              Atendimento no WhatsApp, no mesmo lugar
            </h1>
            <p className={classes.subtitle}>
              Centralize conversas, organize a equipe e automatize o que se repetir — com a tela real do produto, não um mockup genérico.
            </p>
            <p className={classes.pitch}>
              O cliente continua no WhatsApp dele. A empresa ganha fila, dono e histórico.
            </p>
            <Box className={classes.ctaContainer}>
              <Button
                className={classes.ctaButton}
                startIcon={<WhatsAppIcon />}
                onClick={scrollToCta}
                size="large"
                aria-label="Começar agora"
              >
                Começar agora
              </Button>
              <Button
                className={classes.secondaryCta}
                variant="outlined"
                component={RouterLink}
                to="/tour"
                size="large"
              >
                Ver em 1 min
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.screenshotWrap}>
              <img
                src="/landing/f3-atendente-chat-maria.png"
                alt="Tela de atendimento do TaktChat: conversa no WhatsApp com a fila de tickets ao lado"
                className={classes.screenshot}
              />
            </Box>
            <p className={classes.caption}>
              Print do produto: chat e tickets na mesma tela
            </p>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;

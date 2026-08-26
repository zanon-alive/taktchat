import React from "react";
import { makeStyles } from "@mui/styles";
import { Container, Typography, Button, Box, Grid } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const useStyles = makeStyles((theme) => ({
  hero: {
    minHeight: "88vh",
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      minHeight: "auto",
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    padding: theme.spacing(4, 0),
  },
  title: {
    fontWeight: 800,
    marginBottom: theme.spacing(3),
    fontSize: "3.25rem",
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
    fontSize: "1.35rem",
    marginBottom: theme.spacing(4),
    opacity: 0.95,
    maxWidth: "560px",
    lineHeight: 1.6,
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.1rem",
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
    maxHeight: "68vh",
  },
  screenshot: {
    display: "block",
    width: "100%",
    height: "auto",
    maxHeight: "68vh",
    objectFit: "cover",
    objectPosition: "top left",
  },
  caption: {
    marginTop: theme.spacing(1.5),
    fontSize: "0.9rem",
    opacity: 0.85,
    textAlign: "center",
  },
  ctaContainer: {
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      justifyContent: "center",
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
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h1" className={classes.title}>
              Atendimento no WhatsApp, no mesmo lugar
            </Typography>
            <Typography variant="h2" className={classes.subtitle}>
              Centralize conversas, organize a equipe e automatize o que se repetir — com a tela real do produto, não um mockup genérico.
            </Typography>
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
            <Typography className={classes.caption}>
              Print do produto: chat e tickets na mesma tela
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;

import React from "react";
import { makeStyles } from "@mui/styles";
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import HubIcon from "@mui/icons-material/Hub";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TimerIcon from "@mui/icons-material/Timer";
import { i18n } from "../../../translate/i18n";
import useScrollAnimation from "../../../hooks/useScrollAnimation";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)",
    padding: theme.spacing(8, 0),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0),
    },
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    textAlign: "center",
    color: "#1E3A8A",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.75rem",
    },
  },
  card: {
    height: "100%",
    padding: theme.spacing(3),
    transition: "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.6s ease",
    opacity: 0,
    transform: "translateY(20px)",
    "&.visible": {
      opacity: 1,
      transform: "translateY(0)",
    },
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[8],
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2),
    },
  },
  cardIcon: {
    fontSize: "3rem",
    color: "#1E3A8A",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      fontSize: "2.5rem",
    },
  },
  cardTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: "#1E3A8A",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.1rem",
    },
  },
  cardDescription: {
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.9rem",
    },
  },
  easeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    backgroundColor: "#25D366",
    color: "#ffffff",
    borderRadius: "50px",
    fontWeight: 700,
    fontSize: "1.1rem",
    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1.5, 2),
      fontSize: "0.95rem",
    },
  },
  easeBadgeIcon: {
    fontSize: "1.5rem",
  },
  socialProof: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.9rem",
    },
  },
  ctaButton: {
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    borderRadius: "50px",
  },
}));

const pillars = [
  {
    icon: <SecurityIcon aria-hidden="true" />,
    titleKey: "valueProposition.pillars.blindagemAtendimento.title",
    descriptionKey: "valueProposition.pillars.blindagemAtendimento.description",
  },
  {
    icon: <HubIcon aria-hidden="true" />,
    titleKey: "valueProposition.pillars.omnicanalidadeInteligente.title",
    descriptionKey: "valueProposition.pillars.omnicanalidadeInteligente.description",
  },
  {
    icon: <TrendingUpIcon aria-hidden="true" />,
    titleKey: "valueProposition.pillars.motorCrescimento.title",
    descriptionKey: "valueProposition.pillars.motorCrescimento.description",
  },
  {
    icon: <AssessmentIcon aria-hidden="true" />,
    titleKey: "valueProposition.pillars.inteligenciaDados.title",
    descriptionKey: "valueProposition.pillars.inteligenciaDados.description",
  },
];

const ValueProposition = () => {
  const classes = useStyles();
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 });

  const scrollToForm = () => {
    const formElement = document.getElementById("lead-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      component="section"
      className={classes.root}
      aria-labelledby="value-prop-headline"
    >
      <Typography
        id="value-prop-headline"
        variant="h2"
        className={classes.sectionTitle}
      >
        {i18n.t("valueProposition.headline")}
      </Typography>

      <Grid container spacing={4} ref={sectionRef}>
        {pillars.map((pillar, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              className={`${classes.card} ${isSectionVisible ? "visible" : ""}`}
              variant="outlined"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <CardContent>
                <Box className={classes.cardIcon}>{pillar.icon}</Box>
                <Typography variant="h5" component="h3" className={classes.cardTitle}>
                  {i18n.t(pillar.titleKey)}
                </Typography>
                <Typography variant="body1" className={classes.cardDescription}>
                  {i18n.t(pillar.descriptionKey)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center">
        <Box className={classes.easeBadge}>
          <TimerIcon className={classes.easeBadgeIcon} aria-hidden="true" />
          {i18n.t("valueProposition.easeBadge")}
        </Box>
      </Box>

      <Typography variant="body2" className={classes.socialProof}>
        {i18n.t("valueProposition.socialProof")}
      </Typography>

      <Box display="flex" justifyContent="center">
        <Button
          variant="outlined"
          color="primary"
          className={classes.ctaButton}
          onClick={scrollToForm}
        >
          {i18n.t("valueProposition.ctaLabel")}
        </Button>
      </Box>
    </Box>
  );
};

export default ValueProposition;

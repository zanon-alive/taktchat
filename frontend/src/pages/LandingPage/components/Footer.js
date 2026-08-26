import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Container, Typography, Box, Grid, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import RevendedorDialog from "../../landing-shared/RevendedorDialog";

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    padding: theme.spacing(6, 0, 3),
    marginTop: theme.spacing(4),
  },
  footerContent: {
    marginBottom: theme.spacing(4),
  },
  footerSection: {
    marginBottom: theme.spacing(3),
  },
  footerTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    fontSize: "1.1rem",
  },
  footerLink: {
    display: "block",
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none",
    marginBottom: theme.spacing(1),
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    font: "inherit",
    textAlign: "left",
    "&:hover": {
      color: "#ffffff",
      textDecoration: "underline",
    },
  },
  footerCopyright: {
    paddingTop: theme.spacing(3),
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.6)",
  },
}));

const Footer = () => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();
  const [resellerOpen, setResellerOpen] = useState(false);

  return (
    <Box component="footer" className={classes.footer}>
      <Container>
        <Grid container spacing={4} className={classes.footerContent}>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.footerSection}>
              <Typography variant="h6" className={classes.footerTitle}>
                TaktChat
              </Typography>
              <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Plataforma de atendimento e campanhas via WhatsApp.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.footerSection}>
              <Typography variant="h6" className={classes.footerTitle}>
                Produto
              </Typography>
              <Link href="#features" className={classes.footerLink}>
                Funcionalidades
              </Link>
              <Link component={RouterLink} to="/tour" className={classes.footerLink}>
                Tour do produto
              </Link>
              <Link href="#planos" className={classes.footerLink}>
                Planos
              </Link>
              <Link href="#faq" className={classes.footerLink}>
                FAQ
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.footerSection}>
              <Typography variant="h6" className={classes.footerTitle}>
                Acesso
              </Typography>
              <Link component={RouterLink} to="/login" className={classes.footerLink}>
                Login
              </Link>
              <Link component={RouterLink} to="/docs" className={classes.footerLink}>
                Documentação
              </Link>
              <Link
                component="button"
                type="button"
                className={classes.footerLink}
                onClick={() => setResellerOpen(true)}
              >
                Seja revendedor
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.footerSection}>
              <Typography variant="h6" className={classes.footerTitle}>
                Legal
              </Typography>
              <Link component={RouterLink} to="/lgpd" className={classes.footerLink}>
                Privacidade e LGPD
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Box className={classes.footerCopyright}>
          <Typography variant="body2">
            © {currentYear} TaktChat. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
      <RevendedorDialog open={resellerOpen} onClose={() => setResellerOpen(false)} />
    </Box>
  );
};

export default Footer;

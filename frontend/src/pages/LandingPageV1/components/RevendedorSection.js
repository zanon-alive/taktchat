import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Container, Grid, Typography, Button } from "@mui/material";
import PartnerIcon from "@mui/icons-material/Handshake";
import RevendedorDialog from "../../landing-shared/RevendedorDialog";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(10, 0),
    background: "linear-gradient(135deg, #065183 0%, #0a7ab8 100%)",
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0),
    },
  },
  title: {
    fontWeight: 700,
    fontSize: "2rem",
    marginBottom: theme.spacing(2),
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
  subtitle: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: theme.spacing(3),
  },
  ctaColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start",
    },
  },
  ctaButton: {
    padding: theme.spacing(2, 4),
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: "#ffffff",
    color: theme.palette.primary.main,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
    },
  },
}));

const RevendedorSection = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box id="revendedor" className={classes.section}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" className={classes.title}>
                Seja um revendedor <strong>TaktChat</strong>
              </Typography>
              <Typography className={classes.subtitle}>
                O TaktChat oferece programas de parceria para revendedores. Escolha o que combina com você e garanta sua comissão.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} className={classes.ctaColumn}>
              <Button
                variant="contained"
                className={classes.ctaButton}
                startIcon={<PartnerIcon />}
                onClick={() => setOpen(true)}
                size="large"
              >
                Seja um parceiro TaktChat
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <RevendedorDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default RevendedorSection;

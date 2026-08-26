import React from "react";
import { makeStyles } from "@mui/styles";
import { Container, Typography, Box, Grid } from "@mui/material";

const shots = [
  {
    src: "/landing/f2-atendente-tickets-lista.png",
    alt: "Lista de tickets do TaktChat com conversas em andamento",
    caption: "Fila de tickets",
  },
  {
    src: "/landing/pendente-kanban.png",
    alt: "Kanban de atendimento do TaktChat",
    caption: "Kanban do atendimento",
  },
  {
    src: "/landing/pendente-flow-builder.png",
    alt: "Construtor de fluxos de automação do TaktChat",
    caption: "Fluxos de automação",
  },
];

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(8, 0),
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    marginBottom: theme.spacing(1),
    color: "#1E3A8A",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: theme.spacing(5),
    color: theme.palette.text.secondary,
  },
  frame: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    backgroundColor: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  img: {
    display: "block",
    width: "100%",
    height: "auto",
  },
  caption: {
    marginTop: theme.spacing(1.5),
    textAlign: "center",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const ProductGallery = () => {
  const classes = useStyles();

  return (
    <Box id="produto" className={classes.section}>
      <Container>
        <Typography variant="h3" className={classes.title}>
          O produto, como ele é
        </Typography>
        <Typography className={classes.subtitle}>
          Telas reais do TaktChat — atendimento, kanban e automação.
        </Typography>
        <Grid container spacing={4}>
          {shots.map((shot) => (
            <Grid item xs={12} md={4} key={shot.src}>
              <Box className={classes.frame}>
                <img src={shot.src} alt={shot.alt} className={classes.img} />
              </Box>
              <Typography className={classes.caption}>{shot.caption}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductGallery;

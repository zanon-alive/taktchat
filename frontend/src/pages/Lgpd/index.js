import React from "react";
import { makeStyles } from "@mui/styles";
import { Container, Typography, Box, Button, Alert } from "@mui/material";
import { Helmet } from "react-helmet";
import { Link as RouterLink } from "react-router-dom";
import CookieBanner from "../landing-shared/CookieBanner";
import { getNumberSupport } from "../../config";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: theme.spacing(6, 0, 10),
  },
  paper: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: theme.spacing(4),
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  title: {
    fontWeight: 800,
    color: "#1E3A8A",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 700,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1.5),
  },
  paragraph: {
    marginBottom: theme.spacing(2),
    lineHeight: 1.7,
    color: theme.palette.text.secondary,
  },
  actions: {
    marginTop: theme.spacing(4),
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
}));

const LgpdPage = () => {
  const classes = useStyles();
  const supportNumber = getNumberSupport() || "5514996870843";
  const waLink = `https://wa.me/${supportNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Olá! Gostaria de falar sobre privacidade e dados no TaktChat."
  )}`;

  return (
    <>
      <Helmet>
        <html lang="pt-BR" />
        <title>Privacidade e LGPD — TaktChat</title>
        <meta
          name="description"
          content="Informações gerais sobre privacidade, cookies e direitos do titular no TaktChat. Texto em revisão."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://taktchat.com.br/lgpd" />
      </Helmet>
      <Box className={classes.root}>
        <Container maxWidth="md">
          <Box className={classes.paper}>
            <Typography variant="h3" component="h1" className={classes.title}>
              Privacidade, cookies e LGPD
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Este texto é informativo e <strong>será revisado</strong> com apoio jurídico.
              Não substitui uma política de privacidade definitiva nem um parecer legal.
            </Alert>

            <Typography className={classes.paragraph}>
              O TaktChat (taktchat.com.br) é uma plataforma de atendimento via WhatsApp.
              Esta página descreve, de forma genérica, como tratamos dados quando você
              visita o site público, envia um lead ou usa cookies.
            </Typography>

            <Typography variant="h5" className={classes.sectionTitle}>
              Quem controla os dados
            </Typography>
            <Typography className={classes.paragraph}>
              O controlador dos dados coletados neste site público é o TaktChat, no domínio
              taktchat.com.br. Para falar sobre o tema, use o WhatsApp de contato abaixo.
            </Typography>

            <Typography variant="h5" className={classes.sectionTitle}>
              Quais dados podemos tratar
            </Typography>
            <Typography className={classes.paragraph}>
              No site de vendas, podemos receber dados que você envia nos formulários
              (por exemplo nome, e-mail, telefone e mensagem) para responder a um pedido
              de contato, cadastro ou parceria. Também podemos registrar dados técnicos
              de navegação (como página visitada e identificadores de cookie) para
              manter o site funcionando e lembrar sua escolha de cookies.
            </Typography>
            <Typography className={classes.paragraph}>
              Se você passa a usar o sistema como cliente, outros dados de atendimento
              (conversas, contatos da sua operação) são tratados no contexto do contrato
              e das configurações da sua empresa. Esta página não detalha esse tratamento
              operacional.
            </Typography>

            <Typography variant="h5" className={classes.sectionTitle}>
              Cookies
            </Typography>
            <Typography className={classes.paragraph}>
              Usamos cookies para lembrar se você aceitou ou recusou o banner de
              consentimento e, quando aplicável, para melhorar a experiência de
              navegação. Você pode recusar cookies não essenciais pelo banner ou
              limpar cookies no seu navegador.
            </Typography>

            <Typography variant="h5" className={classes.sectionTitle}>
              Direitos do titular
            </Typography>
            <Typography className={classes.paragraph}>
              Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode solicitar
              informações sobre os dados que tratamos, correção, anonimização ou
              exclusão quando couber, e oposição a tratamentos em hipóteses legais.
              Para exercer esses direitos, entre em contato pelos canais abaixo.
              Prazos e procedimentos detalhados serão definidos na revisão jurídica
              desta política.
            </Typography>

            <Typography variant="h5" className={classes.sectionTitle}>
              Contato
            </Typography>
            <Typography className={classes.paragraph}>
              WhatsApp:{" "}
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                {supportNumber}
              </a>
            </Typography>
            <Typography className={classes.paragraph}>
              Site:{" "}
              <a href="https://taktchat.com.br/landing">https://taktchat.com.br/landing</a>
            </Typography>

            <Box className={classes.actions}>
              <Button component={RouterLink} to="/landing" variant="contained" color="primary">
                Voltar à página inicial
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined">
                Login
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <CookieBanner />
    </>
  );
};

export default LgpdPage;

import React from "react";
import CookieConsent from "react-cookie-consent";
import { makeStyles } from "@mui/styles";
import { Typography, Link } from "@mui/material";
import "./CookieBanner.css";

const useStyles = makeStyles((theme) => ({
    content: {
        flex: "1 1 auto",
        marginRight: "16px",
        [theme.breakpoints.down("sm")]: {
            marginRight: 0,
            marginBottom: "16px",
            textAlign: "center",
        },
    },
    text: {
        fontSize: "0.9rem",
        lineHeight: 1.5,
    },
    link: {
        color: "#4fc3f7",
        textDecoration: "underline",
        cursor: "pointer",
        "&:hover": {
            color: "#81d4fa",
        },
    },
}));

const CookieBanner = () => {
    const classes = useStyles();

    return (
        <CookieConsent
            location="bottom"
            buttonText="Aceitar todos"
            declineButtonText="Recusar"
            enableDeclineButton
            cookieName="taktchat_cookie_consent"
            containerClasses="taktchat-cookie-banner"
            contentClasses={classes.content}
            buttonClasses="taktchat-cookie-accept"
            declineButtonClasses="taktchat-cookie-decline"
            expires={150}
        >
            <Typography variant="body2" className={classes.text}>
                Nós usamos cookies para melhorar sua experiência de navegação e analisar o tráfego do site.
                Ao clicar em "Aceitar todos", você concorda com o uso de cookies conforme nossa{" "}
                <Link href="/lgpd" className={classes.link}>
                    Política de Privacidade
                </Link>.
            </Typography>
        </CookieConsent>
    );
};

export default CookieBanner;

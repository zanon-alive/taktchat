import React from "react";
import { createPortal } from "react-dom";
import { makeStyles } from "@mui/styles";
import { Fab, Tooltip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { fabBottomCss } from "./cornerFabStack";
import useCornerFabStack from "./useCornerFabStack";
import useSupportWhatsApp from "./useSupportWhatsApp";

const useStyles = makeStyles(() => ({
    icon: {
        fontSize: "2rem",
    },
    fab: {
        animation: "$pulse 2s infinite",
        "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
        },
    },
    "@keyframes pulse": {
        "0%": {
            boxShadow: "0 0 0 0 rgba(37, 211, 102, 0.7)",
        },
        "70%": {
            boxShadow: "0 0 0 15px rgba(37, 211, 102, 0)",
        },
        "100%": {
            boxShadow: "0 0 0 0 rgba(37, 211, 102, 0)",
        },
    },
}));

export const supportWhatsAppFabSx = {
    position: "fixed",
    right: "max(16px, env(safe-area-inset-right, 0px))",
    bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
    left: "auto",
    top: "auto",
    zIndex: 1400,
    width: 56,
    height: 56,
    backgroundColor: "#25D366",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    "&:hover": {
        backgroundColor: "#20BA5A",
    },
};

const ChatWidget = ({ className, sx, minBottom }) => {
    const classes = useStyles();
    const { whatsappBottom, apiDialogOpen } = useCornerFabStack({ minBottom });
    const { url, ready } = useSupportWhatsApp();

    if (typeof document === "undefined" || apiDialogOpen || !ready || !url) {
        return null;
    }

    return createPortal(
        <Tooltip title="Fale conosco no WhatsApp" placement="left" arrow>
            <Fab
                className={`${classes.fab}${className ? ` ${className}` : ""}`}
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
                color="inherit"
                sx={{
                    "&&": {
                        ...supportWhatsAppFabSx,
                        bottom: fabBottomCss(whatsappBottom),
                        ...sx,
                    },
                }}
            >
                <WhatsAppIcon className={classes.icon} />
            </Fab>
        </Tooltip>,
        document.body
    );
};

export default ChatWidget;

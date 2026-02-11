import React, { useEffect, useRef } from "react";

import { makeStyles } from "@mui/styles";
import { green } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckoutPage from "../CheckoutPage";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ContactModal = ({ open, onClose, Invoice, contactId, initialValues, onSave }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }} maxWidth="md" scroll="paper">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Assinatura</span>
            <IconButton onClick={handleClose} size="small" aria-label="fechar">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <CheckoutPage
            Invoice={Invoice}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactModal;

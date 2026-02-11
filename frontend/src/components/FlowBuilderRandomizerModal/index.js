import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@mui/styles";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Box, Slider, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const FlowBuilderRandomizerModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [percent, setPercent] = useState(0);
  const [activeModal, setActiveModal] = useState(false);
  

  useEffect(() => {
    if (open === "edit") {
      setPercent(data.data.percent);
      setActiveModal(true);
    } else if (open === "create") {
      setPercent(0);
      setActiveModal(true);
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleValue = (event, newValue) => {
    setPercent(newValue)
  }

  const handleSaveContact = async values => {
    if (!percent || parseInt(percent) <= 0) {
      return toast.error("Adicione o valor de intervalo");
    }
    if (parseInt(percent) > 120) {
      return toast.error("Máximo de tempo atingido 120 segundos");
    }
    if (open === "edit") {
      onUpdate({
        ...data,
        data: { percent: percent }
      });
    } else if (open === "create") {
      onSave({
        percent: percent
      });
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>{open === "create" ? "Adicionar um randomizador ao fluxo" : "Editar randomizador"}</span>
            <IconButton onClick={handleClose} size="small" aria-label="fechar">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Stack direction={'row'} minHeight={120} alignItems={'center'} gap={4}>
              <Typography>{percent}%</Typography>
              <Slider
                aria-label="Temperature"
                defaultValue={percent}
                valueLabelDisplay="auto"
                onChange={handleValue}
                step={10}
                marks
                min={0}
                max={100}
              />
              <Typography>{100 - percent}%</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.btnWrapper}
              onClick={() => handleSaveContact()}
            >
              {open === "create" ? `Adicionar` : "Editar"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderRandomizerModal;

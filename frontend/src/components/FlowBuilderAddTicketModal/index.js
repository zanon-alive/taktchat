import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
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
import { Box, Stack } from "@mui/material";
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

const FlowBuilderTicketModal = ({
    open,
    onSave,
    data,
    onUpdate,
    close
}) => {
    const classes = useStyles();
    const isMounted = useRef(true);
    const [activeModal, setActiveModal] = useState(false)
    const [queues, setQueues] = useState([])
    const [selectedQueue, setQueueSelected] = useState()

    useEffect(() => {
        isMounted.current = true;
        
        if (open === 'edit') {
            (async () => {
                try {
                    const { data: old } = await api.get("/queue");
                    if (!isMounted.current) return;
                    setQueues(old)
                    const queue = old.find((item) => item.id === data.data.id)
                    console.log('queue', queue)
                    if (queue) {
                        setQueueSelected(queue.id)
                    }
                    setActiveModal(true)
                } catch (error) {
                    if (isMounted.current) {
                        console.log(error)
                    }
                }
            })();

        } else if (open === 'create') {
            (async () => {
                try {
                    const { data } = await api.get("/queue");
                    if (!isMounted.current) return;
                    setQueues(data)
                    setActiveModal(true)
                } catch (error) {
                    if (isMounted.current) {
                        console.log(error)
                    }
                }
            })()
        }
        return () => {
            isMounted.current = false;
        };
    }, [open, data]);


    const handleClose = () => {
        close(null)
        setActiveModal(false)
    };

    const handleSaveContact = () => {
        if (!selectedQueue) {
            return toast.error('Adicione uma fila')
        }
        if (open === 'edit') {
            const queue = queues.find(item => item.id === selectedQueue)
            onUpdate({
                ...data,
                data: queue
            });
        } else if (open === 'create') {
            const queue = queues.find(item => item.id === selectedQueue)
            onSave({
                data: queue
            })
        }
        handleClose()

    };

    return (
        <div className={classes.root}>
            <Dialog open={activeModal} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }} fullWidth maxWidth="md" scroll="paper">
                <DialogTitle id="form-dialog-title">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>{open === 'create' ? `Adicionar uma fila ao fluxo` : `Editar fila`}</span>
                        <IconButton onClick={handleClose} size="small" aria-label="fechar">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <Stack>
                    <DialogContent dividers>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            //   onChange={handleChange}
                            value={selectedQueue}
                            style={{ width: "95%" }}
                            onChange={(e) => { setQueueSelected(e.target.value) }}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                            }}
                            renderValue={() => {
                                if (selectedQueue === "") {
                                    return "Selecione uma Conexão"
                                }
                                const queue = queues.find(w => w.id === selectedQueue)
                                return queue.name
                            }}
                        >

                            {queues.length > 0 && (
                                queues.map((queue, index) => (
                                    <MenuItem dense key={index} value={queue.id}>{queue.name}</MenuItem>
                                ))
                            )}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            variant="outlined"
                        >
                            {i18n.t("contactModal.buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            className={classes.btnWrapper}
                            onClick={handleSaveContact}
                        >
                            {open === 'create' ? `Adicionar` : 'Editar'}
                        </Button>
                    </DialogActions>
                </Stack>
            </Dialog>
        </div>
    );
};

export default FlowBuilderTicketModal;
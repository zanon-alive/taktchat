import React, { useEffect, useState, useRef } from "react";
import { Field } from "formik";
import { makeStyles } from "@mui/styles";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const QueueSelectSingle = ({ selectedQueueId, onChange, label }) => {
    const classes = useStyles();
    const [queues, setQueues] = useState([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue");
                if (isMounted.current) setQueues(data);
            } catch (err) {
                if (isMounted.current) toastError(`QUEUESELETSINGLE >>> ${err}`);
            }
        })();
    }, []);

    // Verificar se o selectedQueueId existe nas filas quando ambos estão disponíveis
    useEffect(() => {
        if (selectedQueueId && queues.length > 0) {
            const queueExists = queues.some(queue => queue.id === selectedQueueId);
            if (!queueExists) {
                console.warn(`Fila ID ${selectedQueueId} não encontrada nas filas disponíveis`);
                // Resetar para valor vazio se a fila não existir
                if (onChange) onChange("");
            }
        }
    }, [selectedQueueId, queues, onChange]);

    const labelText = label || i18n.t("queueSelect.inputLabel");

    return (
        <div style={{ marginTop: 6 }}>
            <FormControl
                variant="outlined"
                className={classes.formControl}
                margin="dense"
                fullWidth
            >
                <div>
                    <Typography>
                        {labelText}
                    </Typography>
                    {typeof onChange === "function" ? (
                        <Select
                            label={labelText}
                            labelId="queue-selection-label"
                            id="queue-selection"
                            fullWidth
                            value={
                                selectedQueueId && queues.some(q => q.id === selectedQueueId) 
                                    ? selectedQueueId 
                                    : ""
                            }
                            onChange={e => onChange(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Selecione uma fila</em>
                            </MenuItem>
                            {queues.map(queue => (
                                <MenuItem key={queue.id} value={queue.id}>
                                    {queue.name}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Field name="queueId">
                            {({ field, form }) => (
                                <Select
                                    {...field}
                                    label={labelText}
                                    labelId="queue-selection-label"
                                    id="queue-selection"
                                    fullWidth
                                    value={queues.length > 0 && queues.some(q => q.id === field.value) ? field.value : ""}
                                    onChange={(e) => form.setFieldValue("queueId", e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>Selecione uma fila</em>
                                    </MenuItem>
                                    {queues.map(queue => (
                                        <MenuItem key={queue.id} value={queue.id}>
                                            {queue.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        </Field>
                    )}
                </div>
            </FormControl>
        </div>
    );
};

export default QueueSelectSingle;

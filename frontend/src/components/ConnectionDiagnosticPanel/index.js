import React, { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    DialogActions,
    Tabs,
    Tab,
    Box,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { BugReport } from "@material-ui/icons";
import ConnectionTimeline from "../ConnectionTimeline";
import ConnectionMetrics from "../ConnectionMetrics";
import { AuthContext } from "../../context/Auth/AuthContext";

const ConnectionDiagnosticPanel = ({ whatsappId, open, onClose }) => {
    const [currentDiagnostic, setCurrentDiagnostic] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const { socket } = useContext(AuthContext);

    useEffect(() => {
        if (!whatsappId || !socket) return;

        const handleDiagnostic = (data) => {
            setCurrentDiagnostic(data);

            // Limpar após 10 segundos
            setTimeout(() => setCurrentDiagnostic(null), 10000);
        };

        socket.on(`whatsapp-${whatsappId}-diagnostic`, handleDiagnostic);

        return () => {
            socket.off(`whatsapp-${whatsappId}-diagnostic`, handleDiagnostic);
        };
    }, [whatsappId, socket]);

    const getSeverity = (severity) => {
        const map = {
            info: "info",
            warning: "warning",
            error: "error",
            critical: "error",
        };
        return map[severity] || "info";
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BugReport style={{ marginRight: 8 }} />
                    Diagnóstico de Conexão
                </div>
            </DialogTitle>
            <DialogContent dividers>
                {currentDiagnostic && (
                    <Alert
                        severity={getSeverity(currentDiagnostic.severity)}
                        style={{ marginBottom: 16 }}
                    >
                        <AlertTitle>{currentDiagnostic.diagnosis}</AlertTitle>
                        {currentDiagnostic.message}
                        {currentDiagnostic.suggestions?.length > 0 && (
                            <ul style={{ marginTop: 8 }}>
                                {currentDiagnostic.suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        )}
                    </Alert>
                )}
                
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    style={{ marginBottom: 16 }}
                >
                    <Tab label="Timeline" />
                    <Tab label="Métricas" />
                </Tabs>

                <Box>
                    {tabValue === 0 && (
                        <ConnectionTimeline whatsappId={whatsappId} />
                    )}
                    {tabValue === 1 && (
                        <ConnectionMetrics whatsappId={whatsappId} days={30} />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConnectionDiagnosticPanel;

import React, { useState, useEffect } from "react";
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
} from "@material-ui/lab";
import {
    CheckCircle,
    Error,
    Warning,
    Info,
    CropFree,
} from "@material-ui/icons";
import { Typography, Paper, Chip, makeStyles } from "@material-ui/core";
import api from "../../services/api";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: '6px 16px',
    },
    secondaryTail: {
        backgroundColor: theme.palette.secondary.main,
    },
}));

const ConnectionTimeline = ({ whatsappId }) => {
    const classes = useStyles();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!whatsappId) return;
            try {
                const { data } = await api.get(`/connection-logs/whatsapp/${whatsappId}`);
                setLogs(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLogs();
    }, [whatsappId]);

    const getIcon = (eventType, severity) => {
        if (eventType.includes("qr")) return <CropFree />;
        if (severity === "error" || severity === "critical") return <Error />;
        if (severity === "warning") return <Warning />;
        if (eventType.includes("open")) return <CheckCircle />;
        return <Info />;
    };

    const getColor = (severity) => {
        const colors = {
            info: "primary",
            warning: "secondary",
            error: "secondary",
            critical: "secondary",
        };
        return colors[severity] || "grey";
    };

    return (
        <Timeline align="alternate">
            {logs.map((log, index) => (
                <TimelineItem key={log.id}>
                    <TimelineOppositeContent>
                        <Typography variant="body2" color="textSecondary">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                        </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color={getColor(log.severity)}>
                            {getIcon(log.eventType, log.severity)}
                        </TimelineDot>
                        {index < logs.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                        <Paper elevation={3} className={classes.paper}>
                            <Typography variant="h6" component="h1">
                                {log.diagnosis || log.eventType}
                            </Typography>
                            <Typography>{log.errorMessage}</Typography>
                            {log.suggestions && log.suggestions.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <Typography variant="subtitle2">Sugestões:</Typography>
                                    <ul>
                                        {log.suggestions.map((suggestion, i) => (
                                            <li key={i}>
                                                <Typography variant="body2">{suggestion}</Typography>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {log.statusCode && (
                                <Chip
                                    label={`Status: ${log.statusCode}`}
                                    size="small"
                                    style={{ marginTop: 8 }}
                                    color={log.statusCode === 401 ? "secondary" : "default"}
                                />
                            )}
                        </Paper>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default ConnectionTimeline;

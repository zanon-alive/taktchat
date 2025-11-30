import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    makeStyles,
} from "@material-ui/core";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../../services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    card: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    cardContent: {
        flexGrow: 1,
    },
    metricValue: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginTop: theme.spacing(1),
    },
    metricLabel: {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
    },
    chartContainer: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(2),
    },
    errorChip: {
        margin: theme.spacing(0.5),
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 200,
    },
}));

const ConnectionMetrics = ({ whatsappId, days = 30 }) => {
    const classes = useStyles();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!whatsappId) return;

            setLoading(true);
            setError(null);

            try {
                const { data } = await api.get(
                    `/connection-logs/metrics/${whatsappId}?days=${days}`
                );
                setMetrics(data);
            } catch (err) {
                console.error("Erro ao buscar métricas:", err);
                setError("Erro ao carregar métricas de conexão");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [whatsappId, days]);

    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return "N/A";
        
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    };

    const getSuccessRateColor = (rate) => {
        if (rate >= 80) return "#4caf50"; // Verde
        if (rate >= 50) return "#ff9800"; // Laranja
        return "#f44336"; // Vermelho
    };

    if (loading) {
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Paper className={classes.root}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!metrics || metrics.totalEvents === 0) {
        return (
            <Paper className={classes.root}>
                <Typography variant="h6" gutterBottom>
                    Métricas de Conexão
                </Typography>
                <Typography color="textSecondary">
                    Nenhum dado disponível para o período selecionado.
                </Typography>
            </Paper>
        );
    }

    // Preparar dados do gráfico
    const chartData = {
        labels: metrics.timeline.map((item) =>
            format(new Date(item.date), "dd/MM", { locale: ptBR })
        ),
        datasets: [
            {
                label: "Conexões",
                data: metrics.timeline.map((item) => item.connections),
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                tension: 0.4,
            },
            {
                label: "Desconexões",
                data: metrics.timeline.map((item) => item.disconnections),
                borderColor: "#f44336",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                tension: 0.4,
            },
            {
                label: "Erros",
                data: metrics.timeline.map((item) => item.errors),
                borderColor: "#ff9800",
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Atividade de Conexão (últimos ${days} dias)`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className={classes.root}>
            <Typography variant="h6" gutterBottom>
                Métricas de Conexão
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Período: {format(new Date(metrics.period.startDate), "dd/MM/yyyy")} até{" "}
                {format(new Date(metrics.period.endDate), "dd/MM/yyyy")}
            </Typography>

            <Grid container spacing={3} style={{ marginTop: 8 }}>
                {/* Taxa de Sucesso */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Typography
                                className={classes.metricLabel}
                                variant="body2"
                            >
                                Taxa de Sucesso
                            </Typography>
                            <Typography
                                className={classes.metricValue}
                                style={{
                                    color: getSuccessRateColor(metrics.successRate),
                                }}
                            >
                                {metrics.successRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {metrics.successfulConnections} de{" "}
                                {metrics.connectionAttempts} tentativas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tempo Médio de Conexão */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Typography
                                className={classes.metricLabel}
                                variant="body2"
                            >
                                Tempo Médio de Conexão
                            </Typography>
                            <Typography className={classes.metricValue}>
                                {formatDuration(metrics.averageConnectionDuration)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Duração média antes de desconectar
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total de Eventos */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Typography
                                className={classes.metricLabel}
                                variant="body2"
                            >
                                Total de Eventos
                            </Typography>
                            <Typography className={classes.metricValue}>
                                {metrics.totalEvents}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Eventos registrados no período
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Conexões Falhadas */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Typography
                                className={classes.metricLabel}
                                variant="body2"
                            >
                                Conexões Falhadas
                            </Typography>
                            <Typography
                                className={classes.metricValue}
                                style={{ color: "#f44336" }}
                            >
                                {metrics.failedConnections}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Desconexões com erro
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Erros Mais Frequentes */}
            {metrics.mostCommonErrors.length > 0 && (
                <Paper style={{ marginTop: 24, padding: 16 }}>
                    <Typography variant="h6" gutterBottom>
                        Erros Mais Frequentes
                    </Typography>
                    <div>
                        {metrics.mostCommonErrors.map((error, index) => (
                            <Chip
                                key={index}
                                label={`Erro ${error.statusCode}: ${error.count} ocorrência(s)`}
                                color={error.statusCode === 401 ? "secondary" : "default"}
                                className={classes.errorChip}
                                title={`Última ocorrência: ${format(
                                    new Date(error.lastOccurrence),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR }
                                )}`}
                            />
                        ))}
                    </div>
                </Paper>
            )}

            {/* Gráfico de Timeline */}
            {metrics.timeline.length > 0 && (
                <Paper className={classes.chartContainer}>
                    <div style={{ height: 300 }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </Paper>
            )}

            {/* Distribuição por Tipo e Severidade */}
            <Grid container spacing={3} style={{ marginTop: 16 }}>
                <Grid item xs={12} md={6}>
                    <Paper style={{ padding: 16 }}>
                        <Typography variant="h6" gutterBottom>
                            Eventos por Tipo
                        </Typography>
                        {Object.entries(metrics.eventsByType).map(([type, count]) => (
                            <div
                                key={type}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 8,
                                }}
                            >
                                <Typography variant="body2">{type}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {count}
                                </Typography>
                            </div>
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper style={{ padding: 16 }}>
                        <Typography variant="h6" gutterBottom>
                            Eventos por Severidade
                        </Typography>
                        {Object.entries(metrics.eventsBySeverity).map(
                            ([severity, count]) => (
                                <div
                                    key={severity}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                    }}
                                >
                                    <Typography variant="body2">{severity}</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {count}
                                    </Typography>
                                </div>
                            )
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default ConnectionMetrics;


import { Op } from "sequelize";
import ConnectionLog from "../models/ConnectionLog";
import { ConnectionDiagnostic } from "../helpers/ConnectionDiagnostic";

interface CreateLogParams {
    whatsappId: number;
    companyId: number;
    eventType: string;
    eventData?: any;
    statusCode?: number;
    errorMessage?: string;
}

class ConnectionLogService {
    async create(params: CreateLogParams): Promise<ConnectionLog> {
        const { whatsappId, companyId, eventType, eventData, statusCode, errorMessage } = params;

        // Diagnóstico automático
        const diagnostic = ConnectionDiagnostic.analyze({
            eventType,
            statusCode,
            errorMessage,
            eventData,
        });

        return await ConnectionLog.create({
            whatsappId,
            companyId,
            eventType,
            eventData,
            statusCode,
            errorMessage,
            diagnosis: diagnostic.diagnosis,
            suggestions: diagnostic.suggestions,
            severity: diagnostic.severity,
            timestamp: new Date(),
        });
    }

    async getByWhatsappId(whatsappId: number, limit = 50): Promise<ConnectionLog[]> {
        return await ConnectionLog.findAll({
            where: { whatsappId },
            order: [["timestamp", "DESC"]],
            limit,
        });
    }

    async getRecent(companyId: number, hours = 24): Promise<ConnectionLog[]> {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return await ConnectionLog.findAll({
            where: {
                companyId,
                timestamp: { [Op.gte]: since },
            },
            order: [["timestamp", "DESC"]],
        });
    }

    async getMetrics(whatsappId: number, days = 30): Promise<any> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        // Buscar todos os logs do período
        const logs = await ConnectionLog.findAll({
            where: {
                whatsappId,
                timestamp: { [Op.gte]: since },
            },
            order: [["timestamp", "ASC"]],
        });

        // Calcular métricas
        const metrics = {
            period: {
                days,
                startDate: since.toISOString(),
                endDate: new Date().toISOString(),
            },
            totalEvents: logs.length,
            connectionAttempts: 0,
            successfulConnections: 0,
            failedConnections: 0,
            successRate: 0,
            averageConnectionDuration: 0,
            mostCommonErrors: [] as Array<{ statusCode: number; count: number; lastOccurrence: string }>,
            eventsByType: {} as Record<string, number>,
            eventsBySeverity: {} as Record<string, number>,
            timeline: [] as Array<{ date: string; connections: number; disconnections: number; errors: number }>,
        };

        // Agrupar eventos por tipo
        const openEvents: ConnectionLog[] = [];
        const closeEvents: ConnectionLog[] = [];
        const errorEvents: ConnectionLog[] = [];
        const errorCounts: Record<number, { count: number; lastOccurrence: Date }> = {};

        logs.forEach((log) => {
            // Contar por tipo
            metrics.eventsByType[log.eventType] = (metrics.eventsByType[log.eventType] || 0) + 1;
            
            // Contar por severidade
            metrics.eventsBySeverity[log.severity] = (metrics.eventsBySeverity[log.severity] || 0) + 1;

            // Identificar tentativas de conexão (qr_code_generated ou connection_update com open)
            if (log.eventType === "qr_code_generated" || 
                (log.eventType === "connection_update" && log.eventData?.connection === "open")) {
                metrics.connectionAttempts++;
                openEvents.push(log);
            }

            // Identificar conexões bem-sucedidas
            if (log.eventType === "connection_open" || 
                (log.eventType === "connection_update" && log.eventData?.connection === "open")) {
                metrics.successfulConnections++;
            }

            // Identificar desconexões
            if (log.eventType === "connection_close" || 
                (log.eventType === "connection_update" && log.eventData?.connection === "close")) {
                closeEvents.push(log);
                
                // Se tem statusCode, é uma falha
                if (log.statusCode) {
                    metrics.failedConnections++;
                    errorEvents.push(log);
                    
                    // Contar erros por statusCode
                    if (!errorCounts[log.statusCode]) {
                        errorCounts[log.statusCode] = { count: 0, lastOccurrence: log.timestamp };
                    }
                    errorCounts[log.statusCode].count++;
                    if (log.timestamp > errorCounts[log.statusCode].lastOccurrence) {
                        errorCounts[log.statusCode].lastOccurrence = log.timestamp;
                    }
                }
            }
        });

        // Calcular taxa de sucesso
        if (metrics.connectionAttempts > 0) {
            metrics.successRate = (metrics.successfulConnections / metrics.connectionAttempts) * 100;
        }

        // Calcular tempo médio de conexão
        const connectionDurations: number[] = [];
        openEvents.forEach((openLog) => {
            const closeLog = closeEvents.find(
                (c) => c.timestamp > openLog.timestamp && 
                       c.timestamp.getTime() - openLog.timestamp.getTime() < 24 * 60 * 60 * 1000 // Dentro de 24h
            );
            if (closeLog) {
                const duration = (closeLog.timestamp.getTime() - openLog.timestamp.getTime()) / 1000; // em segundos
                connectionDurations.push(duration);
            }
        });
        
        if (connectionDurations.length > 0) {
            const totalDuration = connectionDurations.reduce((sum, d) => sum + d, 0);
            metrics.averageConnectionDuration = totalDuration / connectionDurations.length;
        }

        // Erros mais frequentes
        metrics.mostCommonErrors = Object.entries(errorCounts)
            .map(([statusCode, data]) => ({
                statusCode: parseInt(statusCode),
                count: data.count,
                lastOccurrence: data.lastOccurrence.toISOString(),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5

        // Timeline (agrupar por dia)
        const timelineMap: Record<string, { connections: number; disconnections: number; errors: number }> = {};
        
        logs.forEach((log) => {
            const dateKey = log.timestamp.toISOString().split("T")[0]; // YYYY-MM-DD
            
            if (!timelineMap[dateKey]) {
                timelineMap[dateKey] = { connections: 0, disconnections: 0, errors: 0 };
            }

            if (log.eventType === "connection_open" || 
                (log.eventType === "connection_update" && log.eventData?.connection === "open")) {
                timelineMap[dateKey].connections++;
            }

            if (log.eventType === "connection_close" || 
                (log.eventType === "connection_update" && log.eventData?.connection === "close")) {
                timelineMap[dateKey].disconnections++;
                
                if (log.statusCode) {
                    timelineMap[dateKey].errors++;
                }
            }
        });

        metrics.timeline = Object.entries(timelineMap)
            .map(([date, data]) => ({
                date,
                ...data,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return metrics;
    }
}

export default new ConnectionLogService();

import { Request, Response } from "express";
import ConnectionLogService from "../services/ConnectionLogService";

export const index = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { whatsappId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const logs = await ConnectionLogService.getByWhatsappId(
            parseInt(whatsappId),
            limit
        );

        return res.json(logs);
    } catch (error) {
        console.error("[ConnectionLogController] Error fetching logs:", error);
        return res.status(500).json({
            error: "Erro ao buscar logs de conexão",
            message: error.message
        });
    }
};

export const recent = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.user;
        const hours = parseInt(req.query.hours as string) || 24;

        const logs = await ConnectionLogService.getRecent(companyId, hours);

        return res.json(logs);
    } catch (error) {
        console.error("[ConnectionLogController] Error fetching recent logs:", error);
        return res.status(500).json({
            error: "Erro ao buscar logs recentes",
            message: error.message
        });
    }
};

export const metrics = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { whatsappId } = req.params;
        const days = parseInt(req.query.days as string) || 30;

        const metrics = await ConnectionLogService.getMetrics(
            parseInt(whatsappId),
            days
        );

        return res.json(metrics);
    } catch (error) {
        console.error("[ConnectionLogController] Error fetching metrics:", error);
        return res.status(500).json({
            error: "Erro ao buscar métricas de conexão",
            message: error.message
        });
    }
};

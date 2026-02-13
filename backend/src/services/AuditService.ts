import AuditLog from "../models/AuditLog";
import { Request } from "express";

interface AuditData {
  userId?: number;
  userName?: string;
  companyId?: number;
  action: string;
  entity: string;
  entityId?: string | number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Serviço para registrar eventos de auditoria.
 */
export const logAudit = async (data: AuditData): Promise<void> => {
  try {
    await AuditLog.create({
      userId: data.userId || null,
      userName: data.userName || "Sistema",
      companyId: data.companyId || null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ? String(data.entityId) : null,
      details: data.details ? JSON.stringify(data.details) : null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null
    });
  } catch (e) {
    // Não falhar a operação principal se o log falhar
    console.error("[AuditService] Erro ao registrar auditoria:", e);
  }
};

/**
 * Helper para obter IP e User-Agent de uma requisição.
 */
export const getRequestInfo = (req: Request) => {
  const ipAddress = req.ip || 
    req.socket.remoteAddress || 
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
    "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  return { ipAddress, userAgent };
};

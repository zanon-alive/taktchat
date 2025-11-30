import ConnectionLogService from "../../ConnectionLogService";
import ConnectionLog from "../../../models/ConnectionLog";
import { ConnectionDiagnostic } from "../../../helpers/ConnectionDiagnostic";
import { Op } from "sequelize";

// Mock do modelo ConnectionLog
jest.mock("../../../models/ConnectionLog", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

// Mock do ConnectionDiagnostic
jest.mock("../../../helpers/ConnectionDiagnostic", () => ({
  ConnectionDiagnostic: {
    analyze: jest.fn(),
  },
}));

describe("ConnectionLogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um log de conexão com diagnóstico", async () => {
      const mockLog = {
        id: 1,
        whatsappId: 1,
        companyId: 1,
        eventType: "connection_open",
        eventData: { connection: "open" },
        statusCode: null,
        errorMessage: null,
        diagnosis: "Conexão estabelecida com sucesso",
        suggestions: [],
        severity: "info",
        timestamp: new Date(),
      };

      const mockDiagnostic = {
        diagnosis: "Conexão estabelecida com sucesso",
        suggestions: [],
        severity: "info",
        userFriendlyMessage: "WhatsApp conectado com sucesso!",
      };

      (ConnectionDiagnostic.analyze as jest.Mock).mockReturnValue(mockDiagnostic);
      (ConnectionLog.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await ConnectionLogService.create({
        whatsappId: 1,
        companyId: 1,
        eventType: "connection_open",
        eventData: { connection: "open" },
      });

      expect(ConnectionDiagnostic.analyze).toHaveBeenCalledWith({
        eventType: "connection_open",
        statusCode: undefined,
        errorMessage: undefined,
        eventData: { connection: "open" },
      });

      expect(ConnectionLog.create).toHaveBeenCalledWith({
        whatsappId: 1,
        companyId: 1,
        eventType: "connection_open",
        eventData: { connection: "open" },
        statusCode: undefined,
        errorMessage: undefined,
        diagnosis: "Conexão estabelecida com sucesso",
        suggestions: [],
        severity: "info",
        timestamp: expect.any(Date),
      });

      expect(result).toEqual(mockLog);
    });

    it("deve criar um log com erro e diagnóstico apropriado", async () => {
      const mockLog = {
        id: 2,
        whatsappId: 1,
        companyId: 1,
        eventType: "connection_close",
        eventData: { connection: "close" },
        statusCode: 401,
        errorMessage: "device_removed",
        diagnosis: "Dispositivo removido pelo WhatsApp",
        suggestions: ["Clique no botão 'Novo QR' para reconectar"],
        severity: "critical",
        timestamp: new Date(),
      };

      const mockDiagnostic = {
        diagnosis: "Dispositivo removido pelo WhatsApp",
        suggestions: ["Clique no botão 'Novo QR' para reconectar"],
        severity: "critical",
        userFriendlyMessage: "O WhatsApp removeu este dispositivo.",
      };

      (ConnectionDiagnostic.analyze as jest.Mock).mockReturnValue(mockDiagnostic);
      (ConnectionLog.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await ConnectionLogService.create({
        whatsappId: 1,
        companyId: 1,
        eventType: "connection_close",
        eventData: { connection: "close" },
        statusCode: 401,
        errorMessage: "device_removed",
      });

      expect(ConnectionDiagnostic.analyze).toHaveBeenCalledWith({
        eventType: "connection_close",
        statusCode: 401,
        errorMessage: "device_removed",
        eventData: { connection: "close" },
      });

      expect(result).toEqual(mockLog);
    });
  });

  describe("getByWhatsappId", () => {
    it("deve retornar logs ordenados por timestamp DESC", async () => {
      const mockLogs = [
        {
          id: 3,
          whatsappId: 1,
          timestamp: new Date("2025-11-22T10:00:00Z"),
        },
        {
          id: 2,
          whatsappId: 1,
          timestamp: new Date("2025-11-22T09:00:00Z"),
        },
        {
          id: 1,
          whatsappId: 1,
          timestamp: new Date("2025-11-22T08:00:00Z"),
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getByWhatsappId(1, 50);

      expect(ConnectionLog.findAll).toHaveBeenCalledWith({
        where: { whatsappId: 1 },
        order: [["timestamp", "DESC"]],
        limit: 50,
      });

      expect(result).toEqual(mockLogs);
    });

    it("deve usar limite padrão de 50 quando não especificado", async () => {
      (ConnectionLog.findAll as jest.Mock).mockResolvedValue([]);

      await ConnectionLogService.getByWhatsappId(1);

      expect(ConnectionLog.findAll).toHaveBeenCalledWith({
        where: { whatsappId: 1 },
        order: [["timestamp", "DESC"]],
        limit: 50,
      });
    });
  });

  describe("getRecent", () => {
    it("deve retornar logs recentes do período especificado", async () => {
      const mockLogs = [
        {
          id: 1,
          companyId: 1,
          timestamp: new Date(),
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getRecent(1, 24);

      expect(ConnectionLog.findAll).toHaveBeenCalledWith({
        where: {
          companyId: 1,
          timestamp: { [Op.gte]: expect.any(Date) },
        },
        order: [["timestamp", "DESC"]],
      });

      expect(result).toEqual(mockLogs);
    });

    it("deve usar período padrão de 24 horas quando não especificado", async () => {
      (ConnectionLog.findAll as jest.Mock).mockResolvedValue([]);

      await ConnectionLogService.getRecent(1);

      expect(ConnectionLog.findAll).toHaveBeenCalled();
    });
  });

  describe("getMetrics", () => {
    it("deve calcular métricas corretamente com dados completos", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const mockLogs = [
        // QR Code gerado (tentativa de conexão)
        {
          id: 1,
          whatsappId: 1,
          companyId: 1,
          eventType: "qr_code_generated",
          timestamp: new Date(thirtyDaysAgo.getTime() + 1 * 60 * 60 * 1000),
          severity: "info",
        },
        // Conexão aberta (sucesso)
        {
          id: 2,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_open",
          eventData: { connection: "open" },
          timestamp: new Date(thirtyDaysAgo.getTime() + 2 * 60 * 60 * 1000),
          severity: "info",
        },
        // Conexão fechada sem erro
        {
          id: 3,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          timestamp: new Date(thirtyDaysAgo.getTime() + 3 * 60 * 60 * 1000),
          severity: "warning",
        },
        // Conexão fechada com erro 401
        {
          id: 4,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          statusCode: 401,
          errorMessage: "device_removed",
          timestamp: new Date(thirtyDaysAgo.getTime() + 4 * 60 * 60 * 1000),
          severity: "critical",
        },
        // Outra tentativa
        {
          id: 5,
          whatsappId: 1,
          companyId: 1,
          eventType: "qr_code_generated",
          timestamp: new Date(thirtyDaysAgo.getTime() + 5 * 60 * 60 * 1000),
          severity: "info",
        },
        // Outra conexão aberta
        {
          id: 6,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_open",
          eventData: { connection: "open" },
          timestamp: new Date(thirtyDaysAgo.getTime() + 6 * 60 * 60 * 1000),
          severity: "info",
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getMetrics(1, 30);

      expect(result.period.days).toBe(30);
      expect(result.totalEvents).toBe(6);
      expect(result.connectionAttempts).toBe(2); // 2 qr_code_generated
      expect(result.successfulConnections).toBe(2); // 2 connection_open
      expect(result.failedConnections).toBe(1); // 1 connection_close com statusCode
      expect(result.successRate).toBe(100); // 2 sucessos / 2 tentativas
      expect(result.mostCommonErrors).toHaveLength(1);
      expect(result.mostCommonErrors[0].statusCode).toBe(401);
      expect(result.mostCommonErrors[0].count).toBe(1);
      expect(result.eventsByType).toHaveProperty("qr_code_generated", 2);
      expect(result.eventsByType).toHaveProperty("connection_open", 2);
      expect(result.eventsByType).toHaveProperty("connection_close", 2);
      expect(result.eventsBySeverity).toHaveProperty("info", 4);
      expect(result.eventsBySeverity).toHaveProperty("warning", 1);
      expect(result.eventsBySeverity).toHaveProperty("critical", 1);
    });

    it("deve calcular tempo médio de conexão corretamente", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const openTime = new Date(thirtyDaysAgo.getTime() + 1 * 60 * 60 * 1000);
      const closeTime = new Date(thirtyDaysAgo.getTime() + 1 * 60 * 60 * 1000 + 3600 * 1000); // 1 hora depois

      const mockLogs = [
        {
          id: 1,
          whatsappId: 1,
          companyId: 1,
          eventType: "qr_code_generated",
          timestamp: openTime,
          severity: "info",
        },
        {
          id: 2,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_open",
          eventData: { connection: "open" },
          timestamp: openTime,
          severity: "info",
        },
        {
          id: 3,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          timestamp: closeTime,
          severity: "warning",
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getMetrics(1, 30);

      // Tempo médio deve ser aproximadamente 3600 segundos (1 hora)
      expect(result.averageConnectionDuration).toBeCloseTo(3600, 0);
    });

    it("deve retornar métricas vazias quando não há logs", async () => {
      (ConnectionLog.findAll as jest.Mock).mockResolvedValue([]);

      const result = await ConnectionLogService.getMetrics(1, 30);

      expect(result.totalEvents).toBe(0);
      expect(result.connectionAttempts).toBe(0);
      expect(result.successfulConnections).toBe(0);
      expect(result.failedConnections).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.averageConnectionDuration).toBe(0);
      expect(result.mostCommonErrors).toEqual([]);
      expect(result.timeline).toEqual([]);
    });

    it("deve agrupar timeline por dia corretamente", async () => {
      const now = new Date();
      const date1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const date2 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const mockLogs = [
        {
          id: 1,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_open",
          eventData: { connection: "open" },
          timestamp: date1,
          severity: "info",
        },
        {
          id: 2,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          timestamp: date1,
          severity: "warning",
        },
        {
          id: 3,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_open",
          eventData: { connection: "open" },
          timestamp: date2,
          severity: "info",
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getMetrics(1, 30);

      expect(result.timeline).toHaveLength(2);
      expect(result.timeline[0].connections).toBe(1);
      expect(result.timeline[0].disconnections).toBe(1);
      expect(result.timeline[1].connections).toBe(1);
    });

    it("deve identificar erros mais frequentes corretamente", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const mockLogs = [
        {
          id: 1,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          statusCode: 401,
          timestamp: new Date(thirtyDaysAgo.getTime() + 1 * 60 * 60 * 1000),
          severity: "critical",
        },
        {
          id: 2,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          statusCode: 401,
          timestamp: new Date(thirtyDaysAgo.getTime() + 2 * 60 * 60 * 1000),
          severity: "critical",
        },
        {
          id: 3,
          whatsappId: 1,
          companyId: 1,
          eventType: "connection_close",
          eventData: { connection: "close" },
          statusCode: 428,
          timestamp: new Date(thirtyDaysAgo.getTime() + 3 * 60 * 60 * 1000),
          severity: "error",
        },
      ];

      (ConnectionLog.findAll as jest.Mock).mockResolvedValue(mockLogs);

      const result = await ConnectionLogService.getMetrics(1, 30);

      expect(result.mostCommonErrors).toHaveLength(2);
      expect(result.mostCommonErrors[0].statusCode).toBe(401);
      expect(result.mostCommonErrors[0].count).toBe(2);
      expect(result.mostCommonErrors[1].statusCode).toBe(428);
      expect(result.mostCommonErrors[1].count).toBe(1);
    });
  });
});


import { Request, Response } from "express";
import * as ConnectionLogController from "../ConnectionLogController";
import ConnectionLogService from "../../services/ConnectionLogService";

// Mock do ConnectionLogService
jest.mock("../../services/ConnectionLogService", () => ({
  __esModule: true,
  default: {
    getByWhatsappId: jest.fn(),
    getRecent: jest.fn(),
    getMetrics: jest.fn(),
    create: jest.fn(),
  },
}));

describe("ConnectionLogController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      query: {},
      user: {
        companyId: 1,
      },
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  describe("index", () => {
    it("deve retornar logs do WhatsApp especificado", async () => {
      const mockLogs = [
        {
          id: 1,
          whatsappId: 1,
          eventType: "connection_open",
          timestamp: new Date(),
        },
        {
          id: 2,
          whatsappId: 1,
          eventType: "connection_close",
          timestamp: new Date(),
        },
      ];

      mockRequest.params = { whatsappId: "1" };
      mockRequest.query = { limit: "10" };

      (ConnectionLogService.getByWhatsappId as jest.Mock).mockResolvedValue(
        mockLogs
      );

      await ConnectionLogController.index(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getByWhatsappId).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLogs);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("deve usar limite padrão de 50 quando não especificado", async () => {
      mockRequest.params = { whatsappId: "1" };
      mockRequest.query = {};

      (ConnectionLogService.getByWhatsappId as jest.Mock).mockResolvedValue([]);

      await ConnectionLogController.index(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getByWhatsappId).toHaveBeenCalledWith(1, 50);
    });

    it("deve retornar erro 500 quando service falha", async () => {
      mockRequest.params = { whatsappId: "1" };

      const error = new Error("Erro ao buscar logs");
      (ConnectionLogService.getByWhatsappId as jest.Mock).mockRejectedValue(
        error
      );

      await ConnectionLogController.index(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao buscar logs de conexão",
        message: "Erro ao buscar logs",
      });
    });
  });

  describe("recent", () => {
    it("deve retornar logs recentes da empresa", async () => {
      const mockLogs = [
        {
          id: 1,
          companyId: 1,
          eventType: "connection_open",
          timestamp: new Date(),
        },
      ];

      mockRequest.query = { hours: "24" };

      (ConnectionLogService.getRecent as jest.Mock).mockResolvedValue(
        mockLogs
      );

      await ConnectionLogController.recent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getRecent).toHaveBeenCalledWith(1, 24);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLogs);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("deve usar período padrão de 24 horas quando não especificado", async () => {
      mockRequest.query = {};

      (ConnectionLogService.getRecent as jest.Mock).mockResolvedValue([]);

      await ConnectionLogController.recent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getRecent).toHaveBeenCalledWith(1, 24);
    });

    it("deve retornar erro 500 quando service falha", async () => {
      const error = new Error("Erro ao buscar logs recentes");
      (ConnectionLogService.getRecent as jest.Mock).mockRejectedValue(error);

      await ConnectionLogController.recent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao buscar logs recentes",
        message: "Erro ao buscar logs recentes",
      });
    });
  });

  describe("metrics", () => {
    it("deve retornar métricas do WhatsApp especificado", async () => {
      const mockMetrics = {
        period: {
          days: 30,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        totalEvents: 10,
        connectionAttempts: 5,
        successfulConnections: 4,
        failedConnections: 1,
        successRate: 80,
        averageConnectionDuration: 3600,
        mostCommonErrors: [
          {
            statusCode: 401,
            count: 1,
            lastOccurrence: new Date().toISOString(),
          },
        ],
        eventsByType: {
          connection_open: 4,
          connection_close: 1,
        },
        eventsBySeverity: {
          info: 8,
          error: 2,
        },
        timeline: [],
      };

      mockRequest.params = { whatsappId: "1" };
      mockRequest.query = { days: "30" };

      (ConnectionLogService.getMetrics as jest.Mock).mockResolvedValue(
        mockMetrics
      );

      await ConnectionLogController.metrics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getMetrics).toHaveBeenCalledWith(1, 30);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMetrics);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("deve usar período padrão de 30 dias quando não especificado", async () => {
      mockRequest.params = { whatsappId: "1" };
      mockRequest.query = {};

      (ConnectionLogService.getMetrics as jest.Mock).mockResolvedValue({
        totalEvents: 0,
        connectionAttempts: 0,
        successfulConnections: 0,
        failedConnections: 0,
        successRate: 0,
        averageConnectionDuration: 0,
        mostCommonErrors: [],
        eventsByType: {},
        eventsBySeverity: {},
        timeline: [],
      });

      await ConnectionLogController.metrics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getMetrics).toHaveBeenCalledWith(1, 30);
    });

    it("deve retornar erro 500 quando service falha", async () => {
      mockRequest.params = { whatsappId: "1" };

      const error = new Error("Erro ao buscar métricas");
      (ConnectionLogService.getMetrics as jest.Mock).mockRejectedValue(error);

      await ConnectionLogController.metrics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao buscar métricas de conexão",
        message: "Erro ao buscar métricas",
      });
    });

    it("deve converter whatsappId para número corretamente", async () => {
      mockRequest.params = { whatsappId: "123" };
      mockRequest.query = { days: "7" };

      (ConnectionLogService.getMetrics as jest.Mock).mockResolvedValue({
        totalEvents: 0,
      });

      await ConnectionLogController.metrics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ConnectionLogService.getMetrics).toHaveBeenCalledWith(123, 7);
    });
  });
});


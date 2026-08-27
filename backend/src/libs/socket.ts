import { Server as SocketIO, Socket } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import logger from "../utils/logger";
import { instrument } from "@socket.io/admin-ui";
import jwt from "jsonwebtoken";
import { isAllowedCorsOrigin } from "../helpers/isAllowedCorsOrigin";
import Redis from "ioredis";

// Define namespaces permitidos
const ALLOWED_NAMESPACES = /^\/workspace-\d+$/;

// Funções de validação simples
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Permite que IDs numéricos também sejam considerados válidos
  return uuidRegex.test(str) || /^\d+$/.test(str);
};

const isValidStatus = (status: string): boolean => {
  return ["open", "closed", "pending", "group", "bot"].includes(status);
};

const validateJWTPayload = (payload: any): { userId: string; iat?: number; exp?: number } => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload inválido");
  }
  const userId = String(payload.userId ?? payload.id ?? "");
  if (!isValidUUID(userId)) {
    throw new Error("userId inválido");
  }
  return { ...payload, userId };
};

// Origens CORS permitidas
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3000"];

// Ajuste da classe AppError para compatibilidade com Error
class SocketCompatibleAppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = "AppError";
    // Garante que a stack trace seja capturada
    Error.captureStackTrace?.(this, SocketCompatibleAppError);
  }
}

const authenticateSocket = (required: boolean) => (socket: Socket, next: (error?: Error) => void) => {
  const authToken = socket.handshake.auth?.token;
  const queryToken = socket.handshake.query.token;
  const token = typeof authToken === "string"
    ? authToken
    : typeof queryToken === "string"
      ? queryToken
      : "";

  if (!token) {
    if (required) {
      return next(new SocketCompatibleAppError("Autenticação obrigatória", 401));
    }
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error("[SOCKET AUTH] JWT_SECRET não configurado");
    return next(new SocketCompatibleAppError("Socket indisponível", 503));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    socket.data.user = validateJWTPayload(decoded);
    return next();
  } catch {
    logger.warn("[SOCKET AUTH] Token inválido no handshake");
    return next(new SocketCompatibleAppError("Token inválido", 401));
  }
};

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedCorsOrigin(origin, ALLOWED_ORIGINS)) {
          callback(null, true);
        } else {
          logger.warn(`Origem não autorizada: ${origin}`);
          callback(new SocketCompatibleAppError("Violação da política CORS", 403));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // Limita payload a 1MB
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Configura o adapter Redis para suportar múltipliplas instâncias (carregamento dinâmico)
  try {
    const redisUrl = process.env.SOCKET_REDIS_URL || process.env.REDIS_URI_ACK || process.env.REDIS_URI;
    if (redisUrl) {
      const pubClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableAutoPipelining: true
      });
      const subClient = pubClient.duplicate();
      try {
        // Requer dinamicamente para evitar erro de tipos quando o pacote ainda não estiver instalado no dev
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createAdapter } = require("@socket.io/redis-adapter");
        io.adapter(createAdapter(pubClient as any, subClient as any));
        logger.info(`Socket.IO Redis adapter habilitado (${redisUrl})`);
      } catch (innerErr) {
        logger.warn("Pacote '@socket.io/redis-adapter' não encontrado. Prosseguindo sem adapter.");
      }
    } else {
      logger.warn("Socket.IO Redis adapter desabilitado: defina SOCKET_REDIS_URL ou REDIS_URI/REDIS_URI_ACK");
    }
  } catch (err) {
    logger.error("Falha ao configurar Socket.IO Redis adapter", err);
  }

  // O namespace raiz mantém compatibilidade com conexões públicas sem token.
  io.use(authenticateSocket(false));

  // Admin UI apenas em desenvolvimento
  const isAdminEnabled = process.env.SOCKET_ADMIN === "true" && process.env.NODE_ENV !== "production";
  if (isAdminEnabled && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    try {
      instrument(io, {
        auth: {
          type: "basic",
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD,
        },
        mode: "development",
        readonly: true,
      });
      logger.info("Socket.IO Admin UI inicializado em modo de desenvolvimento");
    } catch (error) {
      logger.error("Falha ao inicializar Socket.IO Admin UI", error);
    }
  } else if (isAdminEnabled) {
    logger.warn("Credenciais de administrador ausentes, Admin UI não inicializado");
  }

  // Namespaces dinâmicos com validação
  const workspaces = io.of((name, auth, next) => {
    if (ALLOWED_NAMESPACES.test(name)) {
      next(null, true);
    } else {
      logger.warn(`Tentativa de conexão a namespace inválido: ${name}`);
      next(new SocketCompatibleAppError("Namespace inválido", 403), false);
    }
  });
  workspaces.use(authenticateSocket(true));

  workspaces.on("connection", (socket) => {
    const clientIp = socket.handshake.address;
    const authenticatedUserId = socket.data.user?.userId || "desconhecido";
    logger.info(
      `[SOCKET] Cliente conectado ao namespace ${socket.nsp.name} ` +
      `(IP: ${clientIp}, userId: ${authenticatedUserId}, transporte: ${socket.conn.transport.name})`
    );

    // userId autenticado vem do JWT (socket.data.user); query.userId é opcional/legado.
    const userId = socket.handshake.query.userId as string;
    if (userId && userId !== "undefined" && !isValidUUID(userId)) {
      logger.warn(`userId inválido na query de ${clientIp} (ignorado; JWT prevalece)`);
    }

    // logger.info(`Cliente conectado ao namespace ${socket.nsp.name} (IP: ${clientIp})`);

    socket.on("joinChatBox", async (ticketId: string, callback?: (error?: string) => void) => {
      const normalizedId = (ticketId ?? "").toString().trim();
      if (!normalizedId || normalizedId === "undefined" || !isValidUUID(normalizedId)) {
        logger.warn(`ticketId inválido: ${normalizedId || "vazio"}`);
        callback?.("ID de ticket inválido");
        return;
      }
      await socket.join(normalizedId);
      logger.info(`Cliente entrou no canal de ticket ${ticketId} no namespace ${socket.nsp.name}`);
      if (process.env.SOCKET_DEBUG === "true") {
        try {
          const sockets = await socket.nsp.in(normalizedId).fetchSockets();
          logger.info(`[SOCKET JOIN DEBUG] ns=${socket.nsp.name} room=${normalizedId} count=${sockets.length}`);
        } catch (e) {
          logger.warn(`[SOCKET JOIN DEBUG] falha ao consultar sala ${normalizedId} em ${socket.nsp.name}`);
        }
      }
      callback?.();
    });

    socket.on("joinNotification", (callback?: (error?: string) => void) => {
      socket.join("notification");
      logger.info(`Cliente entrou no canal de notificações no namespace ${socket.nsp.name}`);
      callback?.();
    });

    socket.on("joinTickets", (status: string, callback?: (error?: string) => void) => {
      if (!isValidStatus(status)) {
        logger.warn(`Status inválido: ${status}`);
        callback?.("Status inválido");
        return;
      }
      socket.join(status);
      logger.info(`Cliente entrou no canal ${status} no namespace ${socket.nsp.name}`);
      callback?.();
    });

    socket.on("joinTicketsLeave", (status: string, callback?: (error?: string) => void) => {
      if (!isValidStatus(status)) {
        logger.warn(`Status inválido: ${status}`);
        callback?.("Status inválido");
        return;
      }
      socket.leave(status);
      logger.info(`Cliente saiu do canal ${status} no namespace ${socket.nsp.name}`);
      callback?.();
    });

    socket.on("joinChatBoxLeave", (ticketId: string, callback?: (error?: string) => void) => {
      const normalizedId = (ticketId ?? "").toString().trim();
      if (!normalizedId || normalizedId === "undefined" || !isValidUUID(normalizedId)) {
        logger.warn(`ticketId inválido: ${normalizedId || "vazio"}`);
        callback?.("ID de ticket inválido");
        return;
      }
      socket.leave(normalizedId);
      logger.info(`Cliente saiu do canal de ticket ${ticketId} no namespace ${socket.nsp.name}`);
      callback?.();
    });

    // Diagnóstico: verifica se o socket está em uma sala e quantos sockets existem nela
    socket.on("debugCheckRoom", async (roomId: string, callback?: (data: any) => void) => {
      try {
        const room = (roomId ?? "").toString().trim();
        if (!room) {
          callback?.({ error: "invalid room" });
          return;
        }
        const sockets = await socket.nsp.in(room).fetchSockets();
        const present = sockets.some(s => s.id === socket.id);
        const payload = {
          present,
          count: sockets.length,
          room,
          roomsOfSocket: Array.from(socket.rooms || [])
        };
        if (process.env.SOCKET_DEBUG === "true") {
          logger.info(`[SOCKET DEBUG] Room ${room} -> present=${present} count=${sockets.length} socketId=${socket.id}`);
        }
        callback?.(payload);
      } catch (e) {
        if (process.env.SOCKET_DEBUG === "true") {
          logger.error("[SOCKET DEBUG] Falha em debugCheckRoom", e);
        }
        callback?.({ error: (e as Error).message });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Cliente desconectado do namespace ${socket.nsp.name} (IP: ${clientIp})`);
    });

    socket.on("error", (error) => {
      logger.error(`Erro no socket do namespace ${socket.nsp.name}: ${error.message}`);
    });
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new SocketCompatibleAppError("Socket IO não inicializado", 500);
  }
  return io;
};

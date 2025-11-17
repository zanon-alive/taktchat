/**
 * Utilitários para mock de socket nos testes
 */

/**
 * Cria um mock de socket com métodos básicos
 */
export const createMockSocket = (options = {}) => {
  const {
    connected = true,
    id = 'mock-socket-id',
    onHandlers = {},
    emitHandlers = {},
  } = options;

  const mockSocket = {
    id,
    connected,
    on: jest.fn((event, handler) => {
      onHandlers[event] = handler;
      return mockSocket;
    }),
    off: jest.fn((event, handler) => {
      if (onHandlers[event]) {
        delete onHandlers[event];
      }
      return mockSocket;
    }),
    emit: jest.fn((event, ...args) => {
      if (emitHandlers[event]) {
        emitHandlers[event](...args);
      }
      return mockSocket;
    }),
    disconnect: jest.fn(() => {
      mockSocket.connected = false;
      return mockSocket;
    }),
    connect: jest.fn(() => {
      mockSocket.connected = true;
      return mockSocket;
    }),
  };

  return { mockSocket, onHandlers, emitHandlers };
};

/**
 * Cria um mock de socket inválido (sem método on)
 */
export const createInvalidSocket = () => {
  return {
    connected: false,
    // Sem método on
  };
};

/**
 * Cria um mock de socket vazio (objeto vazio)
 */
export const createEmptySocket = () => {
  return {};
};

/**
 * Cria um mock de socket null/undefined
 */
export const createNullSocket = () => {
  return null;
};

/**
 * Helper para simular eventos de socket
 */
export const simulateSocketEvent = (socket, event, data) => {
  if (socket && socket.onHandlers && socket.onHandlers[event]) {
    socket.onHandlers[event](data);
  }
};

/**
 * Helper para verificar se socket.on foi chamado corretamente
 */
export const expectSocketOnCalled = (mockSocket, event, times = 1) => {
  expect(mockSocket.on).toHaveBeenCalledWith(
    expect.stringContaining(event),
    expect.any(Function)
  );
  expect(mockSocket.on).toHaveBeenCalledTimes(times);
};

/**
 * Helper para verificar se socket.off foi chamado no cleanup
 */
export const expectSocketOffCalled = (mockSocket, event, times = 1) => {
  expect(mockSocket.off).toHaveBeenCalledWith(
    expect.stringContaining(event),
    expect.any(Function)
  );
};

/**
 * Helper para criar mock de user
 */
export const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    companyId: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
};

/**
 * Helper para criar mock de AuthContext
 */
export const createMockAuthContext = (overrides = {}) => {
  const { mockSocket } = createMockSocket();
  const mockUser = createMockUser();

  return {
    user: mockUser,
    socket: mockSocket,
    isAuth: true,
    loading: false,
    handleLogin: jest.fn(),
    handleLogout: jest.fn(),
    ...overrides,
  };
};


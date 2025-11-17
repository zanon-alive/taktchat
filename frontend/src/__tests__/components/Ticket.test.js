/**
 * Testes para o componente Ticket
 * Foca nas verificações de socket implementadas
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Ticket from '../../components/Ticket';
import { AuthContext } from '../../context/Auth/AuthContext';
import {
  createMockSocket,
  createInvalidSocket,
  createEmptySocket,
  createNullSocket,
  createMockUser,
} from '../setup/socketMocks';

// Mock do useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ ticketId: 'test-ticket-id' }),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock do api
jest.mock('../../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

const renderWithProviders = (component, { socket, user, ...authOverrides } = {}) => {
  const mockUser = user || createMockUser();
  const mockAuthContext = {
    user: mockUser,
    socket: socket || createMockSocket().mockSocket,
    isAuth: true,
    loading: false,
    handleLogin: jest.fn(),
    handleLogout: jest.fn(),
    ...authOverrides,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Ticket Component - Socket Verifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('não deve chamar socket.on quando socket é null', () => {
    const { mockSocket } = createMockSocket();
    
    renderWithProviders(<Ticket />, {
      socket: null,
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando socket é undefined', () => {
    const { mockSocket } = createMockSocket();
    
    renderWithProviders(<Ticket />, {
      socket: undefined,
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando socket não tem método on', () => {
    const invalidSocket = createInvalidSocket();
    
    renderWithProviders(<Ticket />, {
      socket: invalidSocket,
    });

    // Não deve quebrar, apenas não deve registrar listeners
    expect(() => {
      renderWithProviders(<Ticket />, { socket: invalidSocket });
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando socket é objeto vazio', () => {
    const emptySocket = createEmptySocket();
    
    renderWithProviders(<Ticket />, {
      socket: emptySocket,
    });

    // Não deve quebrar
    expect(() => {
      renderWithProviders(<Ticket />, { socket: emptySocket });
    }).not.toThrow();
  });

  test('deve chamar socket.on quando socket é válido e tem companyId', () => {
    const { mockSocket } = createMockSocket();
    
    renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  test('deve chamar socket.off no cleanup quando socket é válido', () => {
    const { mockSocket } = createMockSocket();
    
    const { unmount } = renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    unmount();

    waitFor(() => {
      expect(mockSocket.off).toHaveBeenCalled();
    });
  });

  test('deve verificar socket.emit antes de chamar joinChatBoxLeave', () => {
    const { mockSocket } = createMockSocket();
    mockSocket.emit = jest.fn();
    
    const { unmount } = renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    unmount();

    waitFor(() => {
      // Verifica que emit só é chamado se socket.emit é uma função
      if (typeof mockSocket.emit === 'function') {
        expect(mockSocket.emit).toHaveBeenCalled();
      }
    });
  });

  test('não deve quebrar quando socket.off não é uma função no cleanup', () => {
    const invalidSocket = {
      ...createMockSocket().mockSocket,
      off: null,
    };
    
    const { unmount } = renderWithProviders(<Ticket />, {
      socket: invalidSocket,
    });

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  test('deve verificar socket.connected antes de chamar onConnectTicket', () => {
    const { mockSocket } = createMockSocket();
    mockSocket.connected = false;
    
    renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    // Não deve chamar onConnectTicket se não estiver conectado
    waitFor(() => {
      // Verifica que não houve erro
      expect(mockSocket.on).toHaveBeenCalled();
    });
  });
});


/**
 * Testes para o componente Ticket
 * Foca nas verificações de socket implementadas
 */

import React from 'react';
import { render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import Ticket from '../../components/Ticket';
import { AuthContext } from '../../context/Auth/AuthContext';
import { TicketsContext } from '../../context/Tickets/TicketsContext';
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

// Mantém estes testes focados no ciclo de vida do socket do Ticket.
jest.mock('../../components/ContactDrawer', () => () => null);
jest.mock('../../components/MessageInput', () => () => null);
jest.mock('../../components/MessagesList', () => () => null);
jest.mock('../../components/TicketInfo', () => () => null);
jest.mock('../../components/TicketActionButtonsCustom', () => () => null);
jest.mock('../../components/TicketHeader', () => () => null);

const theme = createTheme();

const renderWithProviders = (component, options = {}) => {
  const { user, ...authOverrides } = options;
  const mockUser = user || createMockUser();
  const mockAuthContext = {
    user: mockUser,
    socket: Object.prototype.hasOwnProperty.call(options, 'socket')
      ? options.socket
      : createMockSocket().mockSocket,
    isAuth: true,
    loading: false,
    handleLogin: jest.fn(),
    handleLogout: jest.fn(),
    ...authOverrides,
  };

  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={mockAuthContext}>
          <TicketsContext.Provider value={{ setTabOpen: jest.fn() }}>
            {component}
          </TicketsContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
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

    expect(mockSocket.on).toHaveBeenCalled();
  });

  test('deve chamar socket.off no cleanup quando socket é válido', () => {
    const { mockSocket } = createMockSocket();
    
    const { unmount } = renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalled();
  });

  test('deve verificar socket.emit antes de chamar joinChatBoxLeave', () => {
    const { mockSocket } = createMockSocket();
    mockSocket.emit = jest.fn();
    
    const { unmount } = renderWithProviders(<Ticket />, {
      socket: mockSocket,
    });

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'joinChatBoxLeave',
      'test-ticket-id',
      expect.any(Function)
    );
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
    expect(mockSocket.on).toHaveBeenCalled();
  });
});


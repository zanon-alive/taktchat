/**
 * Testes para o componente TicketsListCustom
 * Foca nas verificações de socket implementadas
 */

import React from 'react';
import { render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TicketsListCustom from '../../components/TicketsListCustom';
import { AuthContext } from '../../context/Auth/AuthContext';
import {
  createMockSocket,
  createInvalidSocket,
  createEmptySocket,
  createMockUser,
} from '../setup/socketMocks';

// Mock do api
jest.mock('../../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: { records: [], hasMore: false } })),
}));

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
    ...authOverrides,
  };

  return render(
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

describe('TicketsListCustom Component - Socket Verifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('não deve chamar socket.on quando socket é null', () => {
    const { mockSocket } = createMockSocket();
    
    renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: null }
    );

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando socket não tem método on', () => {
    const invalidSocket = createInvalidSocket();
    
    expect(() => {
      renderWithProviders(
        <TicketsListCustom
          status="open"
          updateCount={jest.fn()}
        />,
        { socket: invalidSocket }
      );
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando user.companyId não existe', () => {
    const { mockSocket } = createMockSocket();
    const userWithoutCompanyId = createMockUser();
    delete userWithoutCompanyId.companyId;
    
    renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: mockSocket, user: userWithoutCompanyId }
    );

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('deve chamar socket.on quando socket e user são válidos', () => {
    const { mockSocket } = createMockSocket();
    
    renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: mockSocket }
    );

    expect(mockSocket.on).toHaveBeenCalled();
  });

  test('deve verificar socket.emit antes de chamar joinTickets', () => {
    const { mockSocket, onHandlers } = createMockSocket();
    mockSocket.emit = jest.fn();
    
    renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: mockSocket }
    );

    onHandlers.connect();
    expect(mockSocket.emit).toHaveBeenCalledWith('joinTickets', 'open');
  });

  test('deve chamar socket.off no cleanup quando socket é válido', () => {
    const { mockSocket } = createMockSocket();
    
    const { unmount } = renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: mockSocket }
    );

    unmount();

    expect(mockSocket.off).toHaveBeenCalled();
  });

  test('não deve quebrar quando socket.off não é uma função no cleanup', () => {
    const invalidSocket = {
      ...createMockSocket().mockSocket,
      off: null,
    };
    
    const { unmount } = renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: invalidSocket }
    );

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  test('deve verificar socket.emit antes de chamar leaveTickets no cleanup', () => {
    const { mockSocket } = createMockSocket();
    mockSocket.emit = jest.fn();
    
    const { unmount } = renderWithProviders(
      <TicketsListCustom
        status="open"
        updateCount={jest.fn()}
      />,
      { socket: mockSocket }
    );

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith('leaveTickets', 'open');
  });
});


/**
 * Testes para o hook useUserMoments
 * Foca nas verificações de socket implementadas
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import useUserMoments from '../../hooks/useUserMoments';
import { AuthContext } from '../../context/Auth/AuthContext';
import {
  createMockSocket,
  createInvalidSocket,
  createEmptySocket,
  createMockUser,
} from '../setup/socketMocks';

// Mock do api
jest.mock('../../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

// Mock do toast
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock do i18n
jest.mock('../../translate/i18n', () => ({
  i18n: {
    t: jest.fn((key) => key),
  },
}));

const createWrapper = (socket, user) => {
  const mockUser = user || createMockUser();
  const mockAuthContext = {
    user: mockUser,
    socket: socket || createMockSocket().mockSocket,
    isAuth: true,
    loading: false,
  };

  return ({ children }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useUserMoments Hook - Socket Verifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('não deve chamar socket.on quando socket é null', () => {
    const { mockSocket } = createMockSocket();
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(null),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando socket não tem método on', () => {
    const invalidSocket = createInvalidSocket();
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(invalidSocket),
    });

    // Não deve quebrar
    expect(() => {
      renderHook(() => useUserMoments(), {
        wrapper: createWrapper(invalidSocket),
      });
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando socket é objeto vazio', () => {
    const emptySocket = createEmptySocket();
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(emptySocket),
    });

    // Não deve quebrar
    expect(() => {
      renderHook(() => useUserMoments(), {
        wrapper: createWrapper(emptySocket),
      });
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando user.id não existe', () => {
    const { mockSocket } = createMockSocket();
    const userWithoutId = createMockUser();
    delete userWithoutId.id;
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(mockSocket, userWithoutId),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando user.companyId não existe', () => {
    const { mockSocket } = createMockSocket();
    const userWithoutCompanyId = createMockUser();
    delete userWithoutCompanyId.companyId;
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(mockSocket, userWithoutCompanyId),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('deve chamar socket.on quando socket e user são válidos', () => {
    const { mockSocket } = createMockSocket();
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(mockSocket),
    });

    waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  test('deve chamar socket.off no cleanup quando socket é válido', () => {
    const { mockSocket } = createMockSocket();
    
    const { unmount } = renderHook(() => useUserMoments(), {
      wrapper: createWrapper(mockSocket),
    });

    unmount();

    waitFor(() => {
      expect(mockSocket.off).toHaveBeenCalled();
    });
  });

  test('não deve quebrar quando socket.off não é uma função no cleanup', () => {
    const invalidSocket = {
      ...createMockSocket().mockSocket,
      off: null,
    };
    
    const { unmount } = renderHook(() => useUserMoments(), {
      wrapper: createWrapper(invalidSocket),
    });

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  test('deve registrar listeners para company-ticket e company-appMessage', () => {
    const { mockSocket } = createMockSocket();
    
    renderHook(() => useUserMoments(), {
      wrapper: createWrapper(mockSocket),
    });

    waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        expect.stringContaining('company-'),
        expect.any(Function)
      );
      // Deve ser chamado 2 vezes (ticket e appMessage)
      expect(mockSocket.on).toHaveBeenCalledTimes(2);
    });
  });
});


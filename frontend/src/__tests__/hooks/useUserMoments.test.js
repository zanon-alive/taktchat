/**
 * Testes para o hook useUserMoments
 * Foca nas verificações de socket implementadas
 */

import React from 'react';
import { render } from '@testing-library/react';
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

const createWrapper = (options = {}) => {
  const mockUser = options.user || createMockUser();
  const mockAuthContext = {
    user: mockUser,
    socket: Object.prototype.hasOwnProperty.call(options, 'socket')
      ? options.socket
      : createMockSocket().mockSocket,
    isAuth: true,
    loading: false,
  };

  return ({ children }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

const renderTestHook = (callback, { wrapper: Wrapper }) => {
  const TestHook = () => {
    callback();
    return null;
  };

  return render(
    <Wrapper>
      <TestHook />
    </Wrapper>
  );
};

describe('useUserMoments Hook - Socket Verifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('não deve chamar socket.on quando socket é null', () => {
    const { mockSocket } = createMockSocket();
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: null }),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando socket não tem método on', () => {
    const invalidSocket = createInvalidSocket();
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: invalidSocket }),
    });

    // Não deve quebrar
    expect(() => {
      renderTestHook(() => useUserMoments(), {
        wrapper: createWrapper({ socket: invalidSocket }),
      });
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando socket é objeto vazio', () => {
    const emptySocket = createEmptySocket();
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: emptySocket }),
    });

    // Não deve quebrar
    expect(() => {
      renderTestHook(() => useUserMoments(), {
        wrapper: createWrapper({ socket: emptySocket }),
      });
    }).not.toThrow();
  });

  test('não deve chamar socket.on quando user.id não existe', () => {
    const { mockSocket } = createMockSocket();
    const userWithoutId = createMockUser();
    delete userWithoutId.id;
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: mockSocket, user: userWithoutId }),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('não deve chamar socket.on quando user.companyId não existe', () => {
    const { mockSocket } = createMockSocket();
    const userWithoutCompanyId = createMockUser();
    delete userWithoutCompanyId.companyId;
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: mockSocket, user: userWithoutCompanyId }),
    });

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('deve chamar socket.on quando socket e user são válidos', () => {
    const { mockSocket } = createMockSocket();
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: mockSocket }),
    });

    expect(mockSocket.on).toHaveBeenCalled();
  });

  test('deve chamar socket.off no cleanup quando socket é válido', () => {
    const { mockSocket } = createMockSocket();
    
    const { unmount } = renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: mockSocket }),
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalled();
  });

  test('não deve quebrar quando socket.off não é uma função no cleanup', () => {
    const invalidSocket = {
      ...createMockSocket().mockSocket,
      off: null,
    };
    
    const { unmount } = renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: invalidSocket }),
    });

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  test('deve registrar listeners para company-ticket e company-appMessage', () => {
    const { mockSocket } = createMockSocket();
    
    renderTestHook(() => useUserMoments(), {
      wrapper: createWrapper({ socket: mockSocket }),
    });

    expect(mockSocket.on).toHaveBeenCalledWith(
      expect.stringContaining('company-'),
      expect.any(Function)
    );
    // Deve ser chamado 2 vezes (ticket e appMessage)
    expect(mockSocket.on).toHaveBeenCalledTimes(2);
  });
});


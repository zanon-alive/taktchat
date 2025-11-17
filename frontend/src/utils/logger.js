/**
 * Logger Helper
 * 
 * Fornece funções de logging que são automaticamente removidas em produção.
 * Use este helper em vez de console.log diretamente para melhor controle.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger object com métodos para diferentes níveis de log
 */
export const logger = {
  /**
   * Log de debug (removido em produção)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de aviso (removido em produção)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de erro (sempre exibido, mesmo em produção)
   * Use para erros críticos que precisam ser monitorados
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log de debug (removido em produção)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de informação (removido em produção)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de grupo (removido em produção)
   */
  group: (...args) => {
    if (isDevelopment) {
      console.group(...args);
    }
  },

  /**
   * Fechar grupo (removido em produção)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log de tabela (removido em produção)
   */
  table: (...args) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },
};

export default logger;


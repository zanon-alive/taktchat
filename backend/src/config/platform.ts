/**
 * Configuração da empresa de gestão da plataforma (Dono da Plataforma)
 * 
 * Esta empresa é responsável por:
 * - Gerenciar todas as outras empresas
 * - Criar e gerenciar planos da plataforma
 * - Ter usuários com permissão 'super' (dono do sistema)
 * - Controlar o faturamento e licenças
 */

/**
 * Obtém o ID da empresa de gestão da plataforma
 * 
 * @returns {number} ID da empresa plataforma (default: 1)
 */
export const getPlatformCompanyId = (): number => {
  const envValue = process.env.PLATFORM_COMPANY_ID;
  
  if (!envValue) {
    // Fallback seguro para empresa 1 (padrão do seed inicial)
    return 1;
  }
  
  const parsed = parseInt(envValue, 10);
  
  if (isNaN(parsed) || parsed < 1) {
    console.warn(
      `[Platform Config] PLATFORM_COMPANY_ID inválido: "${envValue}". Usando default: 1`
    );
    return 1;
  }
  
  return parsed;
};

/**
 * Valida se um companyId é a empresa de gestão da plataforma
 * 
 * @param {number} companyId - ID da empresa a validar
 * @returns {boolean} true se for a empresa plataforma
 */
export const isPlatformCompany = (companyId: number): boolean => {
  return companyId === getPlatformCompanyId();
};

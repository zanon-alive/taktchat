import api from "./api";

// Serviço para gerenciar configurações OpenAI centralizadas
class OpenAIService {
  // Buscar configuração OpenAI ativa da empresa
  static async getActiveConfig() {
    try {
      const { data } = await api.get("/queueIntegration", {
        params: { type: "openai", active: true }
      });
      
      // Retorna a primeira configuração OpenAI ativa encontrada
      const openaiConfig = data.queueIntegrations?.find(config => config.type === "openai");
      return openaiConfig || null;
    } catch (error) {
      console.error("Erro ao buscar configuração OpenAI:", error);
      return null;
    }
  }

  // Buscar todas as configurações OpenAI da empresa
  static async getAllConfigs() {
    try {
      const { data } = await api.get("/queueIntegration", {
        params: { type: "openai" }
      });
      
      return data.queueIntegrations?.filter(config => config.type === "openai") || [];
    } catch (error) {
      console.error("Erro ao buscar configurações OpenAI:", error);
      return [];
    }
  }

  // Validar se existe configuração OpenAI ativa
  static async hasActiveConfig() {
    const config = await this.getActiveConfig();
    return config && config.apiKey;
  }

  // Obter configurações padrão para novos prompts/flows
  static async getDefaultSettings() {
    const config = await this.getActiveConfig();
    
    if (!config) {
      return {
        model: "gpt-3.5-turbo-1106",
        temperature: 1,
        maxTokens: 100,
        maxMessages: 10,
        apiKey: "",
      };
    }

    return {
      model: config.model || "gpt-3.5-turbo-1106",
      temperature: config.temperature || 1,
      maxTokens: config.maxTokens || 100,
      maxMessages: config.maxMessages || 10,
      apiKey: config.apiKey || "",
    };
  }
}

export default OpenAIService;

interface DiagnosticResult {
    diagnosis: string;
    suggestions: string[];
    severity: "info" | "warning" | "error" | "critical";
    userFriendlyMessage: string;
}

export class ConnectionDiagnostic {
    static analyze(params: {
        eventType: string;
        statusCode?: number;
        errorMessage?: string;
        eventData?: any;
    }): DiagnosticResult {
        const { eventType, statusCode, errorMessage, eventData } = params;

        // device_removed (401)
        if (statusCode === 401 && (errorMessage?.includes("device_removed") || eventData?.isDeviceRemoved)) {
            return {
                diagnosis: "WhatsApp removeu o dispositivo ativamente",
                severity: "critical",
                userFriendlyMessage:
                    "O WhatsApp desconectou este número. Isso NÃO é um problema da plataforma TaktChat.",
                suggestions: [
                    "Verifique se o número está funcionando no WhatsApp Mobile",
                    "Pode estar bloqueado por spam ou múltiplas conexões",
                    "Aguarde 48 horas antes de tentar reconectar",
                    "Considere usar outro número",
                    "Verifique se não foi removido manualmente nos 'Aparelhos Conectados'",
                ],
            };
        }

        // Intentional Logout (401)
        if (statusCode === 401 && errorMessage?.includes("Intentional Logout")) {
            return {
                diagnosis: "Desconexão manual",
                severity: "info",
                userFriendlyMessage: "Você desconectou o WhatsApp manualmente.",
                suggestions: [
                    "Para reconectar, gere um novo QR Code",
                ],
            };
        }

        // Connection Terminated (428)
        if (statusCode === 428) {
            return {
                diagnosis: "Conexão terminada - credenciais podem estar inválidas",
                severity: "error",
                userFriendlyMessage: "A conexão foi interrompida pelo WhatsApp.",
                suggestions: [
                    "O sistema tentará reconectar automaticamente",
                    "Se persistir, desconecte e reconecte o número",
                    "Verifique se o QR Code foi escaneado corretamente",
                ],
            };
        }

        // Restart Required (515)
        if (statusCode === 515) {
            return {
                diagnosis: "WhatsApp solicitou reinicialização",
                severity: "warning",
                userFriendlyMessage: "O WhatsApp pediu para reiniciar a conexão.",
                suggestions: [
                    "O sistema está reconectando automaticamente",
                    "Aguarde alguns segundos",
                ],
            };
        }

        // QR Code gerado
        if (eventType === "qr_code_generated") {
            return {
                diagnosis: "QR Code gerado - aguardando escaneamento",
                severity: "info",
                userFriendlyMessage: "Escaneie o QR Code com seu WhatsApp Mobile",
                suggestions: [
                    "Abra o WhatsApp Mobile",
                    "Vá em: Configurações → Aparelhos conectados",
                    "Toque em: Conectar um aparelho",
                    "Escaneie o QR Code exibido",
                ],
            };
        }

        // Conexão aberta
        if (eventType === "connection_open" || (eventType === "connection_update" && eventData?.connection === "open")) {
            return {
                diagnosis: "Conexão estabelecida com sucesso",
                severity: "info",
                userFriendlyMessage: "WhatsApp conectado com sucesso!",
                suggestions: [],
            };
        }

        // Conexão fechada (genérico)
        if (eventType === "connection_close" || (eventType === "connection_update" && eventData?.connection === "close")) {
            // Verificar se é device_removed (401) mesmo quando vem como connection_close
            if (statusCode === 401) {
                return {
                    diagnosis: "Dispositivo removido pelo WhatsApp",
                    severity: "critical",
                    userFriendlyMessage: "O WhatsApp removeu este dispositivo. É necessário gerar um novo QR Code.",
                    suggestions: [
                        "Clique no botão 'Novo QR' para reconectar",
                        "Verifique se o número não foi bloqueado por spam",
                        "Verifique se não foi removido manualmente nos 'Aparelhos Conectados'",
                    ],
                };
            }

            return {
                diagnosis: "Conexão fechada",
                severity: "warning",
                userFriendlyMessage: `A conexão foi fechada. Motivo: ${errorMessage || "Desconhecido"}`,
                suggestions: [
                    "Aguarde a reconexão automática"
                ],
            };
        }

        // Padrão
        return {
            diagnosis: "Evento de conexão",
            severity: "info",
            userFriendlyMessage: `Evento: ${eventType}`,
            suggestions: [],
        };
    }
}

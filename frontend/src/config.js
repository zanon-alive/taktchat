function getConfig(name, defaultValue = null) {
    // If inside a docker container, use window.ENV
    if (window.ENV !== undefined) {
        return window.ENV[name] || defaultValue;
    }

    return process.env[name] || defaultValue;
}

export function getBackendUrl() {
    // 1. Tentar window.ENV primeiro (configuração runtime via nginx/docker)
    if (window.ENV?.REACT_APP_BACKEND_URL) {
        return window.ENV.REACT_APP_BACKEND_URL;
    }
    
    // 2. Detectar baseado no hostname atual (runtime)
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        
        // Mapear hostname para URL da API
        if (hostname === 'taktchat.com.br' || hostname === 'www.taktchat.com.br') {
            return 'https://api.taktchat.com.br';
        }
        if (hostname === 'taktchat.alivesolucoes.com.br') {
            return 'https://taktchat-api.alivesolucoes.com.br';
        }
        // Em desenvolvimento local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8080';
        }
    }
    
    // 3. Fallback para variável de ambiente (build-time)
    return getConfig('REACT_APP_BACKEND_URL');
}

export function getHoursCloseTicketsAuto() {
    return getConfig('REACT_APP_HOURS_CLOSE_TICKETS_AUTO');
}

export function getFrontendPort() {
    return getConfig('SERVER_PORT');
}

export function getPrimaryColor() {
    return getConfig("REACT_APP_PRIMARY_COLOR");
}

export function getPrimaryDark() {
    return getConfig("REACT_APP_PRIMARY_DARK");
}

export function getNumberSupport() {
    return getConfig("REACT_APP_NUMBER_SUPPORT");
}
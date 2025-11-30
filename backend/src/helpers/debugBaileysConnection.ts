import * as fsp from 'fs/promises';
import * as fs from 'fs';
import path from 'path';
import moment from 'moment';

/**
 * Módulo para debug detalhado de conexões Baileys
 * Permite rastrear passo a passo o processo de conexão e desconexão
 */

interface DebugLogEntry {
    timestamp: string; // ISO format com milissegundos
    timestampMs: number; // timestamp em milissegundos
    whatsappId: number;
    phoneNumber: string;
    eventType: string; // "qr_generated", "connection_open", "connection_close", "creds_update", etc.
    elapsedMs?: number; // ms desde início da sessão
    data: any; // dados específicos do evento
    stackTrace?: string; // se for erro
}

// Armazenamento em memória dos logs ativos
const activeLogs = new Map<number, {
    fileName: string;
    startTime: number;
    phoneNumber: string;
    entries: DebugLogEntry[];
}>();

/**
 * Inicializa um novo arquivo de log para debug de uma conexão
 */
export async function initDebugLog(whatsappId: number, phoneNumber: string): Promise<string> {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `baileys-debug-whatsapp-${whatsappId}-${phoneNumber}-${timestamp}.log`;
    const logsDir = path.resolve(__dirname, '..', '..', 'logs', 'baileys-debug');

    // Criar diretório se não existir
    try {
        if (!fs.existsSync(logsDir)) {
            await fsp.mkdir(logsDir, { recursive: true });
        }
    } catch (error) {
        console.error('[DebugBaileys] Erro ao criar diretório de logs:', error);
    }

    const filePath = path.resolve(logsDir, fileName);

    // Inicializar estrutura em memória
    activeLogs.set(whatsappId, {
        fileName: filePath,
        startTime: Date.now(),
        phoneNumber,
        entries: []
    });

    // Criar arquivo com header
    const header = `
========================================
BAILEYS CONNECTION DEBUG LOG
========================================
WhatsApp ID: ${whatsappId}
Phone Number: ${phoneNumber}
Start Time: ${moment().format('DD/MM/YYYY HH:mm:ss')}
Start Timestamp: ${Date.now()}
========================================

`;

    await fsp.writeFile(filePath, header);
    console.log(`[DebugBaileys] ✅ Log iniciado: ${filePath}`);

    return filePath;
}

/**
 * Adiciona um evento ao log de debug
 */
export async function logDebugEvent(
    whatsappId: number,
    eventType: string,
    data: any,
    stackTrace?: string
): Promise<void> {
    const logSession = activeLogs.get(whatsappId);

    if (!logSession) {
        console.warn(`[DebugBaileys] ⚠️ Nenhum log ativo para whatsappId=${whatsappId}. Ignorando evento: ${eventType}`);
        return;
    }

    const now = Date.now();
    const elapsedMs = now - logSession.startTime;

    const entry: DebugLogEntry = {
        timestamp: moment(now).format('DD/MM/YYYY HH:mm:ss.SSS'),
        timestampMs: now,
        whatsappId,
        phoneNumber: logSession.phoneNumber,
        eventType,
        elapsedMs,
        data,
        stackTrace
    };

    // Adicionar à lista em memória
    logSession.entries.push(entry);

    // Formatar para arquivo
    const logText = formatLogEntry(entry);

    // Escrever no arquivo
    try {
        await fsp.appendFile(logSession.fileName, logText + '\n');
    } catch (error) {
        console.error(`[DebugBaileys] ❌ Erro ao escrever log para whatsappId=${whatsappId}:`, error);
    }
}

/**
 * Formata uma entrada de log para escrita em arquivo
 */
function formatLogEntry(entry: DebugLogEntry): string {
    const elapsedSeconds = entry.elapsedMs ? (entry.elapsedMs / 1000).toFixed(3) : 'N/A';

    let text = `
----------------------------------------
[${entry.timestamp}] (+${elapsedSeconds}s)
Event: ${entry.eventType}
WhatsApp ID: ${entry.whatsappId}
Phone: ${entry.phoneNumber}
`;

    // Adicionar dados do evento
    if (entry.data) {
        text += `Data:\n${JSON.stringify(entry.data, null, 2)}\n`;
    }

    // Adicionar stack trace se houver
    if (entry.stackTrace) {
        text += `Stack Trace:\n${entry.stackTrace}\n`;
    }

    text += '----------------------------------------';

    return text;
}

/**
 * Fecha um log de debug e gera resumo
 */
export async function closeDebugLog(whatsappId: number, summary?: string): Promise<string | null> {
    const logSession = activeLogs.get(whatsappId);

    if (!logSession) {
        console.warn(`[DebugBaileys] ⚠️ Nenhum log ativo para fechar para whatsappId=${whatsappId}`);
        return null;
    }

    const totalTime = Date.now() - logSession.startTime;
    const totalSeconds = (totalTime / 1000).toFixed(2);

    // Gerar resumo
    const footer = `

========================================
LOG FINALIZADO
========================================
Total Time: ${totalSeconds}s
Total Events: ${logSession.entries.length}
End Time: ${moment().format('DD/MM/YYYY HH:mm:ss')}
${summary ? `Summary: ${summary}` : ''}
========================================

EVENTOS POR TIPO:
${generateEventSummary(logSession.entries)}

`;

    // Escrever footer
    try {
        await fsp.appendFile(logSession.fileName, footer);
    } catch (error) {
        console.error(`[DebugBaileys] ❌ Erro ao fechar log para whatsappId=${whatsappId}:`, error);
    }

    const filePath = logSession.fileName;

    // Remover da memória
    activeLogs.delete(whatsappId);

    console.log(`[DebugBaileys] ✅ Log finalizado: ${filePath}`);
    console.log(`[DebugBaileys] Total de eventos: ${logSession.entries.length}, Tempo total: ${totalSeconds}s`);

    return filePath;
}

/**
 * Gera resumo de eventos por tipo
 */
function generateEventSummary(entries: DebugLogEntry[]): string {
    const eventCounts = new Map<string, number>();

    entries.forEach(entry => {
        const count = eventCounts.get(entry.eventType) || 0;
        eventCounts.set(entry.eventType, count + 1);
    });

    let summary = '';
    eventCounts.forEach((count, eventType) => {
        summary += `  - ${eventType}: ${count}\n`;
    });

    return summary || '  (nenhum evento registrado)';
}

/**
 * Verifica se existe log ativo para um whatsappId
 */
export function hasActiveLog(whatsappId: number): boolean {
    return activeLogs.has(whatsappId);
}

/**
 * Obtém informações do log ativo
 */
export function getActiveLogInfo(whatsappId: number): { fileName: string; startTime: number; eventCount: number } | null {
    const logSession = activeLogs.get(whatsappId);
    if (!logSession) return null;

    return {
        fileName: logSession.fileName,
        startTime: logSession.startTime,
        eventCount: logSession.entries.length
    };
}

/**
 * Força a finalização de todos os logs ativos (útil para shutdown)
 */
export async function closeAllDebugLogs(): Promise<void> {
    const promises: Promise<string | null>[] = [];

    activeLogs.forEach((_, whatsappId) => {
        promises.push(closeDebugLog(whatsappId, 'Fechado automaticamente'));
    });

    await Promise.all(promises);
    console.log(`[DebugBaileys] Todos os logs foram fechados.`);
}

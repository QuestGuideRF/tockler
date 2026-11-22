import { Logger } from '../logger';
type EventData = unknown;
type EventListener = (event: EventData, ...args: unknown[]) => void;
interface ElectronBridge {
    invokeIpc: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
    sendIpc: (channel: string, ...args: unknown[]) => void;
    onIpc: (channel: string, listener: EventListener) => void;
    removeListenerIpc: (channel: string, listener: EventListener) => void;
}
const getElectronBridge = (): ElectronBridge => {
    return (window as unknown as { electronBridge: ElectronBridge }).electronBridge;
};
function send(name: string, ...args: unknown[]): void {
    Logger.debug(`Отправить событие: ${name}`);
    getElectronBridge().sendIpc(name, ...args);
}
function on(name: string, listener: EventListener): void {
    getElectronBridge().onIpc(name, listener);
}
function off(name: string, listener: EventListener): void {
    getElectronBridge().removeListenerIpc(name, listener);
}
async function emit<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
    try {
        Logger.debug(`Создать событие: ${name}`);
        const result = await getElectronBridge().invokeIpc<T>(name, ...args);
        return result;
    } catch (error) {
        console.error('[EventEmitter] не удалось выполнить эмитт для', name, 'с ошибкой:', error);
        throw error;
    }
}
export const ElectronEventEmitter = {
    send,
    on,
    off,
    emit,
};
import { logManager } from './log-manager';
const logger = logManager.getLogger('setupMainHandler');
const isPromise = (obj: any) => {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};
export const setupMainHandler = (electronModule: any, availableActions: any, enableLogs = false) => {
    enableLogs && logger.info('setupMainHandler Журналы включены!');
    Object.keys(availableActions).forEach((actionName) => {
        enableLogs && logger.info(`Создание дескриптора IPC для имени = ${actionName}`);
        electronModule.ipcMain.handle(actionName, async (_event: any, ...args: any[]) => {
            enableLogs && logger.info(`Получен новый запрос с именем = ${actionName}.`, args);
            try {
                const result = availableActions[actionName](...args);
                if (isPromise(result)) {
                    result.catch((e: any) => {
                        logger.error(e);
                        return { error: e.toString() };
                    });
                    return await result;
                }
                return result;
            } catch (e: any) {
                logger.error(e);
                return { error: e.toString() };
            }
        });
    });
};
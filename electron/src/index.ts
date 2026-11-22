import { app, ipcMain } from 'electron';
import contextMenu from 'electron-context-menu';
import AppManager from './app/app-manager';
import AppUpdater from './app/app-updater';
import WindowManager from './app/window-manager';
import { cleanupBackgroundJob, initBackgroundJob } from './background/initBackgroundJob';
import { config } from './utils/config';
import { logManager } from './utils/log-manager';
let logger = logManager.getLogger('AppIndex');
logger.info(`Версия Токлера: ${app.getVersion()}`);
app.setAppUserModelId('ee.trimatech.tockler');
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
    app.on('second-instance', () => {
        logger.debug('Сделать одиночный экземпляр');
        WindowManager.openMainWindow();
    });
    AppUpdater.init();
    app.commandLine.appendSwitch('enable-hardware-acceleration');
    app.commandLine.appendSwitch('ignore-gpu-blacklist');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch('disable-http-cache', 'true');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    app.commandLine.appendSwitch('disable-background-timer-throttling');
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
    contextMenu();
    ipcMain.on('close-app', () => {
        logger.info('Закрытие Токлера');
        app.quit();
    });
    app.on('will-quit', async () => {
        logger.debug('will-quit');
        await cleanupBackgroundJob();
        await AppManager.destroy();
    });
    app.on('window-all-closed', () => {
        logger.debug('window-all-closed');
        app.quit();
    });
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });
    app.on('activate', () => {
        logger.debug('Активировать событие');
        if (app.isReady()) {
            WindowManager.openMainWindow();
        } else {
            logger.debug('Приложение не готово к событию активации');
        }
    });
    app.on('ready', async () => {
        try {
            WindowManager.initMainWindowEvents();
            if (!config.isDev || config.trayEnabledInDev) {
                WindowManager.setTrayWindow();
            }
            WindowManager.setNotificationWindow();
            await AppManager.init();
            await initBackgroundJob();
        } catch (error) {
            logger.error(
                `Ошибка приложения в событии готовности: ${error instanceof Error ? error.toString() : String(error)}`,
                error,
            );
        }
    });
} else {
    logger.debug('Выход из экземпляра.');
    app.quit();
}
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import {
    ACTIVE_WINDOW_CHECK_INTERVAL,
    areEqualActiveWindow,
    normalizedActiveWindow,
    NormalizedActiveWindow,
} from './watchForActiveWindow.utils';
const logger = logManager.getLogger('watchForActiveWindow');
let interval: NodeJS.Timeout | null = null;
let lastActiveWindow: NormalizedActiveWindow | null = null;
async function checkActiveWindow() {
    const activeWindow = await normalizedActiveWindow();
    const windowChanged = lastActiveWindow && !areEqualActiveWindow(lastActiveWindow, activeWindow);
    if (!lastActiveWindow || windowChanged) {
        appEmitter.emit('active-window-changed', activeWindow);
    }
    lastActiveWindow = activeWindow;
}
async function watchForActiveWindow(backgroundJobInterval: number) {
    logger.debug('Добавить интервал checkActiveWindow');
    const timeInSeconds = backgroundJobInterval || ACTIVE_WINDOW_CHECK_INTERVAL;
    const timeInMs = timeInSeconds * 1000;
    checkActiveWindow();
    interval = setInterval(() => checkActiveWindow(), timeInMs);
}
function watchForActiveWindowRemove() {
    if (interval) {
        logger.debug('Удалить интервал checkActiveWindow');
        clearInterval(interval);
        interval = null;
    }
    lastActiveWindow = null;
}
export function startActiveWindowWatcher(backgroundJobInterval: number) {
    logger.warn('Запустить активный наблюдатель за окнами');
    watchForActiveWindow(backgroundJobInterval);
    return watchForActiveWindowRemove;
}
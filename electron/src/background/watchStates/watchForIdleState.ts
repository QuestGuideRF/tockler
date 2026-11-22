import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { checkIdleState, IDLE_STATE_CHECK_INTERVAL } from './watchForIdleState.utils';
const logger = logManager.getLogger('IdleStateWatcher');
let interval: NodeJS.Timeout | null = null;
function addIdleStateWatch(idleAfterSeconds: number) {
    removeIdleStateWatch();
    logger.debug('Добавить интервал проверки состояния простоя');
    interval = setInterval(() => checkIdleState(idleAfterSeconds), IDLE_STATE_CHECK_INTERVAL);
}
function removeIdleStateWatch() {
    if (interval) {
        logger.debug('Удалить интервал проверки состояния простоя');
        clearInterval(interval);
        interval = null;
    }
}
function startIdleStateWatcher(idleAfterSeconds: number) {
    addIdleStateWatch(idleAfterSeconds);
    return removeIdleStateWatch;
}
let removeIdleStateWatcher: () => void;
export function watchForIdleState(idleAfterSeconds: number) {
    logger.debug('Наблюдение за состоянием ожидания');
    removeIdleStateWatcher = startIdleStateWatcher(idleAfterSeconds);
    appEmitter.on('system-is-resuming', async () => {
        logger.debug('Состояние изменено: система возобновляет работу');
        if (removeIdleStateWatcher) {
            logger.warn('ОШИБКА: Остановка предыдущего средства наблюдения за состоянием простоя. Не должно произойти.');
            removeIdleStateWatcher();
        }
        removeIdleStateWatcher = startIdleStateWatcher(idleAfterSeconds);
    });
    appEmitter.on('system-is-sleeping', async () => {
        logger.debug('Состояние изменено: система спит');
        removeIdleStateWatcher?.();
    });
}
export function watchForIdleStateCleanup() {
    logger.debug('Удаление наблюдателя за состоянием простоя');
    removeIdleStateWatcher?.();
}
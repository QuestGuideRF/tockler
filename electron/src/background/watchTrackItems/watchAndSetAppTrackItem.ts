import { dbClient } from '../../drizzle/dbClient';
import { NewTrackItem, TrackItem } from '../../drizzle/schema';
import { State } from '../../enums/state';
import { TrackItemType } from '../../enums/track-item-type';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
import { startActiveWindowWatcher } from './watchForActiveWindow';
import { NormalizedActiveWindow } from './watchForActiveWindow.utils';
const logger = logManager.getLogger('watchAndSetAppTrackItem');
let currentAppItem: NewTrackItem | null = null;
async function setAppTrackItem(activeWindow: NormalizedActiveWindow) {
    logger.debug('Приложение изменено', activeWindow);
    const now = Date.now();
    if (currentAppItem) {
        currentAppItem.endDate = now;
        await dbClient.insertTrackItemInternal(currentAppItem);
    }
    currentAppItem = {
        taskName: TrackItemType.AppTrackItem,
        app: activeWindow.app,
        title: activeWindow.title,
        url: activeWindow.url,
        beginDate: now,
        endDate: now,
    };
}
export async function getOngoingAppTrackItem() {
    if (!currentAppItem) {
        return null;
    }
    const color = await dbClient.getAppColor(currentAppItem?.app || '');
    return { ...currentAppItem, endDate: Date.now(), id: 0, color } as TrackItem;
}
const saveOngoingTrackItem = async () => {
    logger.debug('Сохранить текущий элемент трека');
    if (currentAppItem) {
        currentAppItem.endDate = Date.now();
        await dbClient.insertTrackItemInternal(currentAppItem);
        currentAppItem = null;
    } else {
        logger.debug('Нет текущего элемента трека для сохранения');
    }
};
export function addActiveWindowWatch() {
    logger.info('Добавить прослушиватель активного окна');
    appEmitter.on('active-window-changed', (activeWindow) => {
        setAppTrackItem(activeWindow);
    });
}
async function removeActiveWindowWatch() {
    logger.info('Удалить прослушиватель активного окна');
    appEmitter.removeAllListeners('active-window-changed');
    await saveOngoingTrackItem();
}
let removeActiveWindowWatcher: () => void;
export function watchAndSetAppTrackItem(backgroundJobInterval: number) {
    logger.debug('Просмотр и установка элемента отслеживания приложения.......');
    addActiveWindowWatch();
    removeActiveWindowWatcher = startActiveWindowWatcher(backgroundJobInterval);
    appEmitter.on('state-changed', async (state: State) => {
        logger.debug('Состояние изменено: прослушиватель активного окна', state);
        if (state === State.Online) {
            logger.debug('Запустить активный наблюдатель за окнами');
            if (removeActiveWindowWatcher) {
                logger.warn('ОШИБКА: Остановка предыдущего активного средства просмотра окон. Не должно произойти.');
                removeActiveWindowWatcher();
            }
            removeActiveWindowWatcher = startActiveWindowWatcher(backgroundJobInterval);
        } else {
            removeActiveWindowWatcher?.();
            await saveOngoingTrackItem();
        }
    });
}
export async function watchAndSetAppTrackItemCleanup() {
    await removeActiveWindowWatch();
    removeActiveWindowWatcher?.();
}
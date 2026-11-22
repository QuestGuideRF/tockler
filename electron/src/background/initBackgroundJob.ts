import { dbClient } from '../drizzle/dbClient';
import { logManager } from '../utils/log-manager';
import { watchForBreakNotification, watchForBreakNotificationCleanup } from './watchBreak/watchForBreakNotification';
import { watchAndPropagateState, watchAndPropagateStateCleanup } from './watchStates/watchAndPropagateState';
import { watchForIdleState, watchForIdleStateCleanup } from './watchStates/watchForIdleState';
import { watchForPowerState, watchForPowerStateCleanup } from './watchStates/watchForPowerState';
import { watchAndSetAppTrackItem, watchAndSetAppTrackItemCleanup } from './watchTrackItems/watchAndSetAppTrackItem';
import { watchAndSetLogTrackItem, watchAndSetLogTrackItemCleanup } from './watchTrackItems/watchAndSetLogTrackItem';
import {
    watchAndSetStatusTrackItem,
    watchAndSetStatusTrackItemCleanup,
} from './watchTrackItems/watchAndSetStatusTrackItem';
let logger = logManager.getLogger('BackgroundJob');
export async function initBackgroundJob() {
    logger.debug('Инициализировать фоновую службу.');
    const dataSettings = await dbClient.fetchDataSettings();
    logger.debug('С настройками:', dataSettings);
    const { idleAfterSeconds, backgroundJobInterval } = dataSettings;
    watchForIdleState(idleAfterSeconds);
    watchForPowerState();
    watchAndPropagateState();
    watchAndSetStatusTrackItem();
    watchAndSetAppTrackItem(backgroundJobInterval);
    watchAndSetLogTrackItem();
    watchForBreakNotification();
}
export async function cleanupBackgroundJob() {
    logger.debug('Очистка фонового задания');
    watchForIdleStateCleanup();
    watchForPowerStateCleanup();
    watchAndPropagateStateCleanup();
    await watchAndSetStatusTrackItemCleanup();
    await watchAndSetAppTrackItemCleanup();
    await watchAndSetLogTrackItemCleanup();
    watchForBreakNotificationCleanup();
}
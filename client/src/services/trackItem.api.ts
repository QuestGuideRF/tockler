import { DateTime } from 'luxon';
import { ITrackItem, NewTrackItem } from '../@types/ITrackItem';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { ElectronEventEmitter } from './ElectronEventEmitter';
export async function findAllDayItems(from: DateTime, to: DateTime, taskName: string): Promise<ITrackItem[]> {
    const data = await ElectronEventEmitter.emit('findAllDayItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
    });
    return data as ITrackItem[];
}
export async function findAllDayItemsForEveryTrack(from: DateTime, to: DateTime) {
    const [appItems, statusItems, logItems] = await Promise.all([
        findAllDayItems(from, to, TrackItemType.AppTrackItem),
        findAllDayItems(from, to, TrackItemType.StatusTrackItem),
        findAllDayItems(from, to, TrackItemType.LogTrackItem),
    ]);
    return { appItems, statusItems, logItems };
}
export function findFirstChunkLogItems(): Promise<ITrackItem[]> {
    return ElectronEventEmitter.emit('findFirstChunkLogItems');
}
export function findFirstTrackItem(): Promise<ITrackItem> {
    return ElectronEventEmitter.emit('findFirstTrackItem');
}
export interface SearchResultI {
    data: Array<ITrackItem>;
    total: number;
    totalDuration?: number;
}
export function searchFromItems({ from, to, taskName, searchStr, paging, sumTotal = false }): Promise<SearchResultI> {
    Logger.debug('Поиск предметов:', { from, to, taskName, searchStr, paging });
    return ElectronEventEmitter.emit('searchFromItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
        searchStr,
        paging,
        sumTotal,
    });
}
export function exportFromItems({ from, to, taskName, searchStr, format = 'csv' }): Promise<ITrackItem[]> {
    return ElectronEventEmitter.emit('exportFromItems', {
        from: from.valueOf(),
        to: to.valueOf(),
        taskName,
        searchStr,
        format,
    });
}
function createTrackItem(trackItem: ITrackItem): Promise<ITrackItem> {
    return ElectronEventEmitter.emit('createTrackItem', { trackItem: trackItem });
}
function updateTrackItem(trackItem: ITrackItem, trackItemId: number): Promise<ITrackItem> {
    return ElectronEventEmitter.emit('updateTrackItem', { trackItem, trackItemId });
}
function getRawTrackItem2(savedItem: ITrackItem): ITrackItem {
    const item = {
        id: savedItem.id,
        app: savedItem.app,
        title: savedItem.title,
        taskName: savedItem.taskName,
        color: savedItem.color,
        beginDate: savedItem.beginDate,
        url: savedItem.url,
        endDate: savedItem.endDate,
    };
    return item;
}
export async function saveTrackItem(inputItem: ITrackItem): Promise<ITrackItem> {
    const trackItem = getRawTrackItem2(inputItem);
    Logger.debug('Сохранение элемента трека.', trackItem);
    if (!trackItem.taskName) {
        trackItem.taskName = 'LogTrackItem';
    }
    if (trackItem.id) {
        const item = await updateTrackItem(trackItem, trackItem.id);
        Logger.debug('Обновлен трек в БД:', item);
        return item;
    }
    if (!trackItem.app) {
        trackItem.app = 'Default';
    }
    const item = createTrackItem(trackItem);
    return item;
}
export function deleteByIds(trackItemIds: number[]): Promise<void> {
    return ElectronEventEmitter.emit('deleteByIds', { trackItemIds });
}
export function startNewLogItem(oldItem: ITrackItem): Promise<void> {
    Logger.debug('startNewLogItem', oldItem);
    const newItem: NewTrackItem = {
        app: oldItem.app || 'WORK',
        taskName: 'LogTrackItem',
        color: oldItem.color,
        title: oldItem.title,
        beginDate: DateTime.now().toMillis(),
        endDate: DateTime.now().plus({ seconds: 60 }).toMillis(),
    };
    ElectronEventEmitter.send('start-new-log-item', newItem);
    return Promise.resolve();
}
export function stopRunningLogItem(runningLogItemId: number) {
    Logger.debug('stopRunningLogItem', runningLogItemId);
    ElectronEventEmitter.send('end-running-log-item');
}
export function updateTrackItemColor(appName: string, color: string) {
    return ElectronEventEmitter.emit('updateTrackItemColor', { appName, color });
}
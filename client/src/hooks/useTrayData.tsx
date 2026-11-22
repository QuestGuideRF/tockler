import { useEffect, useState } from 'react';
import { ITrackItem } from '../@types/ITrackItem';
import { getTodayTimerange } from '../components/Timeline/timeline.utils';
import { TrackItemType } from '../enum/TrackItemType';
import { Logger } from '../logger';
import { ElectronEventEmitter } from '../services/ElectronEventEmitter';
import { getRunningLogItem } from '../services/settings.api';
import { findAllDayItems, findFirstChunkLogItems } from '../services/trackItem.api';
export const useTrayData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusItems, setStatusItems] = useState<ITrackItem[]>([]);
    const [logItems, setLogItems] = useState<ITrackItem[]>([]);
    const [runningLogItem, setRunningLogItem] = useState<ITrackItem>();
    useEffect(() => {
        const eventLogItemStarted = (logItem) => {
            const newItem: ITrackItem = JSON.parse(logItem);
            Logger.debug('log-trackItem-started:', newItem);
            setRunningLogItem(newItem);
        };
        ElectronEventEmitter.on('log-item-started', eventLogItemStarted);
        return () => {
            ElectronEventEmitter.off('log-item-started', eventLogItemStarted);
        };
    }, []);
    async function fetchStatusItems() {
        const timerange = getTodayTimerange();
        Logger.debug('TrayApp – Загрузка элементов состояния:', JSON.stringify(timerange));
        try {
            const items = await findAllDayItems(timerange[0], timerange[1], TrackItemType.StatusTrackItem);
            setStatusItems(items);
            return items;
        } catch (error) {
            Logger.error('Ошибка при получении элементов статуса:', error);
            return [];
        }
    }
    async function fetchLogItems() {
        Logger.debug('TrayApp – Загрузка элементов журнала');
        try {
            const items = await findFirstChunkLogItems();
            setLogItems(items);
            return items;
        } catch (error) {
            Logger.error('Ошибка при получении элементов журнала:', error);
            return [];
        }
    }
    async function fetchRunningLogItem() {
        Logger.debug('TrayApp — загрузка текущего элемента журнала');
        try {
            const logItem = await getRunningLogItem();
            setRunningLogItem(logItem);
            Logger.debug('TrayApp — загружен элемент журнала выполнения:', logItem);
            return logItem;
        } catch (error) {
            Logger.error('Ошибка при получении текущего элемента журнала:', error);
            return undefined;
        }
    }
    async function refreshData() {
        if (isLoading) {
            Logger.debug('Данные уже загружаются, обновление отсутствует.');
            return;
        }
        setIsLoading(true);
        Logger.debug('Начинаем обновление данных');
        try {
            await Promise.all([fetchStatusItems(), fetchLogItems(), fetchRunningLogItem()]);
            Logger.debug('Обновление данных завершено');
        } catch (error) {
            Logger.error('Ошибка при обновлении данных:', error);
        } finally {
            setIsLoading(false);
        }
    }
    return {
        isLoading,
        statusItems,
        logItems,
        runningLogItem,
        setRunningLogItem,
        fetchStatusItems,
        fetchLogItems,
        fetchRunningLogItem,
        refreshData,
    };
};
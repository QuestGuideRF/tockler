import { formatDuration, intervalToDuration } from 'date-fns';
import { DateTime } from 'luxon';
import { convertDate } from './constants';
import { TrackItemType } from './enum/TrackItemType';
export const diffAndFormatShort = (beginDate: number, endDate: number) => {
    const diff = convertDate(endDate).diff(convertDate(beginDate));
    return formatDurationInternal(diff.toMillis());
};
export const formatDurationInternal = (dur: number) => {
    if (!dur) {
        return '0s';
    }
    const formattedDuration = formatDuration(intervalToDuration({ start: 0, end: dur }), { zero: false });
    return formattedDuration
        .replace(/ minutes?/g, 'm')
        .replace(/ hours?/g, 'h')
        .replace(/ seconds?/g, 's');
};
export const ITEM_TYPES = {
    [TrackItemType.AppTrackItem]: 'App',
    [TrackItemType.StatusTrackItem]: 'Status',
    [TrackItemType.LogTrackItem]: 'Task',
};
export const STORAGE_KEYS = {
    VISIBLE_RANGE: 'tockler_visible_range',
};
export const saveVisibleRange = (visibleTimerange: DateTime[]): void => {
    if (!visibleTimerange || visibleTimerange.length !== 2) {
        console.error('В localStorage найден неверный видимый диапазон');
        return;
    }
    try {
        const serialized = JSON.stringify(visibleTimerange.map((dt) => dt.toISO()));
        localStorage.setItem(STORAGE_KEYS.VISIBLE_RANGE, serialized);
        console.log('Сохранен видимый диапазон в localStorage:', serialized);
    } catch (error) {
        console.error('Не удалось сохранить видимый диапазон в localStorage:', error);
    }
};
export const loadVisibleRange = (): DateTime[] | null => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEYS.VISIBLE_RANGE);
        if (!serialized) {
            console.error('В localStorage не найден видимый диапазон');
            return null;
        }
        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed) || parsed.length !== 2) {
            console.error('В localStorage найден неверный видимый диапазон');
            return null;
        }
        console.log('Загружен видимый диапазон из localStorage:', parsed);
        return parsed.map((isoString) => DateTime.fromISO(isoString));
    } catch (error) {
        console.error('Не удалось загрузить видимый диапазон из localStorage:', error);
        return null;
    }
};
import { DateTime } from 'luxon';
import { convertDate } from '../../constants';
export const getDynamicTimeFormat = (timestamp: number, visibleTimerange?: DateTime[]) => {
    const locale = DateTime.local().resolvedLocaleOptions().locale;
    const dateTime = convertDate(timestamp);
    if (!visibleTimerange || visibleTimerange.length !== 2) {
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
    const [start, end] = visibleTimerange;
    const rangeDuration = end.diff(start).milliseconds;
    if (rangeDuration > 24 * 60 * 60 * 1000) {
        return dateTime.setLocale(locale).toLocaleString({ ...DateTime.DATE_MED_WITH_WEEKDAY, year: undefined });
    } else if (rangeDuration > 60 * 60 * 1000) {
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE);
    } else {
        return dateTime.setLocale(locale).toLocaleString(DateTime.TIME_WITH_SECONDS);
    }
};
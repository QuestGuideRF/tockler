import { DateTime } from 'luxon';
export const DATE_TIME_FORMAT = 'гггг-ММ-дд ЧЧ:мм:сс';
export const INPUT_DATE_FORMAT = 'гггг-ММ-дд ЧЧ:мм:сс ZZ';
export const TIME_FORMAT = 'HH:mm:ss';
export const DAY_MONTH_LONG_FORMAT = 'д МММ';
export const TIME_FORMAT_SHORT = 'HH:mm';
export const DURATION_FORMAT = 'w[w] d[d] h[h] м[м] с[с]';
export const DURATION_SETTINGS = { largest: 2 };
export const BREAKPOINT_TIME = '04:00';
export const convertDate = (d: Date | number | DateTime): DateTime => {
    if (d instanceof DateTime) {
        return d;
    }
    if (typeof d === 'number') {
        return DateTime.fromMillis(d);
    }
    return DateTime.fromJSDate(d);
};
export const COLORS = { green: '#8BC34A' };
import { last } from 'lodash';
import { DateTime } from 'luxon';
import { describe, expect, it, test } from 'vitest';
import {
    getClampHours,
    getOnlineTimesForChart,
    getTotalOnlineDuration,
    groupByBreaks,
    isBetweenHours,
    isLessThanHours,
} from './OnlineChart.util';
const ONLINE = 'ONLINE';
const OFFLINE = 'OFFLINE';
const IDLE = 'IDLE';
const beginDate18_23_50 = DateTime.fromISO('2021-06-18T23:50:00').toMillis();
const endDate19_00_10 = DateTime.fromISO('2021-06-19T00:10:00').toMillis();
const beginDate19_10_00 = DateTime.fromISO('2021-06-19T10:00:00').toMillis();
const endDate19_10_10 = DateTime.fromISO('2021-06-19T10:10:00').toMillis();
const beginDate19_11_50 = DateTime.fromISO('2021-06-19T11:50:00').toMillis();
const endDate_19_12_10 = DateTime.fromISO('2021-06-19T12:10:00').toMillis();
const beginDate19_18_50 = DateTime.fromISO('2021-06-19T18:50:00').toMillis();
const endDate19_19_10 = DateTime.fromISO('2021-06-19T19:10:00').toMillis();
const beginDate_19_23_50 = DateTime.fromISO('2021-06-19T23:50:00').toMillis();
const endDate20_00_10 = DateTime.fromISO('2021-06-20T00:10:00').toMillis();
const realDate = DateTime.fromISO('2021-06-19T10:10:00');
describe('OnlineChart getOnlineTimesForChart', () => {
    it('использует только ОНЛАЙН-элементы', () => {
        const onlineItem = {
            id: 1,
            app: ONLINE,
            beginDate: beginDate19_10_00,
            endDate: endDate19_10_10,
        };
        const offlineItems = [
            {
                id: 2,
                app: OFFLINE,
                beginDate: beginDate19_11_50,
                endDate: endDate_19_12_10,
            },
            {
                id: 3,
                app: OFFLINE,
                beginDate: beginDate19_18_50,
                endDate: endDate19_19_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 24 }),
            items: [onlineItem, ...offlineItems],
        });
        expect(actual).toEqual([
            {
                beginDate: realDate.startOf('day').toMillis(),
                endDate: beginDate19_10_00,
                color: 'transparent',
                diff: 600,
                x: 0,
            },
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_10_00,
                endDate: endDate19_10_10,
                diff: 10,
                x: 1,
                color: 'transparent',
            },
            {
                beginDate: endDate19_10_10,
                endDate: realDate.endOf('day').plus({ milliseconds: 1 }).toMillis(),
                color: 'transparent',
                diff: 830,
                x: 2,
            },
        ]);
    });
    it('Устанавливает первые, последние и промежуточные часы пустых элементов от 0 до 24.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_10_00,
                endDate: endDate19_10_10,
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: beginDate19_18_50,
                endDate: endDate19_19_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 24 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                beginDate: DateTime.fromISO('2021-06-19T00:00:00').toMillis(),
                endDate: beginDate19_10_00,
                color: 'transparent',
                diff: 600,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate19_10_00,
                color: 'transparent',
                endDate: endDate19_10_10,
                diff: 10,
                x: 1,
                id: 1,
            },
            {
                beginDate: endDate19_10_10,
                endDate: beginDate19_18_50,
                diff: 520,
                color: 'transparent',
                x: 2,
            },
            {
                app: ONLINE,
                beginDate: beginDate19_18_50,
                endDate: endDate19_19_10,
                diff: 20,
                color: 'transparent',
                x: 3,
                id: 2,
            },
            {
                beginDate: endDate19_19_10,
                endDate: DateTime.fromISO('2021-06-19T24:00:00').toMillis(),
                color: 'transparent',
                diff: 290,
                x: 4,
            },
        ]);
    });
    it('Устанавливает первый, последний и промежуточный пустые элементы для часов с 12 по 24.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_10_00,
                endDate: endDate19_10_10,
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: beginDate19_18_50,
                endDate: endDate19_19_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                beginDate: DateTime.fromISO('2021-06-19T12:00:00').toMillis(),
                endDate: beginDate19_18_50,
                color: 'transparent',
                diff: 410,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate19_18_50,
                endDate: endDate19_19_10,
                color: 'transparent',
                diff: 20,
                x: 1,
                id: 2,
            },
            {
                beginDate: endDate19_19_10,
                endDate: DateTime.fromISO('2021-06-19T24:00:00').toMillis(),
                color: 'transparent',
                diff: 290,
                x: 2,
            },
        ]);
    });
    it('Зажимает предметы от 12 до 24 часов.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_11_50,
                endDate: endDate_19_12_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                app: ONLINE,
                beginDate: DateTime.fromISO('2021-06-19T12:00:00').toMillis(),
                color: 'transparent',
                endDate: endDate_19_12_10,
                diff: 10,
                x: 0,
                id: 1,
            },
            {
                beginDate: endDate_19_12_10,
                endDate: DateTime.fromISO('2021-06-19T24:00:00').toMillis(),
                color: 'transparent',
                diff: 710,
                x: 1,
            },
        ]);
    });
    it('Зажимает предметы на срок от 12 до 24 часов endDate', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_11_50,
                endDate: endDate_19_12_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 12 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                beginDate: DateTime.fromISO('2021-06-19T00:00:00').toMillis(),
                endDate: beginDate19_11_50,
                color: 'transparent',
                diff: 710,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate19_11_50,
                color: 'transparent',
                endDate: DateTime.fromISO('2021-06-19T12:00:00').toMillis(),
                diff: 10,
                id: 1,
                x: 1,
            },
        ]);
    });
    it('Зажимает предметы с 12 до 24 часов. Дата окончания следующего дня.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate_19_23_50,
                endDate: endDate20_00_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 12, endHour: 24 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                beginDate: DateTime.fromISO('2021-06-19T12:00:00').toMillis(),
                endDate: beginDate_19_23_50,
                color: 'transparent',
                diff: 710,
                x: 0,
            },
            {
                app: ONLINE,
                beginDate: beginDate_19_23_50,
                color: 'transparent',
                endDate: DateTime.fromISO('2021-06-19T24:00:00').toMillis(),
                diff: 10,
                id: 1,
                x: 1,
            },
        ]);
    });
    it('Фиксирует элементы в течение часов от 0 до 12. BeginDate предыдущего дня.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: beginDate18_23_50,
                endDate: endDate19_00_10,
            },
        ];
        const actual = getOnlineTimesForChart({
            ...getClampHours({ realDate, startHour: 0, endHour: 12 }),
            items: [...items],
        });
        expect(actual).toEqual([
            {
                app: ONLINE,
                beginDate: DateTime.fromISO('2021-06-19T00:00:00').toMillis(),
                endDate: endDate19_00_10,
                color: 'transparent',
                diff: 10,
                id: 1,
                x: 0,
            },
            {
                beginDate: endDate19_00_10,
                endDate: DateTime.fromISO('2021-06-19T12:00:00').toMillis(),
                color: 'transparent',
                diff: 710,
                x: 1,
            },
        ]);
    });
});
const getMillisFromTime = (time: string) => {
    return DateTime.fromISO(`19 июня 2021 г. ${time}`).toMillis();
};
const getDateFromTime = (time: string) => {
    return DateTime.fromISO(`19 июня 2021 г. ${time}`);
};
const MINUTES = 60 * 1000;
const minBreakTime = 5;
describe('Группа онлайн-графиковПо перерывам', () => {
    it('groupByBreaks принимает элементы до тех пор, пока не найдет минимальное время перерыва.', () => {
        const chunk1 = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('08:29:00'),
                endDate: getMillisFromTime('08:39:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
                color: 'transparent',
                diff: 10,
                x: 1,
            },
            {
                id: 3,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:14:00'),
                color: 'transparent',
                diff: 14,
                x: 2,
            },
        ];
        const chunk2 = [
            {
                id: 4,
                app: ONLINE,
                beginDate: getMillisFromTime('07:00:00'),
                endDate: getMillisFromTime('07:10:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
        ];
        const sorted = [...chunk1, ...chunk2];
        const grouped = groupByBreaks(sorted, minBreakTime);
        expect(grouped).toEqual([chunk1, chunk2]);
    });
    it('groupByBreaks группирует все элементы.', () => {
        const chunk1 = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('08:29:00'),
                endDate: getMillisFromTime('08:39:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
                color: 'transparent',
                diff: 10,
                x: 1,
            },
            {
                id: 3,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:14:00'),
                color: 'transparent',
                diff: 14,
                x: 2,
            },
        ];
        const chunk2 = [
            {
                id: 4,
                app: ONLINE,
                beginDate: getMillisFromTime('07:00:00'),
                endDate: getMillisFromTime('07:10:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
        ];
        const chunk3 = [
            {
                id: 5,
                app: ONLINE,
                beginDate: getMillisFromTime('06:50:00'),
                endDate: getMillisFromTime('06:51:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
        ];
        const chunk4 = [
            {
                id: 6,
                app: ONLINE,
                beginDate: getMillisFromTime('06:00:00'),
                endDate: getMillisFromTime('06:10:00'),
                color: 'transparent',
                diff: 10,
                x: 0,
            },
            {
                id: 7,
                app: ONLINE,
                beginDate: getMillisFromTime('05:00:00'),
                endDate: getMillisFromTime('05:55:00'),
                color: 'transparent',
                diff: 55,
                x: 1,
            },
        ];
        const sorted = [...chunk1, ...chunk2, ...chunk3, ...chunk4];
        const grouped = groupByBreaks(sorted, minBreakTime);
        expect(grouped).toEqual([chunk1, chunk2, chunk3, chunk4]);
    });
});
describe('OnlineChart getTotalOnlineDuration', () => {
    it('getTotalOnlineDuration суммирует различия', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:15:00'),
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
            },
        ];
        const now = DateTime.fromMillis(last(items)?.endDate || 0);
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([25 * MINUTES]);
    });
    it('getTotalOnlineDuration возвращает 0, если нет элементов ONLINE.', () => {
        const items = [
            {
                id: 1,
                app: OFFLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:15:00'),
            },
            {
                id: 2,
                app: IDLE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
            },
        ];
        const now = DateTime.fromMillis(last(items)?.endDate || 0);
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([0]);
    });
    it('getTotalOnlineDuration суммирует только элементы ONLINE', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:10:00'),
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:11:00'),
                endDate: getMillisFromTime('08:14:00'),
            },
        ];
        const now = DateTime.fromMillis(last(items)?.endDate || 0);
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([13 * MINUTES]);
    });
    it('getTotalOnlineDuration принимает элементы до тех пор, пока не найдет минимальное время перерыва.', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('07:00:00'),
                endDate: getMillisFromTime('07:10:00'),
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:14:00'),
            },
            {
                id: 3,
                app: ONLINE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
            },
            {
                id: 4,
                app: ONLINE,
                beginDate: getMillisFromTime('08:29:00'),
                endDate: getMillisFromTime('08:39:00'),
            },
        ];
        const now = DateTime.fromMillis(last(items)?.endDate || 0);
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([34 * MINUTES, 10 * MINUTES]);
    });
    it('getTotalOnlineDuration игнорирует элементы в создателе после указанного времени', () => {
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('07:00:00'),
                endDate: getMillisFromTime('07:10:00'),
            },
            {
                id: 2,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:14:00'),
            },
            {
                id: 3,
                app: ONLINE,
                beginDate: getMillisFromTime('08:15:00'),
                endDate: getMillisFromTime('08:25:00'),
            },
            {
                id: 4,
                app: ONLINE,
                beginDate: getMillisFromTime('08:29:00'),
                endDate: getMillisFromTime('08:39:00'),
            },
        ];
        const now = getDateFromTime('08:15:00');
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([14 * MINUTES, 10 * MINUTES]);
    });
    it('getTotalOnlineDuration возвращает [0], если только что был сделан перерыв', () => {
        const now = getDateFromTime('08:25:00');
        const items = [
            {
                id: 1,
                app: ONLINE,
                beginDate: getMillisFromTime('08:00:00'),
                endDate: getMillisFromTime('08:20:00'),
            },
        ];
        const duration = getTotalOnlineDuration(now, items, minBreakTime);
        expect(duration).toEqual([0]);
    });
});
describe('OnlineChart isBetweenHours', () => {
    it('isBetweenHours возвращает правильно, если в конечной части частично выходит за пределы диапазона', () => {
        const startHour = 12;
        const endHour = 24;
        const { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });
        expect(
            isBetweenHours({ beginClamp, endClamp })({
                id: 1,
                app: ONLINE,
                beginDate: beginDate_19_23_50,
                endDate: endDate20_00_10,
            }),
        ).toBeTruthy();
    });
    it('isBetweenHours возвращает правильно, если частично выходит за пределы диапазона в начальной части', () => {
        const startHour = 0;
        const endHour = 12;
        const { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });
        expect(
            isBetweenHours({ beginClamp, endClamp })({
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_11_50,
                endDate: beginDate19_11_50,
            }),
        ).toBeTruthy();
    });
    it('isBetweenHours правильно возвращает false, если дата выходит за пределы диапазона ', () => {
        const startHour = 0;
        const endHour = 12;
        const { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });
        expect(
            isBetweenHours({ beginClamp, endClamp })({
                id: 1,
                app: ONLINE,
                beginDate: beginDate_19_23_50,
                endDate: endDate20_00_10,
            }),
        ).toBeFalsy();
    });
    it('isBetweenHours правильно возвращает false, если дата выходит за пределы диапазона в начальной части', () => {
        const startHour = 12;
        const endHour = 24;
        const { beginClamp, endClamp } = getClampHours({ realDate, startHour, endHour });
        expect(
            isBetweenHours({ beginClamp, endClamp })({
                id: 1,
                app: ONLINE,
                beginDate: beginDate19_11_50,
                endDate: beginDate19_11_50,
            }),
        ).toBeFalsy();
    });
});
test('isLessThanHours возвращает правильно', () => {
    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            id: 1,
            app: ONLINE,
            beginDate: getMillisFromTime('08:15:00'),
            endDate: getMillisFromTime('08:15:00'),
        }),
    ).toBeTruthy();
    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            id: 1,
            app: ONLINE,
            beginDate: getMillisFromTime('08:14:00'),
            endDate: getMillisFromTime('08:14:00'),
        }),
    ).toBeTruthy();
    expect(
        isLessThanHours(getDateFromTime('08:15:00'))({
            id: 1,
            app: ONLINE,
            beginDate: getMillisFromTime('08:14:00'),
            endDate: getMillisFromTime('08:16:00'),
        }),
    ).not.toBeTruthy();
});
export
 {};
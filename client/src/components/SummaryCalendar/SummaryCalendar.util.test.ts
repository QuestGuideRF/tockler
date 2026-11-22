import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { CALENDAR_MODE } from '../../SummaryContext.util';
import { summariseTimeOnline } from './SummaryCalendar.util';
import { TEST_INPUT } from './SummaryCalendar.util.testdata';
describe('summariseTimeOnline', () => {
    it('анализирует онлайн-элементы', () => {
        const actual = summariseTimeOnline(TEST_INPUT, CALENDAR_MODE.MONTH, DateTime.fromMillis(1589311528755));
        const result = {
            '05-12': { beginDate: 1589311528755, endDate: 1589312113568, online: 358396 },
            '05-14': { beginDate: 1589480558049, endDate: 1589483666850, online: 2707998 },
            '05-24': { beginDate: 1590354279611, endDate: 1590357497348, online: 3085853 },
            '05-25': { beginDate: 1590375522178, endDate: 1590388476539, online: 1527164 },
        };
        expect(actual).toEqual(result);
    });
    it('онлайн-элемент после полуночи - до 04:00 - он переходит на предыдущий день', () => {
        const input = [
            {
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 02:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 03:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм'),
        );
        const result = {
            '04-09': {
                beginDate: DateTime.fromFormat('2020-04-10 02:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 03:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                online: 3600000,
            },
        };
        expect(actual).toEqual(result);
    });
    it('онлайн-товар после 04:00 переходит на правильный день', () => {
        const input = [
            {
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм'),
        );
        const result = {
            '04-10': {
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                online: 3600000,
            },
        };
        expect(actual).toEqual(result);
    });
    it('проснулся в 04:30 и пошел спать в 03:30', () => {
        const input = [
            {
                id: 1,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 05:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
            {
                id: 2,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 11:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-10 15:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
            {
                id: 3,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-10 23:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 01:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
            {
                id: 4,
                app: 'ONLINE',
                beginDate: DateTime.fromFormat('2020-04-11 02:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 03:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
            },
        ];
        const actual = summariseTimeOnline(
            input,
            CALENDAR_MODE.MONTH,
            DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм'),
        );
        const result = {
            '04-10': {
                beginDate: DateTime.fromFormat('2020-04-10 04:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                endDate: DateTime.fromFormat('2020-04-11 03:30', 'гггг-ММ-дд ЧЧ:мм').toMillis(),
                online: 28800000,
            },
        };
        expect(actual).toEqual(result);
    });
});
export
 {};
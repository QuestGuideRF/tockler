import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { ITrackItem } from '../../@types/ITrackItem';
import { filterItems } from './timeline.utils';
describe('Утилиты временной шкалы', () => {
    it('filterItems в элементах диапазона', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items: ITrackItem[] = [
            {
                id: 1,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T17:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T17:10:00.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
            {
                id: 3,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T18:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:00:00.000Z').toMillis(),
            },
        ];
        const actual = filterItems(items, visibleTimerange);
        expect(actual).toEqual(items);
    });
    it('filterItems не включает элементы, выходящие за пределы диапазона.', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items = [
            {
                id: 1,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
        ];
        const outOfRangeItems: ITrackItem[] = [
            {
                id: 1,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T16:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T16:59:59.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T19:00:01.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:10:00.000Z').toMillis(),
            },
        ];
        const actual = filterItems([...items, ...outOfRangeItems], visibleTimerange);
        expect(actual).toEqual(items);
    });
    it('filterItems возвращает элементы, которые частично находятся в', () => {
        const visibleTimerange = [
            DateTime.fromISO('2021-06-19T17:00:00.000Z'),
            DateTime.fromISO('2021-06-19T19:00:00.000Z'),
        ];
        const items = [
            {
                id: 1,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T16:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T17:10:00.000Z').toMillis(),
            },
            {
                id: 2,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T18:00:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T18:10:00.000Z').toMillis(),
            },
            {
                id: 3,
                app: 'app',
                beginDate: DateTime.fromISO('2021-06-19T18:50:00.000Z').toMillis(),
                endDate: DateTime.fromISO('2021-06-19T19:10:00.000Z').toMillis(),
            },
        ];
        const actual = filterItems(items, visibleTimerange);
        expect(actual).toEqual(items);
    });
});
export
 {};
import { describe, expect, it } from 'vitest';
import { NewTrackItem } from '../drizzle/schema';
import { getTimestamp } from './time.testUtils';
vi.mock('electron');
vi.mock('../utils/log-manager');
describe('splitTrackItemAtMidnight', () => {
    it('не следует разделять элемент, если даты начала и окончания совпадают', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        const sameDay: NewTrackItem = {
            app: 'Тестовое приложение',
            beginDate: getTimestamp('2024-02-01T10:00:00'),
            endDate: getTimestamp('2024-02-01T14:00:00'),
            taskName: 'Тестовое задание',
        };
        const result = splitTrackItemAtMidnight(sameDay);
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(sameDay);
    });
    it('следует разделить элемент на две части, если он охватывает ровно два дня', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        const twoDays: NewTrackItem = {
            app: 'Тестовое приложение',
            beginDate: getTimestamp('2024-02-01T20:00:00'),
            endDate: getTimestamp('2024-02-02T04:00:00'),
            taskName: 'Тестовое задание',
        };
        const result = splitTrackItemAtMidnight(twoDays);
        expect(result).toHaveLength(2);
        expect(result[0].beginDate).toBe(twoDays.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));
        expect(result[0].app).toBe(twoDays.app);
        expect(result[0].taskName).toBe(twoDays.taskName);
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(twoDays.endDate);
        expect(result[1].app).toBe(twoDays.app);
        expect(result[1].taskName).toBe(twoDays.taskName);
    });
    it('следует разделить элемент на несколько частей, если он длится более двух дней', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        const multiDays: NewTrackItem = {
            app: 'Тестовое приложение',
            beginDate: getTimestamp('2024-02-01T22:00:00'),
            endDate: getTimestamp('2024-02-03T02:00:00'),
            taskName: 'Тестовое задание',
            title: 'Название теста',
            url: 'http://test.com',
            color: '#FFFFFF',
        };
        const result = splitTrackItemAtMidnight(multiDays);
        expect(result).toHaveLength(3);
        expect(result[0].beginDate).toBe(multiDays.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(getTimestamp('2024-02-02T23:59:59.999'));
        expect(result[2].beginDate).toBe(getTimestamp('2024-02-03T00:00:00'));
        expect(result[2].endDate).toBe(multiDays.endDate);
        for (const item of result) {
            expect(item.app).toBe(multiDays.app);
            expect(item.taskName).toBe(multiDays.taskName);
            expect(item.title).toBe(multiDays.title);
            expect(item.url).toBe(multiDays.url);
            expect(item.color).toBe(multiDays.color);
        }
    });
    it('должен обрабатывать товары ровно в полночь', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        const exactMidnight: NewTrackItem = {
            app: 'Тестовое приложение',
            beginDate: getTimestamp('2024-02-01T00:00:00'),
            endDate: getTimestamp('2024-02-02T00:00:00'),
            taskName: 'Тестовое задание',
        };
        const result = splitTrackItemAtMidnight(exactMidnight);
        expect(result).toHaveLength(2);
        expect(result[0].beginDate).toBe(exactMidnight.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(exactMidnight.endDate);
    });
    it('должен правильно обрабатывать дробные миллисекунды', async () => {
        const { splitTrackItemAtMidnight } = await import('../drizzle/worker/queries/trackItem.db.util');
        const withMilliseconds: NewTrackItem = {
            app: 'Тестовое приложение',
            beginDate: getTimestamp('2024-02-01T23:59:59.500'),
            endDate: getTimestamp('2024-02-02T00:00:00.500'),
            taskName: 'Тестовое задание',
        };
        const result = splitTrackItemAtMidnight(withMilliseconds);
        expect(result).toHaveLength(2);
        expect(result[0].beginDate).toBe(withMilliseconds.beginDate);
        expect(result[0].endDate).toBe(getTimestamp('2024-02-01T23:59:59.999'));
        expect(result[1].beginDate).toBe(getTimestamp('2024-02-02T00:00:00'));
        expect(result[1].endDate).toBe(withMilliseconds.endDate);
    });
});
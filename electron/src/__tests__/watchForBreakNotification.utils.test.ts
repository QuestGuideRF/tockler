import { Client } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewTrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { getTimestamp } from './time.testUtils';
vi.mock('electron');
vi.mock('electron-is-dev');
vi.mock('../utils/log-manager');
let client: Client;
let db: ReturnType<typeof drizzle>;
async function cleanupTestDb() {
    if (client) {
        await db.delete(trackItems).execute();
        await client.close();
    }
}
const NOW = getTimestamp('2024-01-01T12:00:00');
describe('getCurrentSessionDuration', () => {
    const minBreakTime = 5;
    beforeEach(async () => {
        vi.resetModules();
        vi.resetAllMocks();
        vi.spyOn(Date, 'now').mockImplementation(() => NOW);
        ({ db, client } = await setupTestDb());
    });
    afterEach(async () => {
        vi.restoreAllMocks();
        await cleanupTestDb();
    });
    it('должен возвращать 0, если элементы не найдены', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(0);
    });
    it('должен возвращать 0, когда текущий перерыв превышает minBreakTime', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const item: NewTrackItem = {
            app: State.Online,
            title: 'Название теста',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: NOW - 10 * 60 * 1000,
            endDate: NOW - 6 * 60 * 1000,
            color: null,
            url: null,
        };
        await db.insert(trackItems).values(item).execute();
        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(0);
    });
    it('следует рассчитать общую продолжительность текущего сеанса', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const items: NewTrackItem[] = [
            {
                app: State.Online,
                title: 'Название теста 1',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 3 * 60 * 1000,
                endDate: NOW - 1 * 60 * 1000,
                color: null,
                url: null,
            },
            {
                app: State.Online,
                title: 'Название теста 2',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 4 * 60 * 1000,
                endDate: NOW - 3 * 60 * 1000,
                color: null,
                url: null,
            },
        ];
        await db.insert(trackItems).values(items).execute();
        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(180000);
    });
    it('should only include items from current session (before break)', async () => {
        const { getCurrentSessionDuration } = await import('../background/watchBreak/watchForBreakNotification.utils');
        const items: NewTrackItem[] = [
            {
                app: 'ONLINE',
                title: 'Текущая сессия',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 2 * 60 * 1000,
                endDate: NOW - 1 * 60 * 1000,
                color: null,
                url: null,
            },
            {
                app: 'ONLINE',
                title: 'Предыдущая сессия',
                taskName: TrackItemType.StatusTrackItem,
                beginDate: NOW - 9 * 60 * 1000,
                endDate: NOW - 8 * 60 * 1000,
                color: null,
                url: null,
            },
        ];
        await db.insert(trackItems).values(items).execute();
        const duration = await getCurrentSessionDuration(minBreakTime);
        expect(duration).toBe(60000);
    });
});
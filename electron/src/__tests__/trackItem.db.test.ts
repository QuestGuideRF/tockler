import { describe, expect, it } from 'vitest';
import { Client } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, vi } from 'vitest';
import { getTimestamp } from '../__tests__/time.testUtils';
import { NewTrackItem, TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { setupTestDb } from './db.testUtils';
import { selectAllAppItems } from './query.testUtils';
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
const NOW = getTimestamp('2023-01-10T12:00:00');
const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.AppTrackItem,
};
describe('trackItem.db', () => {
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
    it('не следует разделять элемент трека, если он не охватывает полночь', async () => {
        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');
        const beginDate = getTimestamp('2023-01-09T00:00:01');
        const endDate = getTimestamp('2023-01-09T23:59:59.999');
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate,
            endDate,
        };
        const id = await insertTrackItem(statusItem);
        expect(id).toBe(1n);
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate,
            endDate,
        });
    });
    it('следует разделить элемент трека, когда он проходит через полночь', async () => {
        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');
        const beforeMidnightTime = getTimestamp('2023-01-09T23:58:28');
        const afterMidnightTime = getTimestamp('2023-01-10T00:05:00');
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: beforeMidnightTime,
            endDate: afterMidnightTime,
        };
        const id = await insertTrackItem(statusItem);
        expect(id).toBe(2n);
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(2);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate: beforeMidnightTime,
            endDate: getTimestamp('2023-01-09T23:59:59.999'),
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 2,
            beginDate: getTimestamp('2023-01-10T00:00:00'),
            endDate: afterMidnightTime,
        });
    });
    it('следует разделить элемент трека, если он охватывает несколько ночей', async () => {
        const { insertTrackItemInternal: insertTrackItem } = await import('../drizzle/worker/queries/trackItem.db');
        const beginDate = getTimestamp('2023-01-09T13:00:00');
        const endDate = getTimestamp('2023-01-13T00:05:00');
        const statusItem: NewTrackItem = {
            app: State.Online,
            title: 'online',
            taskName: TrackItemType.StatusTrackItem,
            beginDate: beginDate,
            endDate: endDate,
        };
        const id = await insertTrackItem(statusItem);
        expect(id).toBe(5n);
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(5);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 1,
            beginDate: beginDate,
            endDate: getTimestamp('2023-01-09T23:59:59.999'),
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 2,
            beginDate: getTimestamp('2023-01-10T00:00:00'),
            endDate: getTimestamp('2023-01-10T23:59:59.999'),
        });
        expect(items[2]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 3,
            beginDate: getTimestamp('2023-01-11T00:00:00'),
            endDate: getTimestamp('2023-01-11T23:59:59.999'),
        });
        expect(items[3]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 4,
            beginDate: getTimestamp('2023-01-12T00:00:00'),
            endDate: getTimestamp('2023-01-12T23:59:59.999'),
        });
        expect(items[4]).toStrictEqual({
            ...emptyData,
            ...statusItem,
            id: 5,
            beginDate: getTimestamp('2023-01-13T00:00:00'),
            endDate: endDate,
        });
    });
});
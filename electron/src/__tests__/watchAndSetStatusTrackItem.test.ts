import { Client } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { setupTestDb } from './db.testUtils';
import { changeStateAndMockDate, selectAllAppItems } from './query.testUtils';
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
const NOW = getTimestamp('2023-01-10T12:00:00');
const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.StatusTrackItem,
};
describe('watchAndSetStatusTrackItem', () => {
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
    it('событие изменения состояния должно завершить текущий элемент статуса', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchTrackItems/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'ONLINE',
            title: 'online',
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.ONLINE,
        });
    });
    it('Событие изменения состояния должно запускать новый элемент журнала, если состояние меняется на «холостой-онлайн-бездействующий»', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem } = await import('../background/watchTrackItems/watchAndSetStatusTrackItem');
        await watchAndSetStatusTrackItem();
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(3));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(3);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            id: 1,
            app: 'ONLINE',
            title: 'online',
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.ONLINE,
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            id: 2,
            app: 'IDLE',
            title: 'idle',
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
            color: COLORS.IDLE,
        });
        expect(items[2]).toStrictEqual({
            ...emptyData,
            id: 3,
            app: 'ONLINE',
            title: 'online',
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
            color: COLORS.ONLINE,
        });
    });
    it('watchAndSetStatusTrackItemRemove должен завершить текущий элемент и сохранить его.', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetStatusTrackItem, watchAndSetStatusTrackItemCleanup: watchAndSetStatusTrackItemRemove } =
            await import('../background/watchTrackItems/watchAndSetStatusTrackItem');
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');
        await watchAndSetStatusTrackItem();
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);
        expect((await selectAllAppItems(db)).length).toBe(0);
        await watchAndSetStatusTrackItemRemove();
        expect(removeAllListenersSpy).toHaveBeenCalledWith('state-changed');
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'ONLINE',
            title: 'online',
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
            color: COLORS.ONLINE,
        });
    });
});
import { Client } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NormalizedActiveWindow } from '../background/watchTrackItems/watchForActiveWindow.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { addColorToApp, setupTestDb } from './db.testUtils';
import { selectAllAppItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';
import { visualizeTrackItems } from './visualize.testUtils';
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
describe('watchAndSetLogTrackItem', () => {
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
    it('сохраняет предыдущий элемент приложения', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { addActiveWindowWatch } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');
        await addActiveWindowWatch();
        const firstApp: NormalizedActiveWindow = {
            app: 'FirstApp',
            title: 'Первое название',
        };
        const secondApp: NormalizedActiveWindow = {
            app: 'SecondApp',
            title: 'Второе название',
        };
        await addColorToApp(firstApp.app ?? '', COLORS.GREEN);
        appEmitter.emit('active-window-changed', firstApp);
        appEmitter.emit('active-window-changed', secondApp);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...firstApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW,
            color: COLORS.GREEN,
        });
    });
    it('сохраняет каждый элемент с правильными датами начала/окончания', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { addActiveWindowWatch } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');
        await addActiveWindowWatch();
        const firstApp: NormalizedActiveWindow = {
            app: 'FirstApp',
            title: 'Первое название',
        };
        const secondApp: NormalizedActiveWindow = {
            app: 'SecondApp',
            title: 'Второе название',
        };
        const thirdApp: NormalizedActiveWindow = {
            app: 'ThirdApp',
            title: 'Третий титул',
        };
        await addColorToApp(firstApp.app ?? '', COLORS.GREEN);
        await addColorToApp(secondApp.app ?? '', COLORS.RED);
        appEmitter.emit('active-window-changed', firstApp);
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('active-window-changed', secondApp);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('active-window-changed', thirdApp);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(2);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...firstApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...secondApp,
            id: 2,
            beginDate: NOW + 1000,
            endDate: NOW + 2000,
            color: COLORS.RED,
        });
    });
    it('watchAndSetAppTrackItemRemove должен завершить текущий элемент и сохранить его.', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { addActiveWindowWatch, watchAndSetAppTrackItemCleanup: watchAndSetAppTrackItemRemove } = await import(
            '../background/watchTrackItems/watchAndSetAppTrackItem'
        );
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');
        vi.mock('../background/watchTrackItems/watchForActiveWindow', () => ({
            startActiveWindowWatcher: vi.fn().mockReturnValue(vi.fn()),
        }));
        await addActiveWindowWatch();
        const testApp: NormalizedActiveWindow = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testApp.app, COLORS.BLUE);
        appEmitter.emit('active-window-changed', testApp);
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);
        expect((await selectAllAppItems(db)).length).toBe(0);
        await watchAndSetAppTrackItemRemove();
        expect(removeAllListenersSpy).toHaveBeenCalledWith('active-window-changed');
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
            color: COLORS.BLUE,
        });
    });
    it('завершает отслеживание приложения, когда состояние меняется на IDLE/OFFLINE', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetAppTrackItem } = await import('../background/watchTrackItems/watchAndSetAppTrackItem');
        const { State } = await import('../enums/state');
        const backgroundJobIntervalSeconds = 1;
        await watchAndSetAppTrackItem(backgroundJobIntervalSeconds);
        const testApp: NormalizedActiveWindow = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testApp.app ?? '', COLORS.GREEN);
        appEmitter.emit('active-window-changed', testApp);
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        appEmitter.emit('state-changed', State.Idle);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 2000);
        appEmitter.emit('state-changed', State.Online);
        appEmitter.emit('active-window-changed', testApp);
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        appEmitter.emit('state-changed', State.Idle);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        items = await selectAllAppItems(db);
        expect(items[1]).toStrictEqual({
            ...emptyData,
            ...testApp,
            id: 2,
            beginDate: NOW + 2000,
            endDate: NOW + 3000,
            color: COLORS.GREEN,
        });
        visualizeTrackItems(items, NOW);
    });
});
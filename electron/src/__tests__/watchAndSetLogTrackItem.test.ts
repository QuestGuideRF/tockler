import { Client } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackItemRaw } from '../app/task-analyser.utils';
import { TrackItem, trackItems } from '../drizzle/schema';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { COLORS } from './color.testUtils';
import { addColorToApp, setupTestDb } from './db.testUtils';
import { changeStateAndMockDate, selectAllAppItems } from './query.testUtils';
import { getTimestamp } from './time.testUtils';
import { visualizeTrackItems } from './visualize.testUtils';
const eventHandlers: Record<string, any> = {};
vi.mock('electron', async () => ({
    app: {
        getPath: vi.fn(() => ''),
    },
    ipcMain: {
        on: vi.fn((event, handler) => {
            eventHandlers[event] = handler;
        }),
    },
}));
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
async function sendStartNewLogItemEvent(testData: TrackItemRaw) {
    expect(eventHandlers['start-new-log-item']).toBeDefined();
    return eventHandlers['start-new-log-item']({} as any, testData);
}
async function sendEndRunningLogItemEvent() {
    expect(eventHandlers['end-running-log-item']).toBeDefined();
    return eventHandlers['end-running-log-item']({} as any);
}
const emptyData: Partial<TrackItem> = {
    color: null,
    url: null,
    taskName: TrackItemType.LogTrackItem,
};
describe('watchAndSetLogTrackItem', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.resetAllMocks();
        Object.keys(eventHandlers).forEach((key) => {
            delete eventHandlers[key];
        });
        vi.spyOn(Date, 'now').mockImplementation(() => NOW);
        ({ db, client } = await setupTestDb());
    });
    afterEach(async () => {
        vi.restoreAllMocks();
        await cleanupTestDb();
    });
    it('start-new-log-item не должен сохранять элемент журнала', async () => {
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
            color: '#ffffff',
            url: 'http://test.com',
        };
        await sendStartNewLogItemEvent(testData);
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(0);
    });
    it('end-running-log-item должен обновить дату окончания элементов журнала', async () => {
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await sendStartNewLogItemEvent(testData);
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 1000);
        await sendEndRunningLogItemEvent();
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0].endDate).toBe(NOW + 1000);
        visualizeTrackItems(items, NOW);
    });
    it('создать новый элемент журнала при переходе в состояние ожидания/автономного режима', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);
        await sendStartNewLogItemEvent(testData);
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        visualizeTrackItems(items, NOW);
    });
    it('создает новый элемент журнала при остановке', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);
        await sendStartNewLogItemEvent(testData);
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);
        items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        vi.spyOn(Date, 'now').mockImplementation(() => NOW + 3000);
        await sendEndRunningLogItemEvent();
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 4000);
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 5000);
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 6000);
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 7000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        visualizeTrackItems(await selectAllAppItems(db), NOW);
    });
    it('не должен создавать новые элементы при остановке', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);
        await sendStartNewLogItemEvent(testData);
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 2000);
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(2));
        const items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
    });
    it('watchAndSetLogTrackItemRemove должен завершить текущий элемент и сохранить его.', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem, watchAndSetLogTrackItemCleanup: watchAndSetLogTrackItemRemove } = await import(
            '../background/watchTrackItems/watchAndSetLogTrackItem'
        );
        const removeAllListenersSpy = vi.spyOn(appEmitter, 'removeAllListeners');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);
        await sendStartNewLogItemEvent(testData);
        const END_TIME = NOW + 5000;
        vi.spyOn(Date, 'now').mockImplementation(() => END_TIME);
        expect((await selectAllAppItems(db)).length).toBe(0);
        await watchAndSetLogTrackItemRemove();
        expect(removeAllListenersSpy).toHaveBeenCalledWith('state-changed');
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        const items = await selectAllAppItems(db);
        expect(items.length).toBe(1);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            app: 'TestApp',
            title: 'Название теста',
            color: COLORS.GREEN,
            id: 1,
            beginDate: NOW,
            endDate: END_TIME,
        });
    });
    it('должен обрабатывать изменение состояния с автономного на режим ожидания', async () => {
        const { appEmitter } = await import('../utils/appEmitter');
        const { watchAndSetLogTrackItem } = await import('../background/watchTrackItems/watchAndSetLogTrackItem');
        await watchAndSetLogTrackItem();
        const testData: TrackItemRaw = {
            app: 'TestApp',
            title: 'Название теста',
        };
        await addColorToApp(testData.app ?? '', COLORS.GREEN);
        await sendStartNewLogItemEvent(testData);
        await changeStateAndMockDate(appEmitter, State.Offline, NOW + 1000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        await changeStateAndMockDate(appEmitter, State.Idle, NOW + 2000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        await changeStateAndMockDate(appEmitter, State.Online, NOW + 3000);
        await vi.waitFor(async () => expect((await selectAllAppItems(db)).length).toBe(1));
        let items = await selectAllAppItems(db);
        expect(items[0]).toStrictEqual({
            ...emptyData,
            ...testData,
            id: 1,
            beginDate: NOW,
            endDate: NOW + 1000,
            color: COLORS.GREEN,
        });
        visualizeTrackItems(items, NOW);
    });
});
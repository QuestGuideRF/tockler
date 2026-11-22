import { createClient } from '@libsql/клиент';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { vi } from 'vitest';
import { createWorkerMock } from './worker.testUtils';
import * as schema from '../drizzle/schema';
import { appSettings } from '../drizzle/schema';
const outputPathUrl = 'file::memory:';
export async function setupTestDb() {
    const client = createClient({
        url: outputPathUrl,
    });
    const db = drizzle(client, {
        schema,
        logger: true,
    });
    console.info('setupTestDb');
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' });
    await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });
    vi.doMock('../drizzle/worker/db', () => ({
        db,
    }));
    vi.doMock('worker_threads', () => createWorkerMock());
    return { db, client };
}
export async function addColorToApp(app: string, color: string) {
    const { appSettingService } = await import('../drizzle/worker/queries/app-setting-service');
    await appSettingService.changeColorForApp(app, color);
}
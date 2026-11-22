import { Database } from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { appSettings } from '../schema';
import { db, sqlite } from './db';
const logger = console;
async function insertDefaultData(db: ReturnType<typeof drizzle>) {
    logger.debug('Проверка данных по умолчанию');
    const onlineSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'ONLINE')).get();
    if (!onlineSetting) {
        logger.debug('Вставка настройки по умолчанию ОНЛАЙН');
        await db.insert(appSettings).values({ name: 'ONLINE', color: '#7ed321' });
    }
    const offlineSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'OFFLINE')).get();
    if (!offlineSetting) {
        logger.debug('Вставка настройки по умолчанию OFFLINE');
        await db.insert(appSettings).values({ name: 'OFFLINE', color: '#f31b1b' });
    }
    const idleSetting = await db.select().from(appSettings).where(eq(appSettings.name, 'IDLE')).get();
    if (!idleSetting) {
        logger.debug('Вставка настройки IDLE по умолчанию');
        await db.insert(appSettings).values({ name: 'IDLE', color: '#f5a623' });
    }
    logger.debug('Проверка данных по умолчанию завершена');
}
function checkForKnexMigrationTables(sqlite: Database): boolean {
    logger.debug('Проверка таблиц миграции Knex');
    try {
        const knexMigrationsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knex_migrations'")
            .get();
        const knexMigrationsLockExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knex_migrations_lock'")
            .get();
        const tablesExist = !!knexMigrationsExist && !!knexMigrationsLockExist;
        logger.debug(`Существуют таблицы миграции Knex: ${tablesExist}`);
        return tablesExist;
    } catch (error) {
        logger.error('Проверка ошибок в таблицах миграции Knex:', error);
        return false;
    }
}
function checkIfAppTablesExist(sqlite: Database): boolean {
    logger.debug('Проверка существования таблиц приложения');
    try {
        const trackItemsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TrackItems'")
            .get();
        const appSettingsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='AppSettings'")
            .get();
        const settingsExist = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Settings'")
            .get();
        const tablesExist = !!trackItemsExist && !!appSettingsExist && !!settingsExist;
        logger.debug(`Таблицы приложений существуют: ${tablesExist}`);
        return tablesExist;
    } catch (error) {
        logger.error('Проверка ошибок для таблиц приложения:', error);
        return false;
    }
}
function removeKnexMigrationTables(sqlite: Database): void {
    logger.debug('Удаление таблиц миграции Knex');
    try {
        sqlite.prepare('DROP TABLE IF EXISTS knex_migrations').run();
        sqlite.prepare('DROP TABLE IF EXISTS knex_migrations_lock').run();
        logger.debug('Таблицы миграции Knex успешно удалены');
    } catch (error) {
        logger.error('Ошибка удаления таблиц миграции Knex:', error);
    }
}
export async function connectAndSync(sqlite: Database, db: ReturnType<typeof drizzle>) {
    try {
        const migrationsFolder = join(__dirname, 'drizzle', 'migrations');
        logger.debug('Проверка миграции по адресу:', migrationsFolder);
        if (!existsSync(migrationsFolder)) {
            logger.error('Не удалось найти папку миграции');
            throw new Error('Не удалось найти папку миграции');
        }
        const metaDir = join(migrationsFolder, 'meta');
        if (!existsSync(metaDir)) {
            logger.debug('Создание метакаталога по адресу:', metaDir);
            mkdirSync(metaDir, { recursive: true });
        }
        const hasKnexTables = checkForKnexMigrationTables(sqlite);
        const hasAppTables = checkIfAppTablesExist(sqlite);
        logger.debug('Запуск миграции из:', migrationsFolder);
        if (hasKnexTables && hasAppTables) {
            logger.info('Таблицы миграции Knex найдены, а таблицы приложений уже существуют. Пропуск первоначальной миграции.');
            sqlite
                .prepare(
                    `
                CREATE TABLE IF NOT EXISTS drizzle_migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    hash TEXT NOT NULL,
                    created_at INTEGER
                )
            `,
                )
                .run();
            const fs = require('fs');
            const initialMigrationFiles = fs
                .readdirSync(migrationsFolder)
                .filter((file: string) => file.endsWith('.sql'))
                .sort();
            const initialMigrationFile = initialMigrationFiles.find((file: string) => file.startsWith('0000_'));
            if (initialMigrationFile) {
                const migrationTag = initialMigrationFile.replace('.sql', '');
                const existingMigration = sqlite
                    .prepare('SELECT * FROM drizzle_migrations WHERE hash = ?')
                    .get(migrationTag);
                if (!existingMigration) {
                    sqlite
                        .prepare('INSERT INTO drizzle_migrations (hash, created_at) VALUES (?, ?)')
                        .run(migrationTag, Date.now());
                    logger.debug(`Отмечена первоначальная миграция "${migrationTag}" как примененная.`);
                }
            }
            removeKnexMigrationTables(sqlite);
        }
        migrate(db, {
            migrationsFolder,
            migrationsTable: 'drizzle_migrations',
        });
        await insertDefaultData(db);
        logger.info('База данных подключена, миграция успешно применена.');
    } catch (error) {
        logger.error('Ошибка подключения к базе данных или применения миграции:', error);
        throw error;
    }
}
export const initDb = async () => {
    await connectAndSync(sqlite, db);
};
export const closeDb = async () => {
    await sqlite.close();
};
export const dbService = {
    initDb,
    closeDb,
};
export type DbService = typeof dbService;
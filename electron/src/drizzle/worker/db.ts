import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { workerData } from 'worker_threads';
import * as schema from '../schema';
const outputPath = workerData.outputPath;
console.info('реальный выходной путь к базе данных', outputPath);
export const sqlite = new Database(outputPath, {
    verbose: process.env['NODE_ENV'] === 'development' ? console.log : undefined,
    timeout: 5000,
});
sqlite.pragma('Journal_mode = WAL');
sqlite.pragma('синхронный = НОРМАЛЬНЫЙ');
sqlite.pragma('размер кэша = -64000');
sqlite.pragma('Foreign_keys = ВКЛ.');
sqlite.pragma('temp_store = ПАМЯТЬ');
sqlite.pragma('mmap_size = 1000000000');
sqlite.pragma('размер_страницы = 8192');
sqlite.pragma('auto_vacuum = ИНКРЕМЕНТАЛЬНО');
sqlite.pragma('busy_timeout = 5000');
export const db = drizzle(sqlite, { schema });
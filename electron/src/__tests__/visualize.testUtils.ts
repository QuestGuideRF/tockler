import { TrackItem } from '../drizzle/schema';
export function visualizeTrackItems(items: TrackItem[], startTime?: number) {
    if (items.length === 0) {
        console.log('Нет элементов для визуализации');
        return;
    }
    const minTime = startTime ?? Math.min(...items.map((item) => item.beginDate));
    const maxTime = Math.max(...items.map((item) => item.endDate));
    const totalDuration = maxTime - minTime;
    const chartWidth = 60;
    const scale = chartWidth / totalDuration;
    console.log('\n--- Временной график TrackItems ---');
    console.log(`Timeline: ${new Date(minTime).toISOString()} to ${new Date(maxTime).toISOString()}`);
    console.log(`Продолжительность: ${totalDuration}мс | Масштаб: ${scale.toFixed(6)} символов/мс`);
    console.log('-'.repeat(80));
    items.forEach((item, index) => {
        const start = Math.round((item.beginDate - minTime) * scale);
        const length = Math.max(1, Math.round((item.endDate - item.beginDate) * scale));
        const bar = ' '.repeat(start) + '█'.repeat(length);
        const duration = ((item.endDate - item.beginDate) / 1000).toFixed(1) + 's';
        const beginDate = ((item.beginDate - minTime) / 1000).toFixed(1) + 's';
        const endDate = ((item.endDate - minTime) / 1000).toFixed(1) + 's';
        const headingSize = 10;
        const idSize = 8;
        const dateSize = 8;
        const id = `Идентификатор=${item.id}`;
        console.log(`${index + 1}. ${item.app.padEnd(headingSize)}${bar}`);
        console.log(
            `   ${id.padEnd(idSize)}` +
                ' '.repeat(start) +
                `${beginDate.padEnd(dateSize)}` +
                ' '.repeat(Math.max(0, length - dateSize)) +
                `${endDate.padEnd(dateSize)}` +
                ` = ` +
                `${duration}`,
        );
        console.log(`.`.repeat(80));
    });
    console.log('-'.repeat(80));
}
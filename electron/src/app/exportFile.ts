import { stringify } from 'csv-stringify/sync';
import { dialog } from 'electron';
import { writeFileSync } from 'fs';
import moment from 'moment';
export async function exportFile(
    from: string,
    to: string,
    taskName: string,
    results: any[],
    format: 'csv' | 'json' = 'csv',
) {
    let fileContent: string;
    let fileExtension: string;
    if (format === 'json') {
        const processedResults = results.map((item) => ({
            ...item,
            beginDate: moment(item.beginDate).format('ГГГГ-ММ-ДД ЧЧ:мм:сс'),
            endDate: moment(item.endDate).format('ГГГГ-ММ-ДД ЧЧ:мм:сс'),
        }));
        fileContent = JSON.stringify(processedResults, null, 2);
        fileExtension = 'json';
    } else {
        const toDateTimeStr = (timestamp: string) => moment(parseInt(timestamp)).format('ГГГГ-ММ-ДД ЧЧ:мм:сс');
        fileContent = stringify(results, {
            delimiter: ';',
            cast: {
                number: function (value, { column }) {
                    if (['endDate', 'beginDate'].includes(column?.toString() || '')) {
                        return toDateTimeStr(value.toString());
                    }
                    return value?.toString();
                },
            },
            header: true,
        });
        fileExtension = 'csv';
    }
    const formattedFrom = moment(new Date(from)).format('YYYY-MM-DD');
    const formattedTo = moment(new Date(to)).format('YYYY-MM-DD');
    const defaultPath = `Tockler_${taskName}_${formattedFrom}-${formattedTo}.${fileExtension}`;
    dialog
        .showSaveDialog({
            title: 'Сохранить экспорт как',
            defaultPath: defaultPath,
            filters: [
                { name: format.toUpperCase(), extensions: [fileExtension] },
                { name: 'Все файлы', extensions: ['*'] },
            ],
        })
        .then(({ filePath }) => {
            if (filePath) {
                writeFileSync(filePath, fileContent);
            }
        });
    return results;
}
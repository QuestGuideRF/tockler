import { trackItems } from './schema';
export const orderByKey = {
    beginDate: trackItems.beginDate,
    endDate: trackItems.endDate,
    app: trackItems.app,
    title: trackItems.title,
    taskName: trackItems.taskName,
    url: trackItems.url,
};
export type OrderByKey = keyof typeof orderByKey;
export interface ITrackItem {
    id: number;
    taskName?: string;
    beginDate: number;
    endDate: number;
    app: string;
    title?: string;
    color?: string;
    url?: string;
}
export interface NewTrackItem extends Omit<ITrackItem, 'id'> {
    id?: number;
}
export interface SelectedTrackItem extends Omit<ITrackItem, 'id'> {
    id?: number;
}
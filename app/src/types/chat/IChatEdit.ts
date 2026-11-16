export interface IChatEdit {
    id: number;
    name: string;
    addUserIds?: number[];
    removeUserIds?: number[];
}
export interface IMessageItem {
    id: number;
    message: string;
    chatId: number;
    userId: number;
    userName: string;
    userImage: string | null;
    createdAt: string;
}
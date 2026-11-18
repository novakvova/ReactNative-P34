import {useCallback, useEffect, useRef, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {MY_CHAT_HUB_URL} from "@/api/config";
import {chatApi} from "@/api/chatApiSlice";
import {useAppDispatch, useAppSelector} from "@/store";
import {IMessageItem} from "@/types/chat/IMessageItem";

export type HubStatus = "connecting" | "connected" | "disconnected";

// З'єднання з MyChatHub. Токен передається через accessTokenFactory.
// Нові повідомлення з хабу додаються в кеш getChatMessages цього чату.
export const useChatHub = (chatId: number | null) => {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.user?.token);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [status, setStatus] = useState<HubStatus>("connecting");

    const tokenRef = useRef<string | undefined>(token);
    tokenRef.current = token;

    // Одне з'єднання на сесію екрана
    useEffect(() => {
        if (!token) return;

        const conn = new HubConnectionBuilder()
            .withUrl(MY_CHAT_HUB_URL, {accessTokenFactory: () => tokenRef.current ?? ""})
            .withAutomaticReconnect()
            .build();

        conn.on("ReceiveMessage", (message: IMessageItem) => {
            dispatch(
                chatApi.util.updateQueryData("getChatMessages", message.chatId, (draft) => {
                    if (!draft.some((item) => item.id === message.id)) {
                        draft.push(message);
                    }
                })
            );
        });

        conn.onreconnecting(() => setStatus("connecting"));
        conn.onreconnected(() => setStatus("connected"));
        conn.onclose(() => setStatus("disconnected"));

        setConnection(conn);
        conn.start()
            .then(() => setStatus("connected"))
            .catch(() => setStatus("disconnected"));

        return () => {
            setConnection(null);
            void conn.stop();
        };
    }, [token, dispatch]);

    // Вступ у групу вибраного чату; після переподключення групу відновлюємо
    useEffect(() => {
        if (!connection || status !== "connected" || chatId === null) return;

        connection.invoke("JoinChat", chatId).catch(() => setStatus("disconnected"));

        return () => {
            void connection.invoke("LeaveChat", chatId).catch(() => undefined);
        };
    }, [connection, status, chatId]);

    const sendMessage = useCallback(
        async (targetChatId: number, message: string): Promise<void> => {
            if (!connection || status !== "connected") {
                throw new Error("Немає з'єднання з сервером");
            }
            await connection.invoke("SendMessage", {chatId: targetChatId, message});
        },
        [connection, status]
    );

    return {status, sendMessage};
};

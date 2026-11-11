import {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    ListRenderItem,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from "react-native-keyboard-controller";
import {cssInterop} from "nativewind";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {CHAT_HUB_URL} from "@/api/config";

// NativeWind не знає про сторонній компонент — вмикаємо className для нього
cssInterop(KeyboardAvoidingView, {className: "style"});

type ConnectionState ="connecting" | "connected" | "disconnected";

interface IChatMessage {
    id: string;
    text: string;
    receivedAt: string;
}

const statusStyles: Record<ConnectionState, { label: string; dot: string }> = {
    connecting: {label: "Підключення...", dot: "bg-amber-400"},
    connected: {label: "На зв'язку", dot: "bg-emerald-500"},
    disconnected: {label: "Немає з'єднання", dot: "bg-red-500"},
};

const formatTime = (date: Date): string => {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const MyChatScreen = () => {
    // Від нових до старих: список інвертований, тож нові повідомлення внизу
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [text, setText] = useState("");
    const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
    const [sendError, setSendError] = useState<string | null>(null);

    const connectionRef = useRef<HubConnection | null>(null);
    const nextIdRef = useRef(0);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(CHAT_HUB_URL)
            .withAutomaticReconnect()
            .build();
        connectionRef.current = connection;

        // Сервер розсилає повідомлення всім клієнтам, включно з відправником
        connection.on("Send", (message: string) => {
            const id = String(nextIdRef.current++);
            setMessages((prev) => [{id, text: message, receivedAt: formatTime(new Date())}, ...prev]);
        });

        connection.onreconnecting(() => setConnectionState("connecting"));
        connection.onreconnected(() => setConnectionState("connected"));
        connection.onclose(() => setConnectionState("disconnected"));

        connection.start()
            .then(() => setConnectionState("connected"))
            .catch(() => setConnectionState("disconnected"));

        return () => {
            connectionRef.current = null;
            void connection.stop();
        };
    }, []);

    const canSend = connectionState === "connected" && text.trim().length > 0;

    const sendMessage = async () => {
        const message = text.trim();
        const connection = connectionRef.current;
        if (!message || !connection || connectionState !== "connected") return;

        setSendError(null);
        try {
            await connection.invoke("Send", message);
            setText("");
        } catch {
            setSendError("Не вдалося надіслати повідомлення. Спробуйте ще раз.");
        }
    };

    const renderMessage: ListRenderItem<IChatMessage> = ({item}) => (
        <View className="mb-3 max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
            <Text className="text-base text-slate-900">{item.text}</Text>
            <Text className="mt-1 text-xs text-slate-400">{item.receivedAt}</Text>
        </View>
    );

    const status = statusStyles[connectionState];

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            {/* Піднімає поле вводу над клавіатурою (однаково на iOS і Android з edge-to-edge) */}
            <KeyboardAvoidingView className="flex-1" behavior="padding">
                <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
                    <Text className="text-xl font-bold text-slate-900">Чат</Text>
                    <View className="flex-row items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <View className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                        <Text className="text-xs font-medium text-slate-600">{status.label}</Text>
                    </View>
                </View>

                <FlatList
                    className="flex-1"
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    inverted
                    contentContainerClassName="px-4 py-4"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-base text-slate-500">Повідомлень ще немає</Text>
                        </View>
                    }
                />

                {sendError && (
                    <Text className="bg-red-50 px-4 py-2 text-sm text-red-600">{sendError}</Text>
                )}

                <View className="flex-row items-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
                    <TextInput
                        className="min-h-12 max-h-32 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                        value={text}
                        onChangeText={setText}
                        placeholder="Введіть повідомлення..."
                        placeholderTextColor="#94a3b8"
                        multiline
                    />
                    <Pressable
                        onPress={sendMessage}
                        disabled={!canSend}
                        className={`h-12 items-center justify-center rounded-2xl bg-indigo-600 px-5 active:bg-indigo-700 ${canSend ? "" : "opacity-50"}`}
                    >
                        <Text className="text-base font-semibold text-white">Відправити</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default MyChatScreen;

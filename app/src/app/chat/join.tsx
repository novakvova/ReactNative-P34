import {useEffect, useRef, useState, type ComponentRef} from "react";
import {Image, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import {router} from "expo-router";
import {
    useGetChatMessagesQuery,
    useGetChatTypesQuery,
    useGetMyChatsQuery,
    useIsChatAdminQuery,
} from "@/api/chatApiSlice";
import {API_BASE_URL} from "@/api/config";
import {useChatHub} from "@/hooks/useChatHub";
import {formatMessageTime} from "@/utils/formatMessageTime";
import {IMessageItem} from "@/types/chat/IMessageItem";

const statusLabels = {
    connecting: "Підключення...",
    connected: "На зв'язку",
    disconnected: "Немає з'єднання",
} as const;

const getInitials = (name: string): string =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

const MessageBubble = ({message}: {message: IMessageItem}) => (
    <View className="mb-3 flex-row items-start gap-3">
        {message.userImage ? (
            <Image
                source={{uri: `${API_BASE_URL}/images/${message.userImage}_64.webp`}}
                className="h-9 w-9 rounded-full bg-slate-200"
            />
        ) : (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                <Text className="text-xs font-semibold text-indigo-700">{getInitials(message.userName)}</Text>
            </View>
        )}

        <View className="flex-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
            <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-sm font-semibold text-slate-900" numberOfLines={1}>
                    {message.userName}
                </Text>
                <Text className="text-xs text-slate-400">{formatMessageTime(message.createdAt)}</Text>
            </View>
            <Text className="mt-1 text-base text-slate-800">{message.message}</Text>
        </View>
    </View>
);

const JoinChatScreen = () => {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [text, setText] = useState<string>("");
    const [sendError, setSendError] = useState<string | null>(null);
    const messagesRef = useRef<ComponentRef<typeof ScrollView>>(null);

    const {data: chats, isLoading: chatsLoading, isError: chatsError} = useGetMyChatsQuery();
    const {data: chatTypes} = useGetChatTypesQuery();
    const {
        data: messages,
        isLoading: messagesLoading,
        isError: messagesError,
    } = useGetChatMessagesQuery(selectedChatId ?? 0, {skip: selectedChatId === null});
    const {data: isAdmin} = useIsChatAdminQuery(selectedChatId ?? 0, {skip: selectedChatId === null});

    const {status, sendMessage} = useChatHub(selectedChatId);

    const selectedChat = chats?.find((chat) => chat.chatId === selectedChatId);
    const selectedTypeName = chatTypes?.find((type) => type.id === selectedChat?.chatTypeId)?.name;

    const canSend = selectedChatId !== null && status === "connected" && text.trim().length > 0;

    const onSend = async () => {
        const message = text.trim();
        if (!message || selectedChatId === null) return;

        setSendError(null);
        try {
            await sendMessage(selectedChatId, message);
            setText("");
        } catch {
            setSendError("Не вдалося надіслати повідомлення. Спробуйте ще раз.");
        }
    };

    // Прокрутка до останнього повідомлення при появі нових
    useEffect(() => {
        messagesRef.current?.scrollToEnd({animated: true});
    }, [messages?.length, selectedChatId]);

    return (
        <View className="flex-1">
            <Pressable
                onPress={() => router.back()}
                className="mb-6 h-12 w-24 items-center justify-center rounded-xl bg-slate-200 active:bg-slate-300"
            >
                <Text className="text-base font-semibold text-slate-900">Назад</Text>
            </Pressable>

            <Text className="mb-6 text-center text-2xl font-bold text-slate-900">Мої чати</Text>

            <View className="flex-row gap-3">
                {/* Ліва колонка: список доступних чатів */}
                <View className="w-2/5">
                    <ScrollView className="h-[480px]" showsVerticalScrollIndicator={false}>
                        {chatsLoading && <Text className="text-sm text-slate-500">Завантаження...</Text>}
                        {chatsError && <Text className="text-sm text-red-500">Не вдалося завантажити чати</Text>}
                        {chats?.length === 0 && (
                            <Text className="text-sm text-slate-500">У вас ще немає чатів</Text>
                        )}

                        {chats?.map((chat) => {
                            const selected = chat.chatId === selectedChatId;
                            return (
                                <Pressable
                                    key={chat.chatId}
                                    onPress={() => setSelectedChatId(chat.chatId)}
                                    className={`mb-2 rounded-xl border px-3 py-3 ${
                                        selected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-slate-50"
                                    }`}
                                >
                                    <Text
                                        numberOfLines={2}
                                        className={selected ? "font-semibold text-white" : "font-semibold text-slate-900"}
                                    >
                                        {chat.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Права колонка: інформація про чат і повідомлення */}
                <View className="flex-1">
                    {selectedChat ? (
                        <>
                            <View className="mb-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                                <Text className="text-base font-bold text-slate-900">{selectedChat.name}</Text>
                                <Text className="text-xs text-slate-500">
                                    {selectedTypeName ?? "Тип не вказано"}
                                    {isAdmin ? " · Ви адміністратор" : ""}
                                </Text>
                                <Text className="mt-1 text-xs text-slate-400">
                                    {statusLabels[status]}
                                </Text>
                            </View>

                            <ScrollView
                                ref={messagesRef}
                                className="mb-3 h-[360px] rounded-xl bg-slate-100 p-3"
                                showsVerticalScrollIndicator={false}
                            >
                                {messagesLoading && <Text className="text-sm text-slate-500">Завантаження...</Text>}
                                {messagesError && (
                                    <Text className="text-sm text-red-500">Не вдалося завантажити повідомлення</Text>
                                )}
                                {messages?.length === 0 && (
                                    <Text className="text-sm text-slate-500">Повідомлень ще немає</Text>
                                )}
                                {messages?.map((message) => (
                                    <MessageBubble key={message.id} message={message} />
                                ))}
                            </ScrollView>

                            {sendError && <Text className="mb-2 text-xs text-red-500">{sendError}</Text>}

                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-indigo-500"
                                    value={text}
                                    onChangeText={setText}
                                    placeholder="Повідомлення"
                                    placeholderTextColor="#94a3b8"
                                    maxLength={1000}
                                />
                                <Pressable
                                    onPress={onSend}
                                    disabled={!canSend}
                                    className={`h-12 items-center justify-center rounded-xl px-4 ${
                                        canSend ? "bg-indigo-600 active:bg-indigo-700" : "bg-slate-300"
                                    }`}
                                >
                                    <Text className="font-semibold text-white">Надіслати</Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <View className="h-[480px] items-center justify-center">
                            <Text className="text-center text-slate-500">Оберіть чат зліва</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default JoinChatScreen;

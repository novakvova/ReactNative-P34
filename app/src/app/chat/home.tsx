import {Image, Pressable, Text, View} from "react-native";
import {router} from "expo-router";
import {useAppSelector} from "@/store";
import {API_BASE_URL} from "@/api/config";

// Початкові літери імені для аватара, якщо фото немає
const getInitials = (name?: string): string => {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
};

const ChatHomeScreen = () => {
    const {user} = useAppSelector(state => state.auth);

    const avatarUri = user?.image ? `${API_BASE_URL}/images/${user.image}_432.webp` : null;

    return (
        <View className="flex-1">
            {/* Ліворуч зверху — перехід до налаштувань (профіль) */}
            <View className="flex-row justify-start">
                <Pressable
                    onPress={() => router.push("/profile")}
                    accessibilityLabel="Налаштування"
                    className="h-12 w-12 items-center justify-center rounded-full bg-white shadow active:bg-slate-100"
                >
                    <Text className="text-2xl">⚙️</Text>
                </Pressable>
            </View>

            <View className="flex-1 items-center justify-center">
                {/* Картка користувача з даними з Redux */}
                <View className="w-full max-w-md items-center rounded-3xl bg-white p-8 shadow-2xl">
                    {avatarUri ? (
                        <Image source={{uri: avatarUri}} className="h-28 w-28 rounded-full bg-slate-200"/>
                    ) : (
                        <View className="h-28 w-28 items-center justify-center rounded-full bg-indigo-100">
                            <Text className="text-3xl font-bold text-indigo-700">
                                {getInitials(user?.name)}
                            </Text>
                        </View>
                    )}
                    <Text className="mt-4 text-center text-xl font-semibold text-slate-900">
                        {user?.name}
                    </Text>
                    <Text className="mt-1 text-center text-sm text-slate-500">
                        {user?.email}
                    </Text>
                </View>

                <Text className="mt-8 text-center text-3xl font-bold text-slate-900">
                    Вітаємо у чат системі
                </Text>

                <View className="mt-8 w-full max-w-md">
                    <Pressable
                        onPress={() => router.push("/chat/create")}
                        className="mb-4 h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                    >
                        <Text className="text-base font-semibold text-white">
                            Створити новий чат
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/chat/join")}
                        className="h-14 w-full items-center justify-center rounded-xl bg-yellow-600 active:bg-yellow-700"
                    >
                        <Text className="text-base font-semibold text-white">
                            Додатися в чат
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default ChatHomeScreen;

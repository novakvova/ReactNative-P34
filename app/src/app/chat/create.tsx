import {Pressable, Text, View} from "react-native";
import {router} from "expo-router";

// Заглушка: створення чату ще не реалізоване
const CreateChatScreen = () => {
    return (
        <View className="flex-1">
            <Pressable
                onPress={() => router.back()}
                className="mb-6 h-12 w-24 items-center justify-center rounded-xl bg-slate-200 active:bg-slate-300"
            >
                <Text className="text-base font-semibold text-slate-900">Назад</Text>
            </Pressable>

            <Text className="text-center text-2xl font-bold text-slate-900">
                Створення чату
            </Text>
            <Text className="mt-2 text-center text-slate-500">
                Цей екран ще в розробці.
            </Text>
        </View>
    );
};

export default CreateChatScreen;

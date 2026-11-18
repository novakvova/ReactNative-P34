import {useState} from "react";
import {Pressable, ScrollView, Text, TextInput, View} from "react-native";
import {router} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    useCreateChatMutation,
    useGetChatTypesQuery,
    useSearchChatUsersQuery,
} from "@/api/chatApiSlice";
import {getApiError} from "@/api/apiErrors";
import {CreateChatSchema, CreateChatForm} from "@/schemas/CreateChatSchema";

const CreateChatScreen = () => {
    const [search, setSearch] = useState<string>("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {data: chatTypes, isError: typesError} = useGetChatTypesQuery();
    const {data: users, isError: usersError} = useSearchChatUsersQuery({
        query: search.trim() || undefined,
    });
    const [createChat, {isLoading}] = useCreateChatMutation();

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<CreateChatForm>({
        resolver: zodResolver(CreateChatSchema),
        defaultValues: {
            name: "",
            chatTypeId: 0,
            userIds: [],
        },
    });

    const onSubmit = async (data: CreateChatForm) => {
        setSubmitError(null);

        try {
            await createChat(data).unwrap();
            router.replace("/chat/join");
        } catch (error) {
            const {message} = getApiError(error);
            setSubmitError(message ?? "Не вдалося створити чат. Спробуйте ще раз.");
        }
    };

    return (
        <View className="flex-1">
            <Pressable
                onPress={() => router.back()}
                className="mb-6 h-12 w-24 items-center justify-center rounded-xl bg-slate-200 active:bg-slate-300"
            >
                <Text className="text-base font-semibold text-slate-900">Назад</Text>
            </Pressable>

            <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                Створення чату
            </Text>
            <Text className="mb-8 text-center text-base text-slate-500">
                Назва, тип і учасники чату
            </Text>

            {/* Назва чату */}
            <View className="mb-5">
                <Text className="mb-2 text-sm font-medium text-slate-700">Назва чату</Text>
                <Controller
                    control={control}
                    name="name"
                    render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                            className="h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="Наприклад: Команда P34"
                            placeholderTextColor="#94a3b8"
                        />
                    )}
                />
                {errors.name && (
                    <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
                )}
            </View>

            {/* Тип чату */}
            <View className="mb-5">
                <Text className="mb-2 text-sm font-medium text-slate-700">Тип чату</Text>
                <Controller
                    control={control}
                    name="chatTypeId"
                    render={({field: {onChange, value}}) => (
                        <View className="flex-row flex-wrap gap-2">
                            {chatTypes?.map((type) => {
                                const selected = value === type.id;
                                return (
                                    <Pressable
                                        key={type.id}
                                        onPress={() => onChange(type.id)}
                                        className={`rounded-xl border px-4 py-3 ${
                                            selected
                                                ? "border-indigo-600 bg-indigo-600"
                                                : "border-slate-300 bg-slate-50"
                                        }`}
                                    >
                                        <Text className={selected ? "font-semibold text-white" : "text-slate-900"}>
                                            {type.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                />
                {typesError && (
                    <Text className="mt-1 text-xs text-red-500">Не вдалося завантажити типи чатів</Text>
                )}
                {errors.chatTypeId && (
                    <Text className="mt-1 text-xs text-red-500">{errors.chatTypeId.message}</Text>
                )}
            </View>

            {/* Учасники чату */}
            <View className="mb-5">
                <Text className="mb-2 text-sm font-medium text-slate-700">Учасники</Text>
                <TextInput
                    className="mb-3 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Пошук користувачів"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                />

                <Controller
                    control={control}
                    name="userIds"
                    render={({field: {onChange, value}}) => (
                        <ScrollView className="max-h-64" keyboardShouldPersistTaps="handled">
                            {users?.map((user) => {
                                const selected = value.includes(user.id);
                                return (
                                    <Pressable
                                        key={user.id}
                                        onPress={() =>
                                            onChange(
                                                selected
                                                    ? value.filter((id) => id !== user.id)
                                                    : [...value, user.id]
                                            )
                                        }
                                        className={`mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                                            selected
                                                ? "border-indigo-600 bg-indigo-50"
                                                : "border-slate-300 bg-slate-50"
                                        }`}
                                    >
                                        <Text className="text-base text-slate-900">{user.name}</Text>
                                        <Text className={selected ? "font-semibold text-indigo-600" : "text-slate-400"}>
                                            {selected ? "✓" : "+"}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}
                />
                {usersError && (
                    <Text className="mt-1 text-xs text-red-500">Не вдалося завантажити користувачів</Text>
                )}
                {errors.userIds && (
                    <Text className="mt-1 text-xs text-red-500">{errors.userIds.message}</Text>
                )}
            </View>

            {submitError && (
                <Text className="mb-4 text-sm text-red-500">{submitError}</Text>
            )}

            <Pressable
                onPress={() => handleSubmit(onSubmit)()}
                disabled={isLoading}
                className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700 disabled:opacity-60"
            >
                <Text className="text-base font-semibold text-white">
                    {isLoading ? "Створення..." : "Створити чат"}
                </Text>
            </Pressable>
        </View>
    );
};

export default CreateChatScreen;

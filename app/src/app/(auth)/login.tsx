import { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {router, useRouter} from "expo-router";
import {ILoginType} from "@/types/auth/ILoginType";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {LoginSchema} from "@/schemas/LoginSchema";
import * as SecureStore from 'expo-secure-store';
import {useAppDispatch} from "@/store";
import {loginSuccess} from "@/store/reducers/AuthSlice";
import {useLoginMutation} from "@/api/apiSlice";
import {getApiError} from "@/api/apiErrors";

const LoginScreen = () => {
    const passwordRef = useRef(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loginUser, {isLoading}] = useLoginMutation();

    const router = useRouter();

    //Може посилати команди у Redux
    const dispatch = useAppDispatch();

    const defaultValue: ILoginType = {
        email: "",
        password: "",
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: defaultValue
    });

    const myOnSubmit = async (data: ILoginType) => {
        setLoginError(null);

        try {
            const {token} = await loginUser(data).unwrap();
            await SecureStore.setItemAsync("token", token);
            dispatch(loginSuccess(token)); //тут ми логінимо у системі користувача
            router.push("/chat/home");

            // console.log("Усіх data", token);
        }
        catch (error) {
            // 400 і 401 — невірний логін або пароль; текст береться з відповіді сервера
            const {status, message} = getApiError(error);
            setLoginError(
                status === 400 || status === 401
                    ? message ?? "Невірний логін або пароль"
                    : "Не вдалося увійти. Перевірте з'єднання і спробуйте ще раз."
            );
        }
    }


    return (
        <>
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="flex-grow px-6 py-10"
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                        automaticallyAdjustKeyboardInsets
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                                <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                                    Вхід
                                </Text>
                                <Text className="mb-8 text-center text-base text-slate-500">
                                    Увійдіть у свій акаунт
                                </Text>
                                <View className="mb-5">
                                    <Text className="mb-2 text-sm font-medium text-slate-700">
                                        Електронна пошта
                                    </Text>

                                    <Controller
                                        control={control}
                                        name="email"
                                        render={({field: {onChange, onBlur, value}}) => (
                                            <TextInput
                                                className="mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                placeholderTextColor="#94a3b8"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        )}
                                    />

                                    {errors.email && (
                                        <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                    )}
                                </View>

                                <View className="mb-5">
                                    <Text className="mb-2 text-sm font-medium text-slate-700">
                                        Пароль
                                    </Text>

                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({field: {onChange, onBlur, value}}) => (
                                            <TextInput
                                                ref={passwordRef}
                                                value={value}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                className="mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                                placeholder="••••••••"
                                                placeholderTextColor="#94a3b8"
                                                secureTextEntry
                                                autoCapitalize="none"
                                            />
                                        )}
                                    />

                                    {errors.password && (
                                        <Text className="mt-1 text-xs text-red-500">{errors.password.message}</Text>
                                    )}
                                </View>


                                {loginError && (
                                    <Text className="mb-4 text-sm text-red-500">{loginError}</Text>
                                )}

                                <TouchableOpacity
                                    onPress={() => router.push("/forgot-password")}
                                    className="mb-4 items-end"
                                >
                                    <Text className="text-sm font-medium text-indigo-600">
                                        Забули пароль?
                                    </Text>
                                </TouchableOpacity>

                                <Pressable
                                    onPress={()=>handleSubmit(myOnSubmit)()}
                                    disabled={isLoading}
                                    className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"

                                >
                                    <Text className="text-base font-semibold text-white">
                                        Увійти
                                    </Text>
                                </Pressable>

                                <TouchableOpacity
                                    onPress={() => router.replace("/register")}
                                    className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700">
                                    <Text className="text-base font-semibold text-white">
                                        Реєстрація
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    )
}

export default LoginScreen;
import {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {cssInterop} from "nativewind";

// NativeWind не знає про сторонній компонент — вмикаємо className для нього
cssInterop(KeyboardAwareScrollView, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
});
import {router} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {IRegisterType} from "@/types/auth/IRegisterType";
import {RegisterSchema} from "@/schemas/RegisterSchema";
import * as ImagePicker from "expo-image-picker";
import {ImagePickerButton} from "@/components/form/ImagePickerButton"
import * as SecureStore from "expo-secure-store";
import {loginSuccess, logout} from "@/store/reducers/AuthSlice";
import {useAppDispatch} from "@/store";
import {useRegisterMutation} from "@/api/apiSlice";
import {getApiError} from "@/api/apiErrors";

const inputClass =
    "mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white";

const RegisterScreen = () => {

    const defaultValue: IRegisterType = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    };

    const {
        control,
        handleSubmit,
        setValue,
        watch, //Ми зможемо слідкувати за певним полем в класі
        formState: {errors, isSubmitting},
    } = useForm<IRegisterType>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: defaultValue,
    });

    const image = watch("imageFile");

    const [registerUser] = useRegisterMutation();
    const [serverError, setServerError] = useState<string | null>(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult) {
            alert("Доступ до галереї потрібен для вибору фото.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // лише фото
            allowsEditing: true,    // можна обрізати після вибору
            aspect: [1, 1],         // квадрат (для круглої аватарки; працює на Android)
            quality: 1,           // трохи стискаємо
        });


        // Користувач закрив галерею, нічого не вибравши
        if (result.canceled) return;
        const asset = result.assets[0];
        const data = {
            uri: asset.uri,
            name: asset.fileName ?? "photo.jpg",
            type: asset.mimeType ?? "image/jpeg",
        };
        // console.log("Select image",data);
        setValue("imageFile",data);

    }

    const dispatch = useAppDispatch();

    const myOnSubmit = async (data: IRegisterType) => {
        setServerError(null);
        try {
            console.log("Data register", data);
            const {token} = await registerUser(data).unwrap();
            await SecureStore.setItemAsync("token", token);
            dispatch(loginSuccess(token)); //тут ми логінимо у системі користувача
            router.push("/profile");
        } catch (error) {
            console.log("Server errror", error);
            setServerError(getApiError(error).message ?? "Не вдалося створити акаунт. Спробуйте ще раз.");
        }
    };

    return (
        <SafeAreaView className="flex-1">
            {/* Прокручує до активного поля, щоб клавіатура його не перекривала */}
            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerClassName="flex-grow px-6 py-10"
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
                showsVerticalScrollIndicator={false}
            >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                            <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                                Реєстрація
                            </Text>
                            <Text className="mb-8 text-center text-base text-slate-500">
                                Створити новий акаунт
                            </Text>

                            {/* Фото: до вибору — значок камери, після — саме фото в колі */}
                            <View className="mb-6 items-center">
                                <ImagePickerButton
                                    imageUri={image?.uri ?? null}
                                    onPress={pickImage}
                                />
                                <Text className="mt-2 text-sm text-slate-500">
                                    {image ? "Натисніть, щоб змінити фото" : "Натисніть, щоб вибрати фото"}
                                </Text>
                            </View>

                            {/* Ім'я */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Ім'я
                                </Text>
                                <Controller
                                    control={control}
                                    name="firstName"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Іван"
                                            placeholderTextColor="#94a3b8"
                                            autoCapitalize="words"
                                            autoComplete="given-name"
                                            textContentType="givenName"
                                            returnKeyType="next"
                                            // onSubmitEditing={() => lastNameRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.firstName && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.firstName.message}</Text>
                                )}
                            </View>

                            {/* Прізвище */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Прізвище
                                </Text>
                                <Controller
                                    control={control}
                                    name="lastName"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            // ref={lastNameRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Петренко"
                                            placeholderTextColor="#94a3b8"
                                            autoCapitalize="words"
                                            autoComplete="family-name"
                                            textContentType="familyName"
                                            returnKeyType="next"
                                            // onSubmitEditing={() => emailRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.lastName && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.lastName.message}</Text>
                                )}
                            </View>

                            {/* Email */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Електронна пошта
                                </Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            // ref={emailRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="example@mail.com"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoComplete="email"
                                            textContentType="emailAddress"
                                            returnKeyType="next"
                                            // onSubmitEditing={() => passwordRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                )}
                            </View>

                            {/* Пароль */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Пароль
                                </Text>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            // ref={passwordRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            returnKeyType="done"
                                            // onSubmitEditing={handleSubmit(myOnSubmit)}
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.password.message}</Text>
                                )}
                            </View>

                            {serverError && (
                                <Text className="mb-4 text-sm text-red-500">{serverError}</Text>
                            )}

                            <Pressable
                                onPress={() => handleSubmit(myOnSubmit)()}
                                disabled={isSubmitting}
                                className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Реєстрація
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => router.replace("/login")}
                                className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Вхід
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
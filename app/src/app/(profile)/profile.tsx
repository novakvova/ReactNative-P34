import {useEffect, useRef} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import {ImagePickerButton} from "@/components/form/ImagePickerButton"
import {serialize} from "object-to-formdata";
import {useAppDispatch, useAppSelector} from "@/store";
import * as SecureStore from "expo-secure-store";
import {logout} from "@/store/reducers/AuthSlice";
import {IProfileType} from "@/types/profile/IProfileType";
import {ProfileSchema} from "@/schemas/ProfileSchema";

const inputClass =
    "mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white";

const ProfileScreen = () => {

    const {user} = useAppSelector(state => state.auth);

    const defaultValue: IProfileType = {
        name: "",
        email: "",
    };

    const {
        control,
        handleSubmit,
        setValue,
        watch, //Ми зможемо слідкувати за певним полем в класі
        reset,
        formState: {errors, isSubmitting},
    } = useForm<IProfileType>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: defaultValue,
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email ?? "",
            });
        }
    }, [user, reset]);

    const image = watch("imageFile");

    const dispatch = useAppDispatch();

    const onLogout = async () => {
        await SecureStore.deleteItemAsync("token");
        dispatch(logout());
        router.replace("/login");
    }

    const onGoToMyChat = () => {
        router.replace("/mychat");
    }

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

    const url = "https://salo.itstep.click/api/Account/Register";

    const myOnSubmit = async (data: IProfileType) => {
        try {
            console.log("Register user ", data);
            const formData = serialize(data);
            const result = await axios.post(url, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                });
            console.log("Успіх status", result.status);
            console.log("Успіх data", result.data);
            router.replace("/login");
        } catch (error) {
            console.log("Помилка", error);
        }
    };

    return (
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
                                Профіль користувача
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
                                    name="name"
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
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
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
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                )}
                            </View>

                            <Pressable
                                onPress={() => handleSubmit(myOnSubmit)()}
                                disabled={isSubmitting}
                                className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Оновити профіль
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                onPress={onGoToMyChat}
                                className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-yellow-600 active:bg-yellow-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Перейти в чат
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onLogout}
                                className="h-14 w-full items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Вийти з акаунта
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
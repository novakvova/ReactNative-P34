import {File} from "expo-file-system";
import {IRegisterType} from "@/types/auth/IRegisterType";

// FormData для реєстрації.
// Глобальний fetch в Expo SDK 58 — це expo/fetch: він не приймає RN-об'єкт { uri, name, type },
// тому фото передаємо як File з expo-file-system (реалізує Blob і має bytes()).
export const toRegisterFormData = (data: IRegisterType): FormData => {
    const formData = new FormData();
    formData.append("FirstName", data.firstName);
    formData.append("LastName", data.lastName);
    formData.append("Email", data.email);
    formData.append("Password", data.password);

    if (data.imageFile) {
        formData.append("ImageFile", new File(data.imageFile.uri), data.imageFile.name);
    }

    return formData;
};

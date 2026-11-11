import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "@/api/baseQuery";
import {toRegisterFormData} from "@/api/formData";
import {ILoginType} from "@/types/auth/ILoginType";
import {IRegisterType} from "@/types/auth/IRegisterType";
import {IForgotPasswordType} from "@/types/auth/IForgotPasswordType";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";
import {IAuthResponse} from "@/types/auth/IAuthResponse";

export interface IMessageResponse {
    message: string;
}

export const api = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginType>({
            query: (body) => ({url: "Account/Login", method: "POST", body}),
        }),
        register: builder.mutation<IAuthResponse, IRegisterType>({
            query: (data) => ({
                url: "Account/Register",
                method: "POST",
                body: toRegisterFormData(data),
            }),
        }),
        forgotPassword: builder.mutation<IMessageResponse, IForgotPasswordType>({
            query: (body) => ({url: "Account/ForgotPassword", method: "POST", body}),
        }),
        resetPassword: builder.mutation<IMessageResponse, IResetPasswordType>({
            query: (body) => ({url: "Account/ResetPassword", method: "POST", body}),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = api;

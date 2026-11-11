import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import {API_BASE_URL} from "@/api/config";
import {logRequest, logResponse} from "@/api/requestLogger";

// Базовий запит для RTK Query. Токен додаємо, якщо користувач увійшов.
// Тип стану описано структурно, щоб не імпортувати RootState зі store (уникаємо циклу).
const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/`,
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as { auth: { user?: { token?: string } } }).auth.user?.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

// Обгортка, що логує кожен запит, статус і помилку
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;
    const method = (typeof args === "string" ? "GET" : args.method ?? "GET").toUpperCase();
    const startedAt = Date.now();

    logRequest(method, url, typeof args === "string" ? undefined : args.body);
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
        const {error} = result;
        // Для FETCH_ERROR / PARSING_ERROR / TIMEOUT_ERROR status — рядок, текст у полі error
        const details = "data" in error && error.data !== undefined ? error.data : ("error" in error ? error.error : undefined);
        logResponse(method, url, error.status, startedAt, details);
    } else {
        logResponse(method, url, result.meta?.response?.status, startedAt, result.data);
    }

    return result;
};

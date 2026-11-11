// Логування HTTP-запитів RTK Query у консоль (лише в режимі розробки).
// Тіла запитів і відповідей логуються, але секрети (паролі, токени, коди) маскуються.

const enabled = __DEV__;

// Поля, значення яких не показуємо в консолі
const SENSITIVE_KEY = /password|token|code|secret/i;
const MASK = "***";

type Loggable = string | number | boolean | null | undefined | Loggable[] | { [key: string]: Loggable };

// Частина FormData в React Native: рядок або файл
interface IFormDataPart {
    fieldName: string;
    string?: string;
    uri?: string;
    name?: string;
    type?: string;
}

// Перетворює FormData на звичайний об'єкт (RN: getParts, web: entries)
const formDataToObject = (formData: FormData): Record<string, Loggable> => {
    const result: Record<string, Loggable> = {};
    const withParts = formData as FormData & { getParts?: () => IFormDataPart[] };

    if (typeof withParts.getParts === "function") {
        for (const part of withParts.getParts()) {
            result[part.fieldName] = part.string !== undefined
                ? part.string
                : {uri: part.uri, name: part.name, type: part.type};
        }
        return result;
    }

    formData.forEach((value, key) => {
        result[key] = typeof value === "string" ? value : "[File]";
    });
    return result;
};

// Робить копію даних для логу з замаскованими секретами
const sanitize = (data: unknown, key?: string): Loggable => {
    if (key && SENSITIVE_KEY.test(key) && data !== undefined && data !== null && data !== "") {
        return MASK;
    }
    if (data instanceof FormData) {
        return sanitize(formDataToObject(data));
    }
    if (Array.isArray(data)) {
        return data.map((item) => sanitize(item));
    }
    if (typeof data === "object" && data !== null) {
        const result: Record<string, Loggable> = {};
        for (const [k, v] of Object.entries(data)) {
            result[k] = sanitize(v, k);
        }
        return result;
    }
    if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
        return data;
    }
    return data === null ? null : undefined;
};

// Витягує текст помилки з відповіді сервера: { error } або ProblemDetails { title }
const extractMessage = (data: unknown): string | undefined => {
    if (typeof data === "string") return data || undefined;
    if (typeof data !== "object" || data === null) return undefined;
    if ("error" in data && typeof data.error === "string") return data.error;
    if ("title" in data && typeof data.title === "string") return data.title;
    return undefined;
};

export const logRequest = (method: string, url: string, body?: unknown) => {
    if (!enabled) return;
    if (body === undefined) {
        console.log(`[HTTP] → ${method} ${url}`);
    } else {
        console.log(`[HTTP] → ${method} ${url}\n  надіслано:`, sanitize(body));
    }
};

export const logResponse = (
    method: string,
    url: string,
    status: number | string | undefined,
    startedAt: number,
    data?: unknown,
) => {
    if (!enabled) return;
    const time = `${Date.now() - startedAt}ms`;
    const ok = typeof status === "number" && status < 400;
    const payload = data === undefined ? [] : ["\n  отримано:", sanitize(data)];

    if (ok) {
        console.log(`[HTTP] ← ${status} ${method} ${url} (${time})`, ...payload);
        return;
    }
    const message = extractMessage(data);
    console.warn(
        `[HTTP] ✗ ${status ?? "NO_STATUS"} ${method} ${url} (${time})${message ? ` — ${message}` : ""}`,
        ...payload,
    );
};

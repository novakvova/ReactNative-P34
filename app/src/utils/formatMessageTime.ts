// Час повідомлення у локальній зоні: "дд.мм ГГ:хх".
// Якщо сервер віддав порожню дату (0001-01-01), повертаємо "--:--".
export const formatMessageTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return "--:--";

    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

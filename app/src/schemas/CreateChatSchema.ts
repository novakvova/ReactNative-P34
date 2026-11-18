import { z } from "zod"

export const CreateChatSchema = z.object({
    name:
        z.string()
            .trim()
            .min(1, "Вкажіть назву чату")
            .max(200, "Назва має бути не більше 200 символів"),
    chatTypeId:
        z.number({ error: "Оберіть тип чату" })
            .min(1, "Оберіть тип чату"),
    userIds:
        z.array(z.number())
            .min(1, "Оберіть хоча б одного користувача"),
});

export type CreateChatForm = z.infer<typeof CreateChatSchema>;

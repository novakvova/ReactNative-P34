import {api} from "@/api/apiSlice";
import {IChatType} from "@/types/chat/IChatType";
import {IChatCreate} from "@/types/chat/IChatCreate";
import {IChatEdit} from "@/types/chat/IChatEdit";
import {IChatListItem} from "@/types/chat/IChatListItem";
import {IMessageItem} from "@/types/chat/IMessageItem";
import {IUserSearch} from "@/types/chat/IUserSearch";
import {IUserShort} from "@/types/chat/IUserShort";
import {IInviteLink} from "@/types/chat/IInviteLink";
import {IInviteRequest} from "@/types/chat/IInviteRequest";

// Ендпоінти чату: контролер ChatsController, базовий шлях api/Chats.
// Токен додає baseQuery; помилки читаємо через getApiError.
export const chatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET api/Chats/types
        getChatTypes: builder.query<IChatType[], void>({
            query: () => "Chats/types",
            providesTags: ["ChatTypes"],
        }),

        // GET api/Chats/my
        getMyChats: builder.query<IChatListItem[], void>({
            query: () => "Chats/my",
            providesTags: ["MyChats"],
        }),

        // POST api/Chats — повертає id створеного чату
        createChat: builder.mutation<number, IChatCreate>({
            query: (body) => ({url: "Chats", method: "POST", body}),
            invalidatesTags: ["MyChats"],
        }),

        // PUT api/Chats/edit — лише адмін чату
        editChat: builder.mutation<void, IChatEdit>({
            query: (body) => ({url: "Chats/edit", method: "PUT", body}),
            invalidatesTags: ["MyChats", "ChatMessages"],
        }),

        // GET api/Chats/users?Query=&ChatId=
        searchChatUsers: builder.query<IUserShort[], IUserSearch>({
            query: (params) => ({url: "Chats/users", params}),
        }),

        // GET api/Chats/{chatId}/messages — лише учасники чату
        getChatMessages: builder.query<IMessageItem[], number>({
            query: (chatId) => `Chats/${chatId}/messages`,
            providesTags: (_result, _error, chatId) => [{type: "ChatMessages", id: chatId}],
        }),

        // GET api/Chats/am-i-admin?chatId=
        isChatAdmin: builder.query<boolean, number>({
            query: (chatId) => ({url: "Chats/am-i-admin", params: {chatId}}),
        }),

        // POST api/Chats/invite-link
        createChatInviteLink: builder.mutation<IInviteLink, IInviteRequest>({
            query: (body) => ({url: "Chats/invite-link", method: "POST", body}),
        }),
    }),
});

export const {
    useGetChatTypesQuery,
    useGetMyChatsQuery,
    useCreateChatMutation,
    useEditChatMutation,
    useSearchChatUsersQuery,
    useGetChatMessagesQuery,
    useIsChatAdminQuery,
    useCreateChatInviteLinkMutation,
} = chatApi;

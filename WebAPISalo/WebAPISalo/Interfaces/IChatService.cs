using WebAPISalo.Models.Chat;

namespace WebAPISalo.Interfaces;

public interface IChatService
{
    Task<long> CreateChatAsync(ChatCreateModel model);
    Task EditChatAsync(ChatEditModel model);
    Task<ChatMessageModel> SendMessageAsync(SendMessageModel model);
    Task<List<ChatTypeItemModel>> GetAllTypes();
    Task<List<UserShortModel>> GetAllUsersAsync(UserSearchModel model);
    Task<List<ChatListItemModel>> GetMyChatsAsync();
    Task<bool> IsUserInChat(long chatId, long userId);
    Task<List<ChatMessageModel>> GetChatMessagesAsync(long chatId);
    Task<bool> AmIAdminAsync(long chatId);
}


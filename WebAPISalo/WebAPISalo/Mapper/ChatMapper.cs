using Riok.Mapperly.Abstractions;
using WebAPISalo.Data.Chat;
using WebAPISalo.Data.Identity;
using WebAPISalo.Models.Chat;

namespace WebAPISalo.Mapper;

[Mapper]
public partial class ChatMapper
{
    // ChatCreateModel -> ChatEntity потребує контексту (UserId),
    // тому залишається ручним методом
    public ChatEntity ToChatEntity(ChatCreateModel src, long currentUserId)
    {
        var entity = new ChatEntity
        {
            ChatTypeId = src.ChatTypeId,
            Name = src.Name
        };

        entity.ChatUsers = src.UserIds
            .Append(currentUserId)
            .Distinct()
            .Select(id => new ChatUserEntity
            {
                UserId = id,
                IsAdmin = id == currentUserId
            })
            .ToList();

        return entity;
    }

    // ChatEditModel -> ChatEntity (ігноруємо ChatUsers, маппимо тільки non-null поля)
    [MapperIgnoreTarget(nameof(ChatEntity.ChatUsers))]
    public partial void UpdateChatEntity(ChatEditModel src, [MappingTarget] ChatEntity dest);

    // Прості маппінги
    public partial ChatTypeItemModel ToChatTypeItemModel(ChatTypeEntity src);

    [MapPropertyFromSource(nameof(UserShortModel.Name), Use = nameof(MapFullName))]
    public partial UserShortModel ToUserShortModel(UserEntity src);

    [MapProperty(nameof(ChatEntity.Id), nameof(ChatListItemModel.ChatId))]
    public partial ChatListItemModel ToChatListItemModel(ChatEntity src);

    [MapPropertyFromSource(nameof(ChatMessageModel.UserName), Use = nameof(MapUserName))]
    public partial ChatMessageModel ToChatMessageModel(ChatMessageEntity src);

    // Кастомні маппінги для обчислюваних полів
    private string MapUserName(ChatMessageEntity src) =>
        src.User.FirstName + " " + src.User.LastName;

    private string MapUserImage(ChatMessageEntity src) =>
        src.User.Image;

    private string MapFullName(UserEntity src) =>
        src.FirstName + " " + src.LastName;
}

using Microsoft.AspNetCore.Identity;
using WebAPISalo.Data.Chat;

namespace WebAPISalo.Data.Identity;

public class UserEntity : IdentityUser<long>
{
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public string? FirstName { get; set; } = null;
    public string? LastName { get; set; } = null;
    public string? Image { get; set; } = null;

    public ICollection<UserRoleEntity> UserRoles { get; set; }
    public ICollection<ChatUserEntity> ChatUsers { get; set; } = new List<ChatUserEntity>();
    public ICollection<ChatMessageEntity> Messages { get; set; } = new List<ChatMessageEntity>();
    public ICollection<ChatMessageReadEntity> MessageReads { get; set; } = new List<ChatMessageReadEntity>();
}

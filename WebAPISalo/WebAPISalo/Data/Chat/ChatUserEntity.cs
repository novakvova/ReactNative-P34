using System.ComponentModel.DataAnnotations.Schema;
using WebAPISalo.Data.Identity;

namespace WebAPISalo.Data.Chat;

[Table("tblChatUsers")]
public class ChatUserEntity
{
    [ForeignKey(nameof(Chat))]
    public long ChatId { get; set; }
    public ChatEntity Chat { get; set; } = null!;

    [ForeignKey(nameof(User))]
    public long UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public bool IsAdmin { get; set; } = false;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

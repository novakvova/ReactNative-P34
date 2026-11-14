using System.ComponentModel.DataAnnotations.Schema;
using WebAPISalo.Data.Identity;

namespace WebAPISalo.Data.Chat;

[Table("tblChatMessageReads")]
public class ChatMessageReadEntity
{
    [ForeignKey(nameof(Message))]
    public long MessageId { get; set; }
    public ChatMessageEntity Message { get; set; } = null!;

    [ForeignKey(nameof(User))]
    public long UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    public DateTime ReadAt { get; set; } = DateTime.UtcNow;
}

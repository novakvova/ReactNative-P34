using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebAPISalo.Data.Identity;

namespace WebAPISalo.Data.Chat;

[Table("tblChatMessages")]
public class ChatMessageEntity : BaseEntity<long>
{
    [Required, StringLength(1000)]
    public string Message { get; set; } = null!;

    //Хто відправив повідомлення
    [ForeignKey(nameof(User))]
    public long UserId { get; set; }
    public UserEntity User { get; set; } = null!;

    //Чат у який надіслано повідомлення
    [ForeignKey(nameof(Chat))]
    public long ChatId { get; set; }
    public ChatEntity Chat { get; set; } = null!;

    [StringLength(255)]
    public string? FileUrl { get; set; }

    [ForeignKey(nameof(ReplyToMessage))]
    //Якщо ми відповідаємо на певне повідомлення
    public long? ReplyToMessageId { get; set; }
    public ChatMessageEntity ? ReplyToMessage { get; set; }

    //Чи редаговано повідомлення
    public bool IsEdited { get; set; } = false;
    public ICollection<ChatMessageReadEntity> MessageReads { get; set; } = new List<ChatMessageReadEntity>();
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPISalo.Data.Chat;

[Table("tblChats")]
public class ChatEntity : BaseEntity<long>
{
    [Required, StringLength(200)]
    public string Name { get; set; } = null!;

    [ForeignKey(nameof(ChatType))]
    public long ChatTypeId { get; set; }
    public ChatTypeEntity ChatType { get; set; }
    public ICollection<ChatUserEntity> ChatUsers { get; set; } = new List<ChatUserEntity>();
    public ICollection<ChatMessageEntity> Messages { get; set; } = new List<ChatMessageEntity>();
}

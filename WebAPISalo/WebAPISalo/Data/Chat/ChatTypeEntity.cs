using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPISalo.Data.Chat;

[Table("tblChatTypes")]
public class ChatTypeEntity : BaseEntity<long>
{
    [Required, StringLength(200)]
    public string Name { get; set; } = null!;
    public ICollection<ChatEntity> Chats { get; set; } = new List<ChatEntity>();
}

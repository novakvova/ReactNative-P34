namespace WebAPISalo.Models.Chat;

public class ChatCreateModel
{
    public string Name { get; set; } = null!;
    public long ChatTypeId { get; set; }

    public List<long> UserIds { get; set; } = [];
}

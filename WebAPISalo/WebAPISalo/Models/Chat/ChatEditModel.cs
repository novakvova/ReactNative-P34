namespace WebAPISalo.Models.Chat;

public class ChatEditModel
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;

    public List<long>? AddUserIds { get; set; }
    public List<long>? RemoveUserIds { get; set; }

}

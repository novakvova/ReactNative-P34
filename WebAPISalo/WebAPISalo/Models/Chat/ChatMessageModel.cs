namespace WebAPISalo.Models.Chat;

public class ChatMessageModel
{
    public long Id { get; set; }
    public long ChatId { get; set; }
    public long UserId { get; set; }
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string UserName { get; set; } = null!;
    public string? UserImage {  get; set; }
}

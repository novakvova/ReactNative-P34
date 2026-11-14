namespace WebAPISalo.Models.Chat;

public class SendMessageModel
{
    public long ChatId { get; set; }
    public string Message { get; set; } = string.Empty;
}

using System.Diagnostics.Eventing.Reader;

namespace WebAPISalo.Models.Chat;

public class UserSearchModel
{
    public string? Query { get; set; }
    public long? ChatId { get; set; }
}

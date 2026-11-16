using Microsoft.AspNetCore.SignalR;
using WebAPISalo.Interfaces;
using WebAPISalo.Models.Chat;

namespace WebAPISalo.Hubs;

public class MyChatHub(IChatService chatService,
    IIdentityService identityService) : Hub
{
    public async Task JoinChat(long chatId)
    {
        var userId = await identityService.GetUserIdAsync();
        var isMember = await chatService.IsUserInChat(chatId, userId);
        if (isMember == false)
            throw new HubException("Даного користувача нема в чаті");

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"chat-{chatId}"
        );
    }
    public async Task SendMessage(SendMessageModel model)
    {
        var messageDto = await chatService.SendMessageAsync(model);
        await Clients.Group($"chat-{model.ChatId}")
            .SendAsync("ReceiveMessage", messageDto);
    }

    public async Task LeaveChat(long chatId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"chat-{chatId}");
    }
}

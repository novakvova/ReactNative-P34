using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPISalo.Interfaces;
using WebAPISalo.Models.Chat;
using WebAPISalo.Services;

namespace WebAPISalo.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatsController(IChatService chatService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] ChatCreateModel model)
    {
        var chatId = await chatService.CreateChatAsync(model);
        return Ok(chatId);
    }

    [HttpPut("edit")]
    public async Task<IActionResult> EditChat([FromBody] ChatEditModel model)
    {
        await chatService.EditChatAsync(model);
        return Ok();
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetChatTypes()
    {
        var types = await chatService.GetAllTypes();
        return Ok(types);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] UserSearchModel model)
    {
        var users = await chatService.GetAllUsersAsync(model);
        return Ok(users);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyChats()
    {
        var chats = await chatService.GetMyChatsAsync();
        return Ok(chats);
    }

    [HttpGet("{chatId:long}/messages")]
    public async Task<IActionResult> GetChatMessages([FromRoute] long chatId)
    {
        var messages = await chatService.GetChatMessagesAsync(chatId);
        return Ok(messages);
    }

    [HttpGet("am-i-admin")]
    public async Task<IActionResult> AmIAdmin([FromQuery] long chatId)
    {
        var isAdmin = await chatService.AmIAdminAsync(chatId);
        return Ok(isAdmin);
    }

    [HttpPost("invite-link")]
    public IActionResult GenerateInvite([FromBody] InviteRequest request)
    {
        var tokenService = new InviteTokenService();
        var token = tokenService.Generate(request.ChatId);
        var link = $"my-android://chat/invite?token={Uri.EscapeDataString(token)}";
        return Ok(new { link });
    }
}

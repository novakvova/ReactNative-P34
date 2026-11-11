using Microsoft.AspNetCore.Mvc;

namespace WebAPISalo.Models.Account;

public class RegisterModel
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    //[FromForm]
    public IFormFile? ImageFile { get; set; }
}

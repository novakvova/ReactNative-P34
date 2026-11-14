namespace WebAPISalo.Interfaces;

public interface IIdentityService
{
    Task<long> GetUserIdAsync();
}

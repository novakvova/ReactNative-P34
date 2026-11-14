using System.Security.Cryptography;
using System.Text;

namespace WebAPISalo.Services;

public class InviteTokenService
{
    private const string Secret = "SUPER_SECRET_KEY_CHANGE_ME";

    public string Generate(long chatId)
    {
        var payload = $"{chatId}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var sig = Sign(payload);

        var token = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{payload}:{sig}")
        );

        return token;
    }

    public long Validate(string token)
    {
        var raw = Encoding.UTF8.GetString(Convert.FromBase64String(token));
        var parts = raw.Split(':');

        if (parts.Length != 3)
            throw new Exception("Invalid token");

        var payload = $"{parts[0]}:{parts[1]}";
        var sig = parts[2];

        var validSig = Sign(payload);

        if (sig != validSig)
            throw new Exception("Invalid signature");

        var chatId = long.Parse(parts[0]);

        return chatId;
    }

    private string Sign(string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(Secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }
}


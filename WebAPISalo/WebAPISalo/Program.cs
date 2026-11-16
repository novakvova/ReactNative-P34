using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SkiaSharp;
using System.Text;
using WebAPISalo.Constants;
using WebAPISalo.Data;
using WebAPISalo.Data.Chat;
using WebAPISalo.Data.Identity;
using WebAPISalo.Hubs;
using WebAPISalo.Interfaces;
using WebAPISalo.Mapper;
using WebAPISalo.Models.Account;
using WebAPISalo.Models.Settings;
using WebAPISalo.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

string conStr = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MyDbContext>(opt =>
    opt.UseNpgsql(conStr));

builder.Services.AddIdentity<UserEntity, RoleEntity>(opt =>
{
    opt.Password.RequiredLength = 6;
    opt.Password.RequireDigit = false;
    opt.Password.RequireLowercase = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<MyDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<ChatMapper>();
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<IChatService, ChatService>();


builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true);
    });
});


builder.Services.AddControllers();

builder.Services.AddSignalR();

var assemblyName = typeof(LoginModel).Assembly.GetName().Name;

builder.Services.AddSwaggerGen(opt =>
{
    var fileDoc = $"{assemblyName}.xml";
    var filePath = Path.Combine(AppContext.BaseDirectory, fileDoc);
    opt.IncludeXmlComments(filePath);

    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });

});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!))
    };

});

var app = builder.Build();

app.UseCors();

app.MapHub<ChatHub>("/chat");

app.MapHub<MyChatHub>("/hub/chat");

try
{
    var myImage = builder.Configuration.GetRequiredSection("ImagesDir").Get<string>() ?? "myimages";
    string path = Path.Combine(Directory.GetCurrentDirectory(), myImage);
    Directory.CreateDirectory(path); //автоматично стоврить images

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(path),
        RequestPath = $"/{myImage}"
    });
}
catch (Exception ex)
{
    Console.WriteLine("Помилка запуску" + ex.Message);
}

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await SeedIdentityAsync(app);

app.Run();

static async Task SeedIdentityAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    await db.Database.MigrateAsync();

    var roleManager = services.GetRequiredService<RoleManager<RoleEntity>>();
    var userManager = services.GetRequiredService<UserManager<UserEntity>>();

    // 1. Ролі
    if (!db.Roles.Any())
    {
        foreach (var roleName in Roles.AllRoles)
        {
            var result = await roleManager.CreateAsync(new RoleEntity { Name = roleName });
            if (!result.Succeeded)
                Console.WriteLine($"Не вдалося створити роль '{roleName}': " +
                    string.Join("; ", result.Errors.Select(e => e.Description)));

        }
    }

    // 2. Користувачі: (email, пароль, роль)
    var users = new[]
    {
        (Email: "admin@gmail.com", Password: "Admin123", Role: Roles.Admin),
        (Email: "user@gmail.com",  Password: "User123",  Role: Roles.User),
    };

    if (!db.Users.Any())
    {
        foreach (var u in users)
        {

            var user = new UserEntity
            {
                UserName = u.Email,
                Email = u.Email,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, u.Password);
            if (!createResult.Succeeded)
                Console.WriteLine($"Не вдалося створити користувача '{u.Email}': " +
                    string.Join("; ", createResult.Errors.Select(e => e.Description)));

            var roleResult = await userManager.AddToRoleAsync(user, u.Role);
            if (!roleResult.Succeeded)
                Console.WriteLine($"Не вдалося додати '{u.Email}' до ролі '{u.Role}': " +
                    string.Join("; ", roleResult.Errors.Select(e => e.Description)));
        }
    }
    if (!db.ChatTypes.Any())
    {
        var types = ChatTypes.All
            .Select(x => new ChatTypeEntity
            {
                Name = x
            }).ToList();

        db.ChatTypes.AddRange(types);
        await db.SaveChangesAsync();
    }

}

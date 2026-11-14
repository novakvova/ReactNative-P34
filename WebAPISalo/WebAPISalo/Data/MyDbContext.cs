using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebAPISalo.Data.Chat;
using WebAPISalo.Data.Identity;

namespace WebAPISalo.Data;

public class MyDbContext : IdentityDbContext<
        UserEntity,
        RoleEntity,
        long,
        IdentityUserClaim<long>,
        UserRoleEntity,
        IdentityUserLogin<long>,
        IdentityRoleClaim<long>,
        IdentityUserToken<long>
    >
{
    public MyDbContext(DbContextOptions<MyDbContext> options)
        :base(options) { }

    public DbSet<ChatTypeEntity> ChatTypes { get; set; }
    public DbSet<ChatEntity> Chats { get; set; }
    public DbSet<ChatUserEntity> ChatUsers { get; set; }
    public DbSet<ChatMessageEntity> ChatMessages { get; set; }
    public DbSet<ChatMessageReadEntity> ChatMessageReads { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserRoleEntity>(ur =>
        {
            ur.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(r => r.RoleId)
                .IsRequired();

            ur.HasOne(ur => ur.User)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(u => u.UserId)
                .IsRequired();
        });

        modelBuilder.Entity<ChatUserEntity>(cu =>
        {
            cu.HasKey(u => new { u.ChatId, u.UserId });
        });

        modelBuilder.Entity<ChatMessageReadEntity>(cmr =>
        {
            cmr.HasKey(x => new { x.MessageId, x.UserId });
        });
    }
}

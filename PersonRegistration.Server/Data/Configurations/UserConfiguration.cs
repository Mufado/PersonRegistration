using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> user)
    {
        user.Property(u => u.Username).IsRequired().HasMaxLength(100);
        user.Property(u => u.PasswordHash).IsRequired();

        // Do not work for in memory database, but it's important for real databases
        user.HasIndex(u => u.Username).IsUnique();
    }
}

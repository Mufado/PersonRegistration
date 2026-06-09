using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Data.Configurations;

public class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> person)
    {
        person.Property(p => p.Name).IsRequired().HasMaxLength(200);
        person.Property(p => p.Cpf).IsRequired().HasMaxLength(11);
        person.Property(p => p.Email).HasMaxLength(256);
        person.Property(p => p.Gender).HasMaxLength(20);
        person.Property(p => p.BirthPlace).HasMaxLength(100);
        person.Property(p => p.Nationality).HasMaxLength(100);
        person.Property(p => p.Address).HasMaxLength(300);

        // Do not work for in memory database, but it's important for real databases
        person.HasIndex(p => p.Cpf).IsUnique();
    }
}

using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.People.Any())
            return;

        var now = DateTime.UtcNow;

        context.People.AddRange(
            new Person
            {
                Name = "Ana Souza",
                Cpf = "11144477735",
                BirthDate = new DateOnly(1990, 5, 12),
                Gender = "Feminino",
                Email = "ana@exemplo.com",
                BirthPlace = "Fortaleza",
                Nationality = "Brasileira",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Person
            {
                Name = "Bruno Lima",
                Cpf = "52998224725",
                BirthDate = new DateOnly(1985, 11, 3),
                Email = "bruno@exemplo.com",
                Nationality = "Brasileira",
                CreatedAt = now,
                UpdatedAt = now
            }
        );

        context.SaveChanges();
    }
}
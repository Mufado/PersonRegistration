using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Dtos.V1;

public record PersonResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Cpf { get; init; } = string.Empty;
    public DateOnly BirthDate { get; init; }
    public string? Email { get; init; }
    public string? BirthPlace { get; init; }
    public string? Nationality { get; init; }
    public BirthSex? BirthSex { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

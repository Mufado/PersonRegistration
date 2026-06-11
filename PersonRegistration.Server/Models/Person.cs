namespace PersonRegistration.Server.Models;

public class Person
{
    public int Id { get; set; }

    public required string Name { get; set; }
    public required string Cpf { get; set; }
    public required DateOnly BirthDate { get; set; }

    public string? Email { get; set; }
    public string? BirthPlace { get; set; }
    public string? Nationality { get; set; }
    public string? Address { get; set; }
    public BirthSex? BirthSex { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
namespace PersonRegistration.Server.Dtos.V2;

public class PersonRequest
{
    public string Name { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Email { get; set; }
    public string? BirthPlace { get; set; }
    public string? Nationality { get; set; }
}
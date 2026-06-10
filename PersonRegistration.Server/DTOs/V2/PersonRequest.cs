namespace PersonRegistration.Server.Dtos.V2;

public class PersonRequest
{
    // Required properties are not using the `required` modifier so the request
    // can be model bound from JSON without the client having to specify all properties.
    // The validation of required properties is handled separately using FluentValidation.
    //
    // BirthDate is nullable to allow clients to omit it from the request,
    // but it is validated as required also using FluentValidation.

    public string Name { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public string? Gender { get; set; }
    public string? Email { get; set; }
    public string? BirthPlace { get; set; }
    public string? Nationality { get; set; }
}
using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Dtos.V1;

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
    public string? Email { get; set; }
    public string? BirthPlace { get; set; }
    public string? Nationality { get; set; }
    public DateOnly? BirthDate { get; set; }
    public BirthSex? BirthSex { get; set; }
}

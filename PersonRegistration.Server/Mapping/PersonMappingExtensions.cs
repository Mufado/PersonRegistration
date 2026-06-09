using PersonRegistration.Server.Models;
using V1 = PersonRegistration.Server.Dtos.V1;
using V2 = PersonRegistration.Server.Dtos.V2;

namespace PersonRegistration.Server.Mapping;

public static class PersonMappingExtensions
{
    public static Person ToEntity(this V1.PersonRequest request) => new()
    {
        Name = request.Name,
        Cpf = request.Cpf,
        BirthDate = request.BirthDate!.Value,
        Gender = request.Gender,
        Email = request.Email,
        BirthPlace = request.BirthPlace,
        Nationality = request.Nationality
    };

    public static Person ToEntity(this V2.PersonRequest request) => new()
    {
        Name = request.Name,
        Cpf = request.Cpf,
        BirthDate = request.BirthDate!.Value,
        Gender = request.Gender,
        Email = request.Email,
        BirthPlace = request.BirthPlace,
        Nationality = request.Nationality,
        Address = request.Address
    };

    public static V1.PersonResponse ToV1Response(this Person person) => new()
    {
        Id = person.Id,
        Name = person.Name,
        Cpf = person.Cpf,
        BirthDate = person.BirthDate,
        Gender = person.Gender,
        Email = person.Email,
        BirthPlace = person.BirthPlace,
        Nationality = person.Nationality,
        CreatedAt = person.CreatedAt,
        UpdatedAt = person.UpdatedAt
    };

    public static V2.PersonResponse ToV2Response(this Person person) => new()
    {
        Id = person.Id,
        Name = person.Name,
        Cpf = person.Cpf,
        BirthDate = person.BirthDate,
        Gender = person.Gender,
        Email = person.Email,
        BirthPlace = person.BirthPlace,
        Nationality = person.Nationality,
        Address = person.Address,
        CreatedAt = person.CreatedAt,
        UpdatedAt = person.UpdatedAt
    };
}
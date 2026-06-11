using System.Text.Json.Serialization;

namespace PersonRegistration.Server.Models;

public enum BirthSex
{
    [JsonStringEnumMemberName("Masculino")]
    Male,

    [JsonStringEnumMemberName("Feminino")]
    Female,

    [JsonStringEnumMemberName("Prefiro não responder")]
    PreferNotToSay
}

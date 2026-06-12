using FluentValidation.TestHelper;
using PersonRegistration.Server.Dtos.V2;
using PersonRegistration.Server.Validators.V2;

namespace PersonRegistration.Tests.Validators.V2;

public class PersonRequestValidatorTests
{
    private readonly PersonRequestValidator _validator = new();

    private static PersonRequest ValidRequest() => new()
    {
        Name = "Ana Souza",
        Cpf = "11144477735",
        BirthDate = new DateOnly(1990, 5, 12),
        Email = "ana@example.com",
        Address = "Rua das Acácias, 240 - Boa Viagem, Recife - PE, 51020-000",
    };

    [Fact]
    public void ValidRequest_PassesValidation()
    {
        var result = _validator.TestValidate(ValidRequest());
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ----- Name -----

    [Fact]
    public void Name_WhenEmpty_HasError()
    {
        var request = ValidRequest();
        request.Name = "";
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Name_WhenLongerThan200_HasError()
    {
        var request = ValidRequest();
        request.Name = new string('a', 201);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Name);
    }

    // ----- Cpf -----

    [Fact]
    public void Cpf_WhenEmpty_HasError()
    {
        var request = ValidRequest();
        request.Cpf = "";
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Cpf);
    }

    [Fact]
    public void Cpf_WhenInvalid_HasError()
    {
        var request = ValidRequest();
        request.Cpf = "12345678900";
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Cpf);
    }

    // ----- BirthDate -----

    [Fact]
    public void BirthDate_WhenNull_HasError()
    {
        var request = ValidRequest();
        request.BirthDate = null;
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.BirthDate);
    }

    [Fact]
    public void BirthDate_WhenInFuture_HasError()
    {
        var request = ValidRequest();
        request.BirthDate = DateOnly.FromDateTime(DateTime.Today).AddDays(1);
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.BirthDate);
    }

    [Fact]
    public void BirthDate_WhenToday_HasNoError()
    {
        var request = ValidRequest();
        request.BirthDate = DateOnly.FromDateTime(DateTime.Today);
        _validator.TestValidate(request).ShouldNotHaveValidationErrorFor(x => x.BirthDate);
    }

    // ----- Email -----

    [Fact]
    public void Email_WhenInvalid_HasError()
    {
        var request = ValidRequest();
        request.Email = "not-an-email";
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Email_WhenEmpty_HasNoError(string? email)
    {
        var request = ValidRequest();
        request.Email = email;
        _validator.TestValidate(request).ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    // ----- Address -----

    [Fact]
    public void Address_WhenEmpty_HasError()
    {
        var request = ValidRequest();
        request.Address = "";
        _validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Address);
    }

    [Fact]
    public void Address_WhenProvided_HasNoError()
    {
        _validator.TestValidate(ValidRequest()).ShouldNotHaveValidationErrorFor(x => x.Address);
    }
}
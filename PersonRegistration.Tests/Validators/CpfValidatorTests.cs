using PersonRegistration.Server.Validators;

namespace PersonRegistration.Tests.Validators;

public class CpfValidatorTests
{
    [Theory]
    [InlineData("11144477735")]
    [InlineData("52998224725")]
    [InlineData("111.444.777-35")]
    public void IsValid_WithValidCpf_ReturnsTrue(string cpf)
    {
        Assert.True(CpfValidator.IsValid(cpf));
    }

    [Theory]
    [InlineData("11144477705")]      // wrong first check digit
    [InlineData("11144477734")]      // wrong second check digit
    [InlineData("11144477736")]      // wrong second check digit
    [InlineData("12345678900")]      // check digits don't match
    public void IsValid_WithWrongCheckDigit_ReturnsFalse(string cpf)
    {
        Assert.False(CpfValidator.IsValid(cpf));
    }

    [Theory]
    [InlineData("11111111111")]
    [InlineData("00000000000")]
    [InlineData("99999999999")]
    public void IsValid_WithAllIdenticalDigits_ReturnsFalse(string cpf)
    {
        Assert.False(CpfValidator.IsValid(cpf));
    }

    [Theory]
    [InlineData("111444777")]
    [InlineData("111444777351")]
    [InlineData("123")]
    public void IsValid_WithWrongDigitCount_ReturnsFalse(string cpf)
    {
        Assert.False(CpfValidator.IsValid(cpf));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("abcdefghijk")]
    public void IsValid_WithEmptyOrNonDigitInput_ReturnsFalse(string? cpf)
    {
        Assert.False(CpfValidator.IsValid(cpf));
    }

    [Theory]
    [InlineData("111.444.777-35", "11144477735")]
    [InlineData("11144477735", "11144477735")]
    [InlineData("abc123def", "123")]
    [InlineData("  12 34  ", "1234")]
    public void Normalize_RemovesEverythingExceptDigits(string input, string expected)
    {
        Assert.Equal(expected, CpfValidator.Normalize(input));
    }

    [Fact]
    public void Normalize_WithNull_ReturnsEmptyString()
    {
        Assert.Equal(string.Empty, CpfValidator.Normalize(null));
    }
}
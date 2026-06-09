namespace PersonRegistration.Server.Validators;

public static class CpfValidator
{

    public static bool IsValid(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf))
            return false;

        var digits = new string([.. cpf.Where(char.IsDigit)]);

        if (digits.Length != 11)
            return false;

        if (digits.Distinct().Count() == 1)
            return false;

        // 1º dígito verificador: pesos 10..2 sobre os 9 primeiros dígitos
        var firstCheck = CalculateCheckDigit(digits, length: 9, startWeight: 10);

        if (firstCheck != digits[9] - '0')
            return false;

        // 2º dígito verificador: pesos 11..2 sobre os 10 primeiros dígitos
        var secondCheck = CalculateCheckDigit(digits, length: 10, startWeight: 11);

        if (secondCheck != digits[10] - '0')
            return false;

        return true;
    }

    public static string Normalize(string? cpf)
        => cpf is null ? string.Empty : new string([.. cpf.Where(char.IsDigit)]);

    private static int CalculateCheckDigit(string digits, int length, int startWeight)
    {
        var sum = 0;

        for (var i = 0; i < length; i++)
            sum += (digits[i] - '0') * (startWeight - i);

        var remainder = sum % 11;

        return remainder < 2 ? 0 : 11 - remainder;
    }
}
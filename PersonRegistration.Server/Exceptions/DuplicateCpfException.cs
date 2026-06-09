namespace PersonRegistration.Server.Exceptions;

public class DuplicateCpfException(string cpf)
    : Exception($"A person with CPF '{cpf}' already exists.")
{
}

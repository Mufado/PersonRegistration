using FluentValidation;
using PersonRegistration.Server.Dtos.V1;

namespace PersonRegistration.Server.Validators.V1;

public class PersonRequestValidator : AbstractValidator<PersonRequest>
{
    public PersonRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(200).WithMessage("O nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Cpf)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("O CPF é obrigatório.")
            .Must(CpfValidator.IsValid).WithMessage("O CPF informado é inválido.");

        RuleFor(x => x.BirthDate)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("A data de nascimento é obrigatória.")
            .Must(date => date!.Value <= DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("A data de nascimento não pode estar no futuro.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("O e-mail informado é inválido.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
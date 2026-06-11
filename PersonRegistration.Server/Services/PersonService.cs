using Microsoft.EntityFrameworkCore;
using PersonRegistration.Server.Data;
using PersonRegistration.Server.Exceptions;
using PersonRegistration.Server.Models;
using PersonRegistration.Server.Validators;

namespace PersonRegistration.Server.Services;

public class PersonService(AppDbContext context) : IPersonService
{
    private readonly AppDbContext _context = context;

    public async Task<IEnumerable<Person>> GetAllAsync(string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _context.People.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            var digits = new string([.. term.Where(char.IsDigit)]);

            query = query.Where(p =>
                p.Name.Contains(term, StringComparison.CurrentCultureIgnoreCase) ||
                (p.Email != null && p.Email.Contains(term, StringComparison.CurrentCultureIgnoreCase)) ||
                (digits.Length > 0 && p.Cpf.Contains(digits)));
        }

        return await query
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Person?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.People
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Person> CreateAsync(Person person, CancellationToken cancellationToken = default)
    {
        person.Cpf = CpfValidator.Normalize(person.Cpf);

        var cpfExists = await _context.People
            .AnyAsync(p => p.Cpf == person.Cpf, cancellationToken);

        if (cpfExists)
            throw new DuplicateCpfException(person.Cpf);

        var now = DateTime.UtcNow;

        person.CreatedAt = now;
        
        person.UpdatedAt = now;

        _context.People.Add(person);
        
        await _context.SaveChangesAsync(cancellationToken);

        return person;
    }

    public async Task<Person?> UpdateAsync(int id, Person incoming, CancellationToken cancellationToken = default)
    {
        var existing = await _context.People
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (existing is null)
            return null;

        var normalizedCpf = CpfValidator.Normalize(incoming.Cpf);

        var cpfTakenByAnother = await _context.People
            .AnyAsync(p => p.Cpf == normalizedCpf && p.Id != id, cancellationToken);

        if (cpfTakenByAnother)
            throw new DuplicateCpfException(normalizedCpf);

        existing.Name = incoming.Name;
        existing.Cpf = normalizedCpf;
        existing.BirthDate = incoming.BirthDate;
        existing.BirthSex = incoming.BirthSex;
        existing.Email = incoming.Email;
        existing.BirthPlace = incoming.BirthPlace;
        existing.Nationality = incoming.Nationality;
        existing.Address = incoming.Address;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return existing;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var existing = await _context.People
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (existing is null)
            return false;

        _context.People.Remove(existing);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
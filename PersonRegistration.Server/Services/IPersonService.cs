using PersonRegistration.Server.Models;

namespace PersonRegistration.Server.Services;

public interface IPersonService
{
    Task<IEnumerable<Person>> GetAllAsync(string? search = null, CancellationToken cancellationToken = default);
    Task<Person?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Person> CreateAsync(Person person, CancellationToken cancellationToken = default);
    Task<Person?> UpdateAsync(int id, Person incoming, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

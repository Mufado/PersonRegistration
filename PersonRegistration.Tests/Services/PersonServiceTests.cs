using Microsoft.EntityFrameworkCore;
using PersonRegistration.Server.Data;
using PersonRegistration.Server.Exceptions;
using PersonRegistration.Server.Models;
using PersonRegistration.Server.Services;

namespace PersonRegistration.Tests.Services;

public class PersonServiceTests
{
    // Each test gets its own in-memory database (unique name) for full isolation.
    // Mock was an option, but using the real DbContext with in-memory provider is
    // simpler and gives more confidence in the actual database interactions.
    private static AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static Person NewPerson(
        string name = "Maria Silva",
        string cpf = "11144477735",
        string? email = "maria@example.com") => new()
        {
            Name = name,
            Cpf = cpf,
            BirthDate = new DateOnly(1990, 5, 12),
            BirthSex = BirthSex.Female,
            Email = email,
            BirthPlace = "Fortaleza",
            Nationality = "Brasileira",
        };

    // ---------------- GetAllAsync ----------------

    [Fact]
    public async Task GetAllAsync_WhenEmpty_ReturnsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var result = await service.GetAllAsync(cancellationToken: ct);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllOrderedByName()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.AddRange(
            NewPerson(name: "Maria Silva", cpf: "11144477735"),
            NewPerson(name: "Bruno Costa", cpf: "52998224725"));

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = (await service.GetAllAsync(cancellationToken: ct)).ToList();

        Assert.Equal(2, result.Count);
        Assert.Equal("Bruno Costa", result[0].Name);
        Assert.Equal("Maria Silva", result[1].Name);
    }

    [Fact]
    public async Task GetAllAsync_SearchByName_IsCaseInsensitive()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.AddRange(
            NewPerson(name: "Maria Silva", cpf: "11144477735"),
            NewPerson(name: "Bruno Costa", cpf: "52998224725"));

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = (await service.GetAllAsync("BRUNO", ct)).ToList();

        Assert.Single(result);
        Assert.Equal("Bruno Costa", result[0].Name);
    }

    [Fact]
    public async Task GetAllAsync_SearchByEmail_Matches()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.AddRange(
            NewPerson(name: "Maria Silva", cpf: "11144477735", email: "first@example.com"),
            NewPerson(name: "Bruno Costa", cpf: "52998224725", email: "second@example.com"));

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = (await service.GetAllAsync("second@", ct)).ToList();

        Assert.Single(result);
        Assert.Equal("Bruno Costa", result[0].Name);
    }

    [Fact]
    public async Task GetAllAsync_SearchByCpf_NormalizesSearchTerm()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.AddRange(
            NewPerson(name: "Maria Silva", cpf: "11144477735"),
            NewPerson(name: "Bruno Costa", cpf: "52998224725"));
        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = (await service.GetAllAsync("111.444", ct)).ToList();

        Assert.Single(result);
        Assert.Equal("Maria Silva", result[0].Name);
    }

    [Fact]
    public async Task GetAllAsync_SearchWithNoMatch_ReturnsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.Add(NewPerson());

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = await service.GetAllAsync("zzzzzz", ct);

        Assert.Empty(result);
    }

    // ---------------- GetByIdAsync ----------------

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var seeded = NewPerson();

        context.People.Add(seeded);

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var result = await service.GetByIdAsync(seeded.Id, ct);

        Assert.NotNull(result);
        Assert.Equal(seeded.Id, result!.Id);
        Assert.Equal("Maria Silva", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ReturnsNull()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var result = await service.GetByIdAsync(999, ct);

        Assert.Null(result);
    }

    // ---------------- CreateAsync ----------------

    [Fact]
    public async Task CreateAsync_PersistsAndSetsTimestamps()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var created = await service.CreateAsync(NewPerson(), ct);

        Assert.True(created.Id > 0);
        Assert.NotEqual(default, created.CreatedAt);
        Assert.Equal(created.CreatedAt, created.UpdatedAt);

        Assert.NotNull(await service.GetByIdAsync(created.Id, ct));
    }

    [Fact]
    public async Task CreateAsync_NormalizesCpf()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var created = await service.CreateAsync(NewPerson(cpf: "111.444.777-35"), ct);

        Assert.Equal("11144477735", created.Cpf);
    }

    [Fact]
    public async Task CreateAsync_WhenCpfAlreadyExists_ThrowsDuplicateCpf()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        context.People.Add(NewPerson(cpf: "11144477735"));

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var duplicate = NewPerson(name: "Other Name", cpf: "111.444.777-35");

        await Assert.ThrowsAsync<DuplicateCpfException>(
            () => service.CreateAsync(duplicate, ct));
    }

    // ---------------- UpdateAsync ----------------

    [Fact]
    public async Task UpdateAsync_UpdatesEditableFields_PreservesCreatedAt()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var createdAt = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var original = NewPerson(name: "Maria Silva", cpf: "11144477735");
        original.CreatedAt = createdAt;
        original.UpdatedAt = createdAt;

        context.People.Add(original);

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var incoming = NewPerson(name: "Maria Souza", cpf: "111.444.777-35");
        incoming.BirthSex = BirthSex.PreferNotToSay;
        incoming.Email = "new@example.com";

        var updated = await service.UpdateAsync(original.Id, incoming, ct);

        Assert.NotNull(updated);
        Assert.Equal("Maria Souza", updated!.Name);
        Assert.Equal(BirthSex.PreferNotToSay, updated.BirthSex);
        Assert.Equal("new@example.com", updated.Email);
        Assert.Equal("11144477735", updated.Cpf);
        Assert.Equal(original.Id, updated.Id);
        Assert.Equal(createdAt, updated.CreatedAt);
        Assert.True(updated.UpdatedAt > createdAt);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ReturnsNull()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var result = await service.UpdateAsync(999, NewPerson(), ct);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_WhenCpfTakenByAnother_ThrowsDuplicateCpf()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var first = NewPerson(name: "Maria Silva", cpf: "11144477735");
        var second = NewPerson(name: "Bruno Costa", cpf: "52998224725");

        context.People.AddRange(first, second);

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var incoming = NewPerson(name: "Bruno Costa", cpf: "11144477735");

        await Assert.ThrowsAsync<DuplicateCpfException>(
            () => service.UpdateAsync(second.Id, incoming, ct));
    }

    [Fact]
    public async Task UpdateAsync_KeepingOwnCpf_DoesNotThrow()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var person = NewPerson(name: "Maria Silva", cpf: "11144477735");

        context.People.Add(person);

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var incoming = NewPerson(name: "Maria Souza", cpf: "11144477735");

        var updated = await service.UpdateAsync(person.Id, incoming, ct);

        Assert.NotNull(updated);
        Assert.Equal("Maria Souza", updated!.Name);
    }

    // ---------------- DeleteAsync ----------------

    [Fact]
    public async Task DeleteAsync_WhenExists_RemovesAndReturnsTrue()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var person = NewPerson();

        context.People.Add(person);

        await context.SaveChangesAsync(ct);

        var service = new PersonService(context);

        var deleted = await service.DeleteAsync(person.Id, ct);

        Assert.True(deleted);
        Assert.Null(await service.GetByIdAsync(person.Id, ct));
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ReturnsFalse()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var context = CreateContext();

        var service = new PersonService(context);

        var deleted = await service.DeleteAsync(999, ct);

        Assert.False(deleted);
    }
}
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using PersonRegistration.Server.Data;
using PersonRegistration.Server.Dtos.Auth;

namespace PersonRegistration.Tests.Integration;

public class PeopleApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public PeopleApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;

        // Clean slate before each test: empty People. The seeded admin user is kept.
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.People.RemoveRange(db.People.ToList());
        db.SaveChanges();
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "Senha@123" },
            TestContext.Current.CancellationToken);

        login.EnsureSuccessStatusCode();

        var body = await login.Content.ReadFromJsonAsync<LoginResponse>(
            TestContext.Current.CancellationToken);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);

        return client;
    }

    private static object ValidPerson(string cpf = "11144477735", string name = "Maria Silva") => new
    {
        name,
        cpf,
        birthDate = "1990-05-12",
        birthSex = "Feminino",
        email = "maria@example.com",
        birthPlace = "Fortaleza",
        nationality = "Brasileira",
    };

    // ---------------- Auth ----------------

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "Senha@123" }, ct);

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>(ct);

        Assert.False(string.IsNullOrWhiteSpace(body!.Token));
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "wrong" }, ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithoutToken_ReturnsUnauthorized()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/people", ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ---------------- v1 CRUD ----------------

    [Fact]
    public async Task GetAll_WhenEmpty_ReturnsEmptyArray()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/v1/people", ct);

        response.EnsureSuccessStatusCode();

        var people = await response.Content.ReadFromJsonAsync<JsonElement>(ct);

        Assert.Equal(JsonValueKind.Array, people.ValueKind);
        Assert.Equal(0, people.GetArrayLength());
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreatedAndNormalizesCpf()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/v1/people",
            ValidPerson(cpf: "111.444.777-35"), ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<JsonElement>(ct);

        Assert.True(created.GetProperty("id").GetInt32() > 0);
        Assert.Equal("11144477735", created.GetProperty("cpf").GetString());
    }

    [Fact]
    public async Task Create_WithInvalidCpf_ReturnsBadRequest()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/v1/people",
            ValidPerson(cpf: "12345678900"), ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithDuplicateCpf_ReturnsConflict()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        await client.PostAsJsonAsync("/api/v1/people", ValidPerson(cpf: "11144477735"), ct);

        var second = await client.PostAsJsonAsync("/api/v1/people",
            ValidPerson(cpf: "111.444.777-35", name: "Other"), ct);

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task GetById_WhenExists_ReturnsPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var created = await client.PostAsJsonAsync("/api/v1/people", ValidPerson(), ct);

        var id = (await created.Content.ReadFromJsonAsync<JsonElement>(ct))
            .GetProperty("id").GetInt32();

        var response = await client.GetAsync($"/api/v1/people/{id}", ct);

        response.EnsureSuccessStatusCode();

        var person = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
        Assert.Equal(id, person.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task GetById_WhenNotFound_ReturnsNotFound()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/v1/people/999", ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_WhenExists_ReturnsUpdated()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var created = await client.PostAsJsonAsync("/api/v1/people", ValidPerson(), ct);
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>(ct))
            .GetProperty("id").GetInt32();

        var response = await client.PutAsJsonAsync($"/api/v1/people/{id}",
            ValidPerson(name: "Maria Souza"), ct);

        response.EnsureSuccessStatusCode();

        var updated = await response.Content.ReadFromJsonAsync<JsonElement>(ct);

        Assert.Equal("Maria Souza", updated.GetProperty("name").GetString());
    }

    [Fact]
    public async Task Update_WhenNotFound_ReturnsNotFound()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/v1/people/999", ValidPerson(), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WhenExists_ReturnsNoContent()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var created = await client.PostAsJsonAsync("/api/v1/people", ValidPerson(), ct);

        var id = (await created.Content.ReadFromJsonAsync<JsonElement>(ct))
            .GetProperty("id").GetInt32();

        var response = await client.DeleteAsync($"/api/v1/people/{id}", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var after = await client.GetAsync($"/api/v1/people/{id}", ct);

        Assert.Equal(HttpStatusCode.NotFound, after.StatusCode);
    }

    [Fact]
    public async Task Delete_WhenNotFound_ReturnsNotFound()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync("/api/v1/people/999", ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------------- v2 CRUD ----------------

    [Fact]
    public async Task V2_Create_WithoutAddress_ReturnsBadRequest()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/v2/people", ValidPerson(), ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task V2_Create_WithAddress_ReturnsCreatedWithAddress()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = await CreateAuthenticatedClientAsync();

        var payload = new
        {
            name = "Maria Silva",
            cpf = "11144477735",
            birthDate = "1990-05-12",
            email = "maria@example.com",
            address = "Rua das Acácias, 240 - Recife/PE",
        };

        var response = await client.PostAsJsonAsync("/api/v2/people", payload, ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<JsonElement>(ct);

        Assert.Equal("Rua das Acácias, 240 - Recife/PE",
            created.GetProperty("address").GetString());
    }
}
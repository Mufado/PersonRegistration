using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PersonRegistration.Server.Data;

namespace PersonRegistration.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    // Unique store name per factory brings isolation from the dev DB and from other test classes.
    // Necessary because each test class gets its own factory instance,
    // so this avoid interference between them.
    private readonly string _databaseName = $"IntegrationTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Supply JWT settings directly so tests don't depend on appsettings.json being found.
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "integration-tests-signing-key-with-at-least-32-bytes",
                ["Jwt:Issuer"] = "PersonRegistrationApi",
                ["Jwt:Audience"] = "PersonRegistrationClient",
            });
        });

        builder.ConfigureTestServices(services =>
        {
            // Swap the app's in-memory database for one isolated to this factory.
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor is not null)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
        });
    }
}
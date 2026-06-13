using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PersonRegistration.Server.Swagger;

// Since .NET 9, ASP.NET Core has had native support for OpenAPI, and
// Swacshbuckle (the package that automatically generates Swagger documentation)
// is no longer included by default.
//
// Because the .NET version used in this application is 10, I had to configure
// Swagger manually in the project.

public class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider = provider;

    public void Configure(SwaggerGenOptions options)
    {
        // Register a Swagger document for each discovered API version
        foreach (var description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(
                description.GroupName,
                new OpenApiInfo
                {
                    Title = "Person Registration API",
                    Version = description.ApiVersion.ToString()
                });
        }

        const string schemeId = "Bearer";

        options.AddSecurityDefinition(schemeId, new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "Insert JWT.",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

        options.AddSecurityRequirement(document =>
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(schemeId, document)] = []
            });
    }
}

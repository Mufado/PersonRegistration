using Asp.Versioning;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using PersonRegistration.Server.Data;
using PersonRegistration.Server.ExceptionHandling;
using PersonRegistration.Server.Filters;
using PersonRegistration.Server.Services;
using PersonRegistration.Server.Swagger;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationActionFilter>();
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("PersonRegistrationDb"));

builder.Services.AddScoped<IPersonService, PersonService>();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
})
.AddMvc()
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddSwaggerGen();

builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();

var app = builder.Build();

app.UseExceptionHandler();

app.UseDefaultFiles();

app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        foreach (var description in app.DescribeApiVersions())
        {
            options.SwaggerEndpoint(
                $"/swagger/{description.GroupName}/swagger.json",
                description.GroupName.ToUpperInvariant());
        }
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

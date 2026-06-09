using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PersonRegistration.Server.Exceptions;

namespace PersonRegistration.Server.ExceptionHandling;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            DuplicateCpfException => (StatusCodes.Status409Conflict, "Conflito de dados"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno do servidor")
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Erro não tratado na requisição.");

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status == StatusCodes.Status500InternalServerError
                ? "Ocorreu um erro inesperado."
                : exception.Message
        };

        httpContext.Response.StatusCode = status;

        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}

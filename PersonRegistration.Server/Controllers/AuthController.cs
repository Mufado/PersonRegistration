using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonRegistration.Server.Data;
using PersonRegistration.Server.Dtos.Auth;
using PersonRegistration.Server.Models;
using PersonRegistration.Server.Services;

namespace PersonRegistration.Server.Controllers;

[ApiController]
[ApiVersionNeutral]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(
    AppDbContext context,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService) : ControllerBase
{
    private readonly AppDbContext _context = context;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;
    private readonly ITokenService _tokenService = tokenService;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);

        if (user is null ||
            _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ProblemDetails { Title = "Credenciais inválidas." });
        }

        return Ok(new LoginResponse { Token = _tokenService.CreateToken(user) });
    }
}

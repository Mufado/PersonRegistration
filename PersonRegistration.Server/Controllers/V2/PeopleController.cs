using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonRegistration.Server.Dtos.V2;
using PersonRegistration.Server.Mapping;
using PersonRegistration.Server.Services;

namespace PersonRegistration.Server.Controllers.V2;

[ApiController]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/people")]
[Produces("application/json")]
[Authorize]
public class PeopleController(IPersonService personService) : ControllerBase
{
    private readonly IPersonService _personService = personService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonResponse>>> GetAll(
    [FromQuery] string? search,
    CancellationToken cancellationToken)
    {
        var people = await _personService.GetAllAsync(search, cancellationToken);
        return Ok(people.Select(p => p.ToV2Response()));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var person = await _personService.GetByIdAsync(id, cancellationToken);
        return person is null ? NotFound() : Ok(person.ToV2Response());
    }

    [HttpPost]
    public async Task<ActionResult<PersonResponse>> Create(
        PersonRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _personService.CreateAsync(request.ToEntity(), cancellationToken);
        return Created($"/api/v2/people/{created.Id}", created.ToV2Response());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PersonResponse>> Update(
        int id,
        PersonRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _personService.UpdateAsync(id, request.ToEntity(), cancellationToken);
        return updated is null ? NotFound() : Ok(updated.ToV2Response());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _personService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
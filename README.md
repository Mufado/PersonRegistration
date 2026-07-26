# Person Registration

REST API in **.NET 10** + SPA in **React**, with API versioning, JWT authentication, automated testing, Swagger documentation, and cloud deployment.

---

## Access

| | |
|---|---|
| 🔗 **Application** | https://personregistration-dthtd7b8g4dpfjf7.westus2-01.azurewebsites.net/ |
| 📖 **Swagger** | https://personregistration-dthtd7b8g4dpfjf7.westus2-01.azurewebsites.net/swagger |
| 👤 **Login** | `admin` / `Senha@123` |

> The application runs on Azure's free tier, where the service hibernates after a certain period of inactivity (the first request sent when the app "wakes up" tends to take longer than the others). Since the database is in-memory, the data **resets to the seeded records** on every app restart.

---

## Running locally

**Prerequisites:** .NET 10 SDK · Node.js 20+

Open `PersonRegistration.slnx` in Visual Studio 2026 and press **F5**. The `.Server` project is the entry point and automatically starts the front-end (via the SPA proxy); the API is served at `/api`.

From the command line:

```bash
# ensure front-end dependencies once
cd personregistration.client && npm install && cd ..

# run the application (spins up API + front-end in dev mode)
dotnet run --project PersonRegistration.Server
```

---

## Stack

**Back-end:** .NET 10 · ASP.NET Core Web API · EF Core (InMemory) · FluentValidation · Asp.Versioning · JWT Bearer · Swashbuckle (Swagger)

**Front-end:** React 19 · TypeScript · Vite · Tailwind CSS v4 · react-hook-form · react-router v7 · axios

---

## Technical decisions

The choices below prioritize **clarity and fit for scope** — avoiding both a lack of structure and over-engineering.

### Back-end architecture

- **Single project, organized by folders** (`Controllers`, `Services`, `Dtos`, `Validators`, `Data`, `Models`, `Mapping`, among others) instead of Clean Architecture, in order to prioritize simplicity.
- **No repository pattern on top of EF Core.** The `DbContext` is already a Unit of Work implementation, and each `DbSet` is already a repository.
- **DTOs separated from entities and versioned**.

### Validation

- **FluentValidation** for format rules, keeping validators isolated and testable.
- **Split by nature of the rule:** validation without I/O (CPF format, email, date of birth) lives in the validators; validation that depends on the database (**CPF uniqueness**) lives in the service layer.

### API versioning (v1 / v2)

- **URL path–based versioning** (`/api/v1`, `/api/v2`).
- **A single entity** with a nullable address. The difference between versions lives in the **DTOs and controllers**, not in the domain or the database.

### In-memory database

- Implemented with EF Core's InMemory provider.

### Automated testing

- Used an **in-memory database instead of mocking** the database, prioritizing simplicity (and, in this case, making the test more faithful to the real application).

### Other back-end decisions

- **Manual DTO ↔ entity mapping** (extension methods), without AutoMapper for a small number of conversions.
- **Global exception handling** via `IExceptionHandler`.
- **JWT** generated with `JsonWebTokenHandler`, passwords hashed via `PasswordHasher`.
- **Schema configuration** isolated in `IEntityTypeConfiguration`.

### Front-end

- **axios with interceptors:** the token is automatically injected into every request, and `401` responses are handled centrally.
- **react-hook-form** for the form, with back-end validation errors (400) mapped back to the corresponding fields.
- **Address:** the form collects six fields (street, number, neighborhood, ZIP code, city, state) which are concatenated into a single string for the API and parsed back out during editing.
- **Server-side search** by name, CPF, or email, with debounce and CPF normalization.
- **State** managed with `useState` / `useContext` (authentication and API version) — no Redux, which I considered unnecessary for this scope.

### Deployment

- **Single artifact:** the React build is served by the .NET app itself, on the same domain. This **eliminates CORS** and reduces deployment to a single service.
- Hosted on **Azure App Service**, published from Visual Studio.

---

## Extras implemented

- ✅ **API documentation** with Swagger (with a v1 / v2 version selector)
- ✅ **In-memory database** (EF Core InMemory)
- ✅ **API version 2** with a required address
- ✅ **Authentication and authorization** via JWT (access restricted to pre-registered users)
- ✅ **Cloud deployment** (Azure App Service)
- ✅ **Automated testing** using xUnit v3

---

## Known limitations and next steps

- **Input formatting and validation** on the front-end for a more comfortable UX.
- **Mapping returned errors to the front-end** so they're more self-explanatory for the user.
- **Token in `localStorage`:** practical for this scope, but vulnerable to XSS.
- **JWT key in `appsettings`:** in production, it would go to environment variables / a secrets manager.

# Cadastro de Pessoas

API REST em **.NET 10** + SPA em **React**, com versionamento de API, autenticação JWT, documentação Swagger e deploy em nuvem (testes automatizados em breve).

---

## Acesso

| | |
|---|---|
| 🔗 **Aplicação** | https://ggpersonregistration.azurewebsites.net/ |
| 📖 **Swagger** | https://ggpersonregistration.azurewebsites.net/swagger |
| 👤 **Login** | `admin` / `Senha@123` |

> A aplicação roda no tier gratuito do Azure (F1). O serviço hiberna após inatividade, então a **primeira requisição pode levar alguns segundos**. Como o banco é em memória, os dados **reiniciam com os registros semeados** a cada restart do app.

---

## Rodando localmente

**Pré-requisitos:** .NET 10 SDK · Node.js 20+

Abra `PersonRegistration.sln` no Visual Studio 2026 e pressione **F5**. O projeto `.Server` é o ponto de entrada e inicia o front-end automaticamente (via SPA proxy); a API atende em `/api`.

Pela linha de comando:

```bash
# garanta as dependências do front uma vez
cd personregistration.client && npm install && cd ..

# rode a aplicação (sobe API + front em modo dev)
dotnet run --project PersonRegistration.Server
```

---

## Stack

**Back-end:** .NET 10 · ASP.NET Core Web API · EF Core (InMemory) · FluentValidation · Asp.Versioning · JWT Bearer · Swashbuckle (Swagger)
**Front-end:** React 19 · TypeScript · Vite · Tailwind CSS v4 · react-hook-form · react-router v7 · axios

---

## Decisões técnicas

As escolhas abaixo priorizam **clareza e adequação ao escopo** — evitando tanto a ausência de estrutura quanto a sobre-engenharia.

### Arquitetura do back-end

- **Projeto único, organizado por pastas** (`Controllers`, `Services`, `Dtos`, `Validators`, `Data`, `Models`, `Mapping`, entre outras) em vez de Clean Architecture, a fim de priorizar simplicidade.
- **Sem repository pattern sobre o EF Core.** O `DbContext` já é uma implementação de Unit of Work e cada `DbSet` já é um repositório; adicionar uma camada genérica por cima, num CRUD, seria redundância. Os serviços consomem o `DbContext` diretamente.
- **DTOs separados das entidades e versionados** — o que permite que v1 e v2 compartilhem uma única entidade de domínio.

### Validação

- **FluentValidation** para regras de formato, mantendo os validadores isolados e testáveis.
- **Divisão por natureza da regra:** validação sem I/O (formato de CPF, e-mail, data de nascimento) fica nos validadores; validação que depende do banco (**unicidade do CPF**) fica na camada de serviço.

### Versionamento da API (v1 / v2)

- **Versionamento por caminho na URL** (`/api/v1`, `/api/v2`).
- **Uma única entidade** com endereço anulável. A diferença entre as versões vive nos **DTOs e controllers**, não no domínio nem no banco: a v2 torna o endereço obrigatório, a v1 simplesmente o ignora.
- O front-end alterna entre v1 e v2 em tempo real.

### Banco em memória

- Implementado com o provider InMemory do EF Core.

### Outras decisões de back-end

- **Mapeamento DTO ↔ entidade manual** (métodos de extensão), sem AutoMapper para poucas conversões.
- **Tratamento global de exceções** via `IExceptionHandler`.
- **JWT** gerado com `JsonWebTokenHandler`, senhas com hash via `PasswordHasher`.
- **Configuração de schema** isolada em `IEntityTypeConfiguration`.

### Front-end

- **axios com interceptors:** o token é injetado automaticamente em toda requisição e o `401` é tratado de forma centralizada.
- **react-hook-form** no formulário, com os erros de validação do back-end (400) mapeados de volta para os campos correspondentes.
- **Endereço:** o formulário coleta seis campos (logradouro, número, bairro, CEP, cidade, UF) que são concatenados em uma única string para a API e parseados de volta na edição.
- **Busca server-side** por nome, CPF ou e-mail, com debounce e normalização do CPF.
- **Estado** gerido com `useState` / `useContext` (autenticação e versão da API) — sem Redux, considerei como desnecessário neste escopo.

### Deploy

- **Artefato único:** o build do React é servido pelo próprio app .NET, no mesmo domínio. Isso **elimina CORS** e reduz o deploy a um só serviço.
- Hospedado no **Azure App Service**, publicado a partir do Visual Studio.

---

## Extras implementados

- ✅ **Documentação da API** com Swagger (com seletor de versão v1 / v2)
- ✅ **Banco de dados em memória** (EF Core InMemory)
- ✅ **Versão 2 da API** com endereço obrigatório
- ✅ **Autenticação e autorização** via JWT (acesso restrito a usuários pré-cadastrados)
- ✅ **Deploy em nuvem** (Azure App Service)
- ⌚ **Testes automatizados** em desenvolvimento

---

## Limitações conhecidas e próximos passos

Trade-offs conscientes, adequados ao escopo de um desafio técnico:

- Finalizar **Testes automatizados** em XUnit (último extra).
- **Token no `localStorage`:** prático para o escopo, mas vulnerável a XSS.
- **Chave JWT no `appsettings`:** em produção, iria para variáveis de ambiente / secret manager.
- **Revisão de códigos gerados por IA**: verificar possíveis locais de falhas em aspectos como seguir boas práticas e erros lógicos.

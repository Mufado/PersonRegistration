import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { username, password });

      login(response.data.token);

      navigate("/");
    } catch {
      setError("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-line bg-[#0a0f10] px-3 py-2.5 font-mono text-sm text-ink "
      + "outline-none placeholder:text-faint focus:border-grn2 focus:ring-2 focus:ring-grn/15";
  
  const labelClass = "mb-2 block font-mono text-[11px] uppercase tracking-widest text-mut";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bg font-sans text-ink">
      <div className="app-bg absolute inset-0" />
      <div className="app-glow absolute inset-0" />

      <div className="relative grid h-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between border-r border-line p-13 lg:flex">
          <Logo />
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-grn2">
              // .NET 10 · REACT 19 · TAILWINDCSS 4
            </div>
            <h1 className="font-display text-[44px] font-bold leading-[1.04] tracking-tight">
              Cadastro de pessoas
              <br />
              <span className="text-grn">com precisão de API.</span>
            </h1>
            <p className="mt-5 max-w-[430px] text-base leading-relaxed text-mut">
              CRUD completo, validação de CPF e datas, duas versões da API documentadas em Swagger com autenticação JWT inclusa.
            </p>
            <div className="mt-7 max-w-[430px] rounded-lg border border-line bg-[#0a0f10] p-4">
              <div className="mb-3 flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                <span className="h-2.5 w-2.5 rounded-full bg-amb" />
                <span className="h-2.5 w-2.5 rounded-full bg-grn" />
              </div>
              <pre className="m-0 font-mono text-[12.5px] leading-loose text-mut">
                <span className="text-grn2">POST</span> /api/auth/login{"\n"}
                <span className="text-faint">← 200 OK</span>{"\n"}
                {"{ "}
                <span className="text-amb">"token"</span>:{" "}
                <span className="text-grn">"eyJhbGci…"</span>
                {" }"}
              </pre>
            </div>
          </div>
          <div className="font-mono text-xs text-faint">
            // acesso restrito a usuários pré-cadastrados
          </div>
        </div>

        <div className="grid place-items-center p-10">
          <div className="w-full max-w-[372px] rounded-lg border border-line bg-surf p-8">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-grn2">
              $ auth --login
            </div>
            <h2 className="mb-6 font-display text-2xl font-bold">Acesso</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={labelClass}>Login</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="mb-5">
                <label className={labelClass}>Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && <p className="mb-3 font-mono text-xs text-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-md bg-grn py-3 font-mono text-sm font-semibold tracking-wide text-[#06140d] transition hover:bg-grn2 disabled:opacity-60"
              >
                {loading ? "AUTENTICANDO…" : "AUTENTICAR →"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-faint">
                <span className="h-[7px] w-[7px] rounded-full bg-grn shadow-[0_0_8px_var(--color-grn)]" />
                token JWT · expira após 2 horas
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
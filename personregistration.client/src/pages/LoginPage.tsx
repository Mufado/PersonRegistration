import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="login-page">
      <h1>Acesso</h1>
      <form onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@empresa.com"
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Autenticando…" : "Autenticar →"}
        </button>
      </form>
    </div>
  );
}
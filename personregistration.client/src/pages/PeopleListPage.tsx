import { useState, useEffect } from "react";
import { useApiVersion } from "../context/ApiVersionContext";
import { useDebounce } from "../hooks/useDebounce";
import { getPeople, deletePerson } from "../api/people";
import type { Person } from "../types/person";
import { PersonCard } from "../components/PersonCard";

export function PeopleListPage() {
  const { version, setVersion } = useApiVersion();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPeople(version, debouncedSearch)
      .then((data) => { if (!cancelled) setPeople(data); })
      .catch(() => { if (!cancelled) setError("Erro ao carregar pessoas."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [version, debouncedSearch]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta pessoa?")) return;

    try {
      await deletePerson(version, id);
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao excluir.");
    }
  }

  return (
    <div className="people-page">
      <header>
        <div>
          <h1>Pessoas</h1>
          <p>GET /api/{version}/people → {people.length} registros</p>
        </div>

        <div className="version-toggle">
          <button className={version === "v1" ? "active" : ""} onClick={() => setVersion("v1")}>v1</button>
          <button className={version === "v2" ? "active" : ""} onClick={() => setVersion("v2")}>v2</button>
        </div>

        <button className="new-button" >+ Novo cadastro</button>
      </header>

      <input
        type="text"
        placeholder="buscar por nome, cpf ou e-mail…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Carregando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && people.length === 0 && <p>Nenhuma pessoa encontrada.</p>}

      <div className="people-grid">
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            onEdit={() => {}}
            onDelete={() => handleDelete(person.id)}
          />
        ))}
      </div>
    </div>
  );
}
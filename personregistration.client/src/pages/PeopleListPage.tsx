import { useState, useEffect } from "react";
import { useApiVersion } from "../context/ApiVersionContext";
import { useDebounce } from "../hooks/useDebounce";
import { getPeople, deletePerson } from "../api/people";
import type { Person } from "../types/person";
import { PersonCard } from "../components/PersonCard";
import { TopBar } from "../components/TopBar";
import { PersonForm } from "./PersonForm";

export function PeopleListPage() {
  const { version } = useApiVersion();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formPerson, setFormPerson] = useState<Person | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPeople(version, debouncedSearch)
      .then((data) => { if (!cancelled) setPeople(data); })
      .catch(() => { if (!cancelled) setError("Erro ao carregar pessoas."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [version, debouncedSearch, reloadKey]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta pessoa?")) return;

    try {
      await deletePerson(version, id);
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao excluir.");
    }
  }

  function openCreate() { setFormPerson(null); setIsFormOpen(true); }

  function openEdit(person: Person) { setFormPerson(person); setIsFormOpen(true); }

  function handleSaved() { setIsFormOpen(false); setReloadKey((k) => k + 1); }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bg font-sans text-ink">
      <div className="app-bg absolute inset-0" />
      <div className="app-glow absolute inset-0" />

      <div className="relative flex h-full flex-col">
        <TopBar />

        <div className="flex-1 overflow-y-auto px-6.5 py-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h1 className="font-display text-[28px] font-bold">Pessoas</h1>
              <div className="mt-1.5 font-mono text-[13px] text-mut">
                <span className="text-grn2">GET</span> /api/{version}/people{" "}
                <span className="text-faint">→ {people.length} registros</span>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-grn px-4.5 py-2.75 font-mono text-[13px] font-semibold text-[#06140d] transition hover:bg-grn2"
            >
              <span className="text-base">+</span> NOVO CADASTRO
            </button>
          </div>

          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-line bg-[#0a0f10] px-3.25">
            <span className="font-mono text-grn2">/</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="buscar por nome, cpf ou e-mail…"
              className="w-full bg-transparent py-2.75 font-mono text-sm text-ink outline-none placeholder:text-faint"
            />
          </div>

          {loading && <p className="font-mono text-sm text-mut">Carregando…</p>}
          {error && <p className="font-mono text-sm text-danger">{error}</p>}
          {!loading && !error && people.length === 0 && (
            <p className="font-mono text-sm text-faint">Nenhuma pessoa encontrada.</p>
          )}

          {!loading && !error && people.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {people.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  version={version}
                  onEdit={() => openEdit(person)}
                  onDelete={() => handleDelete(person.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <PersonForm person={formPerson} onClose={() => setIsFormOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}
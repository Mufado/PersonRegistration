import type { Person } from "../types/person";
import type { ApiVersion } from "../context/ApiVersionContext";

function getInitials(name: string): string {
  const parts = name.trim().split(" ");

  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");

  return `${day}/${month}/${year}`;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  return age;
}

function Row({ label, value, accent }: { label: string; value: string | null; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-[12.5px]">
      <span className="font-mono tracking-wide text-faint">{label}</span>
      <span className={`truncate text-right font-mono ${accent ? "text-grn" : "text-ink"}`}>
        {value || "null"}
      </span>
    </div>
  );
}

export function PersonCard({
  person,
  version,
  onEdit,
  onDelete,
}: {
  person: Person;
  version: ApiVersion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-surf p-4.5">
      <div className="mb-3.75 flex items-center gap-3">
        <div className="grid h-10.5 w-10.5 place-items-center rounded-[7px] border border-line bg-surf2 font-display text-[15px] font-bold text-grn">
          {getInitials(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[15.5px] font-semibold">{person.name}</div>
          <div className="font-mono text-[11px] text-faint">
            #{String(person.id).padStart(3, "0")}
            {person.birthSex && ` · ${person.birthSex.toLowerCase()}`}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-3.25">
        <Row label="cpf" value={formatCpf(person.cpf)} />
        <Row label="nasc" value={`${formatDate(person.birthDate)} (${calculateAge(person.birthDate)})`} />
        <Row label="email" value={person.email} />
        <Row label="natural" value={person.birthPlace} />
        <Row label="nacional" value={person.nationality} />
        {version === "v2" && <Row label="endereço" value={person.address} accent />}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
        <span className="font-mono text-[10.5px] text-faint">
          upd {formatDate(person.updatedAt.split("T")[0])}
        </span>
        <div className="flex gap-1.5">
          <button onClick={onEdit} title="Editar" className="grid h-7.5 w-7.5 cursor-pointer place-items-center rounded-md border border-line bg-surf2 text-mut transition hover:border-grn2 hover:text-grn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18.5 9.5a2 2 0 00-2.8-2.8L5 17.2V20z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={onDelete} title="Excluir" className="grid h-7.5 w-7.5 cursor-pointer place-items-center rounded-md border border-line bg-surf2 text-mut transition hover:border-danger hover:text-danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
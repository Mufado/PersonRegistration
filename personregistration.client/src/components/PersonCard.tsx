import type { Person } from "../types/person";

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

export function PersonCard({
  person,
  onEdit,
  onDelete,
}: {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="person-card">
      <div className="card-header">
        <div className="avatar">{getInitials(person.name)}</div>
        <div>
          <h3>{person.name}</h3>
          <span>
            #{String(person.id).padStart(3, "0")}
            {person.birthSex && ` · ${person.birthSex}`}
          </span>
        </div>
      </div>

      <dl>
        <div><dt>cpf</dt><dd>{formatCpf(person.cpf)}</dd></div>
        <div><dt>nasc</dt><dd>{formatDate(person.birthDate)} ({calculateAge(person.birthDate)})</dd></div>
        {person.email && <div><dt>email</dt><dd>{person.email}</dd></div>}
        {person.birthPlace && <div><dt>natural</dt><dd>{person.birthPlace}</dd></div>}
        {person.nationality && <div><dt>nacional</dt><dd>{person.nationality}</dd></div>}
      </dl>

      <footer>
        <span>upd {formatDate(person.updatedAt.split("T")[0])}</span>
        <div>
          <button onClick={onEdit} title="Editar">✎</button>
          <button onClick={onDelete} title="Excluir">🗑</button>
        </div>
      </footer>
    </div>
  );
}
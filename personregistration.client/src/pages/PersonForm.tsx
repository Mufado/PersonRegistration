import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useApiVersion } from "../context/ApiVersionContext";
import { createPerson, updatePerson } from "../api/people";
import type { Person, PersonRequest } from "../types/person";
import type { UseFormRegisterReturn } from "react-hook-form";

const SANITIZE = {
  letters: /[^A-Za-zÀ-ÿ\s]/g,
  uf: /[^A-Za-zÀ-ÿ]/g,
  number: /[^0-9]/g,
  cep: /[^0-9.\-]/g,
  street: /[^A-Za-zÀ-ÿ0-9\s.,\-]/g,
};

interface PersonFormValues {
  name: string; cpf: string; birthDate: string; birthSex: string; email: string;
  birthPlace: string; nationality: string;
  street: string; number: string; district: string; zipCode: string; city: string; state: string;
}

const emptyValues: PersonFormValues = {
  name: "", cpf: "", birthDate: "", birthSex: "", email: "", birthPlace: "",
  nationality: "", street: "", number: "", district: "", zipCode: "", city: "", state: "",
};

const inputClass =
  "w-full rounded-md border border-line bg-[#0a0f10] px-[13px] py-[11px] pr-9 font-mono text-sm text-ink outline-none placeholder:text-faint focus:border-grn2 focus:ring-2 focus:ring-grn/15";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="mb-3.75 flex items-center gap-2.5">
      <span className="font-mono text-[12.5px] font-semibold text-grn">{">"} {title}</span>
      {badge && (
        <span className="rounded border border-grn/40 bg-grn/12 px-2 py-0.5 font-mono text-[10px] text-grn">
          {badge}
        </span>
      )}
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({
  label, required, hint, error, valid, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string;
  valid?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.75 flex gap-1.25 whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-mut">
        {label}{required && <span className="text-grn">*</span>}
      </div>
      <div className="relative">
        {children}
        {valid && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute right-3 top-3.25 text-grn">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {error && <div className="mt-1.5 font-mono text-[10.5px] text-danger">{error}</div>}
      {!error && hint && <div className="mt-1.5 font-mono text-[10.5px] text-faint">{hint}</div>}
    </div>
  );
}


function buildAddress(v: PersonFormValues): string {
  return `${v.street}, ${v.number} - ${v.district}, ${v.city} - ${v.state}, ${v.zipCode}`;
}

function parseAddress(address: string | null): Partial<PersonFormValues> {
  if (!address) return {};

  let rest = address;

  const cut = (sep: string): string | null => {
    const idx = rest.lastIndexOf(sep);

    if (idx === -1) return null;

    const after = rest.slice(idx + sep.length);

    rest = rest.slice(0, idx);

    return after;
  };

  // The order matters, as the separators are used to split the string step by step.
  // We start from the end (zip code) and move backwards to the street.
  const zipCode = cut(", ");
  const state = cut(" - ");
  const city = cut(", ");
  const district = cut(" - ");
  const number = cut(", ");

  if (zipCode === null || state === null || city === null || district === null || number === null) {
    return { street: address };
  }

  return { street: rest, number, district, city, state, zipCode };
}

function restrict(reg: UseFormRegisterReturn, pattern: RegExp): UseFormRegisterReturn {
  return {
    ...reg,
    onChange: (e: { target: HTMLInputElement; type?: string }) => {
      e.target.value = e.target.value.replace(pattern, "");
      return reg.onChange(e);
    },
  };
}

export function PersonForm({
  person, onClose, onSaved,
}: {
  person: Person | null; onClose: () => void; onSaved: () => void;
}) {
  const { version } = useApiVersion();
  const isEditing = person !== null;

  const {
    register, handleSubmit, reset, setError, watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({ defaultValues: emptyValues, shouldUnregister: true });

  const values = watch();

  useEffect(() => {
    reset(
      person
        ? {
            ...emptyValues,
            name: person.name, cpf: person.cpf, birthDate: person.birthDate,
            birthSex: person.birthSex ?? "", email: person.email ?? "",
            birthPlace: person.birthPlace ?? "", nationality: person.nationality ?? "",
            ...parseAddress(person.address),
          }
        : emptyValues
    );
  }, [person, reset]);

  async function onSubmit(values: PersonFormValues) {
    const payload: PersonRequest = {
      name: values.name, cpf: values.cpf, birthDate: values.birthDate,
      birthSex: values.birthSex ? (values.birthSex as PersonRequest["birthSex"]) : null,
      email: values.email || null,birthPlace: values.birthPlace || null,
      nationality: values.nationality || null,
    };
    
    if (version === "v2") payload.address = buildAddress(values);

    try {
      if (person) await updatePerson(version, person.id, payload);
      else await createPerson(version, payload);
      onSaved();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const backendErrors = err.response.data?.errors as Record<string, string[]> | undefined;
        if (backendErrors) {
          for (const [field, messages] of Object.entries(backendErrors)) {
            const key = field.charAt(0).toLowerCase() + field.slice(1);
            setError(key as keyof PersonFormValues, { message: messages[0] });
          }
          return;
        }
      }
      alert("Erro ao salvar. Verifique os dados.");
    }
  }

  const addressFields = [
    { name: "street" as const,   label: "Logradouro", span: "sm:col-span-2", sanitize: SANITIZE.street },
    { name: "number" as const,   label: "Número",     span: "",              sanitize: SANITIZE.number },
    { name: "district" as const, label: "Bairro",     span: "sm:col-span-2", sanitize: SANITIZE.letters },
    { name: "zipCode" as const,  label: "CEP",        span: "",              sanitize: SANITIZE.cep },
    { name: "city" as const,     label: "Cidade",     span: "sm:col-span-2", sanitize: SANITIZE.letters },
    { name: "state" as const,    label: "UF",         span: "",              sanitize: SANITIZE.uf },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(4,6,7,0.6)] backdrop-blur-sm" onClick={onClose} />

      <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-135 flex-col border-l border-line bg-[#090d0e] shadow-[-30px_0_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between border-b border-line px-6.5 py-5">
          <div>
            <div className="mb-1.75 font-mono text-xs text-grn2">
              {isEditing ? `PUT /api/${version}/people/${person.id}` : `POST /api/${version}/people`}
            </div>
            <h2 className="font-display text-[21px] font-bold">
              {isEditing ? "Editar pessoa" : "Nova pessoa"}
            </h2>
          </div>
          <button
            type="button" onClick={onClose}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-line bg-surf2 text-mut transition hover:border-grn2 hover:text-grn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6.5 py-5">
            <SectionTitle title="dados_pessoais" />
            <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nome" required error={errors.name?.message} valid={!!values.name && !errors.name}>
                  <input className={inputClass} {...register("name", { required: "O nome é obrigatório." })} />
                </Field>
              </div>
              <Field label="CPF" required error={errors.cpf?.message} valid={!!values.cpf && !errors.cpf}>
                <input className={inputClass} {...register("cpf", { required: "O CPF é obrigatório." })} />
              </Field>
              <Field label="Nascimento" required error={errors.birthDate?.message} valid={!!values.birthDate && !errors.birthDate}>
                <input type="date" className={inputClass} {...register("birthDate", { required: "A data é obrigatória." })} />
              </Field>
              <Field label="Sexo">
                <select className={inputClass} {...register("birthSex")}>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Prefiro não responder">Prefiro não responder</option>
                </select>
              </Field>
              <Field label="E-mail" error={errors.email?.message} valid={!!values.email && !errors.email}>
                <input className={inputClass} {...register("email")} />
              </Field>
              <Field label="Naturalidade">
                <input className={inputClass} {...register("birthPlace")} />
              </Field>
              <Field label="Nacionalidade">
                <input className={inputClass} {...register("nationality")} />
              </Field>
            </div>

            {version === "v2" ? (
              <div className="rounded-lg border border-grn/40 bg-grn/5 px-4.25 py-3.75">
                <SectionTitle title="endereco" badge="required · v2" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {addressFields.map((f) => (
                    <div key={f.name} className={f.span}>
                      <Field label={f.label} required error={errors[f.name]?.message}>
                        <input className={inputClass} {...restrict(register(f.name, { required: "Obrigatório." }), f.sanitize)} />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-line px-4.25 py-3.5 text-faint">
                <span className="font-mono text-grn2">{"//"}</span>
                <span className="font-mono text-xs">
                  endereco: obrigatório apenas em <span className="text-grn">/api/v2</span>
                </span>
              </div>
            )}

            {isEditing && (
              <div className="mt-5.5 flex gap-6.5 border-t border-line pt-4.5">
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-faint">criado_em</div>
                  <div className="font-mono text-[12.5px] text-mut">{formatDateTime(person.createdAt)}</div>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-faint">atualizado_em</div>
                  <div className="font-mono text-[12.5px] text-mut">{formatDateTime(person.updatedAt)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 border-t border-line px-6.5 py-4">
            <button
              type="button" onClick={onClose}
              className="cursor-pointer rounded-md border border-line bg-surf2 px-5 py-2.75 font-mono text-[13px] text-mut transition hover:text-ink"
            >
              cancelar
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="cursor-pointer rounded-md bg-grn px-6 py-2.75 font-mono text-[13px] font-semibold text-[#06140d] transition hover:bg-grn2 disabled:opacity-60"
            >
              {isSubmitting ? "SALVANDO…" : "SALVAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
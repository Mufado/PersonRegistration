import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useApiVersion } from "../context/ApiVersionContext";
import { createPerson, updatePerson } from "../api/people";
import type { Person, PersonRequest, PersonFormValues } from "../types/person";
import { buildAddress, parseAddress, SANITIZE } from "../utils/address";
import { formatDateTime } from "../utils/format";
import { inputClass, restrict } from "../utils/formHelpers";
import { Field, SectionTitle } from "../components/Field";

const emptyValues: PersonFormValues = {
  name: "", cpf: "", birthDate: "", birthSex: "", email: "", birthPlace: "",
  nationality: "", street: "", number: "", district: "", zipCode: "", city: "", state: "",
};

const addressFields = [
  { name: "street" as const,   label: "Logradouro", span: "sm:col-span-2", sanitize: SANITIZE.street },
  { name: "number" as const,   label: "Número",     span: "",              sanitize: SANITIZE.number },
  { name: "district" as const, label: "Bairro",     span: "sm:col-span-2", sanitize: SANITIZE.letters },
  { name: "zipCode" as const,  label: "CEP",        span: "",              sanitize: SANITIZE.cep },
  { name: "city" as const,     label: "Cidade",     span: "sm:col-span-2", sanitize: SANITIZE.letters },
  { name: "state" as const,    label: "UF",         span: "",              sanitize: SANITIZE.uf },
];

export function PersonForm({ person, onClose, onSaved }: {
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

  async function onSubmit(formValues: PersonFormValues) {
    const payload: PersonRequest = {
      name: formValues.name, cpf: formValues.cpf, birthDate: formValues.birthDate,
      birthSex: formValues.birthSex ? (formValues.birthSex as PersonRequest["birthSex"]) : null,
      email: formValues.email || null, birthPlace: formValues.birthPlace || null,
      nationality: formValues.nationality || null,
    };

    if (version === "v2") payload.address = buildAddress(formValues);

    try {
      if (person) {
        await updatePerson(version, person.id, payload)
      } else {
        await createPerson(version, payload)
      };

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
          <button type="button" onClick={onClose}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-line bg-surf2 text-mut transition hover:border-grn2 hover:text-grn">
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
            <button type="button" onClick={onClose}
              className="cursor-pointer rounded-md border border-line bg-surf2 px-5 py-2.75 font-mono text-[13px] text-mut transition hover:text-ink">
              cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="cursor-pointer rounded-md bg-grn px-6 py-2.75 font-mono text-[13px] font-semibold text-[#06140d] transition hover:bg-grn2 disabled:opacity-60">
              {isSubmitting ? "SALVANDO…" : "SALVAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
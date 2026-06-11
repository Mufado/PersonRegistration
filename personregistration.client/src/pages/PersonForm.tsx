import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useApiVersion } from "../context/ApiVersionContext";
import { createPerson, updatePerson } from "../api/people";
import type { Person, PersonRequest } from "../types/person";

interface PersonFormValues {
  name: string;
  cpf: string;
  birthDate: string;
  birthSex: string;
  email: string;
  birthPlace: string;
  nationality: string;
  street: string;
  number: string;
  district: string;
  zipCode: string;
  city: string;
  state: string;
}

const emptyValues: PersonFormValues = {
  name: "", cpf: "", birthDate: "", birthSex: "", email: "", birthPlace: "",
  nationality: "", street: "", number: "", district: "", zipCode: "", city: "", state: "",
};

export function PersonForm({
  person,
  onClose,
  onSaved,
}: {
  person: Person | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { version } = useApiVersion();
  const isEditing = person !== null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    defaultValues: emptyValues,
    shouldUnregister: true,
  });

  useEffect(() => {
    reset(
      person
        ? {
            ...emptyValues,
            name: person.name,
            cpf: person.cpf,
            birthDate: person.birthDate,
            birthSex: person.birthSex ?? "",
            email: person.email ?? "",
            birthPlace: person.birthPlace ?? "",
            nationality: person.nationality ?? "",
          }
        : emptyValues
    );
  }, [person, reset]);

  async function onSubmit(values: PersonFormValues) {
    const payload: PersonRequest = {
      name: values.name,
      cpf: values.cpf,
      birthDate: values.birthDate,
      birthSex: values.birthSex ? (values.birthSex as PersonRequest["birthSex"]) : null,
      email: values.email || null,
      birthPlace: values.birthPlace || null,
      nationality: values.nationality || null,
    };

    if (version === "v2") {
      payload.address = buildAddress(values);
    }

    try {
      if (person) {
        await updatePerson(version, person.id, payload);
      } else {
        await createPerson(version, payload);
      }
      
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
    <div className="form-overlay" onClick={onClose}>
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <span>
            {isEditing ? `PUT /api/${version}/people/${person.id}` : `POST /api/${version}/people`}
          </span>
          <h2>{isEditing ? "Editar pessoa" : "Nova pessoa"}</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Nome *
            <input {...register("name", { required: "O nome é obrigatório." })} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>

          <label>CPF *
            <input {...register("cpf", { required: "O CPF é obrigatório." })} />
            {errors.cpf && <span className="field-error">{errors.cpf.message}</span>}
          </label>

          <label>Nascimento *
            <input type="date" {...register("birthDate", { required: "A data é obrigatória." })} />
            {errors.birthDate && <span className="field-error">{errors.birthDate.message}</span>}
          </label>

          <label>Sexo
            <select {...register("birthSex")}>
              <option value="">Não informar</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Prefiro não responder">Prefiro não responder</option>
            </select>
          </label>

          <label>E-mail
            <input {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>

          <label>Naturalidade
            <input {...register("birthPlace")} />
          </label>

          <label>Nacionalidade
            <input {...register("nationality")} />
          </label>

          {version === "v2" && (
            <fieldset>
              <legend>Endereço (obrigatório na v2)</legend>
              <input placeholder="Logradouro" {...register("street", { required: "Obrigatório." })} />
              {errors.street && <span className="field-error">{errors.street.message}</span>}
              <input placeholder="Número" {...register("number", { required: "Obrigatório." })} />
              <input placeholder="Bairro" {...register("district", { required: "Obrigatório." })} />
              <input placeholder="CEP" {...register("zipCode", { required: "Obrigatório." })} />
              <input placeholder="Cidade" {...register("city", { required: "Obrigatório." })} />
              <input placeholder="UF" {...register("state", { required: "Obrigatório." })} />
            </fieldset>
          )}

          <footer>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function buildAddress(v: PersonFormValues): string {
  return `${v.street}, ${v.number} - ${v.district}, ${v.city} - ${v.state}, ${v.zipCode}`;
}
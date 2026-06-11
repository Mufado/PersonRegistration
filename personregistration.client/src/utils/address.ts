import type { PersonFormValues } from "../types/person";

export const SANITIZE = {
  letters: /[^A-Za-zÀ-ÿ\s]/g,
  uf: /[^A-Za-zÀ-ÿ]/g,
  number: /[^0-9]/g,
  cep: /[^0-9.\-]/g,
  street: /[^A-Za-zÀ-ÿ0-9\s.,\-]/g,
};

export function buildAddress(v: PersonFormValues): string {
  return `${v.street}, ${v.number} - ${v.district}, ${v.city} - ${v.state}, ${v.zipCode}`;
}

export function parseAddress(address: string | null): Partial<PersonFormValues> {
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
  // Start from the end (zip code) and move backwards to the street.
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
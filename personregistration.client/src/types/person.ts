export type BirthSex = "Masculino" | "Feminino" | "Prefiro não responder";

export interface Person {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  birthSex: BirthSex | null;
  email: string | null;
  birthPlace: string | null;
  nationality: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonRequest {
  name: string;
  cpf: string;
  birthDate: string | null;
  birthSex: BirthSex | null;
  email: string | null;
  birthPlace: string | null;
  nationality: string | null;
  address?: string | null;
}
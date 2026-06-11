import { apiClient } from "./client";
import type { Person, PersonRequest } from "../types/person";
import type { ApiVersion } from "../context/ApiVersionContext";

export async function createPerson(version: ApiVersion, data: PersonRequest): Promise<Person> {
  const response = await apiClient.post(`/${version}/people`, data);
  return response.data;
}

export async function updatePerson(version: ApiVersion, id: number, data: PersonRequest): Promise<Person> {
  const response = await apiClient.put(`/${version}/people/${id}`, data);
  return response.data;
}

export async function getPeople(version: ApiVersion, search?: string): Promise<Person[]> {
  const response = await apiClient.get(`/${version}/people`, {
    params: search ? { search } : undefined,
  });

  return response.data;
}

export async function deletePerson(version: ApiVersion, id: number): Promise<void> {
  await apiClient.delete(`/${version}/people/${id}`);
}
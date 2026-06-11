import { apiClient } from "./client";
import type { Person } from "../types/person";
import type { ApiVersion } from "../context/ApiVersionContext";

export async function getPeople(version: ApiVersion, search?: string): Promise<Person[]> {
  const response = await apiClient.get(`/${version}/people`, {
    params: search ? { search } : undefined,
  });
  
  return response.data;
}

export async function deletePerson(version: ApiVersion, id: number): Promise<void> {
  await apiClient.delete(`/${version}/people/${id}`);
}
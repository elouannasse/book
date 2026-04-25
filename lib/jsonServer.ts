export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type StoredUser = User & {
  password: string;
};

export type AppUser = StoredUser;

export type FavoriteRecord = {
  id: number;
  userId: number;
  bookKey: string;
  title: string;
  author: string;
  coverId: number;
};

export type FavoriteInput = Omit<FavoriteRecord, "id">;

import { fetchJson } from "@/lib/http";

const API_BASE = process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001";

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await fetchJson<StoredUser[]>(`${API_BASE}/users?email=${encodeURIComponent(email)}`, {
    cache: "no-store"
  });
  return users[0] ?? null;
}

export async function registerUser(payload: Omit<StoredUser, "id">): Promise<StoredUser> {
  return fetchJson<StoredUser>(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function loginUser(email: string, password: string): Promise<StoredUser | null> {
  const users = await fetchJson<StoredUser[]>(
    `${API_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { cache: "no-store" }
  );
  return users[0] ?? null;
}

export async function getFavorites(userId: number): Promise<FavoriteRecord[]> {
  return fetchJson<FavoriteRecord[]>(`${API_BASE}/favorites?userId=${encodeURIComponent(String(userId))}`, {
    cache: "no-store"
  });
}

export async function addFavorite(data: FavoriteInput): Promise<FavoriteRecord> {
  return fetchJson<FavoriteRecord>(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function deleteFavorite(id: number): Promise<void> {
  await fetchJson<Record<string, never> | FavoriteRecord>(`${API_BASE}/favorites/${id}`, { method: "DELETE" });
}

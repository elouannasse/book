import type { BookSummary } from "@/lib/openLibrary";

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
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  firstPublishYear: number | null;
};

const API_BASE = process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const response = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`, { cache: "no-store" });
  const users = await parseJson<StoredUser[]>(response);
  return users[0] ?? null;
}

export async function registerUser(payload: Omit<StoredUser, "id">): Promise<StoredUser> {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseJson<StoredUser>(response);
}

export async function loginUser(email: string, password: string): Promise<StoredUser | null> {
  const response = await fetch(
    `${API_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { cache: "no-store" }
  );
  const users = await parseJson<StoredUser[]>(response);
  return users[0] ?? null;
}

export async function getFavorites(userId: number): Promise<FavoriteRecord[]> {
  const response = await fetch(`${API_BASE}/favorites?userId=${userId}`, { cache: "no-store" });
  return parseJson<FavoriteRecord[]>(response);
}

export async function addFavorite(userId: number, book: BookSummary): Promise<FavoriteRecord> {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      bookId: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      firstPublishYear: book.firstPublishYear
    })
  });

  return parseJson<FavoriteRecord>(response);
}

export async function removeFavorite(userId: number, bookId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/favorites?userId=${userId}&bookId=${encodeURIComponent(bookId)}`, {
    cache: "no-store"
  });
  const matches = await parseJson<FavoriteRecord[]>(response);

  await Promise.all(
    matches.map((item) =>
      fetch(`${API_BASE}/favorites/${item.id}`, {
        method: "DELETE"
      })
    )
  );
}

export type Book = {
  key: string;
  title: string;
  author_name: string[];
  first_publish_year: number | null;
  cover_i?: number;
  language: string[];
};

export type BookDetail = {
  key: string;
  title: string;
  authors: string[];
  description: string;
  subjects: string[];
  cover_i?: number;
  publish_date: string;
  language: string[];
};

type OpenLibrarySearchResponse = {
  docs: Book[];
  numFound: number;
};

type OpenLibraryWorkResponse = {
  key: string;
  title?: string;
  description?: string | { value?: string };
  covers?: number[];
  subjects?: string[];
  first_publish_date?: string;
  languages?: Array<{ key?: string }>;
  authors?: Array<{ author?: { key?: string } }>;
};

const OPEN_LIBRARY_BASE = "https://openlibrary.org";

export function getCoverUrl(coverId: number, size: "S" | "M" | "L"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function normalizeLanguage(value?: string): string | null {
  if (!value) return null;
  const languageCode = value.split("/").pop();
  return languageCode ?? null;
}

export async function searchBooks(query: string, genre?: string, page = 1): Promise<{ books: Book[]; total: number }> {
  const params = new URLSearchParams({
    title: query,
    page: String(page),
    limit: "10"
  });

  if (genre) {
    params.set("subject", genre);
  }

  const response = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to search books");
  }

  const data = (await response.json()) as OpenLibrarySearchResponse;
  const books = data.docs.map((doc) => ({
    key: doc.key,
    title: doc.title ?? "Unknown title",
    author_name: doc.author_name ?? [],
    first_publish_year: doc.first_publish_year ?? null,
    cover_i: doc.cover_i,
    language: doc.language ?? []
  }));

  return { books, total: data.numFound ?? 0 };
}

export async function getBookDetail(key: string): Promise<BookDetail> {
  const workId = key.replace("/works/", "");
  const response = await fetch(`${OPEN_LIBRARY_BASE}/works/${workId}.json`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load book detail");
  }

  const work = (await response.json()) as OpenLibraryWorkResponse;
  const authors = await Promise.all(
    (work.authors ?? []).map(async (entry) => {
      const authorKey = entry.author?.key;
      if (!authorKey) return null;
      try {
        const authorResponse = await fetch(`${OPEN_LIBRARY_BASE}${authorKey}.json`, { cache: "no-store" });
        if (!authorResponse.ok) return null;
        const author = (await authorResponse.json()) as { name?: string };
        return author.name ?? null;
      } catch {
        return null;
      }
    })
  );

  const description =
    typeof work.description === "string"
      ? work.description
      : work.description?.value ?? "No description available.";

  return {
    key: work.key ?? key,
    title: work.title ?? "Unknown title",
    authors: authors.filter((name): name is string => Boolean(name)),
    description,
    subjects: work.subjects ?? [],
    cover_i: work.covers?.[0],
    publish_date: work.first_publish_date ?? "Unknown",
    language: (work.languages ?? [])
      .map((item) => normalizeLanguage(item.key))
      .filter((item): item is string => Boolean(item))
  };
}

export type BookSummary = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  firstPublishYear: number | null;
};

export type BookDetail = {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  coverUrl: string | null;
};

type OpenLibrarySearchResponse = {
  docs: Array<{
    key: string;
    title?: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
  }>;
  numFound: number;
};

const OPEN_LIBRARY_BASE = "https://openlibrary.org";

function toCoverUrl(coverId?: number): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
}

export async function searchBooks(query: string, page = 1): Promise<{ books: BookSummary[]; total: number }> {
  const url = `${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&page=${page}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to search books");
  }

  const data = (await response.json()) as OpenLibrarySearchResponse;

  const books = data.docs.map((doc) => ({
    id: doc.key.split("/").pop() ?? doc.key,
    title: doc.title ?? "Unknown title",
    author: doc.author_name?.join(", ") ?? "Unknown author",
    coverUrl: toCoverUrl(doc.cover_i),
    firstPublishYear: doc.first_publish_year ?? null
  }));

  return { books, total: data.numFound ?? 0 };
}

export async function getBookDetails(id: string): Promise<BookDetail> {
  const response = await fetch(`${OPEN_LIBRARY_BASE}/works/${id}.json`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load book details");
  }

  const data = (await response.json()) as {
    title?: string;
    description?: string | { value?: string };
    covers?: number[];
    subjects?: string[];
  };

  const description =
    typeof data.description === "string"
      ? data.description
      : data.description?.value ?? "No description available.";

  return {
    id,
    title: data.title ?? "Unknown title",
    description,
    subjects: data.subjects ?? [],
    coverUrl: toCoverUrl(data.covers?.[0])
  };
}

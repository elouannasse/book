"use client";

import { useEffect, useMemo, useState } from "react";
import BookCard from "@/components/BookCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { searchBooks, type BookSummary } from "@/lib/openLibrary";

const PAGE_SIZE = 100;

export default function HomePage() {
  const [query, setQuery] = useState("javascript");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await searchBooks(query, page);
        if (cancelled) return;
        setBooks(result.books);
        setTotal(result.total);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [query, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <section>
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Find your next great read</h1>
        <p className="mt-2 text-sm text-slate-600">Search the Open Library catalog and keep your favorite books.</p>
        <div className="mt-4">
          <SearchBar
            initialValue={query}
            onSearch={(next) => {
              setQuery(next);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? <LoadingSkeleton /> : null}
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : null}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

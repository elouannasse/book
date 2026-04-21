"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBookDetails, type BookDetail } from "@/lib/openLibrary";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getBookDetails(id);
        if (cancelled) return;
        setBook(detail);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch book");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading book details...</p>;
  }

  if (error || !book) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error ?? "Book not found."}</p>
        <Link href="/" className="text-sm font-semibold text-brand-700">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 md:grid-cols-[260px_1fr]">
      <div className="overflow-hidden rounded-lg bg-slate-100">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-80 items-center justify-center text-sm text-slate-500">No cover available</div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-black text-slate-900">{book.title}</h1>
        <p className="mt-4 leading-7 text-slate-700">{book.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {book.subjects.slice(0, 12).map((subject) => (
            <span key={subject} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {subject}
            </span>
          ))}
        </div>

        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand-700">
          Back to search
        </Link>
      </div>
    </section>
  );
}

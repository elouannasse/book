"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBookDetail, getCoverUrl, type BookDetail } from "@/lib/openLibrary";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { user } = useAuth();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getBookDetail(id);
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
        {book.cover_i ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getCoverUrl(book.cover_i, "L")} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-80 items-center justify-center text-sm text-slate-500">No cover available</div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-black text-slate-900">{book.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Authors: {book.authors.length > 0 ? book.authors.join(", ") : "Unknown"}
        </p>
        <p className="mt-1 text-sm text-slate-600">Publish date: {book.publish_date}</p>
        <p className="mt-4 leading-7 text-slate-700">{book.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {book.subjects.slice(0, 12).map((subject) => (
            <span key={subject} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {subject}
            </span>
          ))}
        </div>

        {user ? (
          <button
            onClick={async () => {
              if (isFavorite(book.key)) {
                const favorite = favorites.find((item) => item.bookKey === book.key);
                if (favorite) {
                  await removeFavorite(favorite.id);
                }
                return;
              }

              await addFavorite({
                key: book.key,
                title: book.title,
                author_name: book.authors,
                first_publish_year: null,
                cover_i: book.cover_i,
                language: book.language
              });
            }}
            className="mt-6 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          >
            {isFavorite(book.key) ? "♥ Favori" : "Ajouter aux favoris"}
          </button>
        ) : null}

        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand-700">
          Back to search
        </Link>
      </div>
    </section>
  );
}

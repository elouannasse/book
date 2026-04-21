"use client";

import Link from "next/link";
import type { BookSummary } from "@/lib/openLibrary";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

type BookCardProps = {
  book: BookSummary;
};

export default function BookCard({ book }: BookCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(book.id);

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-brand-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-slate-500">No cover</div>
          )}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-slate-800">{book.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{book.author}</p>
        <p className="mt-1 text-xs text-slate-500">
          First published: {book.firstPublishYear ? book.firstPublishYear : "Unknown"}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/books/${book.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700"
        >
          Details
        </Link>
        <button
          onClick={() => {
            if (!user) return;
            void toggleFavorite(user.id, book);
          }}
          disabled={!user}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {favorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>
    </article>
  );
}

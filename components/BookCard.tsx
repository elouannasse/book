"use client";

import Link from "next/link";
import { useState } from "react";
import type { Book } from "@/lib/openLibrary";
import { getCoverUrl } from "@/lib/openLibrary";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  const { user } = useAuth();
  const { isFavorite, addFavorite } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const favorite = isFavorite(book.key);
  const displayAuthors = book.author_name.length > 0 ? book.author_name.join(", ") : "Unknown author";
  const displayLanguages = book.language.length > 0 ? book.language.join(", ") : "Unknown";
  const detailPath = `/books/${encodeURIComponent(book.key)}`;

  const handleAddFavorite = async () => {
    if (!user || favorite || isAdding) {
      return;
    }

    try {
      setIsAdding(true);
      await addFavorite(book);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-brand-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
          {book.cover_i ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getCoverUrl(book.cover_i, "M")} alt={book.title} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-slate-500">No cover available</div>
          )}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-slate-800">{book.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{displayAuthors}</p>
        <p className="mt-1 text-xs text-slate-500">
          First published: {book.first_publish_year ? book.first_publish_year : "Unknown"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Language: {displayLanguages}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={detailPath}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700"
        >
          Voir le detail
        </Link>
        {user ? (
          <button
            onClick={() => {
              void handleAddFavorite();
            }}
            disabled={favorite || isAdding}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            <span aria-hidden className={favorite ? "text-red-100" : "text-white"}>
              {favorite ? "♥" : "♡"}
            </span>
            {favorite ? "Deja favori" : isAdding ? "Ajout..." : "Ajouter aux favoris"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

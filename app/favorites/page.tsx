"use client";

import { useEffect } from "react";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { items, loading, loadFavorites } = useFavorites();

  useEffect(() => {
    if (!user) return;
    void loadFavorites(user.id);
  }, [user, loadFavorites]);

  return (
    <section>
      <h1 className="text-2xl font-black text-slate-900">Your Favorites</h1>
      <p className="mt-1 text-sm text-slate-600">Books you saved from search.</p>

      {loading ? <p className="mt-6 text-sm text-slate-600">Loading favorites...</p> : null}

      {!loading && items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-brand-100 bg-white p-6">
          <p className="text-sm text-slate-600">No favorites yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold text-brand-700">
            Discover books
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { getCoverUrl } from "@/lib/openLibrary";

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = async (favoriteId: number) => {
    const confirmed = window.confirm("Voulez-vous supprimer ce livre de vos favoris ?");
    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(favoriteId);
      await removeFavorite(favoriteId);
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading) {
    return <p className="text-sm text-slate-600">Chargement...</p>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-brand-100 bg-white p-6">
        <p className="text-sm text-slate-600">Vous devez vous connecter pour voir vos favoris.</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-brand-700">
          Aller a la connexion
        </Link>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-black text-slate-900">Mes favoris</h1>
      <p className="mt-1 text-sm text-slate-600">Tous les livres que vous avez enregistre.</p>

      {loading ? <p className="mt-6 text-sm text-slate-600">Chargement des favoris...</p> : null}

      {!loading && favorites.length === 0 ? (
        <div className="mt-6 rounded-xl border border-brand-100 bg-white p-6">
          <p className="text-sm text-slate-600">Vous n'avez aucun favori pour le moment.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold text-brand-700">
            Decouvrir des livres
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((favorite) => (
          <article
            key={favorite.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <div>
              <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
                {favorite.coverId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getCoverUrl(favorite.coverId, "M")}
                    alt={favorite.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-slate-500">No cover available</div>
                )}
              </div>
              <h2 className="line-clamp-2 text-base font-semibold text-slate-800">{favorite.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{favorite.author}</p>
            </div>

            <button
              onClick={() => {
                void handleRemove(favorite.id);
              }}
              disabled={removingId === favorite.id}
              className="mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {removingId === favorite.id ? "Suppression..." : "Supprimer"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

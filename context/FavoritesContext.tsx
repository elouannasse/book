"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Book } from "@/lib/openLibrary";
import {
  addFavorite as addFavoriteRequest,
  deleteFavorite as deleteFavoriteRequest,
  getFavorites as getFavoritesRequest,
  type FavoriteRecord
} from "@/lib/jsonServer";
import { useAuth } from "@/context/AuthContext";

type FavoritesState = {
  favorites: FavoriteRecord[];
  loading: boolean;
};

type FavoritesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FAVORITES"; payload: FavoriteRecord[] }
  | { type: "ADD_FAVORITE"; payload: FavoriteRecord }
  | { type: "REMOVE_FAVORITE"; payload: number };

export type Favorite = {
  id: number;
  userId: number;
  bookKey: string;
  title: string;
  author: string;
  coverId: number;
};

type FavoritesContextValue = {
  favorites: Favorite[];
  loading: boolean;
  addFavorite: (book: Book) => Promise<void>;
  removeFavorite: (favoriteId: number) => Promise<void>;
  isFavorite: (bookKey: string) => boolean;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function reducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload, loading: false };
    case "ADD_FAVORITE":
      if (state.favorites.some((item) => item.bookKey === action.payload.bookKey)) {
        return state;
      }
      return { ...state, favorites: [action.payload, ...state.favorites] };
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    favorites: [],
    loading: true
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      dispatch({ type: "SET_FAVORITES", payload: [] });
      return;
    }

    let cancelled = false;

    const run = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const nextFavorites = await getFavoritesRequest(user.id);
        if (cancelled) {
          return;
        }
        dispatch({ type: "SET_FAVORITES", payload: nextFavorites });
      } catch {
        if (!cancelled) {
          dispatch({ type: "SET_FAVORITES", payload: [] });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites: state.favorites,
      loading: state.loading,
      addFavorite: async (book) => {
        if (!user) {
          return;
        }

        const duplicate = state.favorites.some((item) => item.bookKey === book.key);
        if (duplicate) {
          return;
        }

        dispatch({ type: "SET_LOADING", payload: true });
        try {
          const created = await addFavoriteRequest({
            userId: user.id,
            bookKey: book.key,
            title: book.title,
            author: book.author_name.length > 0 ? book.author_name.join(", ") : "Unknown author",
            coverId: book.cover_i ?? 0
          });
          dispatch({ type: "ADD_FAVORITE", payload: created });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      },
      removeFavorite: async (favoriteId) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
          await deleteFavoriteRequest(favoriteId);
          dispatch({ type: "REMOVE_FAVORITE", payload: favoriteId });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      },
      isFavorite: (bookKey) => state.favorites.some((item) => item.bookKey === bookKey),
      clearFavorites: () => {
        dispatch({ type: "SET_FAVORITES", payload: [] });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }),
    [state.favorites, state.loading, user]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}

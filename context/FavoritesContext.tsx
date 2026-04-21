"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { BookSummary } from "@/lib/openLibrary";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/jsonServer";

type FavoritesState = {
  items: BookSummary[];
  loading: boolean;
};

type FavoritesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FAVORITES"; payload: BookSummary[] }
  | { type: "ADD_FAVORITE"; payload: BookSummary }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "CLEAR" };

type FavoritesContextValue = {
  items: BookSummary[];
  loading: boolean;
  loadFavorites: (userId: number) => Promise<void>;
  toggleFavorite: (userId: number, book: BookSummary) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function reducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_FAVORITES":
      return { ...state, items: action.payload, loading: false };
    case "ADD_FAVORITE":
      if (state.items.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [action.payload, ...state.items] };
    case "REMOVE_FAVORITE":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case "CLEAR":
      return { items: [], loading: false };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    loading: false
  });

  const value = useMemo<FavoritesContextValue>(
    () => ({
      items: state.items,
      loading: state.loading,
      loadFavorites: async (userId) => {
        dispatch({ type: "SET_LOADING", payload: true });
        const records = await getFavorites(userId);
        const mapped: BookSummary[] = records.map((item) => ({
          id: item.bookId,
          title: item.title,
          author: item.author,
          coverUrl: item.coverUrl,
          firstPublishYear: item.firstPublishYear
        }));
        dispatch({ type: "SET_FAVORITES", payload: mapped });
      },
      toggleFavorite: async (userId, book) => {
        const exists = state.items.some((item) => item.id === book.id);

        if (exists) {
          await removeFavorite(userId, book.id);
          dispatch({ type: "REMOVE_FAVORITE", payload: book.id });
          return;
        }

        await addFavorite(userId, book);
        dispatch({ type: "ADD_FAVORITE", payload: book });
      },
      isFavorite: (bookId) => state.items.some((item) => item.id === bookId),
      clearFavorites: () => dispatch({ type: "CLEAR" })
    }),
    [state.items, state.loading]
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

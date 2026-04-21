"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { clearFavorites } = useFavorites();

  const navClass = (path: string) =>
    `text-sm font-medium transition ${pathname === path ? "text-brand-700" : "text-slate-700 hover:text-brand-500"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-black tracking-tight text-brand-700">
          BooksFinder
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className={navClass("/")}>
            Home
          </Link>

          {!isLoading && user ? (
            <>
              <Link href="/favorites" className={navClass("/favorites")}>
                Favorites
              </Link>
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={() => {
                  logout();
                  clearFavorites();
                  router.push("/login");
                }}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link href="/login" className={navClass("/login")}>
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white">
                Register
              </Link>
            </>
          ) : (
            <span className="text-sm text-slate-500">Loading...</span>
          )}
        </nav>
      </div>
    </header>
  );
}

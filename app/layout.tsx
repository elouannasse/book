import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BooksFinder",
  description: "Search and save your favorite books"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FavoritesProvider>
            <Navbar />
            <main className="page-wrap">{children}</main>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

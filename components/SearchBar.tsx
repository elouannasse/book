"use client";

import { FormEvent, useState } from "react";

const GENRES = ["", "Fiction", "Science", "History", "Romance", "Mystery", "Biography"];

type SearchBarProps = {
  initialValue?: string;
  initialGenre?: string;
  onSearch: (query: string, genre: string) => void;
};

export default function SearchBar({ initialValue = "", initialGenre = "", onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [genre, setGenre] = useState(initialGenre);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onSearch(next, genre);
  };

  return (
    <form onSubmit={handleSubmit} className="grid w-full gap-3 sm:grid-cols-[1fr_180px_auto]">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by title..."
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <select
        value={genre}
        onChange={(event) => setGenre(event.target.value)}
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        {GENRES.map((item) => (
          <option key={item || "all"} value={item}>
            {item || "All genres"}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}

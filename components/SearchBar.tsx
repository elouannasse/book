"use client";

import { FormEvent, useState } from "react";

type SearchBarProps = {
  initialValue?: string;
  onSearch: (query: string) => void;
};

export default function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onSearch(next);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by title, author, subject..."
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="submit"
        className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}

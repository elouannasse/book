"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Keep logging simple for debugging and soutenance demonstration.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">
        An unexpected error happened while loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}

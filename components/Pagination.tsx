"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-brand-100 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const showDots = previous && page - previous > 1;

        return (
          <div key={page} className="flex items-center gap-3">
            {showDots ? <span className="text-sm text-slate-400">...</span> : null}
            <button
              onClick={() => onPageChange(page)}
              className={`rounded-lg px-3 py-2 text-sm ${
                page === currentPage
                  ? "bg-brand-500 font-semibold text-white"
                  : "border border-brand-100 bg-white text-slate-700"
              }`}
            >
              {page}
            </button>
          </div>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-brand-100 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
          <div className="mb-3 h-52 rounded-lg bg-slate-100" />
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mb-2 h-3 w-2/3 rounded bg-slate-100" />
          <div className="mb-2 h-3 w-1/2 rounded bg-slate-100" />
          <div className="mt-4 h-9 w-full rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

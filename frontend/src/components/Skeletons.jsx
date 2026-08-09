export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="h-4 w-1/3 bg-slate-200 dark:bg-ink-700 rounded mb-4" />
      <div className="h-8 w-1/2 bg-slate-200 dark:bg-ink-700 rounded mb-2" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-ink-700 rounded" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-200/70 dark:bg-ink-700/60" />
      ))}
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-6 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-28 h-28 rounded-full bg-slate-200 dark:bg-ink-700" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-slate-200/70 dark:bg-ink-700/60" />
      <div className="h-40 rounded-2xl bg-slate-200/70 dark:bg-ink-700/60" />
    </div>
  );
}

export default function ReportSection({ title, items = [], numbered = false }) {
  if (!items.length) return null;
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-mono text-xs text-brand-500 mt-0.5 shrink-0">
              {numbered ? String(idx + 1).padStart(2, '0') : '—'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Check, X } from 'lucide-react';

/**
 * Renders a list of strings as chips. `tone` controls the color scheme:
 * 'positive' (matched/strength), 'negative' (missing/weakness), 'neutral'.
 */
export default function TagList({ items = [], tone = 'neutral', icon = true }) {
  if (!items.length) {
    return <p className="text-sm text-slate-400 italic">None identified</p>;
  }

  const toneClasses = {
    positive: 'bg-signal-50 text-signal-700 dark:bg-signal-500/10 dark:text-signal-300',
    negative: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    neutral: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  };

  const Icon = tone === 'positive' ? Check : tone === 'negative' ? X : null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span key={idx} className={`chip gap-1 ${toneClasses[tone]}`}>
          {icon && Icon && <Icon size={12} strokeWidth={3} />}
          {item}
        </span>
      ))}
    </div>
  );
}

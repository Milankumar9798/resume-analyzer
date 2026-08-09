import { motion } from 'framer-motion';

const getBarColor = (score) => {
  if (score >= 80) return 'bg-signal-500';
  if (score >= 60) return 'bg-brand-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
};

export default function ScoreBar({ label, score = 0 }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{score}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-ink-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

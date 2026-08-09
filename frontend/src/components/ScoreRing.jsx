import { motion } from 'framer-motion';

const getColor = (score) => {
  if (score >= 80) return { ring: '#14b8a6', glow: 'rgba(20,184,166,0.35)' }; // signal-500
  if (score >= 60) return { ring: '#6366f1', glow: 'rgba(99,102,241,0.35)' }; // brand-500
  if (score >= 40) return { ring: '#f59e0b', glow: 'rgba(245,158,11,0.35)' }; // amber-500
  return { ring: '#f43f5e', glow: 'rgba(244,63,94,0.35)' }; // rose-500
};

/**
 * Circular progress "scan" gauge - the app's signature visual element.
 * Doubles as an ATS/document-scanning metaphor: the ring fills like a
 * scan line sweeping around the score.
 */
export default function ScoreRing({ score = 0, label = '', size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const { ring, glow } = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-200 dark:stroke-ink-700"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-[10px] font-mono text-slate-400">/100</span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-center text-slate-500 dark:text-slate-400 max-w-[140px]">
          {label}
        </span>
      )}
    </div>
  );
}

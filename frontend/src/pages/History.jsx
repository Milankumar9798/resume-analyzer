import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ScanLine, Target, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import { ListSkeleton } from '../components/Skeletons.jsx';
import { getAnalysisHistory, getJobMatchHistory } from '../api/resumeApi';

const TABS = [
  { key: 'analyses', label: 'ATS Analyses', icon: ScanLine },
  { key: 'matches', label: 'Job Matches', icon: Target },
];

export default function History() {
  const [tab, setTab] = useState('analyses');
  const [analyses, setAnalyses] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, m] = await Promise.all([getAnalysisHistory(), getJobMatchHistory()]);
        setAnalyses(a.data.data);
        setMatches(m.data.data);
      } catch {
        toast.error('Could not load history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">History</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-gradient-to-r from-brand-600 to-signal-600 text-white'
                : 'bg-white dark:bg-ink-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-ink-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : tab === 'analyses' ? (
        analyses.length ? (
          <div className="space-y-2">
            {analyses.map((a) => (
              <Link
                key={a.id}
                to={`/analysis/${a.id}`}
                className="flex items-center justify-between card !py-4 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.resumeFileName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {a.atsScore}/100
                  </span>
                  <ArrowRight size={15} className="text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState label="No ATS analyses yet" cta="/upload" ctaLabel="Upload a resume" />
        )
      ) : matches.length ? (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link
              key={m.id}
              to={`/job-match/${m.id}`}
              className="flex items-center justify-between card !py-4 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.jobTitle || 'Untitled role'} {m.companyName ? `· ${m.companyName}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-sm font-semibold text-signal-600 dark:text-signal-400">
                  {m.jobMatchScore}/100
                </span>
                <ArrowRight size={15} className="text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState label="No job matches yet" cta="/job-match" ctaLabel="Run a job match" />
      )}
    </AppShell>
  );
}

function EmptyState({ label, cta, ctaLabel }) {
  return (
    <div className="card text-center py-14">
      <p className="text-sm text-slate-400 mb-4">{label}</p>
      <Link to={cta} className="btn-primary inline-flex">
        {ctaLabel}
      </Link>
    </div>
  );
}

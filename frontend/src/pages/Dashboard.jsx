import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  FileText,
  Target,
  ScanLine,
  UploadCloud,
  ArrowRight,
  Sparkles,
  Linkedin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell.jsx';
import { CardSkeleton, ListSkeleton } from '../components/Skeletons.jsx';
import { getDashboardStats } from '../api/resumeApi';
import { useAuth } from '../hooks/useAuth';

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card flex items-center gap-4">
    <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-signal-600 text-white shrink-0">
      <Icon size={18} />
    </span>
    <div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, desc }) => (
  <Link
    to={to}
    className="card flex items-center gap-4 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
  >
    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-slate-400 truncate">{desc}</p>
    </div>
  </Link>
);

const barColor = (score) => {
  if (score >= 80) return '#14b8a6';
  if (score >= 60) return '#6366f1';
  if (score >= 40) return '#f59e0b';
  return '#f43f5e';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch (err) {
        toast.error('Could not load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const atsChartData = (stats?.trends.atsScoreHistory || []).map((d, i) => ({
    name: `#${i + 1}`,
    score: d.score,
  }));

  const matchChartData = (stats?.trends.jobMatchScoreHistory || []).map((d, i) => ({
    name: d.label ? d.label.slice(0, 12) || `#${i + 1}` : `#${i + 1}`,
    score: d.score,
  }));

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400 mt-1">Here's how your job search is tracking.</p>
        </div>
        <Link to="/upload" className="btn-primary">
          <UploadCloud size={16} /> Analyze new resume
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={FileText} label="Total resumes uploaded" value={stats.totals.totalResumes} />
          <StatCard icon={ScanLine} label="Average ATS score" value={stats.averages.avgAtsScore} />
          <StatCard icon={Target} label="Average job match score" value={stats.averages.avgJobMatchScore} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold mb-4">ATS score trend</h2>
          {loading ? (
            <div className="h-64 bg-slate-100 dark:bg-ink-700/50 rounded-xl animate-pulse" />
          ) : atsChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={atsChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-ink-700" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-16 text-center">
              Run your first analysis to see trends here.
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Recent uploads</h2>
          {loading ? (
            <ListSkeleton rows={3} />
          ) : stats.recentResumes.length ? (
            <ul className="space-y-2">
              {stats.recentResumes.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100/70 dark:bg-ink-700/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={15} className="text-brand-500 shrink-0" />
                    <span className="text-sm truncate">{r.originalFileName}</span>
                  </div>
                  <Link
                    to={`/upload?resumeId=${r.id}`}
                    className="text-brand-600 dark:text-brand-400 shrink-0"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400 mb-3">No resumes yet</p>
              <Link to="/upload" className="btn-secondary text-xs">
                Upload your first resume
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Job match scores by application</h2>
        {loading ? (
          <div className="h-56 bg-slate-100 dark:bg-ink-700/50 rounded-xl animate-pulse" />
        ) : matchChartData.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={matchChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-ink-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {matchChartData.map((entry, index) => (
                  <Cell key={index} fill={barColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-400 py-14 text-center">
            Run a job match to see how you stack up across applications.
          </p>
        )}
      </div>

      <h2 className="font-semibold mb-3">Quick actions</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction to="/job-match" icon={Target} label="Match a job" desc="Compare a resume to a JD" />
        <QuickAction to="/cover-letter" icon={Sparkles} label="Cover letter" desc="Generate a tailored draft" />
        <QuickAction to="/linkedin-summary" icon={Linkedin} label="LinkedIn summary" desc="Write your About section" />
      </div>
    </AppShell>
  );
}


import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Target, History, User, FileText, Linkedin } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Resume', icon: UploadCloud },
  { to: '/job-match', label: 'Job Match', icon: Target },
  { to: '/cover-letter', label: 'Cover Letter', icon: FileText },
  { to: '/linkedin-summary', label: 'LinkedIn Summary', icon: Linkedin },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200/70 dark:border-ink-700/70 bg-slate-50/60 dark:bg-ink-900/60 min-h-[calc(100vh-4rem)] py-6 px-3 gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-brand-600 to-signal-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-ink-700/60'
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}

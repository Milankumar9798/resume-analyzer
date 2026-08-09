import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, ScanLine } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-ink-700/70 bg-slate-50/80 dark:bg-ink-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-signal-600 text-white">
            <ScanLine size={16} />
          </span>
          <span className="font-display font-bold text-lg tracking-tight">
            Resume<span className="text-brand-600 dark:text-brand-400">IQ</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-ink-700/60 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <>
              <Link
                to="/profile"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold"
              >
                {user.avatarInitials || user.name?.[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-ink-700/60 transition-colors"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

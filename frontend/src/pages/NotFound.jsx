import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-ink-900 px-4 text-center">
      <span className="font-display font-bold text-6xl text-brand-600">404</span>
      <p className="text-slate-500 dark:text-slate-400 mt-3 mb-6">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}

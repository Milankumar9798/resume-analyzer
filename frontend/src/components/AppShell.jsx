import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-900">
      <Navbar />
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-8 min-w-0 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
}

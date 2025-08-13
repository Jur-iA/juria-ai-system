import React from 'react';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isDemo, demoExpiresAt } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [now, setNow] = React.useState(Date.now());
  const redirectedRef = React.useRef(false);

  // ticker for countdown
  React.useEffect(() => {
    if (!isDemo || !demoExpiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isDemo, demoExpiresAt]);

  const remainingMs = demoExpiresAt ? Math.max(0, demoExpiresAt - now) : undefined;
  const remainingMin = remainingMs !== undefined ? Math.floor(remainingMs / 60000) : undefined;
  const remainingSec = remainingMs !== undefined ? Math.floor((remainingMs % 60000) / 1000) : undefined;

  // Auto logout and redirect when demo expires
  React.useEffect(() => {
    if (!isDemo) return;
    if (typeof remainingMs !== 'number') return;
    if (remainingMs > 0) return;
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    const t = setTimeout(() => {
      try { logout(); } catch {}
      if (typeof window !== 'undefined') {
        window.location.replace('/?expired=1');
      }
    }, 50);
    return () => clearTimeout(t);
  }, [isDemo, remainingMs, logout]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {isDemo && demoExpiresAt && (
        <div className="px-4 pt-3">
          <div className="relative w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-blue-600/10 to-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-sm px-4 py-2 flex items-center justify-between">
            <span className="font-medium">
              Modo demo ativo — expira em {remainingMin}m {remainingSec}s
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/556299937353?text=Oi%2C%20quero%20ver%20uma%20demo%20do%20JurIA%20%F0%9F%91%8B"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar casos, documentos..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <NotificationBell />

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.oabNumber}</p>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              {user?.name?.charAt(0)}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
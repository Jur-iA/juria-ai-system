//
import { 
  Home, 
  Scale, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Settings,
  Bell,
  X,
  Sparkles
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/cases', icon: Scale, label: 'Casos' },
  { to: '/chat', icon: MessageSquare, label: 'Chat IA' },
  { to: '/documents', icon: FileText, label: 'Documentos' },
  { to: '/calendar', icon: Calendar, label: 'Calendário' },
  { to: '/notifications', icon: Bell, label: 'Notificações' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">JuriAI</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`
                  }
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.label === 'Chat IA' && (
                    <Sparkles className="w-4 h-4 ml-auto text-emerald-500" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* AI Assistant Banner */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center mb-2">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">IA Jurídica</span>
            </div>
            <p className="text-xs opacity-90 mb-3">
              Assistente especializado em direito brasileiro
            </p>
            <div className="flex gap-2">
              <NavLink
                to="/chat"
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center flex-1"
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                Conversar Agora
              </NavLink>
              <a
                href="https://wa.me/556299937353?text=Oi%2C%20quero%20ver%20uma%20demo%20do%20JurIA%20%F0%9F%91%8B"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Sun, Moon, Search, Sparkles } from 'lucide-react';

export default function Header() {
  // [BUG_INTENCIONAL_ID_44] Dark mode toggle doesn't persist after page refresh
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Missing: localStorage.setItem('darkMode', ...) — BUG #44
  };

  const getInitialColor = (name: string) => {
    const colors = [
      'from-brand-500 to-brand-700',
      'from-accent-500 to-accent-700',
      'from-emerald-500 to-emerald-700',
      'from-violet-500 to-violet-700',
      'from-rose-500 to-rose-700',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200/80 dark:border-surface-800/60 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors peer-focus:text-brand-500" />
          <input
            type="text"
            placeholder="Buscar alunos, planos, aulas..."
            className="peer input-base pl-10 bg-surface-50 dark:bg-surface-800/50 border-surface-200/60 dark:border-surface-700/40"
            data-testid="input-global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200"
          data-testid="btn-dark-mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          className="p-2.5 rounded-xl text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200 relative"
          data-testid="btn-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full animate-pulse-soft ring-2 ring-white dark:ring-surface-900"></span>
        </button>

        <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-surface-200 dark:border-surface-800">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getInitialColor(user?.name || 'U')} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role === 'ADMIN' ? 'Administrador' :
               user?.role === 'RECEPTIONIST' ? 'Recepcionista' :
               user?.role === 'INSTRUCTOR' ? 'Professor' : 'Aluno'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Shield,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTIONIST', 'INSTRUCTOR', 'STUDENT'] },
  { path: '/students', label: 'Alunos', icon: Users, roles: ['ADMIN', 'RECEPTIONIST', 'INSTRUCTOR'] },
  { path: '/plans', label: 'Planos', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/enrollments', label: 'Matrículas', icon: GraduationCap, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/classes', label: 'Aulas', icon: Calendar, roles: ['ADMIN', 'RECEPTIONIST', 'INSTRUCTOR'] },
  { path: '/finance', label: 'Financeiro', icon: DollarSign, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/users', label: 'Usuários', icon: Shield, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.filter((item) => 
    user ? item.roles.includes(user.role) : false
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-brand-600/20 flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold font-display tracking-tight text-surface-900 dark:text-white">GymManager</h1>
            <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-[0.2em] uppercase">Pro Edition</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-surface-200 dark:via-surface-800 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            data-testid={`nav-${item.path.substring(1)}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-3">
        <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-surface-200 dark:via-surface-800 to-transparent" />
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <div className="w-9 h-9 rounded-full gradient-brand-vivid flex items-center justify-center text-white text-sm font-bold flex-shrink-0 avatar-ring">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role === 'ADMIN' ? 'Administrador' :
                 user.role === 'RECEPTIONIST' ? 'Recepcionista' :
                 user.role === 'INSTRUCTOR' ? 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-danger-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-red-950/30 ${collapsed ? 'justify-center px-2' : ''}`}
          data-testid="btn-logout"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 mx-3 mb-3 rounded-xl text-gray-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-brand-600 transition-colors"
        data-testid="btn-collapse-sidebar"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-surface-800 shadow-elevated border border-surface-200 dark:border-surface-700"
        data-testid="btn-mobile-menu"
      >
        <Menu className="w-5 h-5 text-surface-700 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-72 h-full bg-white dark:bg-surface-900 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              data-testid="btn-close-mobile-menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[272px]'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

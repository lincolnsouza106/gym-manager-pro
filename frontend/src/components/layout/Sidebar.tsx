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
      <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold gradient-text">GymManager</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Pro Edition</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
          data-testid="btn-logout"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 mx-3 mb-3 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        data-testid="btn-mobile-menu"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-72 h-full bg-white dark:bg-gray-900 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
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
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

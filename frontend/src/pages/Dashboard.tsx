import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import {
  Users, TrendingUp, CreditCard, AlertTriangle,
  DollarSign, UserPlus, Activity, Lock, Unlock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

interface DashboardStats {
  totalStudents: number;
  newStudentsThisMonth: number;
  activeEnrollments: number;
  overdueInvoices: number;
  totalRevenue: number;
  overdueStudentIds: number[];
  turnstileStatus: Array<{ id: number; name: string; turnstileStatus: string }>;
}

const CHART_COLORS = ['#0d9488', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

const KPI_STYLES = [
  { accent: 'card-accent-teal', iconBg: 'bg-brand-50 dark:bg-teal-950/30', iconColor: 'text-brand-600 dark:text-brand-400', valueColor: 'text-brand-700 dark:text-brand-300' },
  { accent: 'card-accent-emerald', iconBg: 'bg-success-50 dark:bg-emerald-950/30', iconColor: 'text-success-600 dark:text-emerald-400', valueColor: 'text-success-700 dark:text-emerald-300' },
  { accent: 'card-accent-purple', iconBg: 'bg-violet-50 dark:bg-violet-950/30', iconColor: 'text-violet-600 dark:text-violet-400', valueColor: 'text-violet-700 dark:text-violet-300' },
  { accent: 'card-accent-red', iconBg: 'bg-danger-50 dark:bg-red-950/30', iconColor: 'text-danger-600 dark:text-red-400', valueColor: 'text-danger-700 dark:text-red-300' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [popularClasses, setPopularClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, revenueRes, classesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue'),
        api.get('/dashboard/popular-classes'),
      ]);

      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setPopularClasses(classesRes.data);
    } catch (error) {
      addToast('error', 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    // [BUG_INTENCIONAL_ID_41] Currency displayed without decimal places on summary
    return `R$ ${Math.floor(value)}`;
  };

  // [BUG_INTENCIONAL_ID_48] Chart tooltip shows raw cents instead of formatted currency
  const tooltipFormatter = (value: number) => {
    return `${value * 100}`;
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total de Alunos',
      value: stats?.totalStudents || 0,
      icon: Users,
    },
    {
      title: 'Novos este Mês',
      value: stats?.newStudentsThisMonth || 0,
      icon: UserPlus,
    },
    {
      title: 'Matrículas Ativas',
      value: stats?.activeEnrollments || 0,
      icon: CreditCard,
    },
    {
      title: 'Inadimplentes',
      value: stats?.overdueInvoices || 0,
      icon: AlertTriangle,
    },
  ];

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-brand-500 to-brand-700',
      'from-accent-500 to-accent-700',
      'from-emerald-500 to-emerald-700',
      'from-violet-500 to-violet-700',
      'from-rose-500 to-rose-700',
      'from-cyan-500 to-cyan-700',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral da Academia LifeFit</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const style = KPI_STYLES[index];
          return (
            <div
              key={card.title}
              className={`glass-card rounded-2xl p-6 ${style.accent} transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5`}
              data-testid={`kpi-card-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${style.iconColor}`} />
                </div>
                <Activity className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <p className={`text-2xl font-bold font-display ${style.valueColor}`}>{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Card */}
      <div className="glass-card rounded-2xl p-6 card-accent-emerald" data-testid="revenue-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white">Faturamento Total</h3>
              <p className="text-2xl font-bold font-display gradient-text">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card rounded-2xl p-6" data-testid="chart-revenue">
          <h3 className="font-semibold font-display text-surface-900 dark:text-white mb-6">Faturamento por Mês</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="total" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Classes Chart */}
        <div className="glass-card rounded-2xl p-6" data-testid="chart-popular-classes">
          <h3 className="font-semibold font-display text-surface-900 dark:text-white mb-6">Aulas Mais Populares</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {/* [BUG_INTENCIONAL_ID_29] Chart expects 'checkins' key but data sends 'value' */}
              <PieChart>
                <Pie
                  data={popularClasses}
                  dataKey="checkins"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name }) => name}
                >
                  {popularClasses.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Turnstile Status */}
      <div className="glass-card rounded-2xl p-6" data-testid="turnstile-status">
        <h3 className="font-semibold font-display text-surface-900 dark:text-white mb-4">Status da Catraca</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {stats?.turnstileStatus?.slice(0, 12).map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-800/30 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
              data-testid={`turnstile-student-${student.id}`}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(student.name)} flex items-center justify-center text-white text-xs font-bold`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{student.name}</p>
              </div>
              {/* [BUG_INTENCIONAL_ID_10] All students show turnstile released, even overdue ones */}
              {student.turnstileStatus === 'RELEASED' ? (
                <Unlock className="w-4 h-4 text-success-500 flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-danger-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

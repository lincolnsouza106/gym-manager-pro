import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import { Plus, X, RefreshCw, XCircle, GraduationCap, Calendar, User } from 'lucide-react';

interface Enrollment {
  id: number;
  studentId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  student: { id: number; name: string; cpf: string };
  plan: { id: number; name: string; price: number };
}

interface Plan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
}

interface Student {
  id: number;
  name: string;
  cpf: string;
}

const AVATAR_COLORS = [
  'from-brand-500 to-brand-700',
  'from-accent-500 to-accent-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
];

const getAvatarColor = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    studentId: 0,
    planId: 0,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrollRes, planRes, studentRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/plans'),
        api.get('/students?limit=100'),
      ]);
      setEnrollments(enrollRes.data);
      setPlans(planRes.data);
      setStudents(studentRes.data.data || []);
    } catch {
      addToast('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/enrollments', formData);
      addToast('success', 'Matrícula criada!');
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro ao criar matrícula', error.response?.data?.error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/enrollments/${id}/cancel`);
      addToast('success', 'Matrícula cancelada');
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro ao cancelar', error.response?.data?.error);
    }
  };

  const handleRenew = async (id: number) => {
    try {
      await api.post(`/enrollments/${id}/renew`);
      addToast('success', 'Matrícula renovada!');
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro ao renovar', error.response?.data?.error);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // [BUG_INTENCIONAL_ID_42] Status badge shows "Active" for expired enrollments
  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.status === 'CANCELLED') return <span className="badge-danger">Cancelada</span>;
    // BUG: does not check if endDate has passed
    return <span className="badge-success">Ativa</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="enrollments-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Matrículas</h1>
          <p className="page-subtitle">Gerencie as matrículas dos alunos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" data-testid="btn-new-enrollment">
          <Plus className="w-4 h-4" />
          Nova Matrícula
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-enrollments">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-800/30 border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Início</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fim</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="table-row-hover" data-testid={`enrollment-row-${enrollment.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(enrollment.student.name)} flex items-center justify-center text-white text-xs font-bold`}>
                          {enrollment.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white text-sm">{enrollment.student.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{enrollment.student.cpf}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-info">{enrollment.plan.name}</span>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(enrollment.plan.price)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {formatDate(enrollment.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {formatDate(enrollment.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enrollment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-0.5">
                        {enrollment.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleRenew(enrollment.id)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-success-50 dark:hover:bg-emerald-950/30 hover:text-success-600 transition-all duration-200"
                              title="Renovar"
                              data-testid={`btn-renew-${enrollment.id}`}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(enrollment.id)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 dark:hover:bg-red-950/30 hover:text-danger-600 transition-all duration-200"
                              title="Cancelar"
                              data-testid={`btn-cancel-enrollment-${enrollment.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="modal-overlay" data-testid="modal-enrollment">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">Nova Matrícula</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-enrollment-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Aluno</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                  className="input-base"
                  required
                  data-testid="select-enrollment-student"
                >
                  <option value={0}>Selecione um aluno</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.cpf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Plano</label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: parseInt(e.target.value) })}
                  className="input-base"
                  required
                  data-testid="select-enrollment-plan"
                >
                  <option value={0}>Selecione um plano</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Data de Início</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-base"
                  data-testid="input-enrollment-start-date"
                />
              </div>

              {/* [BUG_INTENCIONAL_ID_4] Save button disappears on mobile (< 768px) */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" data-testid="btn-cancel-enrollment">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary hidden md:inline-flex" data-testid="btn-save-enrollment">
                  Criar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

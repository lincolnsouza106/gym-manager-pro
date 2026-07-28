import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, CreditCard, Clock, DollarSign, Users } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string | null;
  durationMonths: number;
  price: number;
  isActive: boolean;
  _count?: { enrollments: number };
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMonths: 1,
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch {
      addToast('error', 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedPlan(null);
    setFormData({ name: '', description: '', durationMonths: 1, price: 0, isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      durationMonths: plan.durationMonths,
      price: plan.price,
      isActive: plan.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await api.put(`/plans/${selectedPlan.id}`, formData);
        addToast('success', 'Plano atualizado!');
      } else {
        await api.post('/plans', formData);
        addToast('success', 'Plano criado!');
      }
      setModalOpen(false);
      loadPlans();
    } catch (error: any) {
      addToast('error', 'Erro ao salvar plano', error.response?.data?.error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // [BUG_INTENCIONAL_ID_14] Deleting plan doesn't check for active enrollments (backend)
      await api.delete(`/plans/${id}`);
      addToast('success', 'Plano excluído!');
      setDeleteConfirm(null);
      loadPlans();
    } catch (error: any) {
      addToast('error', 'Erro ao excluir', error.response?.data?.error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="plans-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Planos</h1>
          <p className="page-subtitle">Gerencie os planos da academia</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary" data-testid="btn-new-plan">
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${!plan.isActive ? 'opacity-60' : ''}`}
              data-testid={`plan-card-${plan.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-brand-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 transition-colors"
                    data-testid={`btn-edit-plan-${plan.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(plan.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 transition-colors"
                    data-testid={`btn-delete-plan-${plan.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description || 'Sem descrição'}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{plan._count?.enrollments || 0} matrículas ativas</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold gradient-text">{formatCurrency(plan.price)}</p>
                <p className="text-xs text-gray-500">
                  {plan.durationMonths > 1 ? `${formatCurrency(plan.price / plan.durationMonths)}/mês` : '/mês'}
                </p>
              </div>

              {!plan.isActive && (
                <div className="mt-3">
                  <span className="badge-danger">Inativo</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="modal-plan">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" data-testid="btn-close-plan-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base"
                  required
                  data-testid="input-plan-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-base h-20 resize-none"
                  data-testid="input-plan-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* [BUG_INTENCIONAL_ID_38] Duration accepts 0 months */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duração (meses)</label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="input-base"
                    required
                    data-testid="input-plan-duration"
                  />
                </div>
                <div>
                  {/* [BUG_INTENCIONAL_ID_28] Price accepts negative values */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className="input-base"
                    required
                    data-testid="input-plan-price"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  id="plan-active"
                  data-testid="checkbox-plan-active"
                />
                <label htmlFor="plan-active" className="text-sm text-gray-700 dark:text-gray-300">Plano ativo</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" data-testid="btn-cancel-plan">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" data-testid="btn-save-plan">
                  {selectedPlan ? 'Salvar' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="modal-delete-plan">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir Plano</h3>
              <p className="text-sm text-gray-500 mb-6">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1" data-testid="btn-cancel-delete-plan">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1" data-testid="btn-confirm-delete-plan">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

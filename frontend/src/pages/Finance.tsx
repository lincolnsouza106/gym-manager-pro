import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import {
  DollarSign, Check, Percent, Filter, TrendingUp, TrendingDown,
  AlertTriangle, X, CreditCard,
} from 'lucide-react';

interface Invoice {
  id: number;
  enrollmentId: number;
  studentId: number;
  amount: number;
  discount: number;
  finalAmount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
  student: { id: number; name: string; cpf: string };
  enrollment: { id: number; plan: { name: string } };
}

interface FinanceSummary {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalInvoices: number;
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

export default function Finance() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [discountModal, setDiscountModal] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const [invoiceRes, summaryRes] = await Promise.all([
        api.get('/finance/invoices', { params }),
        api.get('/finance/summary'),
      ]);
      setInvoices(invoiceRes.data);
      setSummary(summaryRes.data);
    } catch {
      addToast('error', 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: number) => {
    try {
      // [BUG_INTENCIONAL_ID_33] Marks invoice as paid regardless of amount
      await api.patch(`/finance/invoices/${id}/pay`);
      addToast('success', 'Pagamento registrado!');
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro ao registrar pagamento', error.response?.data?.error);
    }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountModal) return;

    try {
      // [BUG_INTENCIONAL_ID_2] Backend subtracts fixed value instead of percentage
      await api.patch(`/finance/invoices/${discountModal}/discount`, { discountPercent });
      addToast('success', 'Desconto aplicado!');
      setDiscountModal(null);
      setDiscountPercent(0);
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro ao aplicar desconto', error.response?.data?.error);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="badge-success">Pago</span>;
      case 'PENDING': return <span className="badge-warning">Pendente</span>;
      case 'OVERDUE': return <span className="badge-danger">Vencida</span>;
      case 'CANCELLED': return <span className="badge bg-surface-100 text-gray-600 dark:bg-surface-800 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">Cancelada</span>;
      default: return <span className="badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="finance-page">
      <div className="page-header">
        <h1 className="page-title">Financeiro</h1>
        <p className="page-subtitle">Gestão de mensalidades e pagamentos</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-6 card-accent-emerald" data-testid="card-total-revenue">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Receita Total</span>
            </div>
            {/* [BUG_INTENCIONAL_ID_41] No decimal places in summary (uses Math.floor) */}
            <p className="text-2xl font-bold font-display text-success-700 dark:text-emerald-300">{formatCurrency(Math.floor(summary.totalRevenue))}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.totalPaid} faturas pagas</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-accent-amber" data-testid="card-pending">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-warning-50 dark:bg-amber-950/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Pendente</span>
            </div>
            <p className="text-2xl font-bold font-display text-amber-700 dark:text-amber-300">{formatCurrency(summary.pendingAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.totalPending} faturas pendentes</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-accent-red" data-testid="card-overdue">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-danger-50 dark:bg-red-950/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Vencidas</span>
            </div>
            <p className="text-2xl font-bold font-display text-danger-700 dark:text-red-300">{formatCurrency(summary.overdueAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.totalOverdue} faturas vencidas</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-48"
            data-testid="select-finance-status"
          >
            <option value="">Todas</option>
            <option value="PENDING">Pendentes</option>
            <option value="PAID">Pagas</option>
            <option value="OVERDUE">Vencidas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-invoices">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-800/30 border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vencimento</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row-hover" data-testid={`invoice-row-${invoice.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(invoice.student.name)} flex items-center justify-center text-white text-xs font-bold`}>
                          {invoice.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white text-sm">{invoice.student.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{invoice.student.cpf}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.enrollment?.plan?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">{formatCurrency(invoice.finalAmount)}</p>
                      {invoice.discount > 0 && (
                        <p className="text-xs text-gray-500 line-through">{formatCurrency(invoice.amount)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-0.5">
                        {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                          <>
                            <button
                              onClick={() => handlePay(invoice.id)}
                              className="p-2 rounded-lg text-gray-400 hover:bg-success-50 dark:hover:bg-emerald-950/30 hover:text-success-600 transition-all duration-200"
                              title="Registrar pagamento"
                              data-testid={`btn-pay-${invoice.id}`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setDiscountModal(invoice.id); setDiscountPercent(0); }}
                              className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 transition-all duration-200"
                              title="Aplicar desconto"
                              data-testid={`btn-discount-${invoice.id}`}
                            >
                              <Percent className="w-4 h-4" />
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

      {/* Discount Modal */}
      {discountModal && (
        <div className="modal-overlay" data-testid="modal-discount">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-sm animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">Aplicar Desconto</h2>
              <button onClick={() => setDiscountModal(null)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-discount-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleApplyDiscount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Percentual de desconto (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.5"
                  className="input-base"
                  required
                  data-testid="input-discount-percent"
                />
                <p className="text-xs text-gray-500 mt-1.5">Digite o percentual de desconto (ex: 10 para 10%)</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setDiscountModal(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" data-testid="btn-apply-discount">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

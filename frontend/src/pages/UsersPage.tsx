import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Shield, User, Mail, Key } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepcionista',
  INSTRUCTOR: 'Professor',
  STUDENT: 'Aluno',
};

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'badge bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-800',
  RECEPTIONIST: 'badge bg-brand-50 text-brand-700 dark:bg-teal-950/30 dark:text-teal-400 ring-1 ring-brand-200 dark:ring-teal-800',
  INSTRUCTOR: 'badge bg-success-50 text-success-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800',
  STUDENT: 'badge bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-gray-400 ring-1 ring-surface-200 dark:ring-surface-700',
};

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

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as string,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch {
      addToast('error', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
    setModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const { password, ...updateData } = formData;
        await api.put(`/users/${selectedUser.id}`, updateData);
        addToast('success', 'Usuário atualizado!');
      } else {
        await api.post('/users', formData);
        addToast('success', 'Usuário criado!');
      }
      setModalOpen(false);
      loadUsers();
    } catch (error: any) {
      addToast('error', 'Erro ao salvar', error.response?.data?.error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      addToast('success', 'Usuário excluído!');
      setDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      addToast('error', 'Erro ao excluir', error.response?.data?.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie os acessos do sistema</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary" data-testid="btn-new-user">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-users">
              <thead>
                <tr className="bg-surface-50/50 dark:bg-surface-800/30 border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {users.map((user) => (
                  <tr key={user.id} className="table-row-hover" data-testid={`user-row-${user.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white text-sm font-bold`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-surface-900 dark:text-white">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={roleBadgeClass[user.role] || 'badge-info'}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 transition-all duration-200"
                          data-testid={`btn-edit-user-${user.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 dark:hover:bg-red-950/30 hover:text-danger-600 transition-all duration-200"
                          data-testid={`btn-delete-user-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" data-testid="modal-user">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-user-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Nome</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-base pl-10" required data-testid="input-user-name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-base pl-10" required data-testid="input-user-email" />
                </div>
              </div>
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Senha</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-base pl-10" required minLength={6} data-testid="input-user-password" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Perfil</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-base" data-testid="select-user-role">
                  <option value="ADMIN">Administrador</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="INSTRUCTOR">Professor</option>
                  <option value="STUDENT">Aluno</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" data-testid="btn-save-user">
                  {selectedUser ? 'Salvar' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" data-testid="modal-delete-user">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-sm p-6 animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-danger-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-danger-600" />
              </div>
              <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-2">Excluir Usuário</h3>
              <p className="text-sm text-gray-500 mb-6">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1" data-testid="btn-confirm-delete-user">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

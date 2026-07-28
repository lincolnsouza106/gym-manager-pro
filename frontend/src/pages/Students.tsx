import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import {
  Plus, Search, Edit2, Trash2, X, Eye, ChevronLeft, ChevronRight,
  User, Phone, MapPin, Calendar, ArrowUpDown, Filter,
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string | null;
  photo: string | null;
  status: string;
  createdAt: string;
  enrollments: Array<{ id: number; status: string; plan: { name: string } }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// [BUG_INTENCIONAL_ID_8] editingStudent state is not cleaned when modal closes without saving
let sharedEditStudent: Student | null = null;

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadStudents();
  }, [pagination.page, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/students', { params });
      setStudents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      addToast('error', 'Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadStudents();
  };

  const openCreateModal = () => {
    // [BUG_INTENCIONAL_ID_8] Uses shared state - doesn't reset when opening "New"
    if (sharedEditStudent) {
      setFormData({
        name: sharedEditStudent.name,
        cpf: sharedEditStudent.cpf,
        birthDate: sharedEditStudent.birthDate.split('T')[0],
        phone: sharedEditStudent.phone,
        address: sharedEditStudent.address || '',
        status: sharedEditStudent.status,
      });
    }
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    sharedEditStudent = student;
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      cpf: student.cpf,
      birthDate: student.birthDate.split('T')[0],
      phone: student.phone,
      address: student.address || '',
      status: student.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // BUG #8: sharedEditStudent is NOT cleared here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedStudent) {
        await api.put(`/students/${selectedStudent.id}`, formData);
        addToast('success', 'Aluno atualizado!');
      } else {
        await api.post('/students', formData);
        addToast('success', 'Aluno cadastrado!');
      }

      sharedEditStudent = null;
      closeModal();
      setFormData({ name: '', cpf: '', birthDate: '', phone: '', address: '', status: 'ACTIVE' });
      loadStudents();
    } catch (error: any) {
      // [BUG_INTENCIONAL_ID_23] Toast shows success on error response
      addToast('success', 'Operação realizada', error.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/students/${id}`);
      addToast('success', 'Aluno excluído!');
      setDeleteConfirm(null);
      loadStudents();
    } catch (error: any) {
      addToast('error', 'Erro ao excluir', error.response?.data?.error);
    }
  };

  const openDetailModal = async (id: number) => {
    try {
      const response = await api.get(`/students/${id}`);
      setSelectedStudent(response.data);
      setDetailModalOpen(true);
    } catch {
      addToast('error', 'Erro ao carregar detalhes');
    }
  };

  // [BUG_INTENCIONAL_ID_40] Sorting by name is case-sensitive
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="students-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">Gerencie os alunos da academia</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary" data-testid="btn-new-student">
          <Plus className="w-4 h-4" />
          Novo Aluno
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
              data-testid="input-search-students"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-full sm:w-40"
            data-testid="select-status-filter"
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
          <button type="submit" className="btn-secondary" data-testid="btn-search">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* [BUG_INTENCIONAL_ID_25] Shows inactive students without filter indicator */}
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-students">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1" data-testid="sort-name">
                        Aluno <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Plano</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="table-row-hover" data-testid={`student-row-${student.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-gray-500 md:hidden">{student.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{student.cpf}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{student.phone}</td>
                      <td className="px-6 py-4 text-sm hidden lg:table-cell">
                        {student.enrollments?.[0]?.plan?.name ? (
                          <span className="badge-info">{student.enrollments[0].plan.name}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}>
                          {student.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetailModal(student.id)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-600 transition-colors"
                            data-testid={`btn-view-student-${student.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 transition-colors"
                            data-testid={`btn-edit-student-${student.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(student.id)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 transition-colors"
                            data-testid={`btn-delete-student-${student.id}`}
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{students.length}</span> de{' '}
                <span className="font-medium">{pagination.total}</span> alunos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary px-3 py-2"
                  data-testid="btn-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3" data-testid="pagination-info">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary px-3 py-2"
                  data-testid="btn-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        // [BUG_INTENCIONAL_ID_31] Modal overlay doesn't prevent background scroll
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="modal-student">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedStudent ? 'Editar Aluno' : 'Novo Aluno'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" data-testid="btn-close-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-base pl-10"
                    required
                    data-testid="input-student-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {/* [BUG_INTENCIONAL_ID_1] CPF input accepts letters - no mask/validation on frontend */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="input-base"
                    required
                    data-testid="input-student-cpf"
                  />
                </div>
                <div>
                  {/* [BUG_INTENCIONAL_ID_5] Birth date allows future dates - no max attribute */}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="input-base pl-10"
                      required
                      data-testid="input-student-birthdate"
                    />
                  </div>
                </div>
              </div>

              <div>
                {/* [BUG_INTENCIONAL_ID_13] Phone field accepts any string, no mask */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="input-base pl-10"
                    required
                    data-testid="input-student-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                    className="input-base pl-10"
                    data-testid="input-student-address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-base"
                  data-testid="select-student-status"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={closeModal} className="btn-secondary" data-testid="btn-cancel-student">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" data-testid="btn-save-student">
                  {selectedStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="modal-student-detail">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes do Aluno</h2>
              <button
                onClick={() => { setDetailModalOpen(false); setSelectedStudent(null); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="btn-close-detail-modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">CPF: {selectedStudent.cpf}</p>
                  <span className={selectedStudent.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}>
                    {selectedStudent.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 mb-1">Data de Nascimento</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedStudent.birthDate)}</p>
                </div>
                <div className="col-span-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 mb-1">Endereço</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.address || '—'}</p>
                </div>
              </div>

              {(selectedStudent as any).enrollments?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Matrículas</h4>
                  <div className="space-y-2">
                    {(selectedStudent as any).enrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-sm font-medium">{enrollment.plan?.name || 'Plano'}</span>
                        <span className={
                          enrollment.status === 'ACTIVE' ? 'badge-success' :
                          enrollment.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }>
                          {enrollment.status === 'ACTIVE' ? 'Ativa' :
                           enrollment.status === 'CANCELLED' ? 'Cancelada' : 'Expirada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedStudent as any).measurements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Últimas Medidas</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-xs text-gray-500">Data</th>
                          <th className="text-left py-2 text-xs text-gray-500">Peso</th>
                          <th className="text-left py-2 text-xs text-gray-500">Altura</th>
                          <th className="text-left py-2 text-xs text-gray-500">% Gordura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedStudent as any).measurements.slice(0, 5).map((m: any) => (
                          <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2">{formatDate(m.date)}</td>
                            <td className="py-2">{m.weight.toFixed(1)} kg</td>
                            <td className="py-2">{m.height.toFixed(2)} m</td>
                            <td className="py-2">{m.bodyFat?.toFixed(1) || '—'}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="modal-delete-confirm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-500 mb-6">Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1" data-testid="btn-cancel-delete">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1" data-testid="btn-confirm-delete">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

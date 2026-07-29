import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import { Plus, X, Calendar, Clock, Users, UserCheck, Trash2 } from 'lucide-react';

interface Modality {
  id: number;
  name: string;
  description: string | null;
  maxCapacity: number;
  schedules: Schedule[];
}

interface Schedule {
  id: number;
  modalityId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  instructorId: number;
  instructor: { id: number; name: string };
  _count: { checkins: number };
  modality?: { name: string; maxCapacity: number };
}

interface Student {
  id: number;
  name: string;
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Classes() {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'modality' | 'schedule' | 'checkin' | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const { addToast } = useToast();

  const [modalityForm, setModalityForm] = useState({ name: '', description: '', maxCapacity: 20 });
  const [scheduleForm, setScheduleForm] = useState({
    modalityId: 0, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', instructorId: 0,
  });
  const [checkinStudentId, setCheckinStudentId] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modRes, schedRes, usersRes, studentsRes] = await Promise.all([
        api.get('/modalities'),
        api.get('/schedules'),
        // [BUG_INTENCIONAL_ID_43] Fetches ALL users for instructor dropdown instead of just instructors
        api.get('/users'),
        api.get('/students?limit=100'),
      ]);
      setModalities(modRes.data);
      setSchedules(schedRes.data);
      setAllUsers(usersRes.data);
      setStudents(studentsRes.data.data || []);
    } catch {
      addToast('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModality = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/modalities', modalityForm);
      addToast('success', 'Modalidade criada!');
      setModalType(null);
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro', error.response?.data?.error);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // [BUG_INTENCIONAL_ID_22] No overlap validation (backend doesn't check)
      await api.post('/schedules', scheduleForm);
      addToast('success', 'Horário criado!');
      setModalType(null);
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro', error.response?.data?.error);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    try {
      // [BUG_INTENCIONAL_ID_17] No capacity check on frontend (backend also doesn't enforce properly)
      // [BUG_INTENCIONAL_ID_36] Allows sending future checkin dates
      await api.post(`/schedules/${selectedSchedule.id}/checkin`, {
        studentId: checkinStudentId,
      });
      addToast('success', 'Check-in realizado!');
      setModalType(null);
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro no check-in', error.response?.data?.error);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await api.delete(`/schedules/${id}`);
      addToast('success', 'Horário excluído');
      loadData();
    } catch (error: any) {
      addToast('error', 'Erro', error.response?.data?.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="classes-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Aulas & Agenda</h1>
          <p className="page-subtitle">Gerencie modalidades, horários e check-ins</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalType('modality')} className="btn-secondary" data-testid="btn-new-modality">
            <Plus className="w-4 h-4" />
            Modalidade
          </button>
          <button onClick={() => setModalType('schedule')} className="btn-primary" data-testid="btn-new-schedule">
            <Plus className="w-4 h-4" />
            Horário
          </button>
        </div>
      </div>

      {/* Modalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
        ) : (
          modalities.map((modality) => (
            <div key={modality.id} className="glass-card rounded-2xl p-5 card-accent-purple" data-testid={`modality-card-${modality.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-surface-900 dark:text-white">{modality.name}</h3>
                  <p className="text-xs text-gray-500">{modality.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  Max: {modality.maxCapacity}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {modality.schedules?.length || 0} horários
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h3 className="font-semibold font-display text-surface-900 dark:text-white">Grade de Horários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-schedules">
            <thead>
              <tr className="bg-surface-50/50 dark:bg-surface-800/30 border-b border-surface-200 dark:border-surface-800">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modalidade</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dia</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Instrutor</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-ins</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="table-row-hover" data-testid={`schedule-row-${schedule.id}`}>
                  <td className="px-6 py-4">
                    <span className="badge-info">{schedule.modality?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{dayNames[schedule.dayOfWeek]}</td>
                  <td className="px-6 py-4 text-sm font-medium font-mono text-surface-900 dark:text-white">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                    {schedule.instructor?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{schedule._count?.checkins || 0}</span>
                    <span className="text-xs text-gray-500">/{schedule.modality?.maxCapacity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedSchedule(schedule); setModalType('checkin'); }}
                        className="p-2 rounded-lg text-gray-400 hover:bg-success-50 dark:hover:bg-emerald-950/30 hover:text-success-600 transition-all duration-200"
                        title="Check-in"
                        data-testid={`btn-checkin-${schedule.id}`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 dark:hover:bg-red-950/30 hover:text-danger-600 transition-all duration-200"
                        data-testid={`btn-delete-schedule-${schedule.id}`}
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
      </div>

      {/* Modality Modal */}
      {modalType === 'modality' && (
        <div className="modal-overlay" data-testid="modal-modality">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">Nova Modalidade</h2>
              <button onClick={() => setModalType(null)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-modality-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateModality} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Nome</label>
                <input type="text" value={modalityForm.name} onChange={(e) => setModalityForm({ ...modalityForm, name: e.target.value })} className="input-base" required data-testid="input-modality-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Descrição</label>
                <textarea value={modalityForm.description} onChange={(e) => setModalityForm({ ...modalityForm, description: e.target.value })} className="input-base h-20 resize-none" data-testid="input-modality-description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Capacidade Máxima</label>
                <input type="number" value={modalityForm.maxCapacity} onChange={(e) => setModalityForm({ ...modalityForm, maxCapacity: parseInt(e.target.value) })} min="1" className="input-base" data-testid="input-modality-capacity" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" data-testid="btn-save-modality">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {modalType === 'schedule' && (
        <div className="modal-overlay" data-testid="modal-schedule">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">Novo Horário</h2>
              <button onClick={() => setModalType(null)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-schedule-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Modalidade</label>
                <select value={scheduleForm.modalityId} onChange={(e) => setScheduleForm({ ...scheduleForm, modalityId: parseInt(e.target.value) })} className="input-base" required data-testid="select-schedule-modality">
                  <option value={0}>Selecione</option>
                  {modalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Dia</label>
                  <select value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(e.target.value) })} className="input-base" data-testid="select-schedule-day">
                    {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Início</label>
                  <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} className="input-base" data-testid="input-schedule-start" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Fim</label>
                  <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} className="input-base" data-testid="input-schedule-end" />
                </div>
              </div>
              <div>
                {/* [BUG_INTENCIONAL_ID_43] Shows ALL users, not just instructors */}
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Instrutor</label>
                <select value={scheduleForm.instructorId} onChange={(e) => setScheduleForm({ ...scheduleForm, instructorId: parseInt(e.target.value) })} className="input-base" required data-testid="select-schedule-instructor">
                  <option value={0}>Selecione</option>
                  {allUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" data-testid="btn-save-schedule">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {modalType === 'checkin' && selectedSchedule && (
        <div className="modal-overlay" data-testid="modal-checkin">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-md animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white">Check-in de Aluno</h2>
              <button onClick={() => setModalType(null)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" data-testid="btn-close-checkin-modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCheckin} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-800/30">
                <p className="text-sm text-gray-500">Aula</p>
                <p className="font-medium font-display text-surface-900 dark:text-white">{selectedSchedule.modality?.name}</p>
                <p className="text-xs text-gray-500 font-mono">{dayNames[selectedSchedule.dayOfWeek]} {selectedSchedule.startTime}-{selectedSchedule.endTime}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">Aluno</label>
                <select value={checkinStudentId} onChange={(e) => setCheckinStudentId(parseInt(e.target.value))} className="input-base" required data-testid="select-checkin-student">
                  <option value={0}>Selecione um aluno</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" data-testid="btn-confirm-checkin">Confirmar Check-in</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { Cita, TipoCita, EstadoCita } from '../../types';
import { ActiveTab } from '../Sidebar';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  Filter,
  PawPrint,
} from 'lucide-react';

interface CitasViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onStartConsultationForCita?: (idCita: number) => void;
}

export const CitasView: React.FC<CitasViewProps> = ({
  onNavigateTab,
  onStartConsultationForCita,
}) => {
  const {
    citas,
    mascotas,
    propietarios,
    veterinarios,
    agendarCita,
    cambiarEstadoCita,
    currentRole,
    currentUser,
  } = useStore();

  const [filterEstado, setFilterEstado] = useState<string>('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Default appointment time: tomorrow at 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10) + 'T10:00';

  const [citaForm, setCitaForm] = useState({
    id_mascota: mascotas[0]?.id_mascota || 1,
    id_propietario: mascotas[0]?.id_propietario || 1,
    id_veterinario: veterinarios[0]?.id_veterinario || 1,
    fecha_hora: defaultDateStr,
    motivo_general: '',
    tipo_cita: 'CONSULTA' as TipoCita,
    estado: 'PENDIENTE' as EstadoCita,
  });

  // Filter for owner role
  const ownerRecord = propietarios.find((p) => p.id_usuario === currentUser.id_usuario);
  const displayedCitas = (
    currentRole === 'PROPIETARIO' && ownerRecord
      ? citas.filter((c) => c.id_propietario === ownerRecord.id_propietario)
      : citas
  ).filter((c) => filterEstado === 'TODAS' || c.estado === filterEstado);

  // Handler for pet change in form -> auto update owner
  const handlePetChange = (id_mascota: number) => {
    const pet = mascotas.find((m) => m.id_mascota === id_mascota);
    setCitaForm((prev) => ({
      ...prev,
      id_mascota,
      id_propietario: pet ? pet.id_propietario : prev.id_propietario,
    }));
  };

  const handleAgendar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!citaForm.motivo_general.trim()) {
      setFormFeedback({ text: 'Por favor indique el motivo de la consulta', isError: true });
      return;
    }

    const res = agendarCita(citaForm);
    if (res.success) {
      setFormFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowModal(false);
        setFormFeedback(null);
        setCitaForm({
          id_mascota: mascotas[0]?.id_mascota || 1,
          id_propietario: mascotas[0]?.id_propietario || 1,
          id_veterinario: veterinarios[0]?.id_veterinario || 1,
          fecha_hora: defaultDateStr,
          motivo_general: '',
          tipo_cita: 'CONSULTA',
          estado: 'PENDIENTE',
        });
      }, 1000);
    } else {
      setFormFeedback({ text: res.message, isError: true });
    }
  };

  const statusBadgeConfig: Record<EstadoCita, { label: string; bg: string; text: string; border: string }> = {
    PENDIENTE: { label: 'Pendiente', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#D97706]/25' },
    CONFIRMADA: { label: 'Confirmada', bg: 'bg-[#F0FDFA]', text: 'text-[#0D9488]', border: 'border-[#0D9488]/25' },
    ATENDIDA: { label: 'Atendida', bg: 'bg-[#F0FDFA]', text: 'text-[#0D9488]', border: 'border-[#0D9488]/25' },
    CANCELADA: { label: 'Cancelada', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#DC2626]/25' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#17191c] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#5d2a1a]" />
            <span>Control y Agendamiento de Citas (RF07)</span>
          </h2>
          <p className="text-xs text-[#777b86] mt-0.5">
            Detección automática de cruces de agenda por veterinario y gestión de estados clínicos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-[#17191c] text-[#ffffff] hover:bg-[#17191c] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita Médica</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['TODAS', 'PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterEstado(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              filterEstado === st
                ? 'bg-[#17191c] text-[#ffffff] shadow-xs'
                : 'bg-[#ffffff] text-[#777b86] hover:bg-[#f2f2f3] border border-[#ececec]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Citas List */}
      <div className="space-y-3">
        {displayedCitas.map((cita) => {
          const pet = mascotas.find((m) => m.id_mascota === cita.id_mascota);
          const owner = propietarios.find((p) => p.id_propietario === cita.id_propietario);
          const vet = veterinarios.find((v) => v.id_veterinario === cita.id_veterinario);
          const badge = statusBadgeConfig[cita.estado];

          const dateObj = new Date(cita.fecha_hora);
          const isPast = dateObj.getTime() < Date.now();

          return (
            <div
              key={cita.id_cita}
              className="p-4 bg-[#ffffff] rounded-[20px] border border-[#ececec] hover:border-[#ececec] transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#17191c] text-[#ffffff] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase text-[#5d2a1a]">
                    {dateObj.toLocaleDateString([], { month: 'short' })}
                  </span>
                  <span className="text-base font-black leading-none">
                    {dateObj.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-[#17191c]">
                      {pet?.nombre} ({pet?.especie})
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f2f2f3] text-[#777b86]">
                      {pet?.codigo_expediente}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {cita.tipo_cita}
                    </span>
                  </div>

                  <p className="text-xs text-[#777b86] font-medium">{cita.motivo_general}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#777b86] pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#777b86]" />
                      <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-[#777b86]" />
                      <span>{vet?.nombres || 'Dr. Asignado'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#777b86]" />
                      <span>Tutor: {owner ? `${owner.nombres} ${owner.apellidos}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {cita.estado === 'PENDIENTE' && (
                  <>
                    <button
                      onClick={() => cambiarEstadoCita(cita.id_cita, 'CONFIRMADA')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Confirmar</span>
                    </button>
                    <button
                      onClick={() => cambiarEstadoCita(cita.id_cita, 'CANCELADA')}
                      className="px-2.5 py-1.5 bg-[#f2f2f3] hover:bg-[#f2f2f3] text-[#777b86] rounded-lg text-xs transition-colors"
                      title="Cancelar Cita"
                    >
                      <XCircle className="w-3.5 h-3.5 text-[#777b86]" />
                    </button>
                  </>
                )}

                {cita.estado === 'CONFIRMADA' && (
                  <>
                    {currentRole !== 'PROPIETARIO' && (
                      <button
                        onClick={() => {
                          if (onStartConsultationForCita) {
                            onStartConsultationForCita(cita.id_cita);
                          }
                          onNavigateTab('consultas');
                        }}
                        className="px-3.5 py-1.5 bg-[#17191c] text-[#ffffff] hover:bg-[#17191c] text-[#ffffff] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Atender (RF08)</span>
                      </button>
                    )}
                    <button
                      onClick={() => cambiarEstadoCita(cita.id_cita, 'CANCELADA')}
                      className="px-2.5 py-1.5 text-[#777b86] hover:text-red-600 rounded-lg text-xs"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </>
                )}

                {cita.estado === 'ATENDIDA' && (
                  <span className="text-xs font-semibold text-[#5d2a1a] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Consulta finalizada</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayedCitas.length === 0 && (
        <div className="p-12 text-center bg-[#ffffff] rounded-[20px] border border-[#ececec]">
          <CalendarDays className="w-12 h-12 text-[#777b86] mx-auto mb-2" />
          <h3 className="font-bold text-[#777b86]">No hay citas en este estado</h3>
          <p className="text-xs text-[#777b86] mt-1">Programa una nueva cita médica usando el botón superior.</p>
        </div>
      )}

      {/* Modal: Agendar Cita */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-lg w-full border border-[#ececec] overflow-hidden">
            <div className="px-6 py-4 bg-[#f2f2f3] text-[#17191c] border-b border-[#ececec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#5d2a1a]" />
                <h3 className="font-bold text-base">RF07: Agendamiento de Cita Médica</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#777b86] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgendar} className="p-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">Paciente / Mascota</label>
                  <select
                    value={citaForm.id_mascota}
                    onChange={(e) => handlePetChange(Number(e.target.value))}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    {mascotas.map((m) => (
                      <option key={m.id_mascota} value={m.id_mascota}>
                        {m.nombre} ({m.especie} - {m.raza}) [{m.codigo_expediente}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">Médico Veterinario Asignado</label>
                  <select
                    value={citaForm.id_veterinario}
                    onChange={(e) => setCitaForm({ ...citaForm, id_veterinario: Number(e.target.value) })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    {veterinarios.map((v) => (
                      <option key={v.id_veterinario} value={v.id_veterinario}>
                        {v.nombres} {v.apellidos} ({v.especialidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#777b86] mb-1">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      required
                      value={citaForm.fecha_hora}
                      onChange={(e) => setCitaForm({ ...citaForm, fecha_hora: e.target.value })}
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#777b86] mb-1">Tipo de Cita</label>
                    <select
                      value={citaForm.tipo_cita}
                      onChange={(e) => setCitaForm({ ...citaForm, tipo_cita: e.target.value as TipoCita })}
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    >
                      <option value="CONSULTA">CONSULTA</option>
                      <option value="VACUNACION">VACUNACION</option>
                      <option value="CONTROL">CONTROL</option>
                      <option value="URGENCIA">URGENCIA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">
                    Motivo de la Cita / Síntomas Iniciales
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={citaForm.motivo_general}
                    onChange={(e) => setCitaForm({ ...citaForm, motivo_general: e.target.value })}
                    placeholder="ej. Decaimiento, pérdida de apetito o control posoperatorio..."
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>
              </div>

              {/* Conflict Prevention Note */}
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900">
                <strong>Garantía RF07:</strong> El sistema valida en la base de datos que el veterinario no tenga otra cita asignada en el mismo intervalo para evitar traslapes.
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    formFeedback.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#ececec]'
                  }`}
                >
                  {formFeedback.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5d2a1a]" />
                  )}
                  <span>{formFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#777b86] rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17191c] text-[#ffffff] hover:bg-[#17191c] text-[#ffffff] rounded-lg text-xs font-bold"
                >
                  Programar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

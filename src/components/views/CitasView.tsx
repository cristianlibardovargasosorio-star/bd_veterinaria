import React, { useRef, useState } from 'react';
import { useStore } from '../../db/store';
import { agendarCitaApi, cambiarEstadoCitaApi } from '../../services/pacientesApiService';
import { TipoCita, EstadoCita } from '../../types';
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
  X,
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
    sesionReal,
    jwtToken,
    recargarPacientes,
  } = useStore();

  const [filterEstado, setFilterEstado] = useState<string>('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const ownerRecord = propietarios.find((p) => p.id_usuario === currentUser.id_usuario);
  const selectablePets = currentRole === 'PROPIETARIO'
    ? mascotas.filter((pet) => pet.id_propietario === ownerRecord?.id_propietario)
    : mascotas;

  // Default appointment time: tomorrow at 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10) + 'T10:00';

  const [citaForm, setCitaForm] = useState({
    id_mascota: selectablePets[0]?.id_mascota ?? 0,
    id_propietario: selectablePets[0]?.id_propietario ?? 0,
    id_veterinario: veterinarios[0]?.id_veterinario || 1,
    fecha_hora: defaultDateStr,
    motivo_general: '',
    tipo_cita: 'CONSULTA' as TipoCita,
    estado: 'PENDIENTE' as EstadoCita,
  });

  // Filter for owner role
  const displayedCitas = (
    currentRole === 'PROPIETARIO'
      ? citas.filter((c) => c.id_propietario === ownerRecord?.id_propietario)
      : citas
  ).filter((c) => filterEstado === 'TODAS' || c.estado === filterEstado);

  const selectedCita = displayedCitas.find((cita) => cita.id_cita === selectedCitaId);
  const selectedPet = mascotas.find((pet) => pet.id_mascota === selectedCita?.id_mascota);
  const selectedOwner = propietarios.find((owner) => owner.id_propietario === selectedCita?.id_propietario);
  const selectedVet = veterinarios.find((vet) => vet.id_veterinario === selectedCita?.id_veterinario);

  // Handler for pet change in form -> auto update owner
  const handlePetChange = (id_mascota: number) => {
    const pet = selectablePets.find((m) => m.id_mascota === id_mascota);
    setCitaForm((prev) => ({
      ...prev,
      id_mascota,
      id_propietario: pet ? pet.id_propietario : prev.id_propietario,
    }));
  };

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    if (!selectablePets.some((pet) => pet.id_mascota === citaForm.id_mascota)) {
      setFormFeedback({ text: 'Selecciona una mascota para agendar la cita.', isError: true });
      return;
    }

    if (!citaForm.motivo_general.trim()) {
      setFormFeedback({ text: 'Por favor indique el motivo de la consulta', isError: true });
      return;
    }

    let res: { success: boolean; message: string };
    if (sesionReal) {
      if (!jwtToken) return;
      setGuardandoCita(true);
      try {
        await agendarCitaApi(jwtToken, citaForm);
        recargarPacientes();
        res = { success: true, message: 'Cita guardada en VetSoft.' };
      } catch (error) {
        res = { success: false, message: (error as Error).message };
      } finally {
        setGuardandoCita(false);
      }
    } else {
      res = agendarCita(citaForm);
    }
    if (res.success) {
      setFormFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowModal(false);
        setFormFeedback(null);
        setCitaForm({
          id_mascota: selectablePets[0]?.id_mascota ?? 0,
          id_propietario: selectablePets[0]?.id_propietario ?? 0,
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

  const actualizarEstado = async (id: number, estado: EstadoCita) => {
    if (!sesionReal) {
      cambiarEstadoCita(id, estado);
      return;
    }
    if (!jwtToken) return;
    setErrorEstado(null);
    try {
      await cambiarEstadoCitaApi(jwtToken, id, estado);
      recargarPacientes();
    } catch (error) {
      setErrorEstado((error as Error).message);
    }
  };

  const statusBadgeConfig: Record<EstadoCita, { label: string; bg: string; text: string; border: string }> = {
    PENDIENTE: { label: 'Pendiente', bg: 'bg-vet-amber-soft', text: 'text-vet-amber-ink', border: 'border-vet-amber/35' },
    CONFIRMADA: { label: 'Confirmada', bg: 'bg-vet-ice', text: 'text-vet-emerald-hover', border: 'border-vet-emerald/30' },
    ATENDIDA: { label: 'Atendida', bg: 'bg-vet-ice', text: 'text-vet-navy', border: 'border-vet-border' },
    CANCELADA: { label: 'Cancelada', bg: 'bg-vet-danger-soft', text: 'text-vet-danger-ink', border: 'border-vet-danger/25' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-vet-navy" />
            <span>Control y Agendamiento de Citas</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Detección automática de cruces de agenda por veterinario y gestión de estados clínicos.
          </p>
        </div>

        <button
          onClick={() => {
            setCitaForm((form) => ({
              ...form, id_mascota: selectablePets[0]?.id_mascota ?? 0,
              id_propietario: selectablePets[0]?.id_propietario ?? 0,
              id_veterinario: veterinarios[0]?.id_veterinario ?? 0,
            }));
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita Médica</span>
        </button>
      </div>

      {/* Filter Tabs */}
      {errorEstado && <p role="alert" className="text-sm text-vet-danger-ink">{errorEstado}</p>}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['TODAS', 'PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterEstado(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              filterEstado === st
                ? 'bg-vet-emerald text-white shadow-xs'
                : 'bg-vet-surface text-vet-muted hover:bg-vet-ice border border-vet-border'
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
          return (
            <div
              key={cita.id_cita}
              className="relative flex flex-col justify-between gap-3 rounded-[20px] border border-vet-border bg-vet-surface p-[16px] shadow-xs transition-colors hover:border-vet-emerald/50 md:flex-row md:items-center"
            >
              <div className="flex min-w-0 items-start gap-[12px]">
                <time
                  dateTime={cita.fecha_hora}
                  className="flex size-[46px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-vet-emerald/25 bg-vet-ice text-vet-emerald-hover"
                >
                  <span className="text-[10px] font-bold uppercase leading-none">
                    {dateObj.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-base font-black leading-none">
                    {dateObj.getDate()}
                  </span>
                </time>

                <div className="min-w-0 space-y-1 break-words">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-vet-navy">
                      {pet?.nombre} ({pet?.especie})
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-vet-ice text-vet-muted">
                      {pet?.codigo_expediente}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {cita.tipo_cita}
                    </span>
                  </div>

                  <p className="text-xs text-vet-muted font-medium">{cita.motivo_general}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-vet-muted pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-vet-muted" />
                      <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-vet-muted" />
                      <span>{vet?.nombres || 'Dr. Asignado'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-vet-muted" />
                      <span>Tutor: {owner ? `${owner.nombres} ${owner.apellidos}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 self-end md:self-center md:shrink-0 [&>button:not(:first-child)]:relative [&>button:not(:first-child)]:z-10">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`Ver detalle de la cita de ${pet?.nombre ?? 'la mascota'}`}
                  onClick={() => {
                    setSelectedCitaId(cita.id_cita);
                    detailsDialogRef.current?.showModal();
                  }}
                  className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-vet-emerald-hover hover:bg-vet-ice"
                >
                  <span className="absolute inset-0 rounded-[20px]" aria-hidden="true" />
                  Ver detalle
                </button>
                {cita.estado === 'PENDIENTE' && (
                  <>
                    <button
                      onClick={() => void actualizarEstado(cita.id_cita, 'CONFIRMADA')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Confirmar</span>
                    </button>
                    <button
                      onClick={() => void actualizarEstado(cita.id_cita, 'CANCELADA')}
                      className="px-2.5 py-1.5 bg-vet-ice hover:bg-vet-ice text-vet-muted rounded-lg text-xs transition-colors"
                      title="Cancelar Cita"
                    >
                      <XCircle className="w-3.5 h-3.5 text-vet-muted" />
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
                        className="px-3.5 py-1.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Atender</span>
                      </button>
                    )}
                    <button
                      onClick={() => void actualizarEstado(cita.id_cita, 'CANCELADA')}
                      className="px-2.5 py-1.5 text-vet-muted hover:text-red-600 rounded-lg text-xs"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </>
                )}

                {cita.estado === 'ATENDIDA' && (
                  <span className="text-xs font-semibold text-vet-navy flex items-center gap-1">
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
        <div className="p-12 text-center bg-vet-surface rounded-[20px] border border-vet-border">
          <CalendarDays className="w-12 h-12 text-vet-muted mx-auto mb-2" />
          <h3 className="font-bold text-vet-muted">No hay citas en este estado</h3>
          <p className="text-xs text-vet-muted mt-1">Programa una nueva cita médica usando el botón superior.</p>
        </div>
      )}

      <dialog
        ref={detailsDialogRef}
        aria-labelledby="cita-details-title"
        onClose={() => setSelectedCitaId(null)}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[20px] border border-vet-border bg-vet-surface text-vet-navy shadow-2xl backdrop:bg-vet-navy/40"
      >
        <header className="flex items-center justify-between gap-4 border-b border-vet-border bg-vet-ice px-6 py-4">
          <h3 id="cita-details-title" className="text-base font-bold">Detalle de la cita</h3>
          <form method="dialog">
            <button type="submit" aria-label="Cerrar detalle" className="rounded-lg p-2 hover:bg-vet-surface">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </header>
        {selectedCita && (
          <dl className="grid grid-cols-2 gap-4 p-6 text-sm">
            <div>
              <dt className="font-semibold">Mascota</dt>
              <dd className="text-vet-muted">{selectedPet ? `${selectedPet.nombre} (${selectedPet.especie})` : 'Sin datos'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Expediente</dt>
              <dd className="text-vet-muted">{selectedPet?.codigo_expediente || 'Sin datos'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-semibold">Fecha y hora</dt>
              <dd className="text-vet-muted">
                {new Date(selectedCita.fecha_hora).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Veterinario</dt>
              <dd className="text-vet-muted">{selectedVet ? `${selectedVet.nombres} ${selectedVet.apellidos}` : 'Sin datos'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Tutor</dt>
              <dd className="text-vet-muted">{selectedOwner ? `${selectedOwner.nombres} ${selectedOwner.apellidos}` : 'Sin datos'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Tipo de cita</dt>
              <dd className="text-vet-muted">{selectedCita.tipo_cita === 'VACUNACION' ? 'VACUNACIÓN' : selectedCita.tipo_cita}</dd>
            </div>
            <div>
              <dt className="font-semibold">Estado</dt>
              <dd className="text-vet-muted">{statusBadgeConfig[selectedCita.estado].label}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-semibold">Motivo de la cita</dt>
              <dd className="whitespace-pre-wrap break-words text-vet-muted">{selectedCita.motivo_general || 'Sin datos'}</dd>
            </div>
          </dl>
        )}
      </dialog>

      {/* Modal: Agendar Cita */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vet-surface/60 backdrop-blur-xs p-4">
          <div className="bg-vet-surface rounded-[20px] shadow-2xl max-w-lg w-full border border-vet-border overflow-hidden">
            <div className="px-6 py-4 bg-vet-ice text-vet-navy border-b border-vet-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-vet-navy" />
                <h3 className="font-bold text-base">Agendamiento de Cita Médica</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-vet-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgendar} className="p-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-vet-muted mb-1">Paciente / Mascota</label>
                  <select
                    value={citaForm.id_mascota}
                    onChange={(e) => handlePetChange(Number(e.target.value))}
                    className="w-full p-2 border border-vet-border rounded-lg"
                  >
                    {!selectablePets.length && <option value={0}>No hay mascotas disponibles</option>}
                    {selectablePets.map((m) => (
                      <option key={m.id_mascota} value={m.id_mascota}>
                        {m.nombre} ({m.especie} - {m.raza}) [{m.codigo_expediente}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-vet-muted mb-1">Médico Veterinario Asignado</label>
                  <select
                    value={citaForm.id_veterinario}
                    onChange={(e) => setCitaForm({ ...citaForm, id_veterinario: Number(e.target.value) })}
                    className="w-full p-2 border border-vet-border rounded-lg"
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
                    <label className="block font-semibold text-vet-muted mb-1">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      required
                      value={citaForm.fecha_hora}
                      onChange={(e) => setCitaForm({ ...citaForm, fecha_hora: e.target.value })}
                      className="w-full p-2 border border-vet-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-vet-muted mb-1">Tipo de Cita</label>
                    <select
                      value={citaForm.tipo_cita}
                      onChange={(e) => setCitaForm({ ...citaForm, tipo_cita: e.target.value as TipoCita })}
                      className="w-full p-2 border border-vet-border rounded-lg"
                    >
                      <option value="CONSULTA">CONSULTA</option>
                      <option value="VACUNACION">VACUNACION</option>
                      <option value="CONTROL">CONTROL</option>
                      <option value="URGENCIA">URGENCIA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-vet-muted mb-1">
                    Motivo de la Cita / Síntomas Iniciales
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={citaForm.motivo_general}
                    onChange={(e) => setCitaForm({ ...citaForm, motivo_general: e.target.value })}
                    placeholder="ej. Decaimiento, pérdida de apetito o control posoperatorio..."
                    className="w-full p-2 border border-vet-border rounded-lg"
                  />
                </div>
              </div>

              {/* Conflict Prevention Note */}
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900">
                <strong>Disponibilidad:</strong> El sistema valida en la base de datos que el veterinario no tenga otra cita asignada en el mismo intervalo para evitar traslapes.
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    formFeedback.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-vet-ice text-vet-navy border border-vet-border'
                  }`}
                >
                  {formFeedback.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-vet-navy" />
                  )}
                  <span>{formFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-vet-border text-vet-muted rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCita || formFeedback?.isError === false}
                  className="px-4 py-2 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-lg text-xs font-bold"
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

import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { kilosALibras, librasAKilos, mostrarPesoEnLibras } from '../../utils/peso';
import { registrarConsultaApi } from '../../services/pacientesApiService';
import { ConsultaMedica } from '../../types';
import { ActiveTab } from '../Sidebar';
import {
  Stethoscope,
  Plus,
  Heart,
  Thermometer,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  User,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface ConsultasViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectConsultaForAI?: (idConsulta: number) => void;
  selectedCitaIdForNewConsulta?: number | null;
}

export const ConsultasView: React.FC<ConsultasViewProps> = ({
  onNavigateTab,
  onSelectConsultaForAI,
  selectedCitaIdForNewConsulta,
}) => {
  const {
    consultas,
    citas,
    mascotas,
    veterinarios,
    registrarConsulta,
    fichasIA,
    currentUser,
    sesionReal,
    jwtToken,
    recargarPacientes,
  } = useStore();

  const [showModal, setShowModal] = useState(!!selectedCitaIdForNewConsulta);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [createdConsultaId, setCreatedConsultaId] = useState<number | null>(null);
  const [guardandoConsulta, setGuardandoConsulta] = useState(false);

  // Available appointments for consultation
  const pendingCitas = citas.filter((c) => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE');

  // Form State
  const initialCita = selectedCitaIdForNewConsulta
    ? citas.find((c) => c.id_cita === selectedCitaIdForNewConsulta)
    : pendingCitas[0] || citas[0];

  const [form, setForm] = useState({
    id_cita: initialCita?.id_cita || 101,
    id_mascota: initialCita?.id_mascota || mascotas[0]?.id_mascota || 1,
    id_veterinario: initialCita?.id_veterinario || veterinarios[0]?.id_veterinario || 1,
    frecuencia_cardiaca: 95,
    temperatura_c: 38.8,
    peso_lb: kilosALibras(mascotas.find((m) => m.id_mascota === initialCita?.id_mascota)?.peso_kg || 15),
    anamnesis_sintomas: initialCita?.motivo_general || '',
    diagnostico: '',
    tratamiento_recetado: '',
    observaciones: '',
  });

  const handleCitaSelect = (idCita: number) => {
    const c = citas.find((ci) => ci.id_cita === idCita);
    if (c) {
      const pet = mascotas.find((m) => m.id_mascota === c.id_mascota);
      setForm((prev) => ({
        ...prev,
        id_cita: c.id_cita,
        id_mascota: c.id_mascota,
        id_veterinario: c.id_veterinario,
        peso_lb: pet?.peso_kg ? kilosALibras(pet.peso_kg) : prev.peso_lb,
        anamnesis_sintomas: c.motivo_general,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!form.diagnostico.trim() || !form.tratamiento_recetado.trim()) {
      setFormFeedback({
        text: 'El diagnóstico y el tratamiento son obligatorios.',
        isError: true,
      });
      return;
    }

    const { peso_lb, ...datosConsulta } = form;
    const consulta = { ...datosConsulta, peso_actual: librasAKilos(peso_lb) };
    if (sesionReal) {
      if (!jwtToken) return;
      setGuardandoConsulta(true);
      try {
        const respuesta = await registrarConsultaApi(jwtToken, consulta);
        recargarPacientes();
        setFormFeedback({ text: 'Consulta guardada en VetSoft.', isError: false });
        setCreatedConsultaId(respuesta.idConsulta);
      } catch (error) {
        setFormFeedback({ text: (error as Error).message, isError: true });
      } finally {
        setGuardandoConsulta(false);
      }
      return;
    }
    const res = registrarConsulta(consulta);
    if (res.success && res.data) {
      setFormFeedback({ text: res.message, isError: false });
      setCreatedConsultaId(res.data.id_consulta);
    } else {
      setFormFeedback({ text: res.message, isError: true });
    }
  };

  const handleProceedToAI = (idConsulta: number) => {
    if (onSelectConsultaForAI) {
      onSelectConsultaForAI(idConsulta);
    }
    setShowModal(false);
    onNavigateTab('fichas-ia');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-vet-navy" />
            <span>Consultas Médicas Clínicas</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Registro de constantes vitales, anamnesis, diagnóstico y tratamiento.
          </p>
        </div>

        <button
          onClick={() => {
            if (pendingCitas[0]) handleCitaSelect(pendingCitas[0].id_cita);
            setCreatedConsultaId(null);
            setFormFeedback(null);
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Consulta Médica</span>
        </button>
      </div>

      {/* Consultas List */}
      <div className="space-y-4">
        {consultas.map((cons) => {
          const pet = mascotas.find((m) => m.id_mascota === cons.id_mascota);
          const vet = veterinarios.find((v) => v.id_veterinario === cons.id_veterinario);
          const ficha = fichasIA.find((f) => f.id_consulta === cons.id_consulta);

          return (
            <div
              key={cons.id_consulta}
              className="p-5 bg-vet-surface rounded-[20px] border border-vet-border hover:border-vet-border transition-all shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-vet-ice text-vet-navy font-black flex items-center justify-center text-sm">
                    #{cons.id_consulta}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-vet-navy">
                        {pet?.nombre} · {pet?.especie} · {pet?.raza}
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-vet-ice text-vet-muted">
                        {pet?.codigo_expediente}
                      </span>
                    </div>
                    <p className="text-xs text-vet-muted">
                      Atendido por: <strong className="text-vet-muted">{vet?.nombres || 'Dr. Médico'}</strong> • Cita vinculada #{cons.id_cita}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-vet-muted">
                    {new Date(cons.fecha_consulta).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="text-[10px] text-vet-muted">
                    {new Date(cons.fecha_consulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-vet-surface rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="text-vet-muted block text-[10px]">Frec. Cardíaca</span>
                    <strong className="text-vet-navy">{cons.frecuencia_cardiaca || '--'} lpm</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-vet-muted block text-[10px]">Temperatura</span>
                    <strong className="text-vet-navy">{cons.temperatura_c || '--'} °C</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Scale className="w-4 h-4 text-vet-emerald" />
                  <div>
                    <span className="text-vet-muted block text-[10px]">Peso Paciente</span>
                    <strong className="text-vet-navy">{mostrarPesoEnLibras(cons.peso_actual)}</strong>
                  </div>
                </div>
              </div>

              {/* Anamnesis & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-vet-muted uppercase text-[10px]">
                    Anamnesis y Síntomas
                  </span>
                  <p className="text-vet-muted bg-vet-surface p-2.5 rounded-lg border border-slate-100">
                    {cons.anamnesis_sintomas}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-vet-navy uppercase text-[10px]">
                    Diagnóstico Definitivo
                  </span>
                  <p className="text-vet-navy font-semibold bg-vet-ice text-vet-navy/50 p-2.5 rounded-lg border border-vet-border">
                    {cons.diagnostico}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-vet-muted uppercase text-[10px]">
                  Tratamiento Recetado & Posología
                </span>
                <p className="text-vet-muted bg-vet-surface p-2.5 rounded-lg border border-slate-100">
                  {cons.tratamiento_recetado}
                </p>
              </div>

              {/* Bottom Actions / AI Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {ficha ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-vet-navy font-bold bg-vet-ice text-vet-navy px-2.5 py-1 rounded-lg border border-vet-border">
                      <Sparkles className="w-3.5 h-3.5 text-vet-navy" />
                      Ficha médica disponible
                    </span>
                    {ficha.aprobado_por_veterinario && (
                      <span className="text-[11px] font-bold text-vet-emerald bg-vet-ice px-2 py-0.5 rounded border border-vet-border">
                        ✓ Aprobada por Médico
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-vet-muted">Sin ficha médica</span>
                )}

                <button
                  onClick={() => handleProceedToAI(cons.id_consulta)}
                  className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{ficha ? 'Ver ficha médica' : 'Generar ficha médica'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Registrar Consulta Médica */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vet-surface/60 backdrop-blur-xs p-4">
          <div className="bg-vet-surface rounded-[20px] shadow-2xl max-w-2xl w-full border border-vet-border overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-vet-ice text-vet-navy border-b border-vet-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-vet-navy" />
                <h3 className="font-bold text-base">Registro de Consulta Médica</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-vet-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {!createdConsultaId ? (
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  {/* Cita select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-vet-muted mb-1">Cita Vinculada</label>
                      <select
                        value={form.id_cita}
                        onChange={(e) => handleCitaSelect(Number(e.target.value))}
                        className="w-full p-2 border border-vet-border rounded-lg"
                      >
                        {(sesionReal ? pendingCitas : citas).map((c) => {
                          const pet = mascotas.find((m) => m.id_mascota === c.id_mascota);
                          return (
                            <option key={c.id_cita} value={c.id_cita}>
                              Cita #{c.id_cita}: {pet?.nombre} - {c.tipo_cita} ({c.estado})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-vet-muted mb-1">Médico Veterinario</label>
                      <select
                        value={form.id_veterinario}
                        onChange={(e) => setForm({ ...form, id_veterinario: Number(e.target.value) })}
                        className="w-full p-2 border border-vet-border rounded-lg"
                      >
                        {veterinarios.map((v) => (
                          <option key={v.id_veterinario} value={v.id_veterinario}>
                            {v.nombres} {v.apellidos} ({v.tarjeta_profesional})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Constantes Vitales */}
                  <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
                    <span className="block font-bold text-vet-muted uppercase tracking-wider text-[11px] mb-2">
                      Constantes Vitales del Paciente
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-vet-muted mb-1">FC (lpm)</label>
                        <input
                          type="number"
                          value={form.frecuencia_cardiaca}
                          onChange={(e) => setForm({ ...form, frecuencia_cardiaca: parseInt(e.target.value) || 0 })}
                          placeholder="ej. 95"
                          className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
                        />
                      </div>
                      <div>
                        <label className="block text-vet-muted mb-1">Temp (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.temperatura_c}
                          onChange={(e) => setForm({ ...form, temperatura_c: parseFloat(e.target.value) || 0 })}
                          placeholder="ej. 39.1"
                          className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
                        />
                      </div>
                      <div>
                        <label htmlFor="consulta-peso" className="block text-vet-muted mb-1">Peso actual (lb)</label>
                        <input
                          id="consulta-peso"
                          type="number"
                          step="0.01"
                          min="0.02"
                          max="2204.60"
                          required
                          value={form.peso_lb || ''}
                          onChange={(e) => setForm({ ...form, peso_lb: e.target.valueAsNumber || 0 })}
                          placeholder="ej. 62.83"
                          className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Anamnesis */}
                  <div>
                    <label className="block font-semibold text-vet-muted mb-1">
                      Anamnesis y Síntomas de Evolución
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.anamnesis_sintomas}
                      onChange={(e) => setForm({ ...form, anamnesis_sintomas: e.target.value })}
                      placeholder="ej. El paciente presenta decaimiento, vómitos espumosos de 48h..."
                      className="w-full p-2 border border-vet-border rounded-lg"
                    />
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <label className="block font-semibold text-vet-muted mb-1">
                      Diagnóstico Clínico Definitivo
                    </label>
                    <input
                      type="text"
                      required
                      value={form.diagnostico}
                      onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                      placeholder="ej. Gastritis aguda secundaria a ingesta de cuerpo extraño no obstructivo"
                      className="w-full p-2 border border-vet-border rounded-lg font-medium"
                    />
                  </div>

                  {/* Tratamiento */}
                  <div>
                    <label className="block font-semibold text-vet-muted mb-1">
                      Tratamiento Recetado, Dosis y Recomendaciones
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.tratamiento_recetado}
                      onChange={(e) => setForm({ ...form, tratamiento_recetado: e.target.value })}
                      placeholder="ej. Omeprazol 20mg c/24h por 5 días en ayunas. Dieta blanda de pollo y arroz..."
                      className="w-full p-2 border border-vet-border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-vet-muted mb-1">Observaciones / Pruebas</label>
                    <input
                      type="text"
                      value={form.observaciones}
                      onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                      placeholder="ej. Radiografía abdominal sin hallazgos de obstrucción mecánica"
                      className="w-full p-2 border border-vet-border rounded-lg"
                    />
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
                      disabled={guardandoConsulta}
                      className="px-4 py-2 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-lg text-xs font-bold"
                    >
                      Guardar Consulta
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Screen with Direct AI Trigger */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-vet-ice text-vet-navy flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-vet-navy">
                      ¡Consulta Médica #{createdConsultaId} Registrada!
                    </h4>
                    <p className="text-xs text-vet-muted max-w-md mx-auto mt-1">
                      Las constantes vitales y el tratamiento quedaron registrados de manera inmutable en la base de datos.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-vet-border max-w-md mx-auto text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-vet-navy">
                      <Sparkles className="w-4 h-4 text-vet-navy" />
                      <span>Ficha médica de la consulta</span>
                    </div>
                    <p className="text-[11px] text-vet-navy/80">
                      Prepara un resumen para el tutor y una síntesis clínica para el expediente.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-vet-muted hover:bg-vet-ice rounded-lg"
                    >
                      Cerrar y volver
                    </button>
                    <button
                      onClick={() => handleProceedToAI(createdConsultaId)}
                      className="px-5 py-2.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md "
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generar ficha médica</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

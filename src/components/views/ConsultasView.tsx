import React, { useState } from 'react';
import { useStore } from '../../db/store';
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
  } = useStore();

  const [showModal, setShowModal] = useState(!!selectedCitaIdForNewConsulta);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [createdConsultaId, setCreatedConsultaId] = useState<number | null>(null);

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
    peso_actual: initialCita ? mascotas.find((m) => m.id_mascota === initialCita.id_mascota)?.peso_kg || 15 : 15,
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
        peso_actual: pet?.peso_kg || prev.peso_actual,
        anamnesis_sintomas: c.motivo_general,
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!form.diagnostico.trim() || !form.tratamiento_recetado.trim()) {
      setFormFeedback({
        text: 'Diagnóstico y Tratamiento son requeridos según el estándar médico RF08',
        isError: true,
      });
      return;
    }

    const res = registrarConsulta(form);
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
          <h2 className="text-xl font-black text-[#2b1d14] tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#4a2c18]" />
            <span>Consultas Médicas Clínicas (RF08)</span>
          </h2>
          <p className="text-xs text-[#634b3b] mt-0.5">
            Registro de constantes vitales, anamnesis, diagnóstico y tratamiento con enlace al motor de IA.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedConsultaId(null);
            setFormFeedback(null);
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#5c3a21] text-[#ffffff] hover:bg-[#5c3a21] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all self-start sm:self-auto"
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
              className="p-5 bg-[#ffffff] rounded-[20px] border border-[#cbb8a6] hover:border-[#cbb8a6] transition-all shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dcc3ad] text-[#4a2c18] font-black flex items-center justify-center text-sm">
                    #{cons.id_consulta}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#2b1d14]">
                        {pet?.nombre} ({pet?.especie} - {pet?.raza})
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#e3d7ca] text-[#634b3b]">
                        {pet?.codigo_expediente}
                      </span>
                    </div>
                    <p className="text-xs text-[#634b3b]">
                      Atendido por: <strong className="text-[#634b3b]">{vet?.nombres || 'Dr. Médico'}</strong> • Cita vinculada #{cons.id_cita}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-[#634b3b]">
                    {new Date(cons.fecha_consulta).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="text-[10px] text-[#634b3b]">
                    {new Date(cons.fecha_consulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#ffffff] rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="text-[#634b3b] block text-[10px]">Frec. Cardíaca</span>
                    <strong className="text-[#2b1d14]">{cons.frecuencia_cardiaca || '--'} lpm</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-[#634b3b] block text-[10px]">Temperatura</span>
                    <strong className="text-[#2b1d14]">{cons.temperatura_c || '--'} °C</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="text-[#634b3b] block text-[10px]">Peso Paciente</span>
                    <strong className="text-[#2b1d14]">{cons.peso_actual} kg</strong>
                  </div>
                </div>
              </div>

              {/* Anamnesis & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[#634b3b] uppercase text-[10px]">
                    Anamnesis y Síntomas
                  </span>
                  <p className="text-[#634b3b] bg-[#ffffff] p-2.5 rounded-lg border border-slate-100">
                    {cons.anamnesis_sintomas}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[#4a2c18] uppercase text-[10px]">
                    Diagnóstico Definitivo
                  </span>
                  <p className="text-[#2b1d14] font-semibold bg-[#dcc3ad] text-[#4a2c18]/50 p-2.5 rounded-lg border border-emerald-100">
                    {cons.diagnostico}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-[#634b3b] uppercase text-[10px]">
                  Tratamiento Recetado & Posología
                </span>
                <p className="text-[#634b3b] bg-[#ffffff] p-2.5 rounded-lg border border-slate-100">
                  {cons.tratamiento_recetado}
                </p>
              </div>

              {/* Bottom Actions / AI Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {ficha ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-[#4a2c18] font-bold bg-[#dcc3ad] text-[#4a2c18] px-2.5 py-1 rounded-lg border border-[#cbb8a6]">
                      <Sparkles className="w-3.5 h-3.5 text-[#4a2c18]" />
                      Ficha IA Generada ({ficha.modelo_utilizado})
                    </span>
                    {ficha.aprobado_por_veterinario && (
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        ✓ Aprobada por Médico
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-[#634b3b]">Sin ficha IA generada aún</span>
                )}

                <button
                  onClick={() => handleProceedToAI(cons.id_consulta)}
                  className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{ficha ? 'Ver Ficha Médica IA (RF10)' : 'Generar Ficha con IA (RF10)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Registrar Consulta Médica */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-2xl w-full border border-[#cbb8a6] overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#e3d7ca] text-[#2b1d14] border-b border-[#cbb8a6] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#4a2c18]" />
                <h3 className="font-bold text-base">RF08: Registro de Consulta Médica</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#634b3b] hover:text-white"
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
                      <label className="block font-semibold text-[#634b3b] mb-1">Cita Vinculada</label>
                      <select
                        value={form.id_cita}
                        onChange={(e) => handleCitaSelect(Number(e.target.value))}
                        className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                      >
                        {citas.map((c) => {
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
                      <label className="block font-semibold text-[#634b3b] mb-1">Médico Veterinario</label>
                      <select
                        value={form.id_veterinario}
                        onChange={(e) => setForm({ ...form, id_veterinario: Number(e.target.value) })}
                        className="w-full p-2 border border-[#e2e2e5] rounded-lg"
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
                  <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbb8a6]">
                    <span className="block font-bold text-[#634b3b] uppercase tracking-wider text-[11px] mb-2">
                      Constantes Vitales del Paciente
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#634b3b] mb-1">FC (lpm)</label>
                        <input
                          type="number"
                          value={form.frecuencia_cardiaca}
                          onChange={(e) => setForm({ ...form, frecuencia_cardiaca: parseInt(e.target.value) || 0 })}
                          placeholder="ej. 95"
                          className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#634b3b] mb-1">Temp (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={form.temperatura_c}
                          onChange={(e) => setForm({ ...form, temperatura_c: parseFloat(e.target.value) || 0 })}
                          placeholder="ej. 39.1"
                          className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#634b3b] mb-1">Peso Actual (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={form.peso_actual}
                          onChange={(e) => setForm({ ...form, peso_actual: parseFloat(e.target.value) || 0 })}
                          placeholder="ej. 28.5"
                          className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Anamnesis */}
                  <div>
                    <label className="block font-semibold text-[#634b3b] mb-1">
                      Anamnesis y Síntomas de Evolución
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.anamnesis_sintomas}
                      onChange={(e) => setForm({ ...form, anamnesis_sintomas: e.target.value })}
                      placeholder="ej. El paciente presenta decaimiento, vómitos espumosos de 48h..."
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <label className="block font-semibold text-[#634b3b] mb-1">
                      Diagnóstico Clínico Definitivo (RF08)
                    </label>
                    <input
                      type="text"
                      required
                      value={form.diagnostico}
                      onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                      placeholder="ej. Gastritis aguda secundaria a ingesta de cuerpo extraño no obstructivo"
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg font-medium"
                    />
                  </div>

                  {/* Tratamiento */}
                  <div>
                    <label className="block font-semibold text-[#634b3b] mb-1">
                      Tratamiento Recetado, Dosis y Recomendaciones
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.tratamiento_recetado}
                      onChange={(e) => setForm({ ...form, tratamiento_recetado: e.target.value })}
                      placeholder="ej. Omeprazol 20mg c/24h por 5 días en ayunas. Dieta blanda de pollo y arroz..."
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#634b3b] mb-1">Observaciones / Pruebas</label>
                    <input
                      type="text"
                      value={form.observaciones}
                      onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                      placeholder="ej. Radiografía abdominal sin hallazgos de obstrucción mecánica"
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>

                  {formFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        formFeedback.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-[#dcc3ad] text-[#4a2c18] border border-[#cbb8a6]'
                      }`}
                    >
                      {formFeedback.isError ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4a2c18]" />
                      )}
                      <span>{formFeedback.text}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-[#e2e2e5] text-[#634b3b] rounded-lg text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#5c3a21] text-[#ffffff] hover:bg-[#5c3a21] text-[#ffffff] rounded-lg text-xs font-bold"
                    >
                      Guardar Consulta
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Screen with Direct AI Trigger */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#dcc3ad] text-[#4a2c18] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#2b1d14]">
                      ¡Consulta Médica #{createdConsultaId} Registrada!
                    </h4>
                    <p className="text-xs text-[#634b3b] max-w-md mx-auto mt-1">
                      Las constantes vitales y el tratamiento quedaron registrados de manera inmutable en la base de datos (RF08).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-[#cbb8a6] max-w-md mx-auto text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                      <Sparkles className="w-4 h-4 text-[#4a2c18]" />
                      <span>Siguiente paso: Ficha Médica con IA (RF10)</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/80">
                      Genera automáticamente el resumen explicativo para el dueño y la síntesis clínica técnica para el expediente con Gemini 3.8 Flash.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#634b3b] hover:bg-[#e3d7ca] rounded-lg"
                    >
                      Cerrar y volver
                    </button>
                    <button
                      onClick={() => handleProceedToAI(createdConsultaId)}
                      className="px-5 py-2.5 bg-[#5c3a21] text-[#ffffff] hover:bg-[#5c3a21] text-[#ffffff] text-xs font-bold rounded-xl flex items-center gap-2 shadow-md "
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Ficha con Gemini 3.8 Flash</span>
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

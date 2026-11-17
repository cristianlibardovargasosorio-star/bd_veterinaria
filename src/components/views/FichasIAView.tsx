import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { FichaIA } from '../../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  ShieldCheck,
  RotateCw,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface FichasIAViewProps {
  initialConsultaId?: number | null;
}

export const FichasIAView: React.FC<FichasIAViewProps> = ({ initialConsultaId }) => {
  const {
    consultas,
    mascotas,
    veterinarios,
    propietarios,
    fichasIA,
    guardarFichaIA,
    toggleAprobacionFichaIA,
    currentRole,
  } = useStore();

  const [selectedConsultaId, setSelectedConsultaId] = useState<number>(() => {
    if (initialConsultaId) return initialConsultaId;
    return consultas[0]?.id_consulta || 105;
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active consultation
  const activeConsulta = consultas.find((c) => c.id_consulta === selectedConsultaId) || consultas[0];
  const activePet = activeConsulta ? mascotas.find((m) => m.id_mascota === activeConsulta.id_mascota) : null;
  const activeVet = activeConsulta ? veterinarios.find((v) => v.id_veterinario === activeConsulta.id_veterinario) : null;
  const activeOwner = activePet ? propietarios.find((p) => p.id_propietario === activePet.id_propietario) : null;
  const existingFicha = fichasIA.find((f) => f.id_consulta === selectedConsultaId);

  const handleGenerateAI = async () => {
    if (!activeConsulta || !activePet) return;
    setLoading(true);
    setErrorMsg(null);

    // Exact payload from 04_manual_integracion_ia_api_md_c49966e2.md
    const payload = {
      id_consulta: activeConsulta.id_consulta,
      mascota: {
        nombre: activePet.nombre,
        especie: activePet.especie,
        raza: activePet.raza,
        peso_kg: activeConsulta.peso_actual || activePet.peso_kg,
      },
      datos_clinicos: {
        frecuencia_cardiaca: activeConsulta.frecuencia_cardiaca,
        temperatura_c: activeConsulta.temperatura_c,
        anamnesis: activeConsulta.anamnesis_sintomas,
        diagnostico: activeConsulta.diagnostico,
        tratamiento: activeConsulta.tratamiento_recetado,
      },
    };

    try {
      const response = await fetch('/api/ai/ficha-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (json.success && json.data) {
        guardarFichaIA({
          id_consulta: activeConsulta.id_consulta,
          resumen_propietario: json.data.resumen_propietario,
          sintesis_tecnica: json.data.sintesis_tecnica,
          modelo_utilizado: json.data.modelo_utilizado || 'Gemini 3.8 Flash',
          aprobado_por_veterinario: false,
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        setErrorMsg('No se pudo generar la ficha médica.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error conectando con el motor Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1E293B] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#5d2a1a]" />
            <span>Fichas Médicas Clínicas con IA (RF10)</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Generación dual con Gemini 3.8 Flash: Explicación empática para el tutor y síntesis técnica para el expediente.
          </p>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={loading || !activeConsulta}
          className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md  disabled:opacity-50 transition-all self-start sm:self-auto cursor-pointer"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Procesando con Gemini 3.8...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{existingFicha ? 'Regenerar con IA' : 'Generar Ficha con Gemini'}</span>
            </>
          )}
        </button>
      </div>

      {/* Select Consultation */}
      <div className="p-4 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-[#5d2a1a]" />
          <span className="text-xs font-bold text-[#64748B]">Consulta Clínica Seleccionada:</span>
        </div>

        <select
          value={selectedConsultaId}
          onChange={(e) => setSelectedConsultaId(Number(e.target.value))}
          className="w-full md:w-96 text-xs p-2 rounded-xl border border-[#e2e2e5] bg-[#ffffff] font-medium"
        >
          {consultas.map((c) => {
            const pet = mascotas.find((m) => m.id_mascota === c.id_mascota);
            const hasFicha = fichasIA.some((f) => f.id_consulta === c.id_consulta);
            return (
              <option key={c.id_consulta} value={c.id_consulta}>
                Consulta #{c.id_consulta} - {pet?.nombre} ({pet?.especie}) - {hasFicha ? '★ Ficha Lista' : '○ Pendiente'}
              </option>
            );
          })}
        </select>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Context Card: Active Consultation Info */}
      {activeConsulta && activePet && (
        <div className="p-5 bg-[#f2f2f3] text-[#1E293B] border border-[#cbd5e1] rounded-[24px] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#cbd5e1] pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#5d2a1a]">
                EXP: {activePet.codigo_expediente}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-xs font-bold text-[#1E293B]">
                {activePet.nombre} ({activePet.especie} - {activePet.raza})
              </span>
            </div>
            <div className="text-xs text-[#64748B]">
              FC: <strong className="text-[#5d2a1a]">{activeConsulta.frecuencia_cardiaca || '--'} lpm</strong> • Temp:{' '}
              <strong className="text-[#5d2a1a]">{activeConsulta.temperatura_c || '--'} °C</strong> • Peso:{' '}
              <strong className="text-[#5d2a1a]">{activeConsulta.peso_actual} kg</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Diagnóstico Técnico:</span>
              <p className="text-[#1E293B] font-medium">{activeConsulta.diagnostico}</p>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Tratamiento Prescrito:</span>
              <p className="text-[#1E293B] font-medium">{activeConsulta.tratamiento_recetado}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Outputs Dual Cards */}
      {existingFicha ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Resumen para el Propietario */}
            <div className="bg-[#ffffff] rounded-[20px] border-2 border-[#cbd5e1] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#fbe1d1] text-[#5d2a1a] rounded-bl-full -mr-8 -mt-8 opacity-40"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1E293B]">Resumen para el Propietario</h4>
                      <p className="text-[10px] text-[#64748B]">Lenguaje empático, cálido y comprensible</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] border border-[#cbd5e1]">
                    Para el Tutor
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#fbe1d1] text-[#5d2a1a]/50 border border-emerald-100 text-xs text-[#1E293B] leading-relaxed font-sans">
                  {existingFicha.resumen_propietario}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(existingFicha.resumen_propietario)}
                  className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] hover:bg-[#ffffff] text-[#64748B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:opacity-90 text-[#ffffff] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir para el Cliente</span>
                </button>
              </div>
            </div>

            {/* 2. Síntesis Técnica Médica */}
            <div className="bg-[#ffffff] rounded-[20px] border-2 border-[#e2e2e5] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f2f2f3] text-[#1E293B] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1E293B]">Síntesis Técnica Médica</h4>
                      <p className="text-[10px] text-[#64748B]">Expediente Clínico Interno Veterinario</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f2f3] text-[#1E293B] border border-[#cbd5e1]">
                    Expediente Oficial
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#ffffff] border border-[#cbd5e1] text-xs text-[#1E293B] leading-relaxed font-mono">
                  {existingFicha.sintesis_tecnica}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{new Date(existingFicha.fecha_generacion).toLocaleString()}</span>
                </div>
                <span className="font-mono text-[10px] text-[#5d2a1a] bg-[#fbe1d1] text-[#5d2a1a] px-2 py-0.5 rounded">
                  {existingFicha.modelo_utilizado}
                </span>
              </div>
            </div>
          </div>

          {/* Veterinarian Approval Box (SRS RF10 Requirement) */}
          <div className="p-5 rounded-[20px] bg-[#ffffff] border border-[#cbd5e1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors ${
                  existingFicha.aprobado_por_veterinario
                    ? 'bg-[#fbe1d1] text-[#5d2a1a]'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    Aprobación y Firma del Médico Veterinario
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      existingFicha.aprobado_por_veterinario
                        ? 'bg-[#fbe1d1] text-[#5d2a1a]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {existingFicha.aprobado_por_veterinario ? 'Aprobada Oficialmente' : 'Pendiente de Firma'}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Responsable:{' '}
                  <strong className="text-[#1E293B]">
                    {activeVet ? `${activeVet.nombres} ${activeVet.apellidos} (${activeVet.tarjeta_profesional})` : 'Veterinario'}
                  </strong>
                </p>
              </div>
            </div>

            {currentRole !== 'PROPIETARIO' && (
              <button
                onClick={() => {
                  toggleAprobacionFichaIA(existingFicha.id_ficha);
                  confetti({ particleCount: 30, spread: 50 });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  existingFicha.aprobado_por_veterinario
                    ? 'bg-[#f2f2f3] hover:bg-[#f2f2f3] text-[#64748B] border border-[#e2e2e5]'
                    : 'bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] '
                }`}
              >
                {existingFicha.aprobado_por_veterinario
                  ? 'Revocar Aprobación'
                  : 'Firmar y Aprobar Ficha Oficial'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] space-y-3">
          <div className="w-16 h-16 rounded-[20px] bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">
              Esta consulta aún no cuenta con Ficha Médica generada
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
              Haz clic en "Generar Ficha con Gemini" para obtener la explicación comprensible para el dueño de{' '}
              <strong>{activePet?.nombre || 'la mascota'}</strong> y la síntesis técnica interna.
            </p>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={loading}
            className="px-5 py-2.5 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md "
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar Ahora con Gemini 3.8 Flash</span>
          </button>
        </div>
      )}
    </div>
  );
};

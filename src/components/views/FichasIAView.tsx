import React, { useRef, useState } from 'react';
import { useStore } from '../../db/store';
import { DiagnosticoDocumento } from './DiagnosticoDocumento';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  Download,
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
    currentUser,
  } = useStore();

  const isOwner = currentRole === 'PROPIETARIO';
  const owner = propietarios.find((record) => record.id_usuario === currentUser.id_usuario);
  const visibleConsultas = isOwner
    ? consultas.filter((consulta) => owner && mascotas.some((pet) =>
        pet.id_mascota === consulta.id_mascota && pet.id_propietario === owner.id_propietario
      ))
    : consultas;
  const [selectedConsultaId, setSelectedConsultaId] = useState(initialConsultaId);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadPreview, setDownloadPreview] = useState<{ content: string; filename: string } | null>(null);
  const downloadDialogRef = useRef<HTMLDialogElement>(null);

  // Active consultation
  const activeConsulta = visibleConsultas.find((c) => c.id_consulta === selectedConsultaId) || visibleConsultas[0];
  const activePet = activeConsulta ? mascotas.find((m) => m.id_mascota === activeConsulta.id_mascota) : null;
  const activeVet = activeConsulta ? veterinarios.find((v) => v.id_veterinario === activeConsulta.id_veterinario) : null;
  const existingFicha = isOwner ? undefined : fichasIA.find((f) => f.id_consulta === activeConsulta?.id_consulta);

  const handleGenerateAI = async () => {
    if (isOwner || !activeConsulta || !activePet) return;
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
    } catch {
      setErrorMsg('No se pudo conectar con el servicio de fichas médicas.');
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

  const handlePreviewDownload = () => {
    if (!activeConsulta || !activePet) return;
    const fecha = new Date(activeConsulta.fecha_consulta).toLocaleString('es-CO');
    const lines = [
      'VetSoft · Ficha médica clínica',
      `Mascota: ${activePet.nombre}`,
      `Fecha de consulta: ${fecha}`,
      '',
      'Diagnóstico',
      activeConsulta.diagnostico,
    ];
    if (existingFicha) {
      lines.push(
        '', 'Expediente', activePet.codigo_expediente,
        '', 'Tratamiento prescrito', activeConsulta.tratamiento_recetado,
        '', 'Resumen para el propietario', existingFicha.resumen_propietario,
        '', 'Síntesis técnica médica', existingFicha.sintesis_tecnica,
      );
    }
    setDownloadPreview({
      content: lines.join('\n'),
      filename: `ficha-medica-${activeConsulta.id_consulta}.txt`,
    });
    downloadDialogRef.current?.showModal();
  };

  const handleDownload = () => {
    if (!downloadPreview) return;
    const url = URL.createObjectURL(new Blob([downloadPreview.content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadPreview.filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    downloadDialogRef.current?.close();
  };

  const previewDialog = (
    <dialog
      ref={downloadDialogRef}
      aria-labelledby="ficha-download-title"
      onClose={() => setDownloadPreview(null)}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-xl rounded-[20px] border border-vet-border bg-vet-surface text-vet-navy shadow-xl backdrop:bg-vet-navy/40"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="border-b border-vet-border px-5 py-4">
          <h3 id="ficha-download-title" className="font-bold">
            Vista previa de la ficha
          </h3>
        </header>
        <div className="overflow-auto whitespace-pre-wrap break-words px-5 py-4 text-sm leading-relaxed">
          {downloadPreview?.content}
        </div>
        <form method="dialog" className="flex justify-end gap-3 border-t border-vet-border px-5 py-4">
          <button type="submit" className="rounded-lg border border-vet-border px-4 py-2 text-sm">Cerrar</button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-vet-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-vet-emerald-hover"
          >
            Descargar
          </button>
        </form>
      </div>
    </dialog>
  );

  const consultationSelector = (
    <label className="p-4 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
      <span className="flex items-center gap-2 text-xs font-bold text-vet-muted">
        <Stethoscope className="w-4 h-4 text-vet-navy" aria-hidden="true" />
        Selecciona una consulta
      </span>
      <select
        value={activeConsulta?.id_consulta ?? ''}
        onChange={(e) => setSelectedConsultaId(Number(e.target.value))}
        className="w-full md:w-96 text-xs p-2 rounded-xl border border-vet-border bg-vet-surface font-medium"
      >
        {visibleConsultas.map((consulta) => {
          const pet = mascotas.find((m) => m.id_mascota === consulta.id_mascota);
          const details = isOwner
            ? new Date(consulta.fecha_consulta).toLocaleDateString('es-CO')
            : fichasIA.some((f) => f.id_consulta === consulta.id_consulta) ? 'Ficha lista' : 'Pendiente';
          return (
            <option key={consulta.id_consulta} value={consulta.id_consulta}>
              {pet?.nombre ?? 'Mascota'} · Consulta #{consulta.id_consulta} · {details}
            </option>
          );
        })}
      </select>
    </label>
  );

  if (isOwner) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-vet-navy tracking-tight">Fichas Médicas Clínicas</h2>
        {activeConsulta && activePet ? (
          <>
            {consultationSelector}
            {activeConsulta.diagnostico?.trim() ? (
              <DiagnosticoDocumento
                key={activeConsulta.id_consulta}
                consultaId={activeConsulta.id_consulta}
                mascota={activePet.nombre}
                fecha={new Date(activeConsulta.fecha_consulta).toLocaleString('es-CO')}
                diagnostico={activeConsulta.diagnostico}
              />
            ) : (
              <p className="text-sm text-vet-muted">Aún no hay un diagnóstico registrado para esta consulta.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-vet-muted">Aún no hay consultas registradas para tus mascotas.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {previewDialog}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-vet-navy" />
            <span>Fichas Médicas Clínicas</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Consulta el resumen de la atención de tu mascota y las indicaciones para su cuidado.
          </p>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={loading || !activeConsulta}
          className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all self-start sm:self-auto cursor-pointer print:hidden"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Preparando ficha...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{existingFicha ? 'Regenerar ficha' : 'Generar ficha'}</span>
            </>
          )}
        </button>
      </div>

      {visibleConsultas.length > 0 && consultationSelector}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Context Card: Active Consultation Info */}
      {activeConsulta && activePet && (
        <div className="p-5 bg-vet-ice text-vet-navy border border-vet-border rounded-[24px] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-vet-border pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-vet-navy">
                EXP: {activePet.codigo_expediente}
              </span>
              <span className="text-vet-muted">•</span>
              <span className="text-xs font-bold text-vet-navy">
                {activePet.nombre} ({activePet.especie} - {activePet.raza})
              </span>
            </div>
            <div className="text-xs text-vet-muted">
              FC: <strong className="text-vet-navy">{activeConsulta.frecuencia_cardiaca || '--'} lpm</strong> • Temp:{' '}
              <strong className="text-vet-navy">{activeConsulta.temperatura_c || '--'} °C</strong> • Peso:{' '}
              <strong className="text-vet-navy">{activeConsulta.peso_actual} kg</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-vet-muted block text-[10px] uppercase font-bold">Diagnóstico Técnico:</span>
              <p className="text-vet-navy font-medium">{activeConsulta.diagnostico}</p>
            </div>
            <div>
              <span className="text-vet-muted block text-[10px] uppercase font-bold">Tratamiento Prescrito:</span>
              <p className="text-vet-navy font-medium">{activeConsulta.tratamiento_recetado}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Outputs Dual Cards */}
      {existingFicha ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Resumen para el Propietario */}
            <div className="bg-vet-surface rounded-[20px] border-2 border-vet-border p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-vet-ice text-vet-navy rounded-bl-full -mr-8 -mt-8 opacity-40"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-vet-ice text-vet-navy flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-vet-navy">Resumen para el Propietario</h4>
                      <p className="text-[10px] text-vet-muted">Lenguaje empático, cálido y comprensible</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vet-ice text-vet-navy border border-vet-border">
                    Para el Tutor
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-vet-ice text-vet-navy/50 border border-vet-border text-xs text-vet-navy leading-relaxed font-sans">
                  {existingFicha.resumen_propietario}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 print:hidden">
                <button
                  onClick={() => handleCopy(existingFicha.resumen_propietario)}
                  className="px-3 py-1.5 rounded-lg border border-vet-border hover:bg-vet-surface text-vet-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-vet-muted" />
                  <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir ficha</span>
                </button>

                <button
                  type="button"
                  onClick={handlePreviewDownload}
                  aria-haspopup="dialog"
                  className="px-3 py-1.5 rounded-lg border border-vet-border hover:bg-vet-ice text-vet-navy text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Descargar ficha</span>
                </button>
              </div>
            </div>

            {/* 2. Síntesis Técnica Médica */}
            <div className="bg-vet-surface rounded-[20px] border-2 border-vet-border p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-vet-ice text-vet-navy flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-vet-navy">Síntesis Técnica Médica</h4>
                      <p className="text-[10px] text-vet-muted">Expediente Clínico Interno Veterinario</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vet-ice text-vet-navy border border-vet-border">
                    Expediente Oficial
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-vet-surface border border-vet-border text-xs text-vet-navy leading-relaxed font-mono">
                  {existingFicha.sintesis_tecnica}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-vet-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-vet-muted" />
                  <span>{new Date(existingFicha.fecha_generacion).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Veterinarian Approval Box (SRS RF10 Requirement) */}
          <div className="p-5 rounded-[20px] bg-vet-surface border border-vet-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors ${
                  existingFicha.aprobado_por_veterinario
                    ? 'bg-vet-ice text-vet-navy'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-vet-navy">
                    Aprobación y Firma del Médico Veterinario
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      existingFicha.aprobado_por_veterinario
                        ? 'bg-vet-ice text-vet-navy'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {existingFicha.aprobado_por_veterinario ? 'Aprobada Oficialmente' : 'Pendiente de Firma'}
                  </span>
                </div>
                <p className="text-xs text-vet-muted mt-0.5">
                  Responsable:{' '}
                  <strong className="text-vet-navy">
                    {activeVet ? `${activeVet.nombres} ${activeVet.apellidos} (${activeVet.tarjeta_profesional})` : 'Veterinario'}
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                toggleAprobacionFichaIA(existingFicha.id_ficha);
                confetti({ particleCount: 30, spread: 50 });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs print:hidden ${
                existingFicha.aprobado_por_veterinario
                  ? 'bg-vet-ice hover:bg-vet-ice text-vet-muted border border-vet-border'
                  : 'bg-vet-emerald hover:bg-vet-emerald-hover text-white '
              }`}
            >
              {existingFicha.aprobado_por_veterinario
                ? 'Revocar Aprobación'
                : 'Firmar y Aprobar Ficha Oficial'}
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-vet-surface rounded-[20px] border border-vet-border space-y-3">
          <div className="w-16 h-16 rounded-[20px] bg-vet-ice text-vet-navy flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-vet-navy">
              Esta consulta aún no cuenta con Ficha Médica generada
            </h3>
            <p className="text-xs text-vet-muted max-w-md mx-auto mt-1">
              Genera la ficha de <strong>{activePet?.nombre || 'la mascota'}</strong> para obtener el resumen para el tutor y la síntesis clínica.
            </p>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={loading}
            className="px-5 py-2.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md "
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar ficha</span>
          </button>
        </div>
      )}
    </div>
  );
};

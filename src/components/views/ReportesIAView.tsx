import React, { useRef, useState } from 'react';
import { useStore } from '../../db/store';
import { TipoReporteIA, ReporteEjecutivoIA } from '../../types';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Sparkles,
  RotateCw,
  Printer,
  AlertTriangle,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

const colombianDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' });
const tituloPredeterminado = 'Evaluación de Desempeño Clínico y Operativo';
type Metrica = keyof ReporteEjecutivoIA['metricas_json'];
const camposMetricas: { campo: Metrica; etiqueta: string; tipo: 'text' | 'number'; paso?: number }[] = [
  { campo: 'total_citas_atendidas', etiqueta: 'Citas atendidas', tipo: 'number' },
  { campo: 'ingresos_totales', etiqueta: 'Facturación', tipo: 'number', paso: 0.01 },
  { campo: 'vacunas_aplicadas', etiqueta: 'Dosis de vacunas', tipo: 'number' },
  { campo: 'top_diagnostico_frecuente', etiqueta: 'Diagnóstico frecuente', tipo: 'text' },
  { campo: 'alertas_stock_critico', etiqueta: 'Alertas de stock', tipo: 'number' },
];

function fechaDelRegistro(value: string) {
  if (/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : colombianDate.format(date);
}

function DetalleReporte({ reporte, acciones }: { reporte: ReporteEjecutivoIA; acciones?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vet-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-vet-navy bg-vet-ice text-vet-navy px-2.5 py-0.5 rounded-full border border-vet-border">
              Reporte Ejecutivo · {reporte.tipo_reporte}
            </span>
          </div>
          <h3 className="mt-1 break-words text-xl font-black text-vet-navy">
            {reporte.titulo || tituloPredeterminado}
          </h3>
          <p className="text-xs text-vet-muted">
            Periodo auditado: <strong>{reporte.periodo_inicio}</strong> a{' '}
            <strong>{reporte.periodo_fin}</strong>
          </p>
        </div>

        {acciones}
      </div>

      {/* Narrative Analysis */}
      <div className="p-5 rounded-[20px] bg-vet-surface border border-vet-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-vet-navy uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-vet-navy" />
          <span>Análisis Narrativo Cuantitativo y Clínico</span>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-vet-navy leading-relaxed font-sans">
          {reporte.analisis_narrativo}
        </p>
      </div>

      {/* Operational Recommendations */}
      <div className="p-5 rounded-[20px] bg-vet-ice border border-vet-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-vet-navy uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-vet-navy" />
          <span>Estrategias y Recomendaciones Operativas Inmediatas</span>
        </div>
        <div className="whitespace-pre-wrap break-words text-sm text-vet-navy leading-relaxed font-medium">
          {reporte.recomendacion_operativa}
        </div>
      </div>

      {/* Metrics Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
        <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
          <span className="text-vet-muted block text-[10px]">Citas Procesadas</span>
          <span className="font-black text-lg text-vet-navy">
            {reporte.metricas_json.total_citas_atendidas}
          </span>
        </div>
        <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
          <span className="text-vet-muted block text-[10px]">Ingresos del Periodo</span>
          <span className="font-black text-lg text-vet-navy">
            ${reporte.metricas_json.ingresos_totales.toLocaleString()}
          </span>
        </div>
        <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
          <span className="text-vet-muted block text-[10px]">Vacunas Aplicadas</span>
          <span className="font-black text-lg text-vet-navy">
            {reporte.metricas_json.vacunas_aplicadas}
          </span>
        </div>
        <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
          <span className="text-vet-muted block text-[10px]">Diagnóstico frecuente</span>
          <span className="break-words text-sm font-semibold text-vet-navy">{reporte.metricas_json.top_diagnostico_frecuente}</span>
        </div>
        <div className="p-3 bg-vet-surface rounded-xl border border-vet-border">
          <span className="text-vet-muted block text-[10px]">Alertas de Stock</span>
          <span className="font-black text-lg text-red-600">
            {reporte.metricas_json.alertas_stock_critico}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-vet-border text-xs text-vet-muted">
        <span>Generado: {new Date(reporte.fecha_generacion).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</span>
      </div>
    </div>
  );
}

export const ReportesIAView: React.FC = () => {
  const {
    citas,
    facturas,
    historiaVacunas,
    consultas,
    vwAlertasStock,
    reportesIA,
    guardarReporteIA,
    currentUser,
  } = useStore();

  const [tipoReporte, setTipoReporte] = useState<TipoReporteIA>('GENERAL');
  const [fechaInicio, setFechaInicio] = useState(() => `${colombianDate.format(new Date()).slice(0, 7)}-01`);
  const [fechaFin, setFechaFin] = useState(() => colombianDate.format(new Date()));
  const [titulo, setTitulo] = useState(tituloPredeterminado);
  const [analisis, setAnalisis] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [metricasEditadas, setMetricasEditadas] = useState<Partial<Record<Metrica, string>>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reporteAbiertoId, setReporteAbiertoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const periodoValido = Boolean(fechaInicio && fechaFin && fechaInicio <= fechaFin);
  const enPeriodo = (value: string) => {
    const fecha = fechaDelRegistro(value);
    return periodoValido && fecha >= fechaInicio && fecha <= fechaFin;
  };
  const totalCitasAtendidas = citas.filter((c) => c.estado === 'ATENDIDA' && enPeriodo(c.fecha_hora)).length;
  const ingresosTotales =
    facturas.filter((f) => f.estado === 'PAGADA' && enPeriodo(f.fecha)).reduce((sum, f) => sum + f.total, 0);
  const vacunasAplicadas = historiaVacunas.filter((vacuna) => enPeriodo(vacuna.fecha_aplicacion)).length;
  const alertasStockCritico = vwAlertasStock.length;

  // Extract top frequent diagnosis from consultas
  const diagCount: Record<string, number> = {};
  const consultasDelPeriodo = consultas.filter((c) => enPeriodo(c.fecha_consulta));
  consultasDelPeriodo.forEach((c) => {
    const d = c.diagnostico.trim().split(/\s+/)[0] || 'Consulta';
    diagCount[d] = (diagCount[d] || 0) + 1;
  });
  const topDiag = Object.entries(diagCount).sort((a, b) => b[1] - a[1])[0];
  const topDiagnosticoFrecuente = topDiag
    ? `${topDiag[0]} (${Math.round((topDiag[1] / consultasDelPeriodo.length) * 100)}%)`
    : 'Sin diagnósticos';
  const metricasCalculadas: ReporteEjecutivoIA['metricas_json'] = {
    total_citas_atendidas: totalCitasAtendidas,
    ingresos_totales: ingresosTotales,
    vacunas_aplicadas: vacunasAplicadas,
    top_diagnostico_frecuente: topDiagnosticoFrecuente,
    alertas_stock_critico: alertasStockCritico,
  };
  const valorMetrica = (campo: Metrica) => metricasEditadas[campo] ?? String(metricasCalculadas[campo]);

  // Latest generated report
  const latestReport = reportesIA[0];
  const reporteAbierto = reportesIA.find((reporte) => reporte.id_reporte === reporteAbiertoId);

  const abrirReporte = (idReporte: number) => {
    setReporteAbiertoId(idReporte);
    dialogRef.current?.showModal();
  };

  const handleGenerateReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!periodoValido || loading) return;
    if (!titulo.trim() || !valorMetrica('top_diagnostico_frecuente').trim()) {
      setErrorMsg('Completa el título y el diagnóstico frecuente.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      periodo: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
      metricas: {
        total_citas_atendidas: Number(valorMetrica('total_citas_atendidas')),
        ingresos_totales: Number(valorMetrica('ingresos_totales')),
        vacunas_aplicadas: Number(valorMetrica('vacunas_aplicadas')),
        top_diagnostico_frecuente: valorMetrica('top_diagnostico_frecuente').trim(),
        alertas_stock_critico: Number(valorMetrica('alertas_stock_critico')),
      },
      tipo_reporte: tipoReporte,
    };

    try {
      let analisisFinal = analisis.trim();
      let recomendacionesFinales = recomendaciones.trim();
      if (!analisisFinal || !recomendacionesFinales) {
        const response = await fetch('/api/ai/reporte-ejecutivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error('No se pudo completar el reporte.');
        analisisFinal ||= json.data?.analisis_narrativo?.trim() ?? '';
        recomendacionesFinales ||= json.data?.recomendacion_operativa?.trim() ?? '';
      }
      if (!analisisFinal || !recomendacionesFinales) throw new Error('El reporte quedó incompleto.');
      guardarReporteIA({
        titulo: titulo.trim(),
        periodo_inicio: fechaInicio,
        periodo_fin: fechaFin,
        tipo_reporte: tipoReporte,
        analisis_narrativo: analisisFinal,
        recomendacion_operativa: recomendacionesFinales,
        metricas_json: payload.metricas,
        id_usuario_admin: currentUser.id_usuario,
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      setErrorMsg('No se pudo completar el reporte automáticamente. Puedes escribir el análisis y las recomendaciones y volver a generarlo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-vet-navy" />
            <span>Reportes Ejecutivos e Inteligencia de Negocio con IA</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Consolidación gerencial de ingresos, epidemiología y stock con análisis narrativo redactado por Gemini 3.8 Flash.
          </p>
        </div>

        <button
          type="submit"
          form="reporte-editor"
          disabled={loading || !periodoValido}
          className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md  disabled:opacity-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Preparando reporte...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generar Reporte Ejecutivo</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Control Panel: Parameters */}
      <form id="reporte-editor" onSubmit={handleGenerateReport} className="p-5 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs print:hidden">
        <fieldset disabled={loading} className="space-y-4">
          <span className="font-bold text-xs text-vet-muted uppercase tracking-wider block">
            Parámetros del Análisis Gerencial
          </span>
          <p className="text-sm text-vet-muted">
            Ajusta el título, el periodo y las cifras. Puedes escribir tus conclusiones o dejar que el sistema complete el análisis y las recomendaciones.
          </p>
          <label className="block space-y-1 text-sm font-semibold text-vet-navy">
            Título del reporte
            <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full rounded-lg border border-vet-border bg-vet-surface p-2 font-normal" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label htmlFor="reporte-enfoque" className="block text-vet-muted font-semibold mb-1">Tipo de Enfoque</label>
              <select
                id="reporte-enfoque"
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value as TipoReporteIA)}
                className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
              >
                <option value="GENERAL">GENERAL (Integral)</option>
                <option value="EPIDEMIOLOGICO">EPIDEMIOLÓGICO (Patologías y Vacunas)</option>
                <option value="FINANCIERO">FINANCIERO (Facturación y Ventas)</option>
                <option value="OPERATIVO">OPERATIVO (Capacidad y Citas)</option>
              </select>
            </div>

            <div>
              <label htmlFor="reporte-inicio" className="block text-vet-muted font-semibold mb-1">Fecha de Inicio</label>
              <input
                id="reporte-inicio"
                type="date"
                max={fechaFin || undefined}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
              />
            </div>

            <div>
              <label htmlFor="reporte-fin" className="block text-vet-muted font-semibold mb-1">Fecha de Fin</label>
              <input
                id="reporte-fin"
                type="date"
                min={fechaInicio || undefined}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-2 border border-vet-border rounded-lg bg-vet-surface"
              />
            </div>
          </div>
          {!periodoValido && <p role="status" className="text-xs font-semibold text-vet-danger-ink">Selecciona ambas fechas y verifica que el inicio sea anterior o igual al fin.</p>}

          <div className="space-y-3 border-t border-vet-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-vet-navy">Cifras del reporte</span>
              {Object.keys(metricasEditadas).length > 0 && (
                <button type="button" onClick={() => setMetricasEditadas({})} className="text-xs font-semibold text-vet-emerald-hover underline">
                  Restaurar cifras calculadas
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {camposMetricas.map(({ campo, etiqueta, tipo, paso }) => (
                <label key={campo} className="block space-y-1 text-xs font-semibold text-vet-muted">
                  {etiqueta}
                  <input
                    required
                    type={tipo}
                    min={tipo === 'number' ? 0 : undefined}
                    step={paso}
                    value={valorMetrica(campo)}
                    onChange={(e) => setMetricasEditadas({ ...metricasEditadas, [campo]: e.target.value })}
                    className="w-full rounded-lg border border-vet-border bg-vet-surface p-2 text-sm font-normal text-vet-navy"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm font-semibold text-vet-navy">
              Análisis del periodo
              <textarea rows={4} value={analisis} onChange={(e) => setAnalisis(e.target.value)} placeholder="Escribe el análisis o deja que se complete al generar." className="w-full rounded-lg border border-vet-border bg-vet-surface p-2 font-normal" />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-vet-navy">
              Recomendaciones
              <textarea rows={4} value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)} placeholder="Escribe las recomendaciones o deja que se completen al generar." className="w-full rounded-lg border border-vet-border bg-vet-surface p-2 font-normal" />
            </label>
          </div>
        </fieldset>
      </form>

      {latestReport && (
        <div className="rounded-[24px] border border-vet-border bg-vet-surface p-6 shadow-xl md:p-8">
          <DetalleReporte reporte={latestReport} acciones={
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => abrirReporte(latestReport.id_reporte)}
                className="rounded-xl border border-vet-border px-3.5 py-2 text-xs font-bold text-vet-navy hover:bg-vet-ice"
              >
                Ver reporte completo
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Reporte</span>
              </button>
            </div>
          } />
        </div>
      )}

      {/* Historical Reports */}
      {reportesIA.length > 1 && (
        <div className="bg-vet-surface rounded-[20px] border border-vet-border p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-vet-navy">Historial de Reportes Generados</h3>
          <div className="space-y-2">
            {reportesIA.slice(1).map((rep) => (
              <button
                key={rep.id_reporte}
                type="button"
                aria-haspopup="dialog"
                onClick={() => abrirReporte(rep.id_reporte)}
                className="block w-full cursor-pointer space-y-1 rounded-xl border border-vet-border p-3.5 text-left text-xs hover:border-vet-emerald/50 hover:bg-vet-ice focus-visible:outline-2 focus-visible:outline-vet-emerald"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-vet-navy">
                    {rep.titulo || `Reporte #${rep.id_reporte}`} · {rep.tipo_reporte}
                  </span>
                  <span className="text-vet-muted">{new Date(rep.fecha_generacion).toLocaleDateString()}</span>
                </span>
                <span className="line-clamp-2 text-vet-muted">{rep.analisis_narrativo}</span>
                <span className="block font-semibold text-vet-emerald-hover">Ver reporte completo</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby="reporte-detalle-titulo"
        onClose={() => setReporteAbiertoId(null)}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-auto rounded-[24px] border border-vet-border bg-vet-surface text-vet-navy shadow-2xl backdrop:bg-vet-navy/50 print:hidden"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-vet-border bg-vet-surface px-5 py-3 sm:px-8">
          <h2 id="reporte-detalle-titulo" className="text-base font-bold">Reporte completo</h2>
          <form method="dialog">
            <button type="submit" className="rounded-lg border border-vet-border px-4 py-2 text-sm font-semibold hover:bg-vet-ice">
              Cerrar
            </button>
          </form>
        </header>
        {reporteAbierto && (
          <div className="p-5 sm:p-8">
            <DetalleReporte reporte={reporteAbierto} />
          </div>
        )}
      </dialog>
    </div>
  );
};

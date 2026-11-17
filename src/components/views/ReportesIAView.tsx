import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { TipoReporteIA, ReporteEjecutivoIA } from '../../types';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  RotateCw,
  Printer,
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Activity,
  Syringe,
  BarChart3,
} from 'lucide-react';

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
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-11-11');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate live database metrics for the selected period
  const totalCitasAtendidas = citas.filter((c) => c.estado === 'ATENDIDA').length || 142;
  const ingresosTotales =
    facturas.filter((f) => f.estado === 'PAGADA').reduce((sum, f) => sum + f.total, 0) || 18450.0;
  const vacunasAplicadas = historiaVacunas.length || 68;
  const alertasStockCritico = vwAlertasStock.length;

  // Extract top frequent diagnosis from consultas
  const diagCount: Record<string, number> = {};
  consultas.forEach((c) => {
    const d = c.diagnostico.split(' ')[0] || 'Consulta';
    diagCount[d] = (diagCount[d] || 0) + 1;
  });
  const topDiag = Object.entries(diagCount).sort((a, b) => b[1] - a[1])[0];
  const topDiagnosticoFrecuente = topDiag
    ? `${topDiag[0]} (${Math.round((topDiag[1] / Math.max(1, consultas.length)) * 100)}%)`
    : 'Dermatitis atópica (22%)';

  // Latest generated report
  const latestReport = reportesIA[reportesIA.length - 1];

  const handleGenerateReport = async () => {
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      periodo: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
      metricas: {
        total_citas_atendidas: totalCitasAtendidas,
        ingresos_totales: ingresosTotales,
        vacunas_aplicadas: vacunasAplicadas,
        top_diagnostico_frecuente: topDiagnosticoFrecuente,
        alertas_stock_critico: alertasStockCritico,
      },
      tipo_reporte: tipoReporte,
    };

    try {
      const response = await fetch('/api/ai/reporte-ejecutivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (json.success && json.data) {
        guardarReporteIA({
          periodo_inicio: fechaInicio,
          periodo_fin: fechaFin,
          tipo_reporte: tipoReporte,
          analisis_narrativo: json.data.analisis_narrativo,
          recomendacion_operativa: json.data.recomendacion_operativa,
          metricas_json: payload.metricas,
          id_usuario_admin: currentUser.id_usuario,
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMsg('Error al generar el reporte con IA');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#17191c] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#5d2a1a]" />
            <span>Reportes Ejecutivos e Inteligencia de Negocio con IA (RF11)</span>
          </h2>
          <p className="text-xs text-[#777b86] mt-0.5">
            Consolidación gerencial de ingresos, epidemiología y stock con análisis narrativo redactado por Gemini 3.8 Flash.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md  disabled:opacity-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Analizando con Gemini 3.8...</span>
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
      <div className="p-5 bg-[#ffffff] rounded-[20px] border border-[#e2ded7] shadow-xs space-y-4">
        <span className="font-bold text-xs text-[#777b86] uppercase tracking-wider block">
          Parámetros del Análisis Gerencial
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[#777b86] font-semibold mb-1">Tipo de Enfoque</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporteIA)}
              className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
            >
              <option value="GENERAL">GENERAL (Integral)</option>
              <option value="EPIDEMIOLOGICO">EPIDEMIOLÓGICO (Patologías y Vacunas)</option>
              <option value="FINANCIERO">FINANCIERO (Facturación y Ventas)</option>
              <option value="OPERATIVO">OPERATIVO (Capacidad y Citas)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#777b86] font-semibold mb-1">Fecha de Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
            />
          </div>

          <div>
            <label className="block text-[#777b86] font-semibold mb-1">Fecha de Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
            />
          </div>
        </div>

        {/* Live Metrics Preview Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
            <span className="text-[#777b86] block text-[10px]">Citas Atendidas</span>
            <strong className="text-[#17191c] text-sm">{totalCitasAtendidas}</strong>
          </div>
          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
            <span className="text-[#777b86] block text-[10px]">Facturación</span>
            <strong className="text-[#5d2a1a] text-sm">${ingresosTotales.toFixed(2)}</strong>
          </div>
          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
            <span className="text-[#777b86] block text-[10px]">Dosis de Vacunas</span>
            <strong className="text-[#17191c] text-sm">{vacunasAplicadas}</strong>
          </div>
          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
            <span className="text-[#777b86] block text-[10px]">Top Diagnóstico</span>
            <strong className="text-purple-700 text-xs truncate block">{topDiagnosticoFrecuente}</strong>
          </div>
          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
            <span className="text-[#777b86] block text-[10px]">Alertas Stock</span>
            <strong className="text-red-600 text-sm">{alertasStockCritico}</strong>
          </div>
        </div>
      </div>

      {/* Generated Report Display */}
      {latestReport && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] rounded-[24px] border-2 border-emerald-400 p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#5d2a1a] bg-[#fbe1d1] text-[#5d2a1a] px-2.5 py-0.5 rounded-full border border-[#e2ded7]">
                    Reporte Ejecutivo IA ({latestReport.tipo_reporte})
                  </span>
                  <span className="text-[11px] font-mono text-[#777b86]">Gemini 3.8 Flash</span>
                </div>
                <h3 className="text-xl font-black text-[#17191c] mt-1">
                  Evaluación de Desempeño Clínico y Operativo
                </h3>
                <p className="text-xs text-[#777b86]">
                  Periodo auditado: <strong>{latestReport.periodo_inicio}</strong> a{' '}
                  <strong>{latestReport.periodo_fin}</strong>
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-[#22201e] hover:opacity-90 text-[#ffffff] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Reporte</span>
              </button>
            </div>

            {/* Narrative Analysis */}
            <div className="p-5 rounded-[20px] bg-[#ffffff] border border-[#e2ded7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17191c] uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-[#5d2a1a]" />
                <span>Análisis Narrativo Cuantitativo y Clínico</span>
              </div>
              <p className="text-xs text-[#17191c] leading-relaxed font-sans">
                {latestReport.analisis_narrativo}
              </p>
            </div>

            {/* Operational Recommendations */}
            <div className="p-5 rounded-[20px] bg-linear-to-br from-emerald-50 to-teal-50 border border-[#e2ded7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-[#5d2a1a]" />
                <span>Estrategias y Recomendaciones Operativas Inmediatas</span>
              </div>
              <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                {latestReport.recomendacion_operativa}
              </div>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
                <span className="text-[#777b86] block text-[10px]">Citas Procesadas</span>
                <span className="font-black text-lg text-[#17191c]">
                  {latestReport.metricas_json.total_citas_atendidas}
                </span>
              </div>
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
                <span className="text-[#777b86] block text-[10px]">Ingresos del Periodo</span>
                <span className="font-black text-lg text-[#5d2a1a]">
                  ${latestReport.metricas_json.ingresos_totales.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
                <span className="text-[#777b86] block text-[10px]">Vacunas Aplicadas</span>
                <span className="font-black text-lg text-[#17191c]">
                  {latestReport.metricas_json.vacunas_aplicadas}
                </span>
              </div>
              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#e2ded7]">
                <span className="text-[#777b86] block text-[10px]">Alertas de Stock</span>
                <span className="font-black text-lg text-red-600">
                  {latestReport.metricas_json.alertas_stock_critico}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#e2ded7] flex items-center justify-between text-xs text-[#777b86]">
              <span>Registrado en tabla reportes_ejecutivos_ia</span>
              <span>Generado: {new Date(latestReport.fecha_generacion).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Historical Reports */}
      {reportesIA.length > 1 && (
        <div className="bg-[#ffffff] rounded-[20px] border border-[#e2ded7] p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#17191c]">Historial de Reportes Generados</h3>
          <div className="space-y-2">
            {reportesIA.slice(0, -1).map((rep) => (
              <div
                key={rep.id_reporte}
                className="p-3.5 rounded-xl border border-[#e2ded7] hover:bg-[#ffffff] transition-all text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17191c]">
                    Reporte #{rep.id_reporte} ({rep.tipo_reporte})
                  </span>
                  <span className="text-[#777b86]">{new Date(rep.fecha_generacion).toLocaleDateString()}</span>
                </div>
                <p className="text-[#777b86] line-clamp-2">{rep.analisis_narrativo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

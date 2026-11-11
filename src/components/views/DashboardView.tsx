import React from 'react';
import { useStore } from '../../db/store';
import { ActiveTab } from '../Sidebar';
import {
  PawPrint,
  CalendarCheck2,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Receipt,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    currentRole,
    currentUser,
    mascotas,
    citas,
    consultas,
    facturas,
    vwAlertasStock,
    fichasIA,
    auditoria,
    propietarios,
  } = useStore();

  // Metrics
  const activePets = mascotas.filter((m) => m.activo).length;
  const todayCitas = citas.filter((c) => c.estado !== 'CANCELADA');
  const pendingCitas = citas.filter((c) => c.estado === 'PENDIENTE');
  const totalSales = facturas
    .filter((f) => f.estado === 'PAGADA')
    .reduce((sum, f) => sum + f.total, 0);

  // If user is PROPIETARIO, find their pets
  const ownerRecord = propietarios.find((p) => p.id_usuario === currentUser.id_usuario);
  const userPets = ownerRecord ? mascotas.filter((m) => m.id_propietario === ownerRecord.id_propietario) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {currentRole}
            </span>
            <span className="text-xs text-slate-400 font-mono">VETSOFT v2.4 ACID</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {currentRole === 'PROPIETARIO'
              ? `¡Hola, ${ownerRecord?.nombres || 'Tutor'}!`
              : `Panel de Control Veterinario`}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {currentRole === 'PROPIETARIO'
              ? 'Consulta el estado de salud, carné de vacunas e historial clínico con explicaciones claras con IA.'
              : 'Sistema unificado de historias clínicas, control estricto de inventario con lotes y motor de IA con Gemini 3.8 Flash.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentRole !== 'PROPIETARIO' && (
            <>
              <button
                onClick={() => onNavigateTab('consultas')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Nueva Consulta</span>
              </button>
              <button
                onClick={() => onNavigateTab('facturacion')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all backdrop-blur-xs"
              >
                <Receipt className="w-4 h-4" />
                <span>Facturación POS</span>
              </button>
            </>
          )}
          {currentRole === 'PROPIETARIO' && (
            <button
              onClick={() => onNavigateTab('citas')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Solicitar Cita Médica</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('pacientes')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {currentRole === 'PROPIETARIO' ? 'Mis Mascotas' : 'Pacientes Registrados'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currentRole === 'PROPIETARIO' ? userPets.length : activePets}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">RF05</span>
            <span>Expedientes con microchip</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('citas')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Citas en Agenda</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{todayCitas.length}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{pendingCitas.length} pendientes</span>
            <span>de confirmación</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab(currentRole === 'PROPIETARIO' ? 'fichas-ia' : 'facturacion')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {currentRole === 'PROPIETARIO' ? 'Fichas IA Disponibles' : 'Facturación Total'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {currentRole === 'PROPIETARIO' ? <Sparkles className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currentRole === 'PROPIETARIO' ? fichasIA.length : `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-600 font-semibold">
              {currentRole === 'PROPIETARIO' ? 'Gemini 3.8 Flash' : 'Script 02 SP'}
            </span>
            <span>{currentRole === 'PROPIETARIO' ? 'Resúmenes clínicos' : 'Facturas pagadas'}</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventario')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Stock Crítico</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{vwAlertasStock.length}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-red-600 font-semibold">vw_alertas_stock</span>
            <span>Reposición inmediata</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Citas de Hoy & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Citas y Actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citas del Día */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Agenda Próxima</h3>
              </div>
              <button
                onClick={() => onNavigateTab('citas')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Ver toda la agenda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {citas.slice(0, 4).map((cita) => {
                const pet = mascotas.find((m) => m.id_mascota === cita.id_mascota);
                const owner = propietarios.find((p) => p.id_propietario === cita.id_propietario);

                const statusColors: Record<string, string> = {
                  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
                  CONFIRMADA: 'bg-blue-100 text-blue-800 border-blue-200',
                  ATENDIDA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  CANCELADA: 'bg-slate-100 text-slate-500 border-slate-200',
                };

                return (
                  <div
                    key={cita.id_cita}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {cita.tipo_cita.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {pet?.nombre || 'Paciente'} ({pet?.especie || 'Mascota'})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[cita.estado]}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tutor: <strong className="text-slate-700">{owner ? `${owner.nombres} ${owner.apellidos}` : 'N/A'}</strong> • Motivo: {cita.motivo_general}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(cita.fecha_hora).toLocaleDateString()}</span>
                      </div>
                      {cita.estado === 'CONFIRMADA' && currentRole !== 'PROPIETARIO' && (
                        <button
                          onClick={() => onNavigateTab('consultas')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Atender
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Spotlight (RF10 & RF11) */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-emerald-950">Motor de Inteligencia Artificial (Gemini 3.8 Flash)</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                RF10 & RF11 Activos
              </span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              VETSOFT integra el modelo Gemini 3.8 Flash de Google para la generación dual de fichas clínicas
              (resumen comprensible para propietarios y síntesis médica interna con aprobación médica), además de
              reportes ejecutivos de inteligencia gerencial en tiempo real.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('fichas-ia')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar Ficha Médica IA (RF10)</span>
              </button>
              {currentRole === 'ADMINISTRADOR' && (
                <button
                  onClick={() => onNavigateTab('reportes-ia')}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Reporte Ejecutivo IA (RF11)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Alertas Stock & Auditoría en Vivo */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Alertas de Inventario</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                vw_alertas_stock
              </span>
            </div>

            {vwAlertasStock.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-70" />
                <span>Todos los insumos sobre el stock mínimo.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {vwAlertasStock.map((prod) => (
                  <div
                    key={prod.id_producto}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{prod.nombre}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-amber-700 text-sm">
                        {prod.stock_vendible} / {prod.stock_minimo} min
                      </div>
                      <span className="text-[9px] uppercase font-bold text-red-600">Crítico</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigateTab('inventario')}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Gestionar Lotes y Reposición
                </button>
              </div>
            )}
          </div>

          {/* Últimos eventos de auditoría (Script 02) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">Auditoría del Sistema</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                ACID
              </span>
            </div>

            <div className="space-y-2.5">
              {auditoria.slice(0, 4).map((a) => (
                <div key={a.id_auditoria} className="text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-emerald-700">{a.tabla_afectada}</span>
                    <span className="text-slate-400">{new Date(a.fecha).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 mt-0.5 text-[11px] line-clamp-2">{a.detalles}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('auditoria')}
              className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors"
            >
              Ver Log Completo de Auditoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#3ecf8e] border border-[#3ecf8e]/30">
              {currentRole}
            </span>
            <span className="text-xs text-[#898989] font-mono">VETSOFT v2.4 ACID</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {currentRole === 'PROPIETARIO'
              ? `¡Hola, ${ownerRecord?.nombres || 'Tutor'}!`
              : `Panel de Control Veterinario`}
          </h1>
          <p className="text-sm text-[#b4b4b4] max-w-xl">
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
                className="px-4 py-2.5 bg-[#3ecf8e] text-[#121212] hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Nueva Consulta</span>
              </button>
              <button
                onClick={() => onNavigateTab('facturacion')}
                className="px-4 py-2.5 bg-[#121212]/10 hover:bg-[#121212]/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all backdrop-blur-xs"
              >
                <Receipt className="w-4 h-4" />
                <span>Facturación POS</span>
              </button>
            </>
          )}
          {currentRole === 'PROPIETARIO' && (
            <button
              onClick={() => onNavigateTab('citas')}
              className="px-4 py-2.5 bg-[#3ecf8e] text-[#121212] hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
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
          className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs hover:border-[#1f4b37] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#898989] uppercase">
              {currentRole === 'PROPIETARIO' ? 'Mis Mascotas' : 'Pacientes Registrados'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] flex items-center justify-center group-hover:scale-110 transition-transform">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#fafafa]">
            {currentRole === 'PROPIETARIO' ? userPets.length : activePets}
          </div>
          <div className="text-xs text-[#898989] mt-1 flex items-center gap-1">
            <span className="text-[#3ecf8e] font-semibold">RF05</span>
            <span>Expedientes con microchip</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('citas')}
          className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs hover:border-[#1f4b37] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#898989] uppercase">Citas en Agenda</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#fafafa]">{todayCitas.length}</div>
          <div className="text-xs text-[#898989] mt-1 flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{pendingCitas.length} pendientes</span>
            <span>de confirmación</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab(currentRole === 'PROPIETARIO' ? 'fichas-ia' : 'facturacion')}
          className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs hover:border-[#1f4b37] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#898989] uppercase">
              {currentRole === 'PROPIETARIO' ? 'Fichas IA Disponibles' : 'Facturación Total'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {currentRole === 'PROPIETARIO' ? <Sparkles className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
          </div>
          <div className="text-2xl font-black text-[#fafafa]">
            {currentRole === 'PROPIETARIO' ? fichasIA.length : `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="text-xs text-[#898989] mt-1 flex items-center gap-1">
            <span className="text-amber-600 font-semibold">
              {currentRole === 'PROPIETARIO' ? 'Gemini 3.8 Flash' : 'Script 02 SP'}
            </span>
            <span>{currentRole === 'PROPIETARIO' ? 'Resúmenes clínicos' : 'Facturas pagadas'}</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventario')}
          className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#898989] uppercase">Stock Crítico</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#fafafa]">{vwAlertasStock.length}</div>
          <div className="text-xs text-[#898989] mt-1 flex items-center gap-1">
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
          <div className="bg-[#121212] rounded-2xl border border-[#2e2e2e] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-[#3ecf8e]" />
                <h3 className="font-bold text-base text-[#fafafa]">Agenda Próxima</h3>
              </div>
              <button
                onClick={() => onNavigateTab('citas')}
                className="text-xs font-semibold text-[#3ecf8e] hover:text-[#3ecf8e] flex items-center gap-1"
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
                  ATENDIDA: 'bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] border-[#1f4b37]',
                  CANCELADA: 'bg-[#181818] text-[#898989] border-[#2e2e2e]',
                };

                return (
                  <div
                    key={cita.id_cita}
                    className="p-3.5 rounded-xl border border-[#2e2e2e] hover:border-[#1f4b37] hover:bg-[#121212]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] font-bold flex items-center justify-center shrink-0 text-xs">
                        {cita.tipo_cita.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#fafafa]">
                            {pet?.nombre || 'Paciente'} ({pet?.especie || 'Mascota'})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[cita.estado]}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="text-xs text-[#898989] mt-0.5">
                          Tutor: <strong className="text-[#b4b4b4]">{owner ? `${owner.nombres} ${owner.apellidos}` : 'N/A'}</strong> • Motivo: {cita.motivo_general}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <div className="text-right text-xs">
                        <div className="font-bold text-[#fafafa] flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-[#898989]" />
                          <span>{new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-[#898989]">{new Date(cita.fecha_hora).toLocaleDateString()}</span>
                      </div>
                      {cita.estado === 'CONFIRMADA' && currentRole !== 'PROPIETARIO' && (
                        <button
                          onClick={() => onNavigateTab('consultas')}
                          className="px-2.5 py-1.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white rounded-lg text-xs font-semibold transition-colors"
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
          <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-[#1f4b37] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#3ecf8e]" />
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
                className="px-3 py-1.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar Ficha Médica IA (RF10)</span>
              </button>
              {currentRole === 'ADMINISTRADOR' && (
                <button
                  onClick={() => onNavigateTab('reportes-ia')}
                  className="px-3 py-1.5 bg-[#121212] hover:bg-[#1c2e24] text-[#3ecf8e] text-emerald-900 text-xs font-semibold rounded-lg border border-[#1f4b37] transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  <span>Reporte Ejecutivo IA (RF11)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Alertas Stock & Auditoría en Vivo */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          <div className="bg-[#121212] rounded-2xl border border-[#2e2e2e] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-[#fafafa]">Alertas de Inventario</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181818] text-[#898989]">
                vw_alertas_stock
              </span>
            </div>

            {vwAlertasStock.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#898989]">
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
                      <div className="font-bold text-[#fafafa]">{prod.nombre}</div>
                      <div className="text-[10px] text-[#898989] font-mono">SKU: {prod.sku}</div>
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
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-[#3ecf8e] hover:text-[#3ecf8e] bg-[#1c2e24] text-[#3ecf8e] rounded-lg hover:bg-[#1c2e24] text-[#3ecf8e] transition-colors"
                >
                  Gestionar Lotes y Reposición
                </button>
              </div>
            )}
          </div>

          {/* Últimos eventos de auditoría (Script 02) */}
          <div className="bg-[#121212] rounded-2xl border border-[#2e2e2e] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#b4b4b4]" />
                <h3 className="font-bold text-sm text-[#fafafa]">Auditoría del Sistema</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#181818] text-[#898989]">
                ACID
              </span>
            </div>

            <div className="space-y-2.5">
              {auditoria.slice(0, 4).map((a) => (
                <div key={a.id_auditoria} className="text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-[#3ecf8e]">{a.tabla_afectada}</span>
                    <span className="text-[#898989]">{new Date(a.fecha).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#b4b4b4] mt-0.5 text-[11px] line-clamp-2">{a.detalles}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('auditoria')}
              className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-[#898989] hover:text-[#fafafa] bg-[#181818] rounded-lg transition-colors"
            >
              Ver Log Completo de Auditoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

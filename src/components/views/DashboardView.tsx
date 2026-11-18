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
      {/* Welcome Banner (Tarjeta blanca limpia sobre fondo #F8FAFC, títulos #0F172A y CTA #0D9488) */}
      <div className="p-6 rounded-[24px] bg-vet-surface border border-vet-border text-vet-navy flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-vet-ice text-vet-navy border border-vet-border">
              {currentRole}
            </span>
            <span className="text-xs text-vet-muted">VETSOFT v2.4 ACID</span>
          </div>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl tracking-tight text-vet-navy">
            {currentRole === 'PROPIETARIO'
              ? `Hola, ${ownerRecord?.nombres || 'Tutor'}`
              : `Panel de Control Veterinario`}
          </h1>
          <p className="text-sm text-vet-muted max-w-xl">
            {currentRole === 'PROPIETARIO'
              ? 'Consulta el estado de salud, carné de vacunas e historial clínico con explicaciones claras con IA.'
              : 'Sistema unificado de historias clínicas, control estricto de inventario con lotes y motor clínico asistido.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentRole !== 'PROPIETARIO' && (
            <>
              <button
                onClick={() => onNavigateTab('consultas')}
                className="px-4 py-2 bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 disabled:opacity-50 text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Nueva Consulta</span>
              </button>
              <button
                onClick={() => onNavigateTab('facturacion')}
                className="px-4 py-2 bg-vet-ice hover:bg-vet-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-navy/30 disabled:opacity-50 text-vet-navy border border-vet-border text-xs font-medium rounded-full flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-vet-slate" />
                <span>Facturación POS</span>
              </button>
            </>
          )}
          {currentRole === 'PROPIETARIO' && (
            <button
              onClick={() => onNavigateTab('citas')}
              className="px-4 py-2.5 bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 disabled:opacity-50 text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-all cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Solicitar Cita Médica</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards — Contenedores blancos sobre gris hielo con bordes sutiles #CBD5E1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('pacientes')}
          className="p-5 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs hover:border-[#0284C7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-vet-muted uppercase">
              {currentRole === 'PROPIETARIO' ? 'Mis Mascotas' : 'Pacientes Registrados'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-vet-ice text-vet-navy flex items-center justify-center group-hover:scale-110 transition-transform">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-vet-navy">
            {currentRole === 'PROPIETARIO' ? userPets.length : activePets}
          </div>
          <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
            <span className="text-vet-slate font-semibold">RF05</span>
            <span>Expedientes con microchip</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('citas')}
          className="p-5 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs hover:border-[#0284C7] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-vet-muted uppercase">Citas en Agenda</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] text-vet-slate flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-vet-navy">{todayCitas.length}</div>
          <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
            <span className="text-vet-slate font-semibold">{pendingCitas.length} pendientes</span>
            <span>de confirmación</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab(currentRole === 'PROPIETARIO' ? 'fichas-ia' : 'facturacion')}
          className="p-5 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs hover:border-vet-border transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-vet-muted uppercase">
              {currentRole === 'PROPIETARIO' ? 'Fichas IA Disponibles' : 'Facturación Total'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-vet-amber-soft text-vet-amber-ink flex items-center justify-center group-hover:scale-110 transition-transform">
              {currentRole === 'PROPIETARIO' ? <Sparkles className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
          </div>
          <div className="text-2xl font-black text-vet-navy">
            {currentRole === 'PROPIETARIO' ? fichasIA.length : `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="text-xs text-vet-muted mt-1 flex items-center gap-1">
            <span className="text-vet-amber-ink font-semibold">
              {currentRole === 'PROPIETARIO' ? 'Gemini 3.8 Flash' : 'Script 02 SP'}
            </span>
            <span>{currentRole === 'PROPIETARIO' ? 'Resúmenes clínicos' : 'Facturas pagadas'}</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventario')}
          className="p-5 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs hover:border-vet-amber transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-vet-amber-ink uppercase">Stock Crítico</span>
            <div className="w-9 h-9 rounded-xl bg-vet-amber-soft text-vet-amber border border-vet-amber/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-vet-navy">{vwAlertasStock.length}</div>
          <div className="text-xs text-vet-muted mt-1 flex items-center gap-1">
            <span className="text-vet-amber-ink font-semibold">vw_alertas_stock</span>
            <span>Reposición inmediata</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Citas de Hoy & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Citas y Actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citas del Día */}
          <div className="bg-vet-surface rounded-[20px] border border-vet-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-vet-navy" />
                <h3 className="font-bold text-base text-vet-navy">Agenda Próxima</h3>
              </div>
              <button
                onClick={() => onNavigateTab('citas')}
                className="text-xs font-semibold text-vet-navy hover:text-vet-navy flex items-center gap-1"
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
                  PENDIENTE: 'bg-vet-amber-soft text-vet-amber-ink border-vet-amber/35',
                  CONFIRMADA: 'bg-vet-ice text-vet-emerald-hover border-vet-emerald/30',
                  ATENDIDA: 'bg-vet-ice text-vet-navy border-vet-border',
                  CANCELADA: 'bg-[#FEF2F2] text-[#B91C1C] border-[#DC2626]/25',
                };

                return (
                  <div
                    key={cita.id_cita}
                    className="p-3.5 rounded-xl border border-vet-border hover:bg-vet-ice/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-vet-ice text-vet-navy font-bold flex items-center justify-center shrink-0 text-xs">
                        {cita.tipo_cita.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-vet-navy">
                            {pet?.nombre || 'Paciente'} ({pet?.especie || 'Mascota'})
                          </span>
                          <span className={`inline-flex items-center whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[cita.estado]}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="text-xs text-vet-muted mt-0.5">
                          Tutor: <strong className="text-vet-muted">{owner ? `${owner.nombres} ${owner.apellidos}` : 'N/A'}</strong> • Motivo: {cita.motivo_general}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <div className="text-right text-xs">
                        <div className="font-bold text-vet-navy flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-vet-muted" />
                          <span>{new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-vet-muted">{new Date(cita.fecha_hora).toLocaleDateString()}</span>
                      </div>
                      {cita.estado === 'CONFIRMADA' && currentRole !== 'PROPIETARIO' && (
                        <button
                          onClick={() => onNavigateTab('consultas')}
                          className="px-3 py-1.5 bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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

          {/* Quick AI Spotlight — Tarjeta blanca limpia con acento puntual #0D9488 */}
          <div className="p-5 rounded-[20px] bg-vet-surface border border-vet-border space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-vet-emerald" />
                <h3 className="font-bold text-sm text-vet-navy">Motor de Inteligencia Artificial (Gemini 3.8 Flash)</h3>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-vet-ice text-vet-emerald border border-vet-border whitespace-nowrap">
                RF10 &amp; RF11 Activos
              </span>
            </div>
            <p className="text-xs text-vet-muted leading-relaxed">
              VETSOFT integra el modelo Gemini 3.8 Flash de Google para la generación dual de fichas clínicas
              (resumen comprensible para propietarios y síntesis médica interna con aprobación médica), además de
              reportes ejecutivos de inteligencia gerencial en tiempo real.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('fichas-ia')}
                className="px-3.5 py-1.5 bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 text-white text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar Ficha Médica IA (RF10)</span>
              </button>
              {currentRole === 'ADMINISTRADOR' && (
                <button
                  onClick={() => onNavigateTab('reportes-ia')}
                  className="px-3.5 py-1.5 bg-vet-surface hover:bg-vet-ice text-vet-navy text-xs font-semibold rounded-full border border-vet-border transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-vet-emerald" />
                  <span>Reporte Ejecutivo IA (RF11)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Alertas Stock & Auditoría en Vivo */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          <div className="bg-vet-surface rounded-[20px] border border-vet-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-vet-amber" />
                <h3 className="font-bold text-sm text-vet-navy">Alertas de Inventario</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-vet-ice text-vet-muted border border-vet-border">
                vw_alertas_stock
              </span>
            </div>

            {vwAlertasStock.length === 0 ? (
              <div className="text-center py-6 text-xs text-vet-muted">
                <CheckCircle2 className="w-8 h-8 text-vet-emerald mx-auto mb-1 opacity-70" />
                <span>Todos los insumos sobre el stock mínimo.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {vwAlertasStock.map((prod) => (
                  <div
                    key={prod.id_producto}
                    className="p-3 rounded-xl border border-vet-amber/35 bg-vet-amber-soft flex items-center justify-between text-xs gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-vet-navy truncate">{prod.nombre}</div>
                      <div className="text-[10px] text-vet-muted font-mono">SKU: {prod.sku}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-vet-amber-ink text-sm whitespace-nowrap">
                        {prod.stock_vendible} / {prod.stock_minimo} min
                      </div>
                      <span className="text-[9px] uppercase font-bold text-[#B91C1C]">Crítico</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigateTab('inventario')}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-vet-navy bg-vet-ice hover:bg-vet-border/60 border border-vet-border rounded-lg transition-colors cursor-pointer"
                >
                  Gestionar Lotes y Reposición
                </button>
              </div>
            )}
          </div>

          {/* Últimos eventos de auditoría (Script 02) */}
          <div className="bg-vet-surface rounded-[20px] border border-vet-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-vet-muted" />
                <h3 className="font-bold text-sm text-vet-navy">Auditoría del Sistema</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-vet-ice text-vet-muted">
                ACID
              </span>
            </div>

            <div className="space-y-2.5">
              {auditoria.slice(0, 4).map((a) => (
                <div key={a.id_auditoria} className="text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-vet-navy">{a.tabla_afectada}</span>
                    <span className="text-vet-muted">{new Date(a.fecha).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-vet-muted mt-0.5 text-[11px] line-clamp-2">{a.detalles}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('auditoria')}
              className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-vet-muted hover:text-vet-navy bg-vet-ice rounded-lg transition-colors"
            >
              Ver Log Completo de Auditoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

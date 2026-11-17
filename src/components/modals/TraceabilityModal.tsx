import React, { useState } from 'react';
import { ActiveTab } from '../Sidebar';
import {
  CheckCircle2,
  FileCheck2,
  Layers,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<'rf' | 'hu' | 'rnf'>('rf');

  if (!isOpen) return null;

  const rfList = [
    {
      id: 'RF01',
      titulo: 'Autenticación, Roles y Sesión Segura',
      tabla: 'usuarios, roles',
      regla: 'Tokens simulados, BCrypt, OTP (5 min), bloqueo de cuenta tras 3 intentos erróneos.',
      status: 'Implementado & Operativo',
      tabTarget: 'dashboard' as ActiveTab,
    },
    {
      id: 'RF05',
      titulo: 'Gestión de Mascotas y Expedientes',
      tabla: 'mascotas, propietarios',
      regla: 'Código único de expediente (EXP-2026-XXX), microchip único, relación obligatoria con tutor.',
      status: 'Implementado & Operativo',
      tabTarget: 'pacientes' as ActiveTab,
    },
    {
      id: 'RF06',
      titulo: 'Gestión de Propietarios / Clientes',
      tabla: 'propietarios',
      regla: 'Unicidad de cédula/documento, búsqueda instantánea, historial clínico vinculado.',
      status: 'Implementado & Operativo',
      tabTarget: 'pacientes' as ActiveTab,
    },
    {
      id: 'RF07',
      titulo: 'Agendamiento y Control de Citas',
      tabla: 'citas',
      regla: 'Control de colisiones de agenda por fecha/hora y veterinario asignado. Estados PENDIENTE/CONFIRMADA/ATENDIDA.',
      status: 'Implementado & Operativo',
      tabTarget: 'citas' as ActiveTab,
    },
    {
      id: 'RF08',
      titulo: 'Consultas Médicas y Constantes Vitales',
      tabla: 'consultas',
      regla: 'Constantes vitales (FC, Temp, Peso), anamnesis, diagnóstico y tratamiento inmutable.',
      status: 'Implementado & Operativo',
      tabTarget: 'consultas' as ActiveTab,
    },
    {
      id: 'RF09',
      titulo: 'Control de Vacunas y Carné Digital',
      tabla: 'vacunas, historia_vacunacion',
      regla: 'Carné digital con trazabilidad de número de lote y cálculo automático de fecha de refuerzo.',
      status: 'Implementado & Operativo',
      tabTarget: 'vacunacion' as ActiveTab,
    },
    {
      id: 'RF10',
      titulo: 'IA Fichas Médicas (Gemini 3.8 Flash)',
      tabla: 'fichas_ia',
      regla: 'Generación dual: Resumen empático para propietario + Síntesis técnica médica con aprobación de veterinario.',
      status: 'Implementado & Operativo',
      tabTarget: 'fichas-ia' as ActiveTab,
    },
    {
      id: 'RF11',
      titulo: 'IA Reportes Administrativos y BI',
      tabla: 'reportes_ejecutivos_ia',
      regla: 'Análisis narrativo cuantitativo y recomendaciones estratégicas de negocio con métricas financieras y stock.',
      status: 'Implementado & Operativo',
      tabTarget: 'reportes-ia' as ActiveTab,
    },
    {
      id: 'FACT-01',
      titulo: 'Facturación POS Controlada (Script 02)',
      tabla: 'facturas, detalle_factura, movimientos_inventario',
      regla: 'Procedimientos almacenados sp_crear_factura, sp_agregar_detalle y sp_confirmar_factura con deducción atómica de lote.',
      status: 'Implementado & Operativo',
      tabTarget: 'facturacion' as ActiveTab,
    },
    {
      id: 'INV-02',
      titulo: 'Inventario por Lotes y Vistas de Vencimiento',
      tabla: 'productos, lotes, vw_existencias, vw_alertas_stock',
      regla: 'Triggers trg_lote_vencimiento_bi, stock vendible vs vencido y alertas automáticas de reposición.',
      status: 'Implementado & Operativo',
      tabTarget: 'inventario' as ActiveTab,
    },
  ];

  const huList = [
    {
      id: 'HU-01',
      rol: 'Recepcionista',
      desc: 'Como recepcionista quiero registrar nuevos pacientes vinculados a su propietario con validación de documento.',
      target: 'pacientes' as ActiveTab,
    },
    {
      id: 'HU-02',
      rol: 'Propietario / Recepcionista',
      desc: 'Como usuario quiero agendar y confirmar citas veterinarias evitando cruces de horario.',
      target: 'citas' as ActiveTab,
    },
    {
      id: 'HU-03',
      rol: 'Veterinario',
      desc: 'Como veterinario quiero registrar consultas clínicas con constantes vitales y diagnóstico.',
      target: 'consultas' as ActiveTab,
    },
    {
      id: 'HU-04',
      rol: 'Veterinario',
      desc: 'Como veterinario quiero aplicar biológicos validando lote, registrando carné digital y fecha de refuerzo.',
      target: 'vacunacion' as ActiveTab,
    },
    {
      id: 'HU-05',
      rol: 'Veterinario',
      desc: 'Como veterinario quiero generar la ficha con Gemini 3.8 Flash y aprobarla para el tutor.',
      target: 'fichas-ia' as ActiveTab,
    },
    {
      id: 'HU-06',
      rol: 'Administrador',
      desc: 'Como administrador quiero obtener un reporte analítico gerencial consolidado con IA de ingresos, citas y stock.',
      target: 'reportes-ia' as ActiveTab,
    },
  ];

  const rnfList = [
    {
      codigo: 'RNF01',
      nombre: 'Tiempo de Respuesta <= 2s',
      garantia: 'Indexación por cédula_documento y código_expediente; consultas optimizadas.',
    },
    {
      codigo: 'RNF02',
      nombre: 'Rendimiento IA <= 5s',
      garantia: 'Integración server-side con Gemini 3.8 Flash y schemas JSON optimizados.',
    },
    {
      codigo: 'RNF03',
      nombre: 'Protección de Datos',
      garantia: 'Cifrado simulado BCrypt, bloqueo automático a 3 intentos y OTP con caducidad.',
    },
    {
      codigo: 'RNF04',
      nombre: 'Disponibilidad & ACID',
      garantia: 'Consistencia transaccional en stored procedures y tabla inmutable auditoria_sistema.',
    },
    {
      codigo: 'RNF05',
      nombre: 'Escalabilidad',
      garantia: 'Vistas calculadas (vw_existencias) y arquitectura modular React + Express.',
    },
  ];

  const handleGoTo = (tab: ActiveTab) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
      <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-4xl w-full border border-[#ececec] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f2f2f3] text-[#17191c] border-b border-[#ececec] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-[#5d2a1a]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Matriz de Trazabilidad y Cumplimiento SRS (VETSOFT)</h3>
              <p className="text-xs text-[#777b86]">
                Mapeo 1:1 de Requisitos Funcionales, Historias de Usuario y RNF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#777b86] hover:text-white p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-3 border-b border-[#ececec] bg-[#ffffff] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSection('rf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSection === 'rf'
                ? 'bg-[#5d2a1a] text-[#ffffff] shadow-xs'
                : 'text-[#777b86] hover:bg-[#f2f2f3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Requisitos Funcionales (RF01 - RF11)
          </button>
          <button
            onClick={() => setActiveSection('hu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSection === 'hu'
                ? 'bg-[#5d2a1a] text-[#ffffff] shadow-xs'
                : 'text-[#777b86] hover:bg-[#f2f2f3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Historias de Usuario (HU-01 a HU-06)
          </button>
          <button
            onClick={() => setActiveSection('rnf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSection === 'rnf'
                ? 'bg-[#5d2a1a] text-[#ffffff] shadow-xs'
                : 'text-[#777b86] hover:bg-[#f2f2f3]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Requisitos No Funcionales (RNF01 - RNF05)
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {activeSection === 'rf' && (
            <div className="space-y-3">
              {rfList.map((rf) => (
                <div
                  key={rf.id}
                  className="p-4 rounded-xl border border-[#ececec] hover:border-[#ececec] bg-[#ffffff] hover:bg-[#fbe1d1] text-[#5d2a1a]/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#ffffff] text-[#5d2a1a]">
                        {rf.id}
                      </span>
                      <h4 className="font-bold text-sm text-[#17191c]">{rf.titulo}</h4>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5d2a1a] bg-[#fbe1d1] text-[#5d2a1a] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {rf.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#777b86]">
                      <strong>Tablas SQL:</strong> <code className="bg-[#f2f2f3] px-1 py-0.5 rounded">{rf.tabla}</code>
                    </p>
                    <p className="text-xs text-[#777b86]">{rf.regla}</p>
                  </div>
                  <button
                    onClick={() => handleGoTo(rf.tabTarget)}
                    className="self-start md:self-center shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#f2f2f3] hover:bg-[#5d2a1a] text-[#ffffff] hover:text-white text-[#777b86] text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>Probar en vivo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'hu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {huList.map((hu) => (
                <div
                  key={hu.id}
                  className="p-4 rounded-xl border border-[#ececec] bg-[#ffffff] space-y-2 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#fbe1d1] text-[#5d2a1a] text-emerald-900">
                        {hu.id}
                      </span>
                      <span className="text-xs font-semibold text-[#777b86]">{hu.rol}</span>
                    </div>
                    <p className="text-xs text-[#777b86] mt-2 leading-relaxed">{hu.desc}</p>
                  </div>
                  <button
                    onClick={() => handleGoTo(hu.target)}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#ffffff] hover:bg-[#5d2a1a] text-[#ffffff] text-xs font-bold rounded-lg transition-colors"
                  >
                    <span>Ejecutar Historia</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'rnf' && (
            <div className="space-y-3">
              {rnfList.map((rnf) => (
                <div
                  key={rnf.codigo}
                  className="p-4 rounded-xl border border-[#ececec] bg-[#ffffff] flex items-center gap-4 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f2f2f3] flex items-center justify-center font-bold text-[#17191c] shrink-0 font-mono text-xs">
                    {rnf.codigo}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#17191c]">{rnf.nombre}</h4>
                    <p className="text-xs text-[#777b86]">{rnf.garantia}</p>
                  </div>
                  <div className="ml-auto text-[#5d2a1a] font-bold text-xs flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cumplido</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f2f2f3] border-t border-[#ececec] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#777b86] font-medium">
            100% Cobertura de Requerimientos SRS & Scripts SQL
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#5d2a1a] hover:opacity-90 text-[#ffffff] rounded-lg text-xs font-bold transition-colors"
          >
            Cerrar Matriz
          </button>
        </div>
      </div>
    </div>
  );
};

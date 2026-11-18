import React from 'react';
import { useStore } from '../db/store';
import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  Stethoscope,
  Syringe,
  Sparkles,
  Receipt,
  Boxes,
  TrendingUp,
  FileText,
  BotMessageSquare,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'pacientes'
  | 'citas'
  | 'consultas'
  | 'vacunacion'
  | 'fichas-ia'
  | 'facturacion'
  | 'inventario'
  | 'reportes-ia'
  | 'asistente-ia'
  | 'usuarios'
  | 'auditoria';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, vwAlertasStock } = useStore();

  const navigationItems: {
    id: ActiveTab;
    label: string;
    sublabel: string;
    icon: any;
    roles: string[];
    badge?: number;
    highlight?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      sublabel: 'Vista General y KPIs',
      icon: LayoutDashboard,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'pacientes',
      label: currentRole === 'PROPIETARIO' ? 'Mis Mascotas' : 'Pacientes y Tutores',
      sublabel: 'RF05 / RF06 Expedientes',
      icon: PawPrint,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'citas',
      label: currentRole === 'PROPIETARIO' ? 'Mis Citas' : 'Agenda de Citas',
      sublabel: 'RF07 Control de Agenda',
      icon: CalendarDays,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'consultas',
      label: 'Consultas Médicas',
      sublabel: 'RF08 Diagnósticos y Vitals',
      icon: Stethoscope,
      roles: ['ADMINISTRADOR', 'VETERINARIO'],
    },
    {
      id: 'vacunacion',
      label: 'Carné de Vacunas',
      sublabel: 'RF09 Historia y Refuerzos',
      icon: Syringe,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'fichas-ia',
      label: 'Fichas Médicas IA',
      sublabel: 'RF10 Gemini 3.8 Flash',
      icon: Sparkles,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'PROPIETARIO'],
      highlight: true,
    },
    {
      id: 'facturacion',
      label: 'Facturación POS',
      sublabel: 'Script 02 SP Transaccional',
      icon: Receipt,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA'],
    },
    {
      id: 'inventario',
      label: 'Inventario & Lotes',
      sublabel: 'Script 02 Vistas y Vencimiento',
      icon: Boxes,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'],
      badge: vwAlertasStock.length > 0 ? vwAlertasStock.length : undefined,
    },
    {
      id: 'reportes-ia',
      label: 'Reportes Ejecutivos IA',
      sublabel: 'RF11 Inteligencia de Negocio',
      icon: TrendingUp,
      roles: ['ADMINISTRADOR'],
      highlight: true,
    },
    {
      id: 'asistente-ia',
      label: 'Asistente Clínico IA',
      sublabel: 'Dosis e Interacciones',
      icon: BotMessageSquare,
      roles: ['ADMINISTRADOR', 'VETERINARIO'],
    },
    {
      id: 'usuarios',
      label: 'Usuarios Internos',
      sublabel: 'VET-RF-01 /admin/usuarios',
      icon: UserPlus,
      roles: ['ADMINISTRADOR'],
    },
    {
      id: 'auditoria',
      label: 'Auditoría & Trazabilidad',
      sublabel: 'Matriz SRS y Log ACID',
      icon: ShieldCheck,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA'],
    },
  ];

  const visibleItems = navigationItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-full md:w-64 md:min-w-[256px] bg-[#0F172A] text-[#F8FAFC] flex flex-col shrink-0 md:min-h-[calc(100vh-4.5rem)] p-4 border-b md:border-b-0 md:border-r border-[#1E293B]">
      <div className="px-4 py-3 mb-3 rounded-[20px] bg-[#1E293B] border border-[#334155]">
        <p className="text-[11px] uppercase tracking-wider text-[#94A3B8]">Navegación Clínica</p>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[#F8FAFC]">
          <span className="text-[#CBD5E1] shrink-0">Vista:</span>
          <span className="font-semibold text-[#7DD3FC] bg-[#0284C7]/25 border border-[#0284C7]/40 px-2.5 py-0.5 rounded-full text-[11px] truncate">
            {currentRole}
          </span>
        </div>
      </div>

      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto pb-2 md:pb-0 flex-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 md:shrink md:w-full flex items-center justify-between px-3.5 py-2.5 rounded-[16px] text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                isActive
                  ? 'bg-[#1E293B] text-[#FFFFFF] border border-[#0D9488]/60 shadow-xs'
                  : 'bg-transparent text-[#CBD5E1] hover:bg-[#1E293B]/70 hover:text-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#2DD4BF]' : 'text-[#94A3B8]'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-tight whitespace-nowrap md:whitespace-normal">
                    {item.label}
                  </div>
                  <div
                    className={`hidden md:block text-[10px] mt-0.5 leading-tight truncate ${
                      isActive ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F59E0B] text-[#0F172A] shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="hidden md:flex mt-4 px-4 py-3 rounded-[20px] bg-[#1E293B] border border-[#334155] text-[11px] text-[#CBD5E1] font-medium items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span>Motor IA · BD Activa</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">Activo</span>
      </div>
    </aside>
  );
};

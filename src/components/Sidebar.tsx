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
      id: 'auditoria',
      label: 'Auditoría & Trazabilidad',
      sublabel: 'Matriz SRS y Log ACID',
      icon: ShieldCheck,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA'],
    },
  ];

  const visibleItems = navigationItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-[#ffffff] text-[#17191c] flex flex-col shrink-0 min-h-[calc(100vh-5rem)] py-4 pr-4">
      <div className="px-4 py-3 mb-2 rounded-[20px] bg-[#f2f2f3]">
        <p className="text-[11px] uppercase tracking-wider text-[#979799]">Navegación Clínica</p>
        <div className="mt-1 flex items-center justify-between text-xs text-[#17191c]">
          <span className="text-[#777b86]">Vista activa:</span>
          <span className="font-medium text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full text-[11px]">{currentRole}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-[20px] text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#17191c] text-[#ffffff]'
                  : 'bg-transparent text-[#17191c] hover:bg-[#f2f2f3]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#fbe1d1]' : 'text-[#777b86]'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs font-medium leading-none">{item.label}</div>
                  <div
                    className={`text-[10px] mt-1 leading-none ${
                      isActive ? 'text-[#a3a6af]' : 'text-[#979799]'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#fbe1d1] text-[#5d2a1a] shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="mt-4 px-4 py-3 rounded-[20px] bg-[#f2f2f3] text-[11px] text-[#777b86] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#5d2a1a]"></span>
          <span>PostgreSQL Activo</span>
        </div>
        <span className="text-[10px] text-[#979799]">Steep UI</span>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { useStore } from '../db/store';
import { INITIAL_USUARIOS } from '../db/initialData';
import { isTabAllowedForRole } from '../utils/rbac';
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
  Menu,
  ChevronDown,
  UsersRound,
  X,
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

const demoOwnerIds = INITIAL_USUARIOS.filter((user) => user.rol_nombre === 'PROPIETARIO').map((user) => user.id_usuario);

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOwnerAccountChanged: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOwnerAccountChanged }) => {
  const { currentRole, currentUser, recentAccountIds, usuarios, vwAlertasStock, switchOwnerAccount } = useStore();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [accountPassword, setAccountPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const otherAccounts = [...new Set([...recentAccountIds, ...demoOwnerIds])].flatMap((id) => {
    const account = usuarios.find((user) => user.id_usuario === id && user.estado === 'ACTIVO' && user.rol_nombre === 'PROPIETARIO');
    return account && account.id_usuario !== currentUser.id_usuario ? [account] : [];
  });
  const chooseAccount = (email: string) => {
    setAccountEmail(email);
    setAccountPassword('');
    setAccountError('');
  };
  const changeAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accountEmail?.trim() || !accountPassword) return;
    const result = switchOwnerAccount(accountEmail, accountPassword);
    setAccountPassword('');
    if (result.success) onOwnerAccountChanged();
    else setAccountError(result.message);
  };
  // En móvil (< md) la barra lateral colapsa en un menú desplegable accesible para preservar la jerarquía del contenido
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      sublabel: 'Expedientes',
      icon: PawPrint,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'citas',
      label: currentRole === 'PROPIETARIO' ? 'Mis Citas' : 'Agenda de Citas',
      sublabel: 'Control de agenda',
      icon: CalendarDays,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'consultas',
      label: 'Consultas Médicas',
      sublabel: 'Diagnósticos y signos vitales',
      icon: Stethoscope,
      roles: ['ADMINISTRADOR', 'VETERINARIO'],
    },
    {
      id: 'vacunacion',
      label: 'Carné de Vacunas',
      sublabel: 'Historial y refuerzos',
      icon: Syringe,
      roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'],
    },
    {
      id: 'fichas-ia',
      label: 'Fichas Médicas',
      sublabel: 'Resumen de consultas',
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
      sublabel: 'Indicadores de gestión',
      icon: TrendingUp,
      roles: ['ADMINISTRADOR'],
      highlight: true,
    },
    {
      id: 'asistente-ia',
      label: 'Asistente Clínico',
      sublabel: 'Referencias veterinarias',
      icon: BotMessageSquare,
      roles: ['VETERINARIO'],
    },
    {
      id: 'usuarios',
      label: 'Usuarios Internos',
      sublabel: 'Personal de la clínica',
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

  const visibleItems = navigationItems.filter((item) => isTabAllowedForRole(currentRole, item.id));

  return (
    <aside className="w-full md:w-64 md:min-w-[256px] bg-vet-navy text-vet-ice flex flex-col shrink-0 md:min-h-[calc(100vh-4.5rem)] p-4 border-b md:border-b-0 md:border-r border-vet-slate">
      <div className="px-4 py-3 mb-3 rounded-[20px] bg-vet-slate border border-slate-700 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-300">Navegación Clínica</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-vet-ice">
            <span className="text-slate-300 shrink-0">Vista:</span>
            <span className="font-semibold text-white bg-vet-navy border border-slate-600 px-2.5 py-0.5 rounded-full text-[11px] truncate">
              {currentRole}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="vetsoft-sidebar-nav"
          aria-label={mobileMenuOpen ? 'Cerrar menú clínico' : 'Abrir menú clínico'}
          className="md:hidden shrink-0 p-2 rounded-xl bg-vet-navy border border-slate-600 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <nav
        id="vetsoft-sidebar-nav"
        aria-label="Navegación principal del sistema"
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col gap-1.5 md:overflow-y-auto flex-1`}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`shrink-0 md:shrink md:w-full flex items-center justify-between px-3.5 py-2.5 rounded-[16px] text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                isActive
                  ? 'bg-vet-sidebar-surface text-white border border-slate-600 shadow-xs'
                  : 'bg-transparent text-slate-200 hover:bg-vet-sidebar-surface/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-tight whitespace-nowrap md:whitespace-normal">
                    {item.label}
                  </div>
                  <div
                    className={`hidden md:block text-[10px] mt-0.5 leading-tight truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-vet-amber text-vet-navy shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="hidden md:flex mt-4 px-4 py-3 rounded-[20px] bg-vet-slate border border-slate-700 text-[11px] text-slate-200 font-medium items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          <span>Sistema clínico</span>
        </div>
        <span className="text-[10px] text-slate-400">Activo</span>
      </div>
      {currentRole === 'PROPIETARIO' && (
        <details className="group mt-2 rounded-[16px] border border-slate-700 bg-vet-slate text-slate-200">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[16px] px-[12px] py-[10px] text-xs font-semibold focus-visible:outline-2 focus-visible:outline-slate-400 [&::-webkit-details-marker]:hidden">
            <UsersRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            Cuentas
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-2 border-t border-slate-700 p-[8px]">
            <div className="px-2 text-xs">
              <p className="text-slate-400">Cuenta actual</p>
              <p className="break-all font-medium text-white">{currentUser.correo}</p>
            </div>
            {otherAccounts.length > 0 && (
              <ul aria-label="Cuentas recientes de este equipo" className="max-h-48 space-y-1 overflow-y-auto">
                {otherAccounts.map((account) => (
                  <li key={account.id_usuario}>
                    <button
                      type="button"
                      onClick={() => chooseAccount(account.correo)}
                      className="w-full break-all rounded-lg px-2 py-2 text-left text-xs hover:bg-vet-navy focus-visible:outline-2 focus-visible:outline-slate-400"
                    >
                      {account.correo}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {accountEmail === null ? (
              <button
                type="button"
                onClick={() => chooseAccount('')}
                className="w-full rounded-lg border border-slate-600 px-2 py-2 text-left text-xs font-semibold text-white hover:bg-vet-navy focus-visible:outline-2 focus-visible:outline-slate-400"
              >
                Cambiar a otra cuenta
              </button>
            ) : (
              <form onSubmit={changeAccount} className="space-y-2 border-t border-slate-700 pt-2 text-xs">
                <label className="block space-y-1">
                  Correo del propietario
                  <input type="email" autoComplete="username" required value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="w-full rounded-lg border border-slate-600 bg-vet-navy px-2 py-2 text-white" />
                </label>
                <label className="block space-y-1">
                  Contraseña
                  <input type="password" autoComplete="current-password" required value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="w-full rounded-lg border border-slate-600 bg-vet-navy px-2 py-2 text-white" />
                </label>
                {accountError && <p role="alert" className="text-red-200">{accountError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="rounded-lg bg-vet-emerald px-2.5 py-2 font-semibold text-white">Cambiar cuenta</button>
                  <button type="button" onClick={() => { setAccountEmail(null); setAccountPassword(''); setAccountError(''); }} className="rounded-lg border border-slate-600 px-2.5 py-2">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </details>
      )}
    </aside>
  );
};

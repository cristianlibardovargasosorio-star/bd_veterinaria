import { UserRole } from '../types';
import type { ActiveTab } from '../components/Sidebar';

export type ProtectedRoutePath =
  | '/citas'
  | '/carne-vacunacion'
  | '/erp'
  | '/pacientes'
  | '/facturacion'
  | '/inventario'
  | '/admin/usuarios';

const ROUTE_TO_TAB: Record<ProtectedRoutePath, ActiveTab> = {
  '/citas': 'citas',
  '/carne-vacunacion': 'vacunacion',
  '/erp': 'dashboard',
  '/pacientes': 'pacientes',
  '/facturacion': 'facturacion',
  '/inventario': 'inventario',
  '/admin/usuarios': 'usuarios',
};

export const ROLE_ALLOWED_TABS: Record<UserRole, ActiveTab[]> = {
  ADMINISTRADOR: [
    'dashboard',
    'pacientes',
    'citas',
    'consultas',
    'vacunacion',
    'fichas-ia',
    'facturacion',
    'inventario',
    'reportes-ia',
    'usuarios',
    'auditoria',
  ],
  VETERINARIO: [
    'dashboard',
    'citas',
    'pacientes',
    'consultas',
    'vacunacion',
    'fichas-ia',
    'inventario',
    'asistente-ia',
  ],
  RECEPCIONISTA: [
    'dashboard',
    'pacientes',
    'citas',
    'vacunacion',
    'facturacion',
    'inventario',
    'auditoria',
  ],
  PROPIETARIO: [
    'pacientes',
    'citas',
    'vacunacion',
    'fichas-ia',
  ],
};

export function getDefaultTabForRole(role: UserRole): ActiveTab {
  if (role === 'PROPIETARIO') return 'pacientes';
  if (role === 'RECEPCIONISTA') return 'citas';
  return 'dashboard';
}

export function isTabAllowedForRole(role: UserRole, tab: ActiveTab): boolean {
  return ROLE_ALLOWED_TABS[role]?.includes(tab) ?? false;
}

/**
 * Previene Open Redirect: solo acepta rutas relativas internas (ej. /citas, /erp).
 * Rechaza URLs absolutas, protocolo-relativas (//), esquemas javascript: o backslashes.
 */
export function sanitizeRedirectTo(raw?: string | null): ProtectedRoutePath | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\') || trimmed.includes('://')) {
    return null;
  }
  const cleanPath = trimmed.split('?')[0].split('#')[0] as ProtectedRoutePath;
  return cleanPath in ROUTE_TO_TAB ? cleanPath : null;
}

export function routeToTab(route: ProtectedRoutePath): ActiveTab {
  return ROUTE_TO_TAB[route];
}

export function isRouteAllowedForRole(role: UserRole, route: ProtectedRoutePath): boolean {
  return isTabAllowedForRole(role, ROUTE_TO_TAB[route]);
}

export function resolvePostLoginDestination(
  role: UserRole,
  rawRedirectTo?: string | null
): { targetTab: ActiveTab; accessDeniedNotice: string | null } {
  const safeRoute = sanitizeRedirectTo(rawRedirectTo);
  if (!safeRoute || safeRoute === '/erp') {
    return { targetTab: getDefaultTabForRole(role), accessDeniedNotice: null };
  }
  const requestedTab = ROUTE_TO_TAB[safeRoute];
  if (isTabAllowedForRole(role, requestedTab)) {
    return { targetTab: requestedTab, accessDeniedNotice: null };
  }
  return {
    targetTab: getDefaultTabForRole(role),
    accessDeniedNotice: `Acceso restringido: tu rol (${role}) no tiene permiso para ingresar a ${safeRoute}.`,
  };
}

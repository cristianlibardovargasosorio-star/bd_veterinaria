import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './db/store';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { SkeletonKPI, SkeletonCard, SkeletonTable } from './components/common/Skeleton';
import {
  ProtectedRoutePath,
  getDefaultTabForRole,
  isTabAllowedForRole,
  resolvePostLoginDestination,
  sanitizeRedirectTo,
} from './utils/rbac';

// Carga diferida (Code Splitting) bajo demanda para mantener respuesta < 1s
const LandingPage = lazy(() =>
  import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginView = lazy(() =>
  import('./components/views/LoginView').then((m) => ({ default: m.LoginView }))
);
const DashboardView = lazy(() =>
  import('./components/views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const PacientesView = lazy(() =>
  import('./components/views/PacientesView').then((m) => ({ default: m.PacientesView }))
);
const CitasView = lazy(() =>
  import('./components/views/CitasView').then((m) => ({ default: m.CitasView }))
);
const ConsultasView = lazy(() =>
  import('./components/views/ConsultasView').then((m) => ({ default: m.ConsultasView }))
);
const VacunacionView = lazy(() =>
  import('./components/views/VacunacionView').then((m) => ({ default: m.VacunacionView }))
);
const FichasIAView = lazy(() =>
  import('./components/views/FichasIAView').then((m) => ({ default: m.FichasIAView }))
);
const FacturacionPOSView = lazy(() =>
  import('./components/views/FacturacionPOSView').then((m) => ({ default: m.FacturacionPOSView }))
);
const InventarioView = lazy(() =>
  import('./components/views/InventarioView').then((m) => ({ default: m.InventarioView }))
);
const ReportesIAView = lazy(() =>
  import('./components/views/ReportesIAView').then((m) => ({ default: m.ReportesIAView }))
);
const AsistenteClinicoView = lazy(() =>
  import('./components/views/AsistenteClinicoView').then((m) => ({ default: m.AsistenteClinicoView }))
);
const AdminUsuariosView = lazy(() =>
  import('./components/views/AdminUsuariosView').then((m) => ({ default: m.AdminUsuariosView }))
);
const AuditoriaSRSView = lazy(() =>
  import('./components/views/AuditoriaSRSView').then((m) => ({ default: m.AuditoriaSRSView }))
);
const SecurityModal = lazy(() =>
  import('./components/modals/SecurityModal').then((m) => ({ default: m.SecurityModal }))
);
const TraceabilityModal = lazy(() =>
  import('./components/modals/TraceabilityModal').then((m) => ({ default: m.TraceabilityModal }))
);
const BackgroundThreeCanvas = lazy(() =>
  import('./components/common/BackgroundThreeCanvas').then((m) => ({ default: m.BackgroundThreeCanvas }))
);

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

function AppShell() {
  const { currentRole, currentUser, jwtToken, logout } = useStore();
  // Navigation mode: Landing Page first, with dedicated /login and seamless access to ERP
  const [appMode, setAppMode] = useState<'landing' | 'erp' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getDefaultTabForRole(currentRole));
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [showTraceability, setShowTraceability] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Skeleton loading state (persisted or toggleable anytime)
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

  // Shared entity state across views
  const [selectedPetForCard, setSelectedPetForCard] = useState<number | null>(null);
  const [selectedCitaForConsulta, setSelectedCitaForConsulta] = useState<number | null>(null);
  const [selectedConsultaForAI, setSelectedConsultaForAI] = useState<number | null>(null);

  const navigateToLoginWithRedirect = (targetRoute: ProtectedRoutePath) => {
    const encoded = encodeURIComponent(targetRoute);
    setAccessNotice(null);
    setRedirectTo(targetRoute);
    setAppMode('login');
    window.history.replaceState(null, '', `/login?redirectTo=${encoded}#login`);
  };

  const handleProtectedAction = (route: ProtectedRoutePath) => {
    if (!jwtToken) {
      navigateToLoginWithRedirect(route);
      return;
    }

    const destination = resolvePostLoginDestination(currentRole, route);
    setAccessNotice(destination.accessDeniedNotice);
    setActiveTab(destination.targetTab);
    setAppMode('erp');
    window.location.hash = '#erp';
  };

  useEffect(() => {
    const syncFromUrl = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const queryRedirect = sanitizeRedirectTo(params.get('redirectTo'));

      if (path === '/login' || hash.startsWith('#login')) {
        if (queryRedirect) setRedirectTo(queryRedirect);
        setAppMode('login');
        return;
      }

      const routeFromPath = sanitizeRedirectTo(path);
      if (routeFromPath) {
        if (!jwtToken) {
          navigateToLoginWithRedirect(routeFromPath);
        } else {
          handleProtectedAction(routeFromPath);
        }
        return;
      }

      if (hash === '#erp') {
        if (!jwtToken) {
          navigateToLoginWithRedirect('/erp');
        } else {
          setActiveTab((tab) => isTabAllowedForRole(currentRole, tab) ? tab : getDefaultTabForRole(currentRole));
          setAppMode('erp');
        }
      }
    };
    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
    return () => window.removeEventListener('hashchange', syncFromUrl);
  }, [jwtToken, currentRole]);

  // Guard RBAC: si el rol actual cambia o intenta abrir un tab fuera de su rol, redirige a su vista principal
  useEffect(() => {
    if (appMode === 'erp' && !isTabAllowedForRole(currentRole, activeTab)) {
      setAccessNotice(
        `Acceso restringido: el módulo "${activeTab}" no está habilitado para el rol ${currentRole}.`
      );
      setActiveTab(getDefaultTabForRole(currentRole));
    }
  }, [appMode, activeTab, currentRole]);

  const handleOpenLogin = () => {
    setRedirectTo(null);
    setAccessNotice(null);
    setAppMode('login');
    window.history.replaceState(null, '', '/login#login');
  };

  const handleLogout = () => {
    logout();
    handleOpenLogin();
  };

  const handleOwnerAccountChanged = () => {
    setAccessNotice(null);
    setSelectedPetForCard(null);
    setSelectedCitaForConsulta(null);
    setSelectedConsultaForAI(null);
    setActiveTab('pacientes');
  };

  const handleLoginSuccess = (_role: UserRole, targetTab: ActiveTab, notice?: string | null) => {
    setAccessNotice(notice ?? null);
    setRedirectTo(null);
    setActiveTab(targetTab);
    setAppMode('erp');
    window.history.replaceState(null, '', '/#erp');
  };

  const handleReturnToLanding = () => {
    setAppMode('landing');
    window.history.replaceState(null, '', '/');
  };

  const erpFallback = (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 rounded-[24px] bg-[#F1F5F9] h-28" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonKPI />
        <SkeletonKPI />
        <SkeletonKPI />
        <SkeletonKPI />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonTable rows={4} />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Suspense fallback={null}>
        <BackgroundThreeCanvas />
      </Suspense>
      {appMode === 'login' ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[#475569]">Cargando acceso...</div>}>
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onReturnToLanding={handleReturnToLanding}
            redirectTo={redirectTo}
          />
        </Suspense>
      ) : appMode === 'landing' ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[#475569]">Cargando VetSoft...</div>}>
          <LandingPage
            onOpenLogin={handleOpenLogin}
            onOpenLoginFor={navigateToLoginWithRedirect}
          />
        </Suspense>
      ) : (
        <div className="min-h-screen relative z-10 bg-transparent flex flex-col font-sans text-vet-navy antialiased selection:bg-vet-emerald/15 selection:text-vet-navy">
          {/* Top Navbar */}
          <Navbar
            onOpenTraceability={() => setShowTraceability(true)}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onReturnToLanding={handleReturnToLanding}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            isSkeletonLoading={isSkeletonLoading}
            onToggleSkeleton={() => setIsSkeletonLoading(!isSkeletonLoading)}
          />

          {/* App Body */}
          <div className="flex-1 flex flex-col md:flex-row max-w-[1360px] w-full mx-auto">
            {/* Left Sidebar */}
            <Sidebar key={currentUser.id_usuario} activeTab={activeTab} setActiveTab={setActiveTab} onOwnerAccountChanged={handleOwnerAccountChanged} />

            {/* Main View Area */}
            <main key={currentUser.id_usuario} className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {accessNotice && (
                <div
                  role="alert"
                  className="mb-4 p-3.5 rounded-2xl bg-warning-soft border border-warning/35 text-warning-ink text-xs font-semibold flex items-center justify-between gap-3"
                >
                  <span>{accessNotice}</span>
                  <button
                    type="button"
                    onClick={() => setAccessNotice(null)}
                    className="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border text-brand-ink hover:bg-surface-hover cursor-pointer shrink-0"
                  >
                    Cerrar
                  </button>
                </div>
              )}
              {isSkeletonLoading ? (
                erpFallback
              ) : (
                <Suspense fallback={erpFallback}>
                  {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}

                  {activeTab === 'pacientes' && (
                    <PacientesView
                      onNavigateTab={setActiveTab}
                      onSelectPetForCard={(id) => {
                        setSelectedPetForCard(id);
                        setActiveTab('vacunacion');
                      }}
                    />
                  )}

                  {activeTab === 'citas' && (
                    <CitasView
                      onNavigateTab={setActiveTab}
                      onStartConsultationForCita={(idCita) => {
                        setSelectedCitaForConsulta(idCita);
                        setActiveTab('consultas');
                      }}
                    />
                  )}

                  {activeTab === 'consultas' && (
                    <ConsultasView
                      onNavigateTab={setActiveTab}
                      onSelectConsultaForAI={(idConsulta) => {
                        setSelectedConsultaForAI(idConsulta);
                        setActiveTab('fichas-ia');
                      }}
                      selectedCitaIdForNewConsulta={selectedCitaForConsulta}
                    />
                  )}

                  {activeTab === 'vacunacion' && <VacunacionView initialPetId={selectedPetForCard} />}

                  {activeTab === 'fichas-ia' && <FichasIAView initialConsultaId={selectedConsultaForAI} />}

                  {activeTab === 'facturacion' && <FacturacionPOSView />}

                  {activeTab === 'inventario' && <InventarioView />}

                  {activeTab === 'reportes-ia' && <ReportesIAView />}

                  {activeTab === 'asistente-ia' && <AsistenteClinicoView />}

                  {activeTab === 'usuarios' && <AdminUsuariosView />}

                  {activeTab === 'auditoria' && <AuditoriaSRSView />}
                </Suspense>
              )}
            </main>
          </div>

          {/* Interactive Modals (Lazy-loaded bajo demanda) */}
          <Suspense fallback={null}>
            {showTraceability && (
              <TraceabilityModal
                isOpen={showTraceability}
                onClose={() => setShowTraceability(false)}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setShowTraceability(false);
                }}
              />
            )}

            {showSecurityModal && (
              <SecurityModal
                isOpen={showSecurityModal}
                onClose={() => setShowSecurityModal(false)}
              />
            )}
          </Suspense>
        </div>
      )}
    </>
  );
}

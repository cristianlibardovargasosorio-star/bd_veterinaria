import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StoreProvider } from './db/store';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { SkeletonKPI, SkeletonCard, SkeletonTable } from './components/common/Skeleton';

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
  // Navigation mode: Landing Page first, with dedicated /login and seamless access to ERP
  const [appMode, setAppMode] = useState<'landing' | 'erp' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showTraceability, setShowTraceability] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Skeleton loading state (persisted or toggleable anytime)
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

  // Shared entity state across views
  const [selectedPetForCard, setSelectedPetForCard] = useState<number | null>(null);
  const [selectedCitaForConsulta, setSelectedCitaForConsulta] = useState<number | null>(null);
  const [selectedConsultaForAI, setSelectedConsultaForAI] = useState<number | null>(null);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.pathname === '/admin/usuarios' || window.location.hash === '#admin/usuarios') {
        setAppMode('erp');
        setActiveTab('usuarios');
      } else if (window.location.hash === '#login') {
        setAppMode('login');
      } else if (window.location.hash === '#erp') {
        setAppMode('erp');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleEnterERP = () => {
    setIsSkeletonLoading(true);
    setAppMode('erp');
    window.location.hash = '#erp';
    setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 120);
  };

  const handleOpenLogin = () => {
    setAppMode('login');
    window.location.hash = '#login';
  };

  const handleLoginSuccess = (role: UserRole, targetTab: ActiveTab) => {
    setActiveTab(targetTab);
    setIsSkeletonLoading(true);
    setAppMode('erp');
    window.location.hash = '#erp';
    setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 120);
  };

  const handleReturnToLanding = () => {
    setAppMode('landing');
    window.location.hash = '';
  };

  const erpFallback = (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 rounded-[24px] bg-[#e3d7ca] h-28" />
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
    <StoreProvider>
      <Suspense fallback={null}>
        <BackgroundThreeCanvas />
      </Suspense>
      {appMode === 'login' ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[#634b3b]">Cargando acceso...</div>}>
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onReturnToLanding={handleReturnToLanding}
          />
        </Suspense>
      ) : appMode === 'landing' ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[#634b3b]">Cargando VetSoft...</div>}>
          <LandingPage
            onEnterERP={handleEnterERP}
            onOpenLogin={handleOpenLogin}
          />
        </Suspense>
      ) : (
        <div className="min-h-screen relative z-10 bg-transparent flex flex-col font-sans text-[#0f172a] antialiased selection:bg-[#F0FDFA] selection:text-[#0D9488]">
          {/* Top Navbar */}
          <Navbar
            onOpenTraceability={() => setShowTraceability(true)}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onReturnToLanding={handleReturnToLanding}
            onOpenLogin={handleOpenLogin}
            onLogout={handleOpenLogin}
            isSkeletonLoading={isSkeletonLoading}
            onToggleSkeleton={() => setIsSkeletonLoading(!isSkeletonLoading)}
          />

          {/* App Body */}
          <div className="flex-1 flex flex-col md:flex-row max-w-[1360px] w-full mx-auto">
            {/* Left Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main View Area */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
    </StoreProvider>
  );
}

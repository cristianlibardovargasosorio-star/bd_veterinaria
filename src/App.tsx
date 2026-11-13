import React, { useState, useEffect } from 'react';
import { StoreProvider } from './db/store';
import { UserRole } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { LoginView } from './components/views/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { PacientesView } from './components/views/PacientesView';
import { CitasView } from './components/views/CitasView';
import { ConsultasView } from './components/views/ConsultasView';
import { VacunacionView } from './components/views/VacunacionView';
import { FichasIAView } from './components/views/FichasIAView';
import { FacturacionPOSView } from './components/views/FacturacionPOSView';
import { InventarioView } from './components/views/InventarioView';
import { ReportesIAView } from './components/views/ReportesIAView';
import { AsistenteClinicoView } from './components/views/AsistenteClinicoView';
import { AuditoriaSRSView } from './components/views/AuditoriaSRSView';
import { SecurityModal } from './components/modals/SecurityModal';
import { TraceabilityModal } from './components/modals/TraceabilityModal';
import { SkeletonKPI, SkeletonCard, SkeletonTable } from './components/common/Skeleton';
import { BackgroundThreeCanvas } from './components/common/BackgroundThreeCanvas';

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
      if (window.location.hash === '#login') {
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
    // Brief natural skeleton transition to showcase skeleton architecture
    setTimeout(() => {
      setIsSkeletonLoading(false);
    }, 450);
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
    }, 350);
  };

  const handleReturnToLanding = () => {
    setAppMode('landing');
    window.location.hash = '';
  };

  return (
    <StoreProvider>
      {/* Fondo 3D veterinario global en los márgenes laterales de todo el sitio */}
      <BackgroundThreeCanvas />
      {appMode === 'login' ? (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onReturnToLanding={handleReturnToLanding}
        />
      ) : appMode === 'landing' ? (
        <LandingPage
          onEnterERP={handleEnterERP}
          onOpenLogin={handleOpenLogin}
        />
      ) : (
        <div className="min-h-screen relative z-10 bg-transparent flex flex-col font-sans text-[#17191c] antialiased selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
          {/* Top Navbar */}
          <Navbar
            onOpenTraceability={() => setShowTraceability(true)}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onReturnToLanding={handleReturnToLanding}
            onOpenLogin={handleOpenLogin}
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
                /* Skeleton Presentation Mode */
                <div className="space-y-6 animate-pulse">
                  <div className="p-6 rounded-[24px] bg-[#f2f2f3] h-28" />
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
              ) : (
                <>
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

                  {activeTab === 'auditoria' && <AuditoriaSRSView />}
                </>
              )}
            </main>
          </div>

          {/* Interactive Modals */}
          <TraceabilityModal
            isOpen={showTraceability}
            onClose={() => setShowTraceability(false)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setShowTraceability(false);
            }}
          />

          <SecurityModal
            isOpen={showSecurityModal}
            onClose={() => setShowSecurityModal(false)}
          />
        </div>
      )}
    </StoreProvider>
  );
}

import React, { useState } from 'react';
import { useStore } from '../db/store';
import { UserRole } from '../types';
import {
  Shield,
  Stethoscope,
  Users,
  AlertTriangle,
  FileCheck2,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onOpenTraceability: () => void;
  onOpenSecurityModal: () => void;
  onReturnToLanding?: () => void;
  onOpenLogin?: () => void;
  isSkeletonLoading?: boolean;
  onToggleSkeleton?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTraceability,
  onOpenSecurityModal,
  onReturnToLanding,
  onOpenLogin,
  isSkeletonLoading = false,
  onToggleSkeleton,
}) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    vwAlertasStock,
    resetDatabase,
  } = useStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const roleBadges: Record<UserRole, { label: string; icon: any }> = {
    ADMINISTRADOR: {
      label: 'Administrador',
      icon: Shield,
    },
    VETERINARIO: {
      label: 'Médico Veterinario',
      icon: Stethoscope,
    },
    RECEPCIONISTA: {
      label: 'Recepción & Caja',
      icon: Users,
    },
    PROPIETARIO: {
      label: 'Tutor de Paciente',
      icon: Sparkles,
    },
  };

  const currentBadge = roleBadges[currentRole] || roleBadges.ADMINISTRADOR;
  const RoleIcon = currentBadge.icon;

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleMenu(false);
  };

  const handleReset = () => {
    resetDatabase();
    setResetConfirm(false);
  };

  return (
    <header className="bg-[#121212] border-b border-[#2e2e2e] sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#121212] border border-[#2e2e2e] flex items-center justify-center text-[#3ecf8e]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg tracking-tight text-[#fafafa]">VETSOFT</span>
              <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#242424] text-[#3ecf8e] border border-[#2e2e2e]">
                ERP + Gemini 3.8
              </span>
            </div>
            <p className="text-[12px] text-[#898989] hidden sm:block">Gestión Veterinaria e Inteligencia Clínica</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Return to Landing Button */}
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-[#242424] text-[#fafafa] text-xs font-normal border border-[#393939] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#898989]" />
              <span className="hidden sm:inline">Sitio Web</span>
            </button>
          )}

          {/* Go to Login RF-01 Button */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-[#242424] text-[#fafafa] text-xs font-normal border border-[#393939] transition-colors cursor-pointer"
              title="Ir al Módulo 1: Login de Usuarios (/login)"
            >
              <Lock className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span className="hidden sm:inline">Login (/login)</span>
            </button>
          )}

          {/* Skeleton Shimmer Toggle Button */}
          {onToggleSkeleton && (
            <button
              onClick={onToggleSkeleton}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
                isSkeletonLoading
                  ? 'bg-[#1f4b37] text-[#3ecf8e] border-[#3ecf8e]'
                  : 'bg-transparent text-[#b4b4b4] border-[#393939] hover:border-[#4d4d4d]'
              }`}
              title="Alternar diseño Skeleton para ver placeholders de carga"
            >
              {isSkeletonLoading ? 'Skeleton ON' : 'Skeleton'}
            </button>
          )}

          {/* Alertas de Stock badge */}
          {vwAlertasStock.length > 0 && (
            <div
              title={`${vwAlertasStock.length} producto(s) en stock crítico o agotado (vw_alertas_stock)`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] text-[#b4b4b4] border border-[#2e2e2e] text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#3ecf8e]" />
              <span>{vwAlertasStock.length} Alertas</span>
            </div>
          )}

          {/* Traceability Matrix Button */}
          <button
            onClick={onOpenTraceability}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-[#242424] text-[#b4b4b4] hover:text-[#fafafa] text-xs border border-[#393939] transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
            <span className="hidden md:inline">Matriz SRS</span>
          </button>

          {/* 2FA & Security Demo */}
          <button
            onClick={onOpenSecurityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-[#242424] text-[#898989] hover:text-[#fafafa] text-xs border border-[#393939] transition-colors cursor-pointer"
            title="Prueba de Autenticación, BCrypt, 3 Intentos y OTP (RF01)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Seguridad RF01</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2e2e2e] bg-[#242424] text-[#fafafa] text-xs font-medium hover:border-[#4d4d4d] transition-all cursor-pointer"
            >
              <RoleIcon className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>Rol: {currentBadge.label}</span>
              <ChevronDown className="w-3 h-3 text-[#898989]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#121212] rounded-[16px] border border-[#2e2e2e] p-2 z-50 shadow-2xl">
                <div className="px-3 py-2 border-b border-[#2e2e2e] mb-1">
                  <p className="text-[11px] uppercase tracking-wider text-[#898989]">
                    Cambio Rápido de Rol (RBAC)
                  </p>
                  <p className="text-xs text-[#b4b4b4] mt-0.5 truncate">
                    Usuario: <strong className="text-[#fafafa]">{currentUser.correo}</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRoleChange('ADMINISTRADOR')}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      currentRole === 'ADMINISTRADOR'
                        ? 'bg-[#242424] text-[#3ecf8e]'
                        : 'text-[#b4b4b4] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#3ecf8e]" />
                      <div>
                        <div className="font-medium">Administrador General</div>
                        <span className="text-[10px] text-[#898989]">admin@vetsoft.com (Acceso total)</span>
                      </div>
                    </div>
                    {currentRole === 'ADMINISTRADOR' && <CheckCircle2 className="w-4 h-4 text-[#3ecf8e]" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('VETERINARIO')}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      currentRole === 'VETERINARIO'
                        ? 'bg-[#242424] text-[#3ecf8e]'
                        : 'text-[#b4b4b4] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#3ecf8e]" />
                      <div>
                        <div className="font-medium">Médico Veterinario</div>
                        <span className="text-[10px] text-[#898989]">Dr. Camilo Restrepo (TP 19823-VET)</span>
                      </div>
                    </div>
                    {currentRole === 'VETERINARIO' && <CheckCircle2 className="w-4 h-4 text-[#3ecf8e]" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('RECEPCIONISTA')}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      currentRole === 'RECEPCIONISTA'
                        ? 'bg-[#242424] text-[#3ecf8e]'
                        : 'text-[#b4b4b4] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#3ecf8e]" />
                      <div>
                        <div className="font-medium">Recepción & Caja</div>
                        <span className="text-[10px] text-[#898989]">Laura Gómez (Citas y POS Facturación)</span>
                      </div>
                    </div>
                    {currentRole === 'RECEPCIONISTA' && <CheckCircle2 className="w-4 h-4 text-[#3ecf8e]" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('PROPIETARIO')}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      currentRole === 'PROPIETARIO'
                        ? 'bg-[#242424] text-[#3ecf8e]'
                        : 'text-[#b4b4b4] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#3ecf8e]" />
                      <div>
                        <div className="font-medium">Portal Propietario</div>
                        <span className="text-[10px] text-[#898989]">Carlos Mendoza (Tutor de Lucas y Luna)</span>
                      </div>
                    </div>
                    {currentRole === 'PROPIETARIO' && <CheckCircle2 className="w-4 h-4 text-[#3ecf8e]" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <div className="relative">
            {resetConfirm ? (
              <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-full border border-[#393939]">
                <button
                  onClick={handleReset}
                  className="px-2.5 py-0.5 bg-[#121212] text-[#3ecf8e] border border-[#3ecf8e] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-1.5 py-0.5 text-[#898989] hover:text-[#fafafa] text-[11px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                title="Reiniciar base de datos a datos iniciales de fábrica"
                className="p-1.5 text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useStore } from '../db/store';
import { UserRole } from '../types';
import {
  Shield,
  Stethoscope,
  Users,
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
    <header className="bg-[#ffffff]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#ececec]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#17191c] flex items-center justify-center text-[#ffffff] shrink-0">
            <Stethoscope size={18} className="w-[18px] h-[18px] text-[#ffffff] shrink-0" strokeWidth={2} />
          </div>
          <div className="whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="font-serif-editorial text-[22px] tracking-tight text-[#17191c] leading-none">VetSoft</span>
              <span className="text-[11px] text-[#777b86] font-normal hidden xl:inline">
                Clinical Suite
              </span>
            </div>
            <p className="text-[11px] text-[#777b86] hidden md:block leading-tight">Hospital Clínico Veterinario VetSoft</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Return to Landing Button */}
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal border border-[#17191c] transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#17191c]" />
              <span className="hidden sm:inline">Sitio Web</span>
            </button>
          )}

          {/* Go to Login RF-01 Button */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal border border-[#17191c] transition-colors cursor-pointer whitespace-nowrap"
              title="Ir al Módulo 1: Login de Usuarios (/login)"
            >
              <Lock className="w-3.5 h-3.5 text-[#17191c]" />
              <span className="hidden md:inline">Login</span>
            </button>
          )}

          {/* Skeleton Shimmer Toggle Button */}
          {onToggleSkeleton && (
            <button
              onClick={onToggleSkeleton}
              className={`hidden xl:inline-flex px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap ${
                isSkeletonLoading
                  ? 'bg-[#fbe1d1] text-[#5d2a1a] font-medium'
                  : 'bg-[#f2f2f3] text-[#777b86] hover:text-[#17191c]'
              }`}
              title="Alternar diseño Skeleton para ver placeholders de carga"
            >
              {isSkeletonLoading ? 'Skeleton ON' : 'Skeleton'}
            </button>
          )}

          {/* Alertas de Stock badge */}
          {vwAlertasStock.length > 0 && (
            <div
              title={`${vwAlertasStock.length} producto(s) en stock crítico o agotado`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-xs font-medium whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5d2a1a]" />
              <span>{vwAlertasStock.length} Alertas</span>
            </div>
          )}

          {/* Traceability Matrix Button */}
          <button
            onClick={onOpenTraceability}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f2f2f3] hover:bg-[#e5e5e7] text-[#17191c] text-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Matriz SRS (RF01-RF11)"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#5d2a1a]" />
            <span className="hidden lg:inline">Matriz SRS</span>
          </button>

          {/* 2FA & Security Demo */}
          <button
            onClick={onOpenSecurityModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#f2f2f3] hover:bg-[#e5e5e7] text-[#777b86] hover:text-[#17191c] text-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Prueba de Autenticación, BCrypt, 3 Intentos y OTP (RF01)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Seguridad</span>
          </button>

          {/* Role Switcher (Filled Pill) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17191c] text-[#ffffff] text-xs font-normal hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
            >
              <RoleIcon className="w-3.5 h-3.5 text-[#fbe1d1]" />
              <span className="hidden sm:inline">{currentBadge.label}</span>
              <ChevronDown className="w-3 h-3 text-[#a3a6af]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#ffffff] rounded-[20px] p-3 z-50 steep-floating-artifact">
                <div className="px-3 py-2 border-b border-[#ececec] mb-2">
                  <p className="text-[11px] uppercase tracking-wider text-[#777b86]">
                    Cambio Rápido de Rol (RBAC)
                  </p>
                  <p className="text-xs text-[#777b86] mt-0.5 truncate">
                    Usuario: <strong className="text-[#17191c]">{currentUser.correo}</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  {(['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'PROPIETARIO'] as UserRole[]).map((r) => {
                    const BIcon = roleBadges[r].icon;
                    const active = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full text-left px-3 py-2.5 rounded-[16px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-[#fbe1d1] text-[#5d2a1a] font-medium'
                            : 'text-[#17191c] hover:bg-[#f2f2f3]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BIcon className={`w-4 h-4 ${active ? 'text-[#5d2a1a]' : 'text-[#777b86]'}`} />
                          <div>
                            <div className="font-medium">{roleBadges[r].label}</div>
                            <span className={`text-[10px] ${active ? 'text-[#5d2a1a]/80' : 'text-[#777b86]'}`}>
                              Vista {r.toLowerCase()}
                            </span>
                          </div>
                        </div>
                        {active && <CheckCircle2 className="w-4 h-4 text-[#5d2a1a]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <div className="relative">
            {resetConfirm ? (
              <div className="flex items-center gap-1 bg-[#f2f2f3] p-1 rounded-full">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-[#17191c] text-[#ffffff] rounded-full text-[11px] font-normal transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-1 text-[#777b86] hover:text-[#17191c] text-[11px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                title="Reiniciar base de datos a datos iniciales de fábrica"
                className="p-2 text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] rounded-full transition-colors cursor-pointer"
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

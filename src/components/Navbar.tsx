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
  LogOut,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onOpenTraceability: () => void;
  onOpenSecurityModal: () => void;
  onReturnToLanding?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  isSkeletonLoading?: boolean;
  onToggleSkeleton?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTraceability,
  onOpenSecurityModal,
  onReturnToLanding,
  onOpenLogin,
  onLogout,
  isSkeletonLoading = false,
  onToggleSkeleton,
}) => {
  const {
    logout,
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
    <header className="bg-vet-surface/95 backdrop-blur-md sticky top-0 z-40 border-b border-vet-border">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-vet-navy flex items-center justify-center text-white shrink-0">
            <Stethoscope size={18} className="w-[18px] h-[18px] text-white shrink-0" strokeWidth={2} />
          </div>
          <div className="whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="font-serif-editorial text-[22px] tracking-tight text-vet-navy leading-none">VetSoft</span>
              <span className="text-[11px] text-vet-muted font-normal hidden xl:inline">
                Clinical Suite
              </span>
            </div>
            <p className="text-[11px] text-vet-muted hidden md:block leading-tight">Hospital Clínico Veterinario VetSoft</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Return to Landing Button */}
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent hover:bg-vet-ice text-vet-navy text-xs font-normal border border-vet-navy transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-vet-navy" />
              <span className="hidden sm:inline">Sitio Web</span>
            </button>
          )}

          {/* Go to Login / Logout VET-RF-02 Button */}
          {onLogout ? (
            <button
              onClick={() => {
                logout();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent hover:bg-vet-danger-soft text-vet-danger-ink text-xs font-medium border border-[#DC2626]/30 transition-colors cursor-pointer whitespace-nowrap"
              title="Cerrar sesión e invalidar token JWT"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cerrar sesión</span>
            </button>
          ) : (
            onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent hover:bg-vet-ice text-vet-navy text-xs font-normal border border-vet-navy transition-colors cursor-pointer whitespace-nowrap"
                title="Iniciar sesión en VetSoft"
              >
                <Lock className="w-3.5 h-3.5 text-vet-navy" />
                <span className="hidden md:inline">Login</span>
              </button>
            )
          )}

          {/* Skeleton Shimmer Toggle Button */}
          {onToggleSkeleton && (
            <button
              onClick={onToggleSkeleton}
              className={`hidden xl:inline-flex px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap ${
                isSkeletonLoading
                  ? 'bg-vet-ice text-vet-navy font-medium'
                  : 'bg-vet-ice text-vet-muted hover:text-vet-navy'
              }`}
              title="Alternar diseño Skeleton para ver placeholders de carga"
            >
              {isSkeletonLoading ? 'Skeleton ON' : 'Skeleton'}
            </button>
          )}

          {/* Alertas de Stock badge */}
          {currentRole !== 'PROPIETARIO' && vwAlertasStock.length > 0 && (
            <div
              title={`${vwAlertasStock.length} producto(s) en stock crítico o agotado`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-warning-soft border border-warning/35 text-warning-ink text-xs font-semibold whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span>{vwAlertasStock.length} Alertas</span>
            </div>
          )}

          {/* Traceability Matrix Button (Solo Administrador) */}
          {currentRole === 'ADMINISTRADOR' && (
            <button
              onClick={onOpenTraceability}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-vet-ice hover:bg-[#e5e5e7] text-vet-navy text-xs transition-colors cursor-pointer whitespace-nowrap"
              title="Matriz SRS"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-vet-navy" />
              <span className="hidden lg:inline">Matriz SRS</span>
            </button>
          )}

          {/* 2FA & Security Demo (Solo Administrador) */}
          {currentRole === 'ADMINISTRADOR' && (
            <button
              onClick={onOpenSecurityModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-vet-ice hover:bg-[#e5e5e7] text-vet-muted hover:text-vet-navy text-xs transition-colors cursor-pointer whitespace-nowrap"
              title="Prueba de autenticación, BCrypt, 3 intentos y OTP"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Seguridad</span>
            </button>
          )}

          {/* Badge de Rol Autenticado (Switcher solo disponible para Administrador) */}
          <div className="relative">
            {currentRole === 'ADMINISTRADOR' ? (
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-vet-navy text-white text-xs font-medium hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <RoleIcon className="w-3.5 h-3.5 text-slate-200" />
                <span className="hidden sm:inline">{currentBadge.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>
            ) : (
              <div
                title={`Sesión activa: ${currentUser.correo}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-vet-navy text-white text-xs font-medium whitespace-nowrap"
              >
                <RoleIcon className="w-3.5 h-3.5 text-slate-200" />
                <span className="hidden sm:inline">{currentBadge.label}</span>
              </div>
            )}

            {showRoleMenu && currentRole === 'ADMINISTRADOR' && (
              <div className="absolute right-0 mt-2 w-72 bg-vet-surface rounded-[20px] p-3 z-50 steep-floating-artifact">
                <div className="px-3 py-2 border-b border-vet-border mb-2">
                  <p className="text-[11px] uppercase tracking-wider text-vet-muted">
                    Cambio Rápido de Rol (RBAC)
                  </p>
                  <p className="text-xs text-vet-muted mt-0.5 truncate">
                    Usuario: <strong className="text-vet-navy">{currentUser.correo}</strong>
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
                            ? 'bg-vet-ice text-vet-navy font-medium'
                            : 'text-vet-navy hover:bg-vet-ice'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BIcon className={`w-4 h-4 ${active ? 'text-vet-navy' : 'text-vet-muted'}`} />
                          <div>
                            <div className="font-medium">{roleBadges[r].label}</div>
                            <span className={`text-[10px] ${active ? 'text-vet-navy/80' : 'text-vet-muted'}`}>
                              Vista {r.toLowerCase()}
                            </span>
                          </div>
                        </div>
                        {active && <CheckCircle2 className="w-4 h-4 text-vet-navy" />}
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
              <div className="flex items-center gap-1 bg-vet-ice p-1 rounded-full">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-vet-emerald text-white rounded-full text-[11px] font-normal transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-1 text-vet-muted hover:text-vet-navy text-[11px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                title="Reiniciar base de datos a datos iniciales de fábrica"
                className="p-2 text-vet-muted hover:text-vet-navy hover:bg-vet-ice rounded-full transition-colors cursor-pointer"
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

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
  KeyRound,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

import { ArrowLeft } from 'lucide-react';

interface NavbarProps {
  onOpenTraceability: () => void;
  onOpenSecurityModal: () => void;
  onReturnToLanding?: () => void;
  isSkeletonLoading?: boolean;
  onToggleSkeleton?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTraceability,
  onOpenSecurityModal,
  onReturnToLanding,
  isSkeletonLoading = false,
  onToggleSkeleton,
}) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    switchUser,
    usuarios,
    vwAlertasStock,
    resetDatabase,
  } = useStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const roleBadges: Record<UserRole, { label: string; color: string; icon: any }> = {
    ADMINISTRADOR: {
      label: 'Administrador',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Shield,
    },
    VETERINARIO: {
      label: 'Médico Veterinario',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Stethoscope,
    },
    RECEPCIONISTA: {
      label: 'Recepción & Caja',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Users,
    },
    PROPIETARIO: {
      label: 'Tutor de Paciente',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">VETSOFT</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ERP + Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Sistema de Gestión Veterinaria e Inteligencia Clínica</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Return to Landing Button */}
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Página Principal</span>
            </button>
          )}

          {/* Skeleton Shimmer Toggle Button */}
          {onToggleSkeleton && (
            <button
              onClick={onToggleSkeleton}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSkeletonLoading
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{vwAlertasStock.length} Alertas</span>
            </div>
          )}

          {/* Traceability Matrix Button */}
          <button
            onClick={onOpenTraceability}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Matriz SRS (RF01-RF11)</span>
          </button>

          {/* 2FA & Security Demo */}
          <button
            onClick={onOpenSecurityModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
            title="Prueba de Autenticación, BCrypt, 3 Intentos y OTP (RF01)"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Seguridad RF01</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${currentBadge.color}`}
            >
              <RoleIcon className="w-4 h-4" />
              <span>Rol: {currentBadge.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Cambio Rápido de Rol (Control RBAC)
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Usuario actual: <strong className="text-slate-800">{currentUser.correo}</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRoleChange('ADMINISTRADOR')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'ADMINISTRADOR'
                        ? 'bg-purple-50 text-purple-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <div>
                        <div>Administrador General</div>
                        <span className="text-[10px] text-slate-400">admin@vetsoft.com (Acceso total)</span>
                      </div>
                    </div>
                    {currentRole === 'ADMINISTRADOR' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('VETERINARIO')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'VETERINARIO'
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Médico Veterinario</div>
                        <span className="text-[10px] text-slate-400">Dr. Camilo Restrepo (TP 19823-VET)</span>
                      </div>
                    </div>
                    {currentRole === 'VETERINARIO' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('RECEPCIONISTA')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'RECEPCIONISTA'
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div>Recepción & Caja</div>
                        <span className="text-[10px] text-slate-400">Laura Gómez (Citas y POS Facturación)</span>
                      </div>
                    </div>
                    {currentRole === 'RECEPCIONISTA' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('PROPIETARIO')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'PROPIETARIO'
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <div>
                        <div>Portal Propietario</div>
                        <span className="text-[10px] text-slate-400">Carlos Mendoza (Tutor de Lucas y Luna)</span>
                      </div>
                    </div>
                    {currentRole === 'PROPIETARIO' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <div className="relative">
            {resetConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                <button
                  onClick={handleReset}
                  className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700 transition-colors"
                >
                  Confirmar Reset
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-1.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-[11px]"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                title="Reiniciar base de datos a datos iniciales de fábrica"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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

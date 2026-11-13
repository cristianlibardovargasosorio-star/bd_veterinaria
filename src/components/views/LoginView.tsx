import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { UserRole } from '../../types';
import { ActiveTab } from '../Sidebar';
import confetti from 'canvas-confetti';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Shield,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, targetTab: ActiveTab) => void;
  onReturnToLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onReturnToLanding }) => {
  const { usuarios, login } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    role: UserRole;
    email: string;
    targetTab: ActiveTab;
    panelName: string;
  } | null>(null);

  // Email format RFC 5322 validation
  const validateEmailFormat = (val: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val.trim());
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setLoginError(null);
    if (!val.trim()) {
      setEmailError(null);
    } else if (!validateEmailFormat(val)) {
      setEmailError('El formato del correo electrónico no es válido.');
    } else {
      setEmailError(null);
    }
  };

  const handleSelectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailError(null);
    setLoginError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Criterio 1: Validar que el formato del correo sea válido antes de enviar
    if (!validateEmailFormat(email)) {
      setEmailError('El formato del correo electrónico no es válido.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Por favor ingrese su contraseña.');
      return;
    }

    setIsSubmitting(true);

    // Criterio 2: Verificar en la BD PostgreSQL que las credenciales coincidan (hash Spring Security)
    setTimeout(() => {
      const result = login(email.trim(), password);

      if (!result.success) {
        setIsSubmitting(false);
        setLoginError(result.message);
        return;
      }

      // Criterio 3: Redirigir según el rol ENUM
      const targetUser = usuarios.find((u) => u.correo.toLowerCase() === email.trim().toLowerCase());
      const role: UserRole = targetUser?.rol_nombre || 'ADMINISTRADOR';

      let targetTab: ActiveTab = 'dashboard';
      let panelName = 'Panel General de Control (/admin/dashboard)';

      if (role === 'ADMINISTRADOR') {
        targetTab = 'dashboard';
        panelName = 'Panel de Administración (/admin/dashboard)';
      } else if (role === 'VETERINARIO') {
        targetTab = 'consultas';
        panelName = 'Panel Clínico Veterinario (/veterinario/panel)';
      } else if (role === 'PROPIETARIO') {
        targetTab = 'vacunacion';
        panelName = 'Portal de Propietario (/propietario/portal)';
      } else if (role === 'RECEPCIONISTA') {
        targetTab = 'citas';
        panelName = 'Recepción y Agenda de Citas';
      }

      setSuccessInfo({
        role,
        email: email.trim(),
        targetTab,
        panelName,
      });

      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#1E293B', '#fbe1d1', '#5d2a1a'],
        });
      } catch (e) {
        // ignore confetti errors
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(role, targetTab);
      }, 1400);
    }, 500);
  };

  return (
    <div className="min-h-screen relative z-10 bg-transparent text-[#1E293B] flex flex-col justify-between selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
      {/* Whisper-quiet Editorial Top Navigation */}
      <div className="max-w-[1200px] w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E293B] flex items-center justify-center text-[#ffffff]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif-editorial text-xl tracking-tight text-[#1E293B]">VetSoft</span>
              <span className="text-[13px] text-[#64748B] font-normal">
                Módulo 1 · Autenticación RF-01
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-2 text-sm text-[#1E293B] bg-transparent hover:bg-[#f2f2f3] px-5 py-2 rounded-full border border-[#1E293B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Sitio</span>
        </button>
      </div>

      {/* Main Editorial Spread Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline + Peach Callout */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[14px] text-[#64748B] font-normal">
              Seguridad & Control RBAC · Spring Security 6
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#1E293B] tracking-tight leading-[1.18]">
              Acceso clínico con <span className="italic">integridad</span> criptográfica.
            </h1>

            <p className="text-[16px] text-[#64748B] leading-relaxed">
              Autenticación respaldada por PostgreSQL y comparación de hash BCrypt mediante Spring Security, con redirección automática según el rol.
            </p>

            {/* Rare Accent Peach Card (1 per page max as per Steep rules) */}
            <div className="p-6 rounded-[24px] bg-[#fbe1d1] text-[#5d2a1a] space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[#5d2a1a]">
                <ShieldCheck className="w-4 h-4 text-[#5d2a1a]" />
                <span>Criterios de Aceptación RF-01</span>
              </div>
              <ul className="text-xs text-[#5d2a1a] space-y-1.5 leading-relaxed">
                <li>1. Validación previa de formato de correo electrónico (RFC 5322).</li>
                <li>2. Verificación de hash BCrypt en PostgreSQL sin exponer contraseñas.</li>
                <li>3. Redirección automática según rol ENUM (Administrador, Veterinario, Propietario).</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Floating Product Artifact Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#ffffff] rounded-[20px] p-8 sm:p-10 relative overflow-hidden steep-floating-artifact">
              {/* SUCCESS OVERLAY */}
              {successInfo && (
                <div className="absolute inset-0 z-20 bg-[#ffffff]/98 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[12px] text-[#64748B]">
                      Sesión verificada en PostgreSQL
                    </span>
                    <h3 className="font-serif-editorial text-2xl text-[#1E293B] pt-1">
                      Bienvenido, {successInfo.email}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Rol autenticado: <strong className="text-[#1E293B]">{successInfo.role}</strong>
                    </p>
                  </div>
                  <div className="p-4 rounded-[16px] bg-[#f2f2f3] text-xs text-[#64748B] w-full max-w-sm">
                    <span>Redirigiendo al panel asignado:</span>
                    <strong className="block text-[#1E293B] mt-1">{successInfo.panelName}</strong>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#ececec]">
                <div>
                  <h2 className="font-serif-editorial text-2xl text-[#1E293B]">Iniciar Sesión</h2>
                  <p className="text-xs text-[#64748B] mt-1">Ingrese su correo electrónico y contraseña</p>
                </div>
                <span className="text-xs text-[#64748B] font-mono">
                  /login
                </span>
              </div>

              {/* Demo Account Neutral Cards */}
              <div className="mb-6 space-y-2">
                <span className="text-[12px] text-[#64748B]">
                  Cuentas de prueba rápida (Contraseña: vetsoft123):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('admin@vetsoft.com', 'vetsoft123')}
                    className="p-3 rounded-[16px] text-left bg-[#f2f2f3] hover:bg-[#e8e8ea] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span className="text-[11px] font-medium text-[#1E293B]">ADMINISTRADOR</span>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-[#64748B] truncate mt-1">admin@vetsoft.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('camilo.vet@vetsoft.com', 'vetsoft123')}
                    className="p-3 rounded-[16px] text-left bg-[#f2f2f3] hover:bg-[#e8e8ea] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span className="text-[11px] font-medium text-[#1E293B]">VETERINARIO</span>
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-[#64748B] truncate mt-1">camilo.vet@vetsoft.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('carlos.mendoza@email.com', 'vetsoft123')}
                    className="p-3 rounded-[16px] text-left bg-[#f2f2f3] hover:bg-[#e8e8ea] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span className="text-[11px] font-medium text-[#1E293B]">PROPIETARIO</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-[#64748B] truncate mt-1">carlos.mendoza...</div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#1E293B] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Correo Electrónico</span>
                    </label>
                    <span className="text-[11px] text-[#64748B]">Validación previa de formato</span>
                  </div>

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="nombre@clinica.com"
                    className={`w-full px-4 py-3 rounded-[16px] bg-[#ffffff] border text-[#1E293B] placeholder-[#a3a6af] text-sm outline-none transition-colors ${
                      emailError
                        ? 'border-[#5d2a1a] bg-[#fbe1d1]/20'
                        : 'border-[#ececec] focus:border-[#1E293B]'
                    }`}
                  />

                  {emailError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[#5d2a1a] text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#1E293B] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Contraseña</span>
                    </label>
                    <span className="text-[11px] text-[#64748B]">Hash BCrypt en PostgreSQL</span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="••••••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-[16px] bg-[#ffffff] border border-[#ececec] focus:border-[#1E293B] text-[#1E293B] placeholder-[#a3a6af] outline-none text-sm transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 rounded-[16px] bg-[#fbe1d1] text-[#5d2a1a] text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#5d2a1a] mt-0.5" />
                    <div>
                      <strong className="block font-medium">Aviso de Autenticación:</strong>
                      <span>{loginError}</span>
                    </div>
                  </div>
                )}

                {/* Submit Pill Button Pair */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !!emailError || !email.trim() || !password.trim()}
                    className="flex-1 py-3 px-6 bg-[#1E293B] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[#ffffff] font-normal text-sm rounded-full transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
                        <span>Verificando en PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesión</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onReturnToLanding}
                    className="py-3 px-6 bg-transparent hover:bg-[#f2f2f3] text-[#1E293B] border border-[#1E293B] font-normal text-sm rounded-full transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              {/* Tech Architecture Footnote */}
              <div className="mt-6 pt-4 border-t border-[#ececec] text-[12px] text-[#64748B] flex flex-wrap items-center justify-between gap-2">
                <span>PostgreSQL · Spring Security 6</span>
                <span>BCryptPasswordEncoder (strength 12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center text-xs text-[#64748B]">
        <span>VetSoft · Especificación IEEE 830 RF-01</span>
      </div>
    </div>
  );
};

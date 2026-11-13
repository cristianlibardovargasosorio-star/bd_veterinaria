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
  Database,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Shield,
  Clock,
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
      setEmailError('Formato de correo inválido. Debe incluir "@" y un dominio válido.');
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
      setEmailError('Error de validación: El formato del correo electrónico es inválido.');
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
      let panelName = 'Panel General de Control';

      if (role === 'ADMINISTRADOR') {
        targetTab = 'dashboard';
        panelName = 'Panel de Administración y Métricas';
      } else if (role === 'VETERINARIO') {
        targetTab = 'consultas';
        panelName = 'Panel de Consultas Médicas & Fichas Clínicas';
      } else if (role === 'PROPIETARIO') {
        targetTab = 'vacunacion';
        panelName = 'Portal de Pacientes & Carné de Vacunación';
      } else if (role === 'RECEPCIONISTA') {
        targetTab = 'citas';
        panelName = 'Recepción, Agenda de Citas & Facturación POS';
      }

      setSuccessInfo({
        role,
        email: email.trim(),
        targetTab,
        panelName,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3ecf8e', '#00c573', '#1f4b37', '#fafafa'],
        });
      } catch (e) {
        // ignore confetti errors
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(role, targetTab);
      }, 1500);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#fafafa] flex flex-col justify-between selection:bg-[#3ecf8e] selection:text-[#121212]">
      {/* Top Banner Navigation */}
      <div className="border-b border-[#2e2e2e] bg-[#121212] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#2e2e2e] bg-[#242424] flex items-center justify-center text-[#3ecf8e]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm tracking-tight text-[#fafafa]">VETSOFT</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#242424] text-[#3ecf8e] border border-[#2e2e2e]">
                MÓDULO 1: AUTENTICACIÓN (RF-01)
              </span>
            </div>
            <span className="text-[11px] text-[#898989] font-mono">
              /login · Spring Security + PostgreSQL
            </span>
          </div>
        </div>

        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-1.5 text-xs text-[#b4b4b4] hover:text-[#fafafa] bg-transparent hover:bg-[#242424] px-3.5 py-1.5 rounded-full border border-[#393939] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Sitio</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: SRS Architecture Context */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#3ecf8e] bg-[#121212] border border-[#2e2e2e] px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>RF-01 Certificado</span>
            </div>

            <div>
              <h1 className="text-3xl font-normal text-[#fafafa] tracking-tight leading-tight">
                Control de Acceso Seguro <br />
                <span className="text-[#3ecf8e]">por Roles (RBAC)</span>
              </h1>
              <p className="text-xs text-[#b4b4b4] mt-3 leading-relaxed">
                Autenticación centralizada con verificación criptográfica en PostgreSQL y validación de hash
                BCrypt mediante Spring Security.
              </p>
            </div>

            {/* Acceptance criteria verification list */}
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex items-center gap-2 font-medium text-[#fafafa]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
                  <span>Criterio 1: Validación Sintáctica RFC</span>
                </div>
                <p className="text-[11px] text-[#898989] pl-3.5">
                  Valida la estructura del correo electrónico antes de emitir la petición al backend.
                </p>
              </div>

              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex items-center gap-2 font-medium text-[#fafafa]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
                  <span>Criterio 2: PostgreSQL & BCrypt</span>
                </div>
                <p className="text-[11px] text-[#898989] pl-3.5 font-mono">
                  Comparación contra hash seguro ($2a$12$...) con bloqueo preventivo tras 3 intentos.
                </p>
              </div>

              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex items-center gap-2 font-medium text-[#fafafa]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
                  <span>Criterio 3: Redirección por Rol ENUM</span>
                </div>
                <div className="text-[11px] text-[#898989] pl-3.5 space-y-0.5">
                  <div>• Administrador → Panel KPIs y Finanzas</div>
                  <div>• Veterinario → Consultas y Fichas Médicas</div>
                  <div>• Propietario → Carné de Vacunación</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#121212] rounded-[16px] border border-[#2e2e2e] p-6 sm:p-8 relative overflow-hidden">
              {/* SUCCESS OVERLAY */}
              {successInfo && (
                <div className="absolute inset-0 z-20 bg-[#121212]/95 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#242424] text-[#3ecf8e] border border-[#3ecf8e] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#3ecf8e] bg-[#242424] px-3 py-1 rounded-full border border-[#2e2e2e]">
                      AUTENTICACIÓN EXITOSA
                    </span>
                    <h3 className="text-lg font-medium text-[#fafafa] pt-2">
                      ¡Bienvenido, {successInfo.email}!
                    </h3>
                    <p className="text-xs text-[#b4b4b4]">
                      Rol verificado: <strong className="text-[#3ecf8e]">{successInfo.role}</strong>
                    </p>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#242424] border border-[#2e2e2e] text-xs text-[#b4b4b4] w-full max-w-sm">
                    <span>Redirigiendo a:</span>
                    <strong className="block text-[#fafafa] mt-0.5">{successInfo.panelName}</strong>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e2e2e]">
                <div>
                  <h2 className="text-lg font-medium text-[#fafafa]">Iniciar Sesión</h2>
                  <p className="text-xs text-[#898989] mt-0.5">Ingrese credenciales registradas en la base de datos</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#242424] border border-[#2e2e2e] text-[10px] font-mono text-[#898989]">
                  POST /api/auth/login
                </div>
              </div>

              {/* Demo Account Pills */}
              <div className="mb-5 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#898989]">
                  Cuentas Demo Preconfiguradas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('admin@vetsoft.com', 'vetsoft123')}
                    className="p-2.5 rounded-[8px] text-left bg-[#242424] border border-[#2e2e2e] hover:border-[#4d4d4d] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#3ecf8e]">Admin</span>
                      <Shield className="w-3 h-3 text-[#898989]" />
                    </div>
                    <div className="text-xs text-[#fafafa] truncate mt-1">admin@vetsoft.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('camilo.vet@vetsoft.com', 'vetsoft123')}
                    className="p-2.5 rounded-[8px] text-left bg-[#242424] border border-[#2e2e2e] hover:border-[#4d4d4d] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#3ecf8e]">Veterinario</span>
                      <Stethoscope className="w-3 h-3 text-[#898989]" />
                    </div>
                    <div className="text-xs text-[#fafafa] truncate mt-1">camilo.vet@vetsoft.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('carlos.mendoza@email.com', 'vetsoft123')}
                    className="p-2.5 rounded-[8px] text-left bg-[#242424] border border-[#2e2e2e] hover:border-[#4d4d4d] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#3ecf8e]">Propietario</span>
                      <Sparkles className="w-3 h-3 text-[#898989]" />
                    </div>
                    <div className="text-xs text-[#fafafa] truncate mt-1">carlos.mendoza...</div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-normal text-[#b4b4b4] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#898989]" />
                      <span>Correo Electrónico *</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#898989]">Formato RFC 5322</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="usuario@dominio.com"
                      className={`w-full px-3 py-2 rounded-[8px] bg-[#121212] border text-[#fafafa] placeholder-[#898989] text-xs outline-none transition-colors ${
                        emailError
                          ? 'border-red-500 focus:border-red-400'
                          : 'border-[#393939] focus:border-[#3ecf8e]'
                      }`}
                    />
                  </div>

                  {emailError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-red-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-normal text-[#b4b4b4] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#898989]" />
                      <span>Contraseña *</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#898989]">BCrypt en PostgreSQL</span>
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
                      className="w-full pl-3 pr-10 py-2 rounded-[8px] bg-[#121212] border border-[#393939] focus:border-[#3ecf8e] text-[#fafafa] placeholder-[#898989] outline-none text-xs transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#898989] hover:text-[#fafafa] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3 rounded-[8px] bg-[#242424] border border-red-800 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <strong className="block">Error de Autenticación:</strong>
                      <span>{loginError}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !!emailError || !email.trim() || !password.trim()}
                  className="w-full py-2.5 bg-[#3ecf8e] hover:bg-[#00c573] hover:border-[#1f4b37] border border-[#3ecf8e] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212] font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                      <span>Verificando credenciales en PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Autenticar y Acceder</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Tech Architecture Footnote */}
              <div className="mt-6 pt-4 border-t border-[#2e2e2e] text-[11px] text-[#898989] flex flex-wrap items-center justify-between gap-2 font-mono">
                <span>PostgreSQL 16 · Spring Security</span>
                <span className="text-[#3ecf8e]">BCrypt (rounds: 12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2e2e2e] bg-[#121212] px-4 py-3 text-center text-xs text-[#898989]">
        <span>VETSOFT ERP · Sistema Hospitalario Veterinario con Cumplimiento SRS RF-01</span>
      </div>
    </div>
  );
};

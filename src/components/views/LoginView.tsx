import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { UserRole } from '../../types';
import { ActiveTab } from '../Sidebar';
import { resolvePostLoginDestination } from '../../utils/rbac';
import { crearCuenta, iniciarSesion } from '../../services/authApiService';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Shield,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, targetTab: ActiveTab, accessNotice?: string | null) => void;
  onReturnToLanding: () => void;
  redirectTo?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onReturnToLanding,
  redirectTo = null,
}) => {
  const { iniciarSesionReal } = useStore();
  const [registro, setRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [aviso, setAviso] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setAviso('');
    setIsSubmitting(true);
    try {
      if (registro) {
        const respuesta = await crearCuenta(nombre.trim(), email.trim(), password);
        setRegistro(false);
        setPassword('');
        setShowPassword(false);
        setAviso(respuesta.mensaje);
        return;
      }
      const { cuenta, token } = await iniciarSesion(email.trim(), password);
      const roleIds: Record<UserRole, number> = {
        ADMINISTRADOR: 1, VETERINARIO: 2, PROPIETARIO: 3, RECEPCIONISTA: 4,
      };
      iniciarSesionReal({
        id_usuario: cuenta.idUsuario,
        nombre_completo: cuenta.nombreCompleto,
        correo: cuenta.correo,
        contrasena: '',
        rol_id: roleIds[cuenta.rol],
        rol_nombre: cuenta.rol,
        estado: 'ACTIVO',
        intentos_fallidos: 0,
        otp_code: null,
        otp_expiracion: null,
        fecha_creacion: cuenta.fechaCreacion,
      }, token);
      const destino = redirectTo || new URLSearchParams(window.location.search).get('redirectTo');
      const { targetTab, accessDeniedNotice } = resolvePostLoginDestination(cuenta.rol, destino);
      onLoginSuccess(cuenta.rol, targetTab, accessDeniedNotice);
    } catch (error) {
      setLoginError(error instanceof TypeError
        ? 'No se pudo conectar al servidor. Intenta de nuevo.'
        : error instanceof Error ? error.message : 'No se pudo completar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen relative z-10 bg-transparent text-vet-navy flex flex-col justify-between selection:bg-vet-emerald/15 selection:text-vet-navy">
      {/* Whisper-quiet Editorial Top Navigation */}
      <div className="max-w-[1200px] w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-vet-navy flex items-center justify-center text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif-editorial text-xl tracking-tight text-vet-navy">VetSoft</span>
              <span className="text-[13px] text-vet-muted font-normal">
                Clínica Veterinaria
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-2 text-sm text-vet-navy bg-vet-surface hover:bg-vet-ice px-5 py-2 rounded-full border border-vet-border transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Sitio</span>
        </button>
      </div>

      {/* Main Editorial Spread Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h1 className="font-serif-editorial text-4xl sm:text-5xl text-vet-navy tracking-tight leading-[1.18]">
              Acceso clínico con <span className="italic">integridad</span> criptográfica.
            </h1>

            <p className="text-[16px] text-vet-muted leading-relaxed">
              Inicia sesión para hacer seguimiento al cuidado de tus mascotas. Si eres parte de la clínica, usa tu cuenta para gestionar la atención de tus pacientes.
            </p>

            <div className="p-6 rounded-[24px] bg-info-soft border border-info/25 text-info-ink space-y-3 shadow-xs">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-info-ink">
                <Stethoscope className="w-4 h-4 text-info" aria-hidden="true" />
                Servicios para tutores
              </h2>
              <ul className="list-disc pl-5 text-sm text-info-ink/90 space-y-1.5 leading-relaxed">
                <li>Agenda y consulta citas veterinarias.</li>
                <li>Revisa el carné digital de vacunación.</li>
                <li>Consulta la información de tus mascotas.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Floating Product Artifact Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-vet-surface border border-vet-border rounded-[20px] p-8 sm:p-10 relative overflow-hidden steep-floating-artifact">
              {/* SUCCESS OVERLAY */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-vet-border">
                <div>
                  <h2 className="font-serif-editorial text-2xl text-vet-navy">{registro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
                  <p className="text-xs text-vet-muted mt-1">{registro ? 'Regístrate como propietario de mascotas.' : 'Ingresa tu correo y contraseña.'}</p>
                </div>
                <span className="text-xs text-vet-muted font-mono">
                  /login
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {aviso && <p role="status" className="text-sm text-vet-navy">{aviso}</p>}
                {registro && (
                  <div>
                    <label htmlFor="registro-nombre" className="block mb-1.5 text-xs font-medium">Nombre completo</label>
                    <input
                      id="registro-nombre"
                      autoComplete="name"
                      required
                      maxLength={150}
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      className="w-full px-4 py-3 rounded-[16px] bg-vet-surface border border-vet-border text-sm"
                    />
                  </div>
                )}
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-email" className="text-xs font-medium text-vet-navy flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-vet-muted" />
                      <span>Correo Electrónico</span>
                    </label>
                    <span className="text-[11px] text-vet-muted">Validación previa de formato</span>
                  </div>

                  <input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="nombre@clinica.com"
                    className={`w-full px-4 py-3 rounded-[16px] bg-vet-surface border text-vet-navy placeholder-vet-placeholder text-sm outline-none transition-colors ${
                      emailError
                        ? 'border-vet-danger bg-vet-danger-soft/50'
                        : 'border-surface-border focus:border-brand'
                    }`}
                  />

                  {emailError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-vet-navy text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-xs font-medium text-vet-navy flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-vet-muted" />
                      <span>Contraseña</span>
                    </label>
                    <span className="text-[11px] text-vet-muted">Hash BCrypt en PostgreSQL</span>
                  </div>

                  <div className="relative">
                    <input
                      id="login-password"
                      autoComplete={registro ? 'new-password' : 'current-password'}
                      minLength={registro ? 8 : undefined}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full pl-4 pr-10 py-3 rounded-[16px] bg-vet-surface border border-vet-border focus:border-vet-navy text-vet-navy placeholder-vet-placeholder outline-none text-sm transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-vet-muted hover:text-vet-navy transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 rounded-[16px] bg-vet-ice text-vet-navy text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-vet-navy mt-0.5" />
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
                    className="flex-1 py-3 px-6 bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
                        <span>{registro ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{registro ? 'Crear cuenta' : 'Iniciar sesión'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onReturnToLanding}
                    className="py-3 px-6 bg-transparent hover:bg-vet-ice text-vet-navy border border-vet-navy font-normal text-sm rounded-full transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setRegistro(!registro);
                    setPassword('');
                    setShowPassword(false);
                    setLoginError(null);
                    setAviso('');
                  }}
                  className="text-sm font-semibold underline text-vet-navy"
                >
                  {registro ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
                </button>
              </form>

              {/* Tech Architecture Footnote */}
              <div className="mt-6 pt-4 border-t border-vet-border text-[12px] text-vet-muted flex flex-wrap items-center justify-between gap-2">
                <span>PostgreSQL · Spring Security 6</span>
                <span>BCryptPasswordEncoder (strength 12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center text-xs text-vet-muted">
        <span>VetSoft · Clínica Veterinaria</span>
      </div>
    </div>
  );
};

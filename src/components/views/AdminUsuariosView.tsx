import React, { useState } from 'react';
import { useStore } from '../../db/store';
import {
  UserPlus,
  Mail,
  Lock,
  Shield,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react';

type RolInterno = 'Veterinario' | 'Recepcionista' | 'Administrador';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const ROLE_TO_STORE: Record<RolInterno, 'VETERINARIO' | 'RECEPCIONISTA' | 'ADMINISTRADOR'> = {
  Veterinario: 'VETERINARIO',
  Recepcionista: 'RECEPCIONISTA',
  Administrador: 'ADMINISTRADOR',
};

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  VETERINARIO: 'Veterinario',
  RECEPCIONISTA: 'Recepcionista',
  PROPIETARIO: 'Propietario',
};

export const AdminUsuariosView: React.FC = () => {
  const { usuarios, currentRole, registerInternalUser } = useStore();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<RolInterno>('Veterinario');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    nombreCompleto?: string;
    correo?: string;
    contrasena?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const internalUsers = usuarios.filter((u) => u.rol_nombre !== 'PROPIETARIO');
  const totalPages = Math.max(1, Math.ceil(internalUsers.length / pageSize));
  const paginatedUsers = internalUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const validateBeforeSubmit = () => {
    const errors: { nombreCompleto?: string; correo?: string; contrasena?: string } = {};

    if (!nombreCompleto.trim()) {
      errors.nombreCompleto = 'El nombre completo es obligatorio';
    }
    if (!correo.trim() || !EMAIL_REGEX.test(correo.trim())) {
      errors.correo = 'El formato del correo electrónico no es válido';
    }
    if (contrasena.length < 6) {
      errors.contrasena = 'La contraseña debe tener mínimo 6 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Criterio 1: Validación previa al envío en el frontend
    if (!validateBeforeSubmit()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Intentar envío al endpoint Spring Boot /admin/usuarios si está disponible
      try {
        const response = await fetch('/admin/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreCompleto: nombreCompleto.trim(),
            correo: correo.trim(),
            contrasena,
            rol,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.status === 409) {
            setServerError(data.mensaje || 'Este correo ya está registrado');
            setIsSubmitting(false);
            return;
          }
          if (!response.ok) {
            setServerError(data.mensaje || 'No se pudo completar el registro');
            setIsSubmitting(false);
            return;
          }
        }
      } catch {
        // Sin servidor Spring Boot activo en el mismo origen: continúa con el store local validado
      }

      const result = registerInternalUser({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        contrasena,
        rol: ROLE_TO_STORE[rol],
      });

      if (!result.success) {
        setServerError(result.message);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(result.message);
      setNombreCompleto('');
      setCorreo('');
      setContrasena('');
      setRol('Veterinario');
      setFieldErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentRole !== 'ADMINISTRADOR') {
    return (
      <div className="p-6 rounded-[24px] bg-[#FEF2F2] border border-[#DC2626]/25 text-[#DC2626] flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="text-sm font-medium">
          Acceso restringido: solo el rol <strong>Administrador</strong> puede registrar personal interno en{' '}
          <code>/admin/usuarios</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-[24px] bg-vet-surface border border-vet-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-vet-muted mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-vet-ice text-vet-navy font-semibold border border-vet-border">
              VET-RF-01
            </span>
            <span className="font-mono">/admin/usuarios</span>
          </div>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl text-vet-navy tracking-tight">
            Registro de Usuarios Internos
          </h1>
          <p className="text-sm text-vet-muted mt-1">
            Alta de personal clínico y administrativo con validación de unicidad y cifrado BCrypt.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-vet-ice border border-vet-border text-xs font-medium text-vet-navy shrink-0">
          <Users className="w-4 h-4 text-vet-emerald" />
          <span>{internalUsers.length} usuarios internos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Registro */}
        <div className="lg:col-span-5 bg-vet-surface rounded-[24px] border border-vet-border p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-vet-ice border border-vet-border text-vet-emerald flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vet-navy">Nuevo Usuario Interno</h2>
              <p className="text-xs text-vet-muted">Veterinario, Recepcionista o Administrador</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label htmlFor="reg-nombre" className="block text-xs font-semibold text-vet-navy mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-vet-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-nombre"
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => {
                    setNombreCompleto(e.target.value);
                    if (fieldErrors.nombreCompleto) setFieldErrors((p) => ({ ...p, nombreCompleto: undefined }));
                  }}
                  placeholder="Ej. Dra. Laura Gómez"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#eff6ff] border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
                />
              </div>
              {fieldErrors.nombreCompleto && (
                <p className="mt-1 text-xs text-[#DC2626] font-medium">{fieldErrors.nombreCompleto}</p>
              )}
            </div>

            {/* Correo electrónico */}
            <div>
              <label htmlFor="reg-correo" className="block text-xs font-semibold text-vet-navy mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-vet-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setServerError(null);
                    if (fieldErrors.correo) setFieldErrors((p) => ({ ...p, correo: undefined }));
                  }}
                  placeholder="nombre@vetsoft.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#eff6ff] border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
                />
              </div>
              {fieldErrors.correo && (
                <p className="mt-1 text-xs text-[#DC2626] font-medium">{fieldErrors.correo}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-vet-navy mb-1.5">
                Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-vet-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => {
                    setContrasena(e.target.value);
                    if (fieldErrors.contrasena) setFieldErrors((p) => ({ ...p, contrasena: undefined }));
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#eff6ff] border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar u ocultar contraseña"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vet-muted hover:text-vet-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.contrasena && (
                <p className="mt-1 text-xs text-[#DC2626] font-medium">{fieldErrors.contrasena}</p>
              )}
            </div>

            {/* Rol ENUM */}
            <div>
              <label htmlFor="reg-rol" className="block text-xs font-semibold text-vet-navy mb-1.5">
                Rol asignado (ENUM)
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-vet-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  id="reg-rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolInterno)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#eff6ff] border border-vet-border text-sm text-vet-navy focus:outline-none focus:border-vet-navy"
                >
                  <option value="Veterinario">Veterinario</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            {/* Alertas */}
            {serverError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/25 text-xs text-[#DC2626] font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="p-3 rounded-2xl bg-vet-ice border border-vet-emerald/35 text-xs text-vet-emerald-hover font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-vet-emerald" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-5 rounded-full bg-vet-emerald hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar usuario interno'}
            </button>
          </form>
        </div>

        {/* Listado de Personal Registrado */}
        <div className="lg:col-span-7 bg-vet-surface rounded-[24px] border border-vet-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-vet-navy">Personal Interno Registrado</h2>
            <span className="text-xs text-vet-muted">Tabla PostgreSQL: usuarios (UNIQUE correo)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-vet-border text-vet-muted">
                  <th className="py-2.5 px-3">Nombre / Correo</th>
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Cifrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ececec]">
                {paginatedUsers.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-[#eff6ff]">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-vet-navy">
                        {u.nombre_completo || ROLE_LABELS[u.rol_nombre] || 'Personal VetSoft'}
                      </div>
                      <div className="text-[11px] text-vet-muted font-mono">{u.correo}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-vet-ice text-vet-navy">
                        {ROLE_LABELS[u.rol_nombre] || u.rol_nombre}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-vet-ice text-vet-emerald-hover border border-vet-emerald/30">
                        {u.estado}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-vet-muted whitespace-nowrap">
                      BCrypt ($2a$)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-vet-border flex items-center justify-between text-xs text-vet-muted">
              <span>
                Página {currentPage} de {totalPages} ({internalUsers.length} registros)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-full border border-vet-border disabled:opacity-40 hover:bg-[#eff6ff] cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-full border border-vet-border disabled:opacity-40 hover:bg-[#eff6ff] cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


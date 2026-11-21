import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../db/store';
import { actualizarUsuarioApi, crearUsuarioApi, listarUsuariosApi, registrarUsuarioInternoApi } from '../../services/usuarioApiService';
import { Usuario, UserRole } from '../../types';
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
  const { usuarios, currentRole, currentUser, registerInternalUser, updateInternalUserAccess, sesionReal, jwtToken } = useStore();
  const [usuariosDb, setUsuariosDb] = useState<Usuario[]>([]);
  const [errorLista, setErrorLista] = useState<string | null>(null);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [guardandoCuenta, setGuardandoCuenta] = useState<number | null>(null);

  useEffect(() => {
    if (!sesionReal || !jwtToken || currentRole !== 'ADMINISTRADOR') return;
    let vigente = true;
    setCargandoLista(true);
    setErrorLista(null);
    listarUsuariosApi(jwtToken)
      .then((datos) => { if (vigente) setUsuariosDb(datos); })
      .catch((error: Error) => { if (vigente) setErrorLista(error.message); })
      .finally(() => { if (vigente) setCargandoLista(false); });
    return () => { vigente = false; };
  }, [sesionReal, jwtToken, currentRole]);

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
  const [pendingAccess, setPendingAccess] = useState<{ id: number; action: 'suspender' | 'eliminar' } | null>(null);
  const [accessFeedback, setAccessFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const accessDialog = useRef<HTMLDialogElement>(null);
  const pageSize = 6;

  const internalUsers = sesionReal ? usuariosDb : usuarios.filter((u) => u.rol_nombre !== 'PROPIETARIO' && u.estado !== 'ELIMINADO');
  const pendingUser = internalUsers.find((user) => user.id_usuario === pendingAccess?.id);
  const eliminating = pendingAccess?.action === 'eliminar';
  const totalPages = Math.max(1, Math.ceil(internalUsers.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedUsers = internalUsers.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  const actualizarCuenta = async (usuario: Usuario, cambio: { rol?: UserRole; activo?: boolean }) => {
    if (!jwtToken) return;
    setGuardandoCuenta(usuario.id_usuario);
    setAccessFeedback(null);
    try {
      const actualizada = await actualizarUsuarioApi(jwtToken, usuario.id_usuario, cambio);
      setUsuariosDb((actuales) => actuales.map((actual) => actual.id_usuario === actualizada.id_usuario ? actualizada : actual));
      setAccessFeedback({ success: true, message: 'Cambios guardados.' });
    } catch (error) {
      setAccessFeedback({ success: false, message: (error as Error).message });
    } finally {
      setGuardandoCuenta(null);
    }
  };

  const confirmAccessChange = (id: number, action: 'suspender' | 'eliminar') => {
    setAccessFeedback(null);
    setPendingAccess({ id, action });
    accessDialog.current?.showModal();
  };

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
      if (sesionReal) {
        if (!jwtToken) throw new Error('Vuelve a iniciar sesión.');
        const creado = await crearUsuarioApi(jwtToken, {
          nombreCompleto: nombreCompleto.trim(), correo: correo.trim(), contrasena, rol: ROLE_TO_STORE[rol],
        });
        setUsuariosDb((actuales) => [creado, ...actuales]);
        setCurrentPage(1);
        setSuccessMessage('Usuario registrado en VetSoft.');
        setNombreCompleto('');
        setCorreo('');
        setContrasena('');
        setRol('Veterinario');
        setFieldErrors({});
        return;
      }

      const response = await registrarUsuarioInternoApi({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        contrasena,
        rol,
      });

      if (response) {
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
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentRole !== 'ADMINISTRADOR') {
    return (
      <div className="p-6 rounded-[24px] bg-vet-danger-soft border border-vet-danger/25 text-vet-danger-ink flex items-center gap-3">
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
              Administración
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Formulario de Registro */}
        <div className="min-w-0 bg-vet-surface rounded-[24px] border border-vet-border p-6 shadow-xs xl:col-span-4">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-vet-hover border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
                />
              </div>
              {fieldErrors.nombreCompleto && (
                <p className="mt-1 text-xs text-vet-danger-ink font-medium">{fieldErrors.nombreCompleto}</p>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-vet-hover border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
                />
              </div>
              {fieldErrors.correo && (
                <p className="mt-1 text-xs text-vet-danger-ink font-medium">{fieldErrors.correo}</p>
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-vet-hover border border-vet-border text-sm text-vet-navy placeholder:text-[#a3a6af] focus:outline-none focus:border-vet-navy"
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
                <p className="mt-1 text-xs text-vet-danger-ink font-medium">{fieldErrors.contrasena}</p>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-vet-hover border border-vet-border text-sm text-vet-navy focus:outline-none focus:border-vet-navy"
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
                className="p-3 rounded-2xl bg-vet-danger-soft border border-vet-danger/25 text-xs text-vet-danger-ink font-medium flex items-center gap-2"
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
        <div className="min-w-0 bg-vet-surface rounded-[24px] border border-vet-border p-4 shadow-xs sm:p-6 xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-vet-navy">{sesionReal ? 'Cuentas registradas' : 'Personal Interno Registrado'}</h2>
            <span className="text-xs text-vet-muted">Tabla PostgreSQL: usuarios (UNIQUE correo)</span>
          </div>
          {cargandoLista && <p role="status" className="py-2 text-sm">Cargando cuentas…</p>}
          {errorLista && <p role="alert" className="py-2 text-sm text-vet-danger-ink">{errorLista}</p>}

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <colgroup>
                <col className="w-[31%]" />
                <col className="w-[18%]" />
                <col className="w-[19%]" />
                <col className="w-[32%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-vet-border text-vet-muted">
                  <th className="py-2.5 px-3">Nombre / Correo</th>
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vet-divider">
                {paginatedUsers.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-vet-hover">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-vet-navy [overflow-wrap:anywhere]">
                        {u.nombre_completo || ROLE_LABELS[u.rol_nombre] || 'Personal VetSoft'}
                      </div>
                      <div className="font-mono text-[11px] text-vet-muted [overflow-wrap:anywhere]">{u.correo}</div>
                    </td>
                    <td className="px-2 py-3">
                      {sesionReal && u.id_usuario !== currentUser.id_usuario ? (
                        <select
                          aria-label={`Rol de ${u.correo}`}
                          value={u.rol_nombre}
                          disabled={guardandoCuenta !== null}
                          onChange={(event) => void actualizarCuenta(u, { rol: event.target.value as UserRole })}
                          className="w-full rounded-lg border border-vet-border bg-vet-surface p-1"
                        >
                          {Object.entries(ROLE_LABELS).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
                        </select>
                      ) : <span className="inline-block max-w-full rounded-full bg-vet-ice px-2 py-0.5 text-[11px] font-semibold text-vet-navy [overflow-wrap:anywhere]">
                        {ROLE_LABELS[u.rol_nombre] || u.rol_nombre}
                      </span>}
                    </td>
                    <td className="px-2 py-3">
                      <span className={`inline-block max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold [overflow-wrap:anywhere] ${u.estado === 'ACTIVO' ? 'bg-vet-ice text-vet-emerald-hover border-vet-emerald/30' : 'bg-vet-ice text-vet-muted border-vet-border'}`}>
                        {u.estado === 'INACTIVO' ? 'SUSPENDIDO' : u.estado}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-vet-muted">
                      {u.id_usuario === currentUser.id_usuario ? 'Tu cuenta' : sesionReal ? (
                        <button
                          type="button"
                          disabled={guardandoCuenta !== null}
                          onClick={() => {
                            const activo = u.estado !== 'ACTIVO';
                            if (activo) void actualizarCuenta(u, { activo });
                            else confirmAccessChange(u.id_usuario, 'suspender');
                          }}
                          className="rounded-lg border border-vet-border px-2.5 py-1.5"
                        >
                          {u.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
                        </button>
                      ) : u.estado === 'INACTIVO' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAccessFeedback(updateInternalUserAccess(u.id_usuario, 'reactivar'))}
                            className="rounded-lg border border-vet-emerald/30 px-2.5 py-1.5 font-semibold text-vet-emerald-hover hover:bg-vet-ice"
                          >
                            Reactivar
                          </button>
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            onClick={() => confirmAccessChange(u.id_usuario, 'eliminar')}
                            className="rounded-lg border border-vet-danger/30 px-2.5 py-1.5 font-semibold text-vet-danger-ink hover:bg-vet-danger-soft"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={() => confirmAccessChange(u.id_usuario, 'suspender')}
                          className="rounded-lg border border-vet-danger/30 px-2.5 py-1.5 font-semibold text-vet-danger-ink hover:bg-vet-danger-soft"
                        >
                          Suspender
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {accessFeedback && (
            <p role="status" className={`mt-3 text-sm ${accessFeedback.success ? 'text-vet-emerald-hover' : 'text-vet-danger-ink'}`}>
              {accessFeedback.message}
            </p>
          )}

          <dialog
            ref={accessDialog}
            aria-labelledby="gestionar-acceso-titulo"
            onClose={() => setPendingAccess(null)}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-[20px] border border-vet-border bg-vet-surface p-[24px] text-vet-navy shadow-xl backdrop:bg-vet-navy/50"
          >
            <h3 id="gestionar-acceso-titulo" className="text-base font-bold">{eliminating ? 'Eliminar cuenta' : 'Suspender acceso'}</h3>
            {pendingUser && (
              <p className="mt-3 break-words text-sm text-vet-muted">
                La cuenta <strong>{pendingUser.correo}</strong> {eliminating ? 'se retirará del listado y ya no podrá reactivarse.' : 'quedará suspendida hasta que la reactives o la elimines.'} Sus registros seguirán en el historial.
              </p>
            )}
            <form method="dialog" className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="submit" className="rounded-lg border border-vet-border px-3 py-2 text-sm">Cancelar</button>
              <button
                type="button"
                disabled={!pendingUser}
                onClick={() => {
                  if (!pendingUser || !pendingAccess) return;
                  if (sesionReal) {
                    void actualizarCuenta(pendingUser, { activo: false });
                    accessDialog.current?.close();
                    return;
                  }
                  const result = updateInternalUserAccess(pendingUser.id_usuario, pendingAccess.action);
                  setAccessFeedback(result);
                  if (result.success && eliminating && paginatedUsers.length === 1) {
                    setCurrentPage(Math.max(1, visiblePage - 1));
                  }
                  accessDialog.current?.close();
                }}
                className="rounded-lg bg-vet-danger-soft px-3 py-2 text-sm font-semibold text-vet-danger-ink"
              >
                {eliminating ? 'Confirmar eliminación' : 'Confirmar suspensión'}
              </button>
            </form>
          </dialog>

          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-vet-border flex items-center justify-between text-xs text-vet-muted">
              <span>
                Página {visiblePage} de {totalPages} ({internalUsers.length} registros)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={visiblePage === 1}
                  onClick={() => setCurrentPage(visiblePage - 1)}
                  className="px-3 py-1 rounded-full border border-vet-border disabled:opacity-40 hover:bg-vet-hover cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={visiblePage === totalPages}
                  onClick={() => setCurrentPage(visiblePage + 1)}
                  className="px-3 py-1 rounded-full border border-vet-border disabled:opacity-40 hover:bg-vet-hover cursor-pointer"
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


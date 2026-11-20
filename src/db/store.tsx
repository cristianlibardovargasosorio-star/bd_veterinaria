import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Usuario,
  Propietario,
  Veterinario,
  Mascota,
  Cita,
  ConsultaMedica,
  VacunaCatalogo,
  HistoriaVacunacion,
  FichaIA,
  ReporteEjecutivoIA,
  Producto,
  Lote,
  Factura,
  DetalleFactura,
  MovimientoInventario,
  AuditoriaSistema,
  ViewExistencia,
  UserRole,
} from '../types';
import {
  DEMO_OWNER_EMAIL,
  DEMO_OWNER_PROFILE,
  INITIAL_USUARIOS,
  INITIAL_PROPIETARIOS,
  INITIAL_VETERINARIOS,
  INITIAL_MASCOTAS,
  INITIAL_CITAS,
  INITIAL_CONSULTAS,
  INITIAL_VACUNAS,
  INITIAL_HISTORIA_VACUNAS,
  INITIAL_FICHAS_IA,
  INITIAL_REPORTES_IA,
  INITIAL_PRODUCTOS,
  INITIAL_LOTES,
  INITIAL_FACTURAS,
  INITIAL_DETALLE_FACTURA,
  INITIAL_MOVIMIENTOS,
  INITIAL_AUDITORIA,
} from './initialData';

interface StoreContextType {
  // Current session & auth
  currentUser: Usuario;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  switchUser: (id_usuario: number) => void;
  login: (
    correo: string,
    contrasena: string
  ) => { success: boolean; message: string; role?: UserRole; token?: string; requiresOtp?: boolean; otp?: string };
  logout: () => void;
  jwtToken: string | null;
  recentAccountIds: number[];
  switchOwnerAccount: (email: string, password: string) => { success: boolean; message: string };
  verificarOtp: (otp: string) => boolean;
  registerInternalUser: (input: {
    nombreCompleto: string;
    correo: string;
    contrasena: string;
    rol: 'VETERINARIO' | 'RECEPCIONISTA' | 'ADMINISTRADOR';
  }) => { success: boolean; message: string; user?: Usuario };
  updateInternalUserAccess: (id: number, action: 'suspender' | 'reactivar' | 'eliminar') => { success: boolean; message: string };

  // Entities
  usuarios: Usuario[];
  propietarios: Propietario[];
  veterinarios: Veterinario[];
  mascotas: Mascota[];
  citas: Cita[];
  consultas: ConsultaMedica[];
  vacunas: VacunaCatalogo[];
  historiaVacunas: HistoriaVacunacion[];
  fichasIA: FichaIA[];
  reportesIA: ReporteEjecutivoIA[];
  productos: Producto[];
  lotes: Lote[];
  facturas: Factura[];
  detallesFactura: DetalleFactura[];
  movimientos: MovimientoInventario[];
  auditoria: AuditoriaSistema[];

  // Views
  vwExistencias: ViewExistencia[];
  vwAlertasStock: ViewExistencia[];

  // Methods (Stored Procedures & Domain Logic)
  registrarMascota: (
    mascota: Omit<Mascota, 'id_mascota' | 'fecha_registro'>,
    nuevoTutor?: Omit<Propietario, 'id_propietario'>
  ) => { success: boolean; message: string; data?: Mascota };
  actualizarMascota: (id_mascota: number, datos: Partial<Mascota>) => void;
  registrarPropietario: (prop: Omit<Propietario, 'id_propietario'>) => { success: boolean; message: string; data?: Propietario };
  agendarCita: (cita: Omit<Cita, 'id_cita' | 'fecha_creacion'>) => { success: boolean; message: string; data?: Cita };
  cambiarEstadoCita: (id_cita: number, nuevoEstado: Cita['estado']) => void;
  registrarConsulta: (consulta: Omit<ConsultaMedica, 'id_consulta' | 'fecha_consulta'>) => { success: boolean; message: string; data?: ConsultaMedica };
  aplicarVacuna: (vacunacion: Omit<HistoriaVacunacion, 'id_historia_vacuna'>) => { success: boolean; message: string; data?: HistoriaVacunacion };
  guardarFichaIA: (ficha: Omit<FichaIA, 'id_ficha' | 'fecha_generacion'>) => FichaIA;
  toggleAprobacionFichaIA: (id_ficha: number) => void;
  guardarReporteIA: (reporte: Omit<ReporteEjecutivoIA, 'id_reporte' | 'fecha_generacion'>) => ReporteEjecutivoIA;

  // POS & Facturación (SP equivalents)
  spCrearFactura: (idCliente: number) => number;
  spAgregarDetalle: (idFactura: number, idLote: number, cantidad: number) => { success: boolean; message: string };
  spConfirmarFactura: (idFactura: number) => { success: boolean; message: string };
  anularFactura: (idFactura: number) => { success: boolean; message: string };

  // Inventario & Lotes
  crearProducto: (prod: Omit<Producto, 'id_producto'>) => { success: boolean; message: string };
  crearLote: (lote: Omit<Lote, 'id_lote'>) => { success: boolean; message: string };
  ajustarStockLote: (idLote: number, cantidadDelta: number, motivo: string, tipo: 'APERTURA' | 'AJUSTE') => { success: boolean; message: string };

  // Utility
  resetDatabase: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_PREFIX = 'vetsoft_db_v4_';

const DEMO_EMAILS = new Set([
  'admin@vetsoft.com',
  'camilo.vet@vetsoft.com',
  'carlos.mendoza@vetsoft.com',
  DEMO_OWNER_EMAIL,
]);

function mergeInitialUsers(storedUsers: Usuario[]): Usuario[] {
  const byEmail = new Map<string, Usuario>();
  for (const u of storedUsers) {
    byEmail.set(u.correo.toLowerCase(), u);
  }
  for (const initial of INITIAL_USUARIOS) {
    const key = initial.correo.toLowerCase();
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, initial);
    } else if (DEMO_EMAILS.has(key) && existing.estado === 'BLOQUEADO') {
      byEmail.set(key, { ...existing, estado: 'ACTIVO', intentos_fallidos: 0 });
    }
  }
  return Array.from(byEmail.values());
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error loading key', key, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving key', key, e);
  }
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() =>
    mergeInitialUsers(loadFromStorage('usuarios', INITIAL_USUARIOS))
  );
  const [propietarios, setPropietarios] = useState<Propietario[]>(() => {
    const stored = loadFromStorage('propietarios', INITIAL_PROPIETARIOS);
    return stored.some((owner) => owner.id_propietario === DEMO_OWNER_PROFILE.id_propietario)
      ? stored
      : [...stored, DEMO_OWNER_PROFILE];
  });
  const [veterinarios] = useState<Veterinario[]>(() => loadFromStorage('veterinarios', INITIAL_VETERINARIOS));
  const [mascotas, setMascotas] = useState<Mascota[]>(() => loadFromStorage('mascotas', INITIAL_MASCOTAS));
  const [citas, setCitas] = useState<Cita[]>(() => loadFromStorage('citas', INITIAL_CITAS));
  const [consultas, setConsultas] = useState<ConsultaMedica[]>(() => loadFromStorage('consultas', INITIAL_CONSULTAS));
  const [vacunas, setVacunas] = useState<VacunaCatalogo[]>(() => loadFromStorage('vacunas', INITIAL_VACUNAS));
  const [historiaVacunas, setHistoriaVacunas] = useState<HistoriaVacunacion[]>(() => loadFromStorage('historia_vacunas', INITIAL_HISTORIA_VACUNAS));
  const [fichasIA, setFichasIA] = useState<FichaIA[]>(() => loadFromStorage('fichas_ia', INITIAL_FICHAS_IA));
  const [reportesIA, setReportesIA] = useState<ReporteEjecutivoIA[]>(() => loadFromStorage('reportes_ia', INITIAL_REPORTES_IA));
  const [productos, setProductos] = useState<Producto[]>(() => loadFromStorage('productos', INITIAL_PRODUCTOS));
  const [lotes, setLotes] = useState<Lote[]>(() => loadFromStorage('lotes', INITIAL_LOTES));
  const [facturas, setFacturas] = useState<Factura[]>(() => loadFromStorage('facturas', INITIAL_FACTURAS));
  const [detallesFactura, setDetallesFactura] = useState<DetalleFactura[]>(() => loadFromStorage('detalles_factura', INITIAL_DETALLE_FACTURA));
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>(() => loadFromStorage('movimientos', INITIAL_MOVIMIENTOS));
  const [auditoria, setAuditoria] = useState<AuditoriaSistema[]>(() => loadFromStorage('auditoria', INITIAL_AUDITORIA));

  // Current session
  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    const savedId = loadFromStorage('current_user_id', 1);
    const found = usuarios.find((u) => u.id_usuario === savedId);
    return found || usuarios[0];
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(currentUser.rol_nombre);
  const [recentAccountIds, setRecentAccountIds] = useState<number[]>(() => loadFromStorage('recent_account_ids', []));
  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    try {
      localStorage.removeItem('vetsoft_jwt_token');
      if (currentUser.estado !== 'ACTIVO') {
        sessionStorage.removeItem('vetsoft_jwt_token');
        return null;
      }
      return sessionStorage.getItem('vetsoft_jwt_token');
    } catch {
      return null;
    }
  });

  // Sync state to localStorage
  useEffect(() => saveToStorage('usuarios', usuarios), [usuarios]);
  useEffect(() => saveToStorage('propietarios', propietarios), [propietarios]);
  useEffect(() => saveToStorage('veterinarios', veterinarios), [veterinarios]);
  useEffect(() => saveToStorage('mascotas', mascotas), [mascotas]);
  useEffect(() => saveToStorage('citas', citas), [citas]);
  useEffect(() => saveToStorage('consultas', consultas), [consultas]);
  useEffect(() => saveToStorage('vacunas', vacunas), [vacunas]);
  useEffect(() => saveToStorage('historia_vacunas', historiaVacunas), [historiaVacunas]);
  useEffect(() => saveToStorage('fichas_ia', fichasIA), [fichasIA]);
  useEffect(() => saveToStorage('reportes_ia', reportesIA), [reportesIA]);
  useEffect(() => saveToStorage('productos', productos), [productos]);
  useEffect(() => saveToStorage('lotes', lotes), [lotes]);
  useEffect(() => saveToStorage('facturas', facturas), [facturas]);
  useEffect(() => saveToStorage('detalles_factura', detallesFactura), [detallesFactura]);
  useEffect(() => saveToStorage('movimientos', movimientos), [movimientos]);
  useEffect(() => saveToStorage('auditoria', auditoria), [auditoria]);
  useEffect(() => saveToStorage('current_user_id', currentUser.id_usuario), [currentUser]);
  useEffect(() => {
    const syncUsers = (event: StorageEvent) => {
      if (event.key === STORAGE_PREFIX + 'recent_account_ids') {
        setRecentAccountIds(loadFromStorage('recent_account_ids', []));
        return;
      }
      if (event.key !== STORAGE_PREFIX + 'usuarios') return;
      const updated = loadFromStorage('usuarios', INITIAL_USUARIOS);
      setUsuarios(updated);
      if (updated.some((user) => user.id_usuario === currentUser.id_usuario && user.estado !== 'ACTIVO')) {
        setJwtToken(null);
        sessionStorage.removeItem('vetsoft_jwt_token');
      }
    };
    window.addEventListener('storage', syncUsers);
    return () => window.removeEventListener('storage', syncUsers);
  }, [currentUser.id_usuario]);

  // Auditor helper
  const addAuditoria = (tabla: string, operacion: 'INSERT' | 'UPDATE' | 'DELETE', detalles: string) => {
    const newRecord: AuditoriaSistema = {
      id_auditoria: Date.now() + Math.floor(Math.random() * 100),
      id_usuario: currentUser.id_usuario,
      usuario_nombre: currentUser.correo,
      tabla_afectada: tabla,
      operacion,
      detalles,
      fecha: new Date().toISOString(),
    };
    setAuditoria((prev) => [newRecord, ...prev]);
  };

  // Switch role and user
  const setCurrentRole = (role: UserRole) => {
    const targetUser = usuarios.find((u) => u.rol_nombre === role && u.estado === 'ACTIVO');
    if (targetUser) {
      setCurrentRoleState(role);
      setCurrentUser(targetUser);
    }
  };

  const switchUser = (id_usuario: number) => {
    const user = usuarios.find((u) => u.id_usuario === id_usuario);
    if (user?.estado === 'ACTIVO') {
      setCurrentUser(user);
      setCurrentRoleState(user.rol_nombre);
      addAuditoria('usuarios', 'UPDATE', `Sesión cambiada a usuario ${user.correo} (${user.rol_nombre})`);
    }
  };

  // VET-RF-02: Autenticación con validación de entrada, cuenta activa, hash BCrypt y emisión de token JWT
  const login = (correo: string, contrasena: string) => {
    if (!correo || !correo.trim() || !contrasena) {
      return {
        success: false,
        message: 'El correo electrónico y la contraseña no pueden estar vacíos.',
      };
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(correo.trim())) {
      return {
        success: false,
        message: 'El formato del correo electrónico no es válido.',
      };
    }

    const normalizedEmail = correo.trim().toLowerCase();
    let effectiveUsuarios = usuarios;
    let userIndex = effectiveUsuarios.findIndex((u) => u.correo.toLowerCase() === normalizedEmail);
    // Fallback por si Vite HMR o caché antigua no incluyó una cuenta inicial
    if (userIndex === -1) {
      const initialMatch = INITIAL_USUARIOS.find((u) => u.correo.toLowerCase() === normalizedEmail);
      if (initialMatch) {
        effectiveUsuarios = [...effectiveUsuarios, initialMatch];
        userIndex = effectiveUsuarios.length - 1;
        setUsuarios(effectiveUsuarios);
      }
    }
    // Criterio 2 VET-RF-02: Mensaje exacto sin revelar si falló correo, contraseña o cuenta inactiva
    const EXACT_AUTH_ERROR = 'Correo o contraseña incorrectos';

    if (userIndex === -1) {
      return { success: false, message: EXACT_AUTH_ERROR };
    }

    const user = effectiveUsuarios[userIndex];

    // Verificar que la cuenta esté activa (INACTIVO o BLOQUEADO devuelven el mismo mensaje exacto)
    if (user.estado !== 'ACTIVO') {
      return {
        success: false,
        message: EXACT_AUTH_ERROR,
      };
    }

    // BCrypt hash comparison (Spring Security BCryptPasswordEncoder simulation: valid demo password is "vetsoft123" or "VetSoft2026*")
    const isValid = contrasena === 'vetsoft123' || contrasena === 'VetSoft2026*';
    if (!isValid) {
      const nuevosIntentos = user.intentos_fallidos + 1;
      const nuevoEstado = nuevosIntentos >= 3 ? 'BLOQUEADO' : user.estado;
      const updatedUser: Usuario = {
        ...user,
        intentos_fallidos: nuevosIntentos,
        estado: nuevoEstado,
      };

      setUsuarios((prev) => {
        const copy = [...prev];
        copy[userIndex] = updatedUser;
        return copy;
      });

      // Nunca se registra la contraseña en los logs de auditoría
      addAuditoria('usuarios', 'UPDATE', `Intento de autenticación fallido para cuenta registrada`);
      return { success: false, message: EXACT_AUTH_ERROR };
    }

    // Emisión de token JWT de sesión (header.payload.signature)
    const toBase64Url = (obj: object) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const nowSec = Math.floor(Date.now() / 1000);
    const issuedJwt = `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url({
      sub: user.correo,
      rol: user.rol_nombre,
      iat: nowSec,
      exp: nowSec + 3600,
    })}.vetsoft_hs256_sig`;

    setJwtToken(issuedJwt);
    try {
      sessionStorage.setItem('vetsoft_jwt_token', issuedJwt);
    } catch {
      // Ignore storage errors
    }

    // Success login -> generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const updatedUser: Usuario = {
      ...user,
      intentos_fallidos: 0,
      otp_code: generatedOtp,
      otp_expiracion: expiry,
    };

    setUsuarios((prev) => {
      const copy = [...prev];
      copy[userIndex] = updatedUser;
      return copy;
    });

    setCurrentUser(updatedUser);
    setCurrentRoleState(updatedUser.rol_nombre);
    const previousAccounts = loadFromStorage<number[]>('recent_account_ids', []);
    const recent = [updatedUser.id_usuario, ...previousAccounts.filter((id) => id !== updatedUser.id_usuario)].slice(0, 5);
    setRecentAccountIds(recent);
    saveToStorage('recent_account_ids', recent);
    addAuditoria('usuarios', 'UPDATE', `VET-RF-02: Login exitoso con JWT para ${correo}`);

    return {
      success: true,
      message: 'Autenticación exitosa con token JWT.',
      role: updatedUser.rol_nombre,
      token: issuedJwt,
      requiresOtp: true,
      otp: generatedOtp,
    };
  };

  const switchOwnerAccount: StoreContextType['switchOwnerAccount'] = (email, password) => {
    if (currentRole !== 'PROPIETARIO' || currentUser.rol_nombre !== 'PROPIETARIO' || !jwtToken) {
      return { success: false, message: 'Esta opción está disponible en el portal de propietarios.' };
    }
    const target = usuarios.find((user) =>
      user.correo.toLowerCase() === email.trim().toLowerCase() &&
      user.rol_nombre === 'PROPIETARIO' &&
      user.estado === 'ACTIVO' &&
      user.id_usuario !== currentUser.id_usuario
    );
    if (!target) return { success: false, message: 'Usa el correo de otra cuenta activa de propietario.' };
    return login(target.correo, password);
  };

  // VET-RF-02 Criterio 4: Cierre de sesión e invalidación del token JWT en el cliente
  const logout = () => {
    setJwtToken(null);
    try {
      sessionStorage.removeItem('vetsoft_jwt_token');
      localStorage.removeItem('vetsoft_jwt_token');
    } catch {
      // Ignore storage errors
    }
    addAuditoria('usuarios', 'UPDATE', `VET-RF-02: Sesión cerrada e invalidación de JWT en cliente (${currentUser.correo})`);
  };

  const verificarOtp = (otp: string) => {
    if (!currentUser.otp_code) return true;
    if (currentUser.otp_code === otp) {
      addAuditoria('usuarios', 'UPDATE', `Código OTP verificado correctamente para ${currentUser.correo}`);
      return true;
    }
    return false;
  };

  /**
   * VET-RF-01: Registro de usuarios internos con validación de formato,
   * longitud mínima de contraseña (6) y unicidad de correo.
   */
  const registerInternalUser = (input: {
    nombreCompleto: string;
    correo: string;
    contrasena: string;
    rol: 'VETERINARIO' | 'RECEPCIONISTA' | 'ADMINISTRADOR';
  }) => {
    const emailNormalized = input.correo.trim().toLowerCase();
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!input.nombreCompleto.trim()) {
      return { success: false, message: 'El nombre completo es obligatorio' };
    }
    if (!emailRegex.test(emailNormalized)) {
      return { success: false, message: 'El formato del correo electrónico no es válido' };
    }
    if (input.contrasena.length < 6) {
      return { success: false, message: 'La contraseña debe tener mínimo 6 caracteres' };
    }
    if (usuarios.some((u) => u.correo.toLowerCase() === emailNormalized)) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    const roleIdMap: Record<'ADMINISTRADOR' | 'VETERINARIO' | 'RECEPCIONISTA', number> = {
      ADMINISTRADOR: 1,
      VETERINARIO: 2,
      RECEPCIONISTA: 3,
    };

    const nextId = usuarios.reduce((max, u) => Math.max(max, u.id_usuario), 0) + 1;
    const newUser: Usuario = {
      id_usuario: nextId,
      nombre_completo: input.nombreCompleto.trim(),
      correo: emailNormalized,
      // Representación cifrada BCrypt en cliente (el backend cifra con BCryptPasswordEncoder(12))
      contrasena: `$2a$12$bcryptHash_${btoa(emailNormalized).replace(/=/g, '').slice(0, 22)}`,
      rol_id: roleIdMap[input.rol],
      rol_nombre: input.rol,
      estado: 'ACTIVO',
      intentos_fallidos: 0,
      otp_code: null,
      otp_expiracion: null,
      fecha_creacion: new Date().toISOString(),
    };

    setUsuarios((prev) => [...prev, newUser]);
    addAuditoria('usuarios', 'INSERT', `VET-RF-01: Usuario interno registrado (${emailNormalized} · ${input.rol})`);

    return {
      success: true,
      message: `Usuario ${newUser.nombre_completo} registrado correctamente con rol ${input.rol}`,
      user: newUser,
    };
  };

  // Vistas Calculadas (vw_existencias y vw_alertas_stock)
  const vwExistencias: ViewExistencia[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return productos.map((prod) => {
      const prodLotes = lotes.filter((l) => l.id_producto === prod.id_producto);
      const stock_fisico = prodLotes.reduce((sum, l) => sum + l.stock_actual, 0);

      const stock_vendible = prodLotes
        .filter((l) => !l.fecha_vencimiento || l.fecha_vencimiento >= today)
        .reduce((sum, l) => sum + l.stock_actual, 0);

      const stock_vencido = prodLotes
        .filter((l) => l.fecha_vencimiento && l.fecha_vencimiento < today)
        .reduce((sum, l) => sum + l.stock_actual, 0);

      return {
        id_producto: prod.id_producto,
        sku: prod.sku,
        nombre: prod.nombre,
        stock_minimo: prod.stock_minimo,
        activo: prod.activo,
        stock_fisico,
        stock_vendible,
        stock_vencido,
      };
    });
  }, [productos, lotes]);

  const vwAlertasStock: ViewExistencia[] = useMemo(() => {
    return vwExistencias.filter((p) => p.activo && p.stock_vendible <= p.stock_minimo);
  }, [vwExistencias]);

  const updateInternalUserAccess: StoreContextType['updateInternalUserAccess'] = (id, action) => {
    if (currentRole !== 'ADMINISTRADOR' || currentUser.estado !== 'ACTIVO') {
      return { success: false, message: 'Solo un administrador activo puede gestionar el acceso del personal.' };
    }
    if (id === currentUser.id_usuario) {
      return { success: false, message: 'No puedes cambiar el acceso de tu propia cuenta.' };
    }
    const user = usuarios.find((record) => record.id_usuario === id && record.rol_nombre !== 'PROPIETARIO');
    if (!user || user.estado === 'ELIMINADO') {
      return { success: false, message: 'Esta cuenta no está disponible.' };
    }
    const isSuspended = user.estado === 'INACTIVO';
    if (action === 'suspender' ? isSuspended : !isSuspended) {
      return { success: false, message: 'Esta acción no está disponible para el estado actual de la cuenta.' };
    }
    if (action === 'suspender' && user.rol_nombre === 'ADMINISTRADOR' && !usuarios.some((record) =>
      record.id_usuario !== id && record.rol_nombre === 'ADMINISTRADOR' && record.estado === 'ACTIVO'
    )) {
      return { success: false, message: 'Debe quedar al menos un administrador activo.' };
    }
    const nextStateByAction = { suspender: 'INACTIVO', reactivar: 'ACTIVO', eliminar: 'ELIMINADO' } as const;
    const resultByAction = { suspender: 'suspendida', reactivar: 'reactivada', eliminar: 'eliminada del listado' };
    setUsuarios((prev) => prev.map((record) => record.id_usuario === id ? {
      ...record,
      estado: nextStateByAction[action],
      intentos_fallidos: 0,
      otp_code: null,
      otp_expiracion: null,
      contrasena: action === 'eliminar' ? '' : record.contrasena,
    } : record));
    const message = `Cuenta ${resultByAction[action]}: ${user.correo}.`;
    addAuditoria('usuarios', 'UPDATE', message);
    return { success: true, message };
  };

  // RF05: Registrar Mascota (con validación de expediente único y propietario)
  const registrarMascota = (
    mascotaData: Omit<Mascota, 'id_mascota' | 'fecha_registro'>,
    nuevoTutor?: Omit<Propietario, 'id_propietario'>
  ) => {
    // Check unique codigo_expediente
    const existing = mascotas.find(
      (m) => m.codigo_expediente.trim().toUpperCase() === mascotaData.codigo_expediente.trim().toUpperCase()
    );
    if (existing) {
      return { success: false, message: `El código de expediente ${mascotaData.codigo_expediente} ya existe en el sistema.` };
    }

    let idPropietario = mascotaData.id_propietario;
    if (nuevoTutor) {
      const result = registrarPropietario(nuevoTutor);
      if (!result.data) return { success: false, message: result.message };
      idPropietario = result.data.id_propietario;
    } else if (!propietarios.some((propietario) => propietario.id_propietario === idPropietario)) {
      return { success: false, message: 'Selecciona un tutor registrado o añade uno nuevo.' };
    }

    const nuevaMascota: Mascota = {
      ...mascotaData,
      id_propietario: idPropietario,
      id_mascota: Date.now(),
      fecha_registro: new Date().toISOString(),
    };

    setMascotas((prev) => [nuevaMascota, ...prev]);
    addAuditoria(
      'mascotas',
      'INSERT',
      `Registro de paciente: ${nuevaMascota.nombre} (${nuevaMascota.especie}), Código: ${nuevaMascota.codigo_expediente}`
    );

    return { success: true, message: 'Paciente registrado exitosamente.', data: nuevaMascota };
  };

  const actualizarMascota = (id_mascota: number, datos: Partial<Mascota>) => {
    setMascotas((prev) =>
      prev.map((m) => (m.id_mascota === id_mascota ? { ...m, ...datos } : m))
    );
    addAuditoria('mascotas', 'UPDATE', `Actualización de datos para paciente #${id_mascota}`);
  };

  // RF06: Registrar Propietario
  const registrarPropietario = (propData: Omit<Propietario, 'id_propietario'>) => {
    const existing = propietarios.find((p) => p.cedula_documento.trim() === propData.cedula_documento.trim());
    if (existing) {
      return {
        success: false,
        message: `Ya existe un propietario con la cédula/documento ${propData.cedula_documento}.`,
      };
    }

    const nuevo: Propietario = {
      ...propData,
      id_propietario: Date.now(),
    };

    setPropietarios((prev) => [nuevo, ...prev]);
    addAuditoria(
      'propietarios',
      'INSERT',
      `Registro de propietario: ${nuevo.nombres} ${nuevo.apellidos}, Documento: ${nuevo.cedula_documento}`
    );

    return { success: true, message: 'Propietario registrado exitosamente.', data: nuevo };
  };

  // RF07: Agendamiento de Citas con Control de Colisiones
  const agendarCita = (citaData: Omit<Cita, 'id_cita' | 'fecha_creacion'>) => {
    // Collision detection: Check if same veterinarian already has an active appointment at same datetime
    const collision = citas.find(
      (c) =>
        c.id_veterinario === citaData.id_veterinario &&
        c.fecha_hora === citaData.fecha_hora &&
        c.estado !== 'CANCELADA'
    );

    if (collision) {
      const vet = veterinarios.find((v) => v.id_veterinario === citaData.id_veterinario);
      return {
        success: false,
        message: `Conflicto de horario: ${vet?.nombres || 'El veterinario'} ya tiene asignada una cita en la fecha y hora seleccionada (${citaData.fecha_hora}).`,
      };
    }

    const nuevaCita: Cita = {
      ...citaData,
      id_cita: Date.now(),
      fecha_creacion: new Date().toISOString(),
    };

    setCitas((prev) => [nuevaCita, ...prev]);
    addAuditoria(
      'citas',
      'INSERT',
      `Agendamiento de cita #${nuevaCita.id_cita} para mascota #${nuevaCita.id_mascota} (${nuevaCita.fecha_hora}) - ${nuevaCita.tipo_cita}`
    );

    return { success: true, message: 'Cita programada con éxito.', data: nuevaCita };
  };

  const cambiarEstadoCita = (id_cita: number, nuevoEstado: Cita['estado']) => {
    setCitas((prev) =>
      prev.map((c) => (c.id_cita === id_cita ? { ...c, estado: nuevoEstado } : c))
    );
    addAuditoria('citas', 'UPDATE', `Cita #${id_cita} cambió de estado a ${nuevoEstado}`);
  };

  // RF08: Consultas Médicas
  const registrarConsulta = (consultaData: Omit<ConsultaMedica, 'id_consulta' | 'fecha_consulta'>) => {
    const nuevaConsulta: ConsultaMedica = {
      ...consultaData,
      id_consulta: Date.now(),
      fecha_consulta: new Date().toISOString(),
    };

    setConsultas((prev) => [nuevaConsulta, ...prev]);

    // Mark corresponding appointment as ATENDIDA
    if (consultaData.id_cita) {
      cambiarEstadoCita(consultaData.id_cita, 'ATENDIDA');
    }

    // Update pet's weight and status
    setMascotas((prev) =>
      prev.map((m) =>
        m.id_mascota === consultaData.id_mascota
          ? { ...m, peso_kg: consultaData.peso_actual, estado_salud: 'EN TRATAMIENTO' }
          : m
      )
    );

    addAuditoria(
      'consultas',
      'INSERT',
      `Registro de consulta clínica #${nuevaConsulta.id_consulta} para mascota #${nuevaConsulta.id_mascota}. Dx: ${nuevaConsulta.diagnostico}`
    );

    return { success: true, message: 'Consulta registrada correctamente.', data: nuevaConsulta };
  };

  // RF09: Control de Vacunas e Historia
  const aplicarVacuna = (vacData: Omit<HistoriaVacunacion, 'id_historia_vacuna'>) => {
    const nuevaVacunacion: HistoriaVacunacion = {
      ...vacData,
      id_historia_vacuna: Date.now(),
    };

    setHistoriaVacunas((prev) => [nuevaVacunacion, ...prev]);
    addAuditoria(
      'historia_vacunacion',
      'INSERT',
      `Aplicación de vacuna #${vacData.id_vacuna} (Lote: ${vacData.lote}) a mascota #${vacData.id_mascota}. Refuerzo: ${vacData.fecha_refuerzo}`
    );

    return { success: true, message: 'Vacunación registrada en el carné digital.', data: nuevaVacunacion };
  };

  // RF10: Guardar y Aprobar Ficha IA
  const guardarFichaIA = (fichaData: Omit<FichaIA, 'id_ficha' | 'fecha_generacion'>) => {
    const existingIndex = fichasIA.findIndex((f) => f.id_consulta === fichaData.id_consulta);
    if (existingIndex >= 0) {
      const updated: FichaIA = {
        ...fichasIA[existingIndex],
        ...fichaData,
        fecha_generacion: new Date().toISOString(),
      };
      setFichasIA((prev) => {
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      });
      addAuditoria('fichas_ia', 'UPDATE', `Actualización de Ficha IA para consulta #${fichaData.id_consulta}`);
      return updated;
    }

    const nuevaFicha: FichaIA = {
      ...fichaData,
      id_ficha: Date.now(),
      fecha_generacion: new Date().toISOString(),
    };

    setFichasIA((prev) => [nuevaFicha, ...prev]);
    addAuditoria('fichas_ia', 'INSERT', `Generación de Ficha IA #${nuevaFicha.id_ficha} con Gemini 3.8 Flash`);
    return nuevaFicha;
  };

  const toggleAprobacionFichaIA = (id_ficha: number) => {
    setFichasIA((prev) =>
      prev.map((f) => {
        if (f.id_ficha === id_ficha) {
          const aprobado = !f.aprobado_por_veterinario;
          addAuditoria(
            'fichas_ia',
            'UPDATE',
            `Ficha IA #${id_ficha} ${aprobado ? 'Aprobada' : 'Desaprobada'} por el médico tratante`
          );
          return { ...f, aprobado_por_veterinario: aprobado };
        }
        return f;
      })
    );
  };

  // RF11: Reportes Ejecutivos IA
  const guardarReporteIA = (repData: Omit<ReporteEjecutivoIA, 'id_reporte' | 'fecha_generacion'>) => {
    const nuevoReporte: ReporteEjecutivoIA = {
      ...repData,
      id_reporte: Date.now(),
      fecha_generacion: new Date().toISOString(),
    };

    setReportesIA((prev) => [nuevoReporte, ...prev]);
    addAuditoria('reportes_ejecutivos_ia', 'INSERT', `Generación de Reporte Ejecutivo IA (${repData.tipo_reporte})`);
    return nuevoReporte;
  };

  // Script 02: PROCEDIMIENTOS ALMACENADOS DE FACTURACIÓN CONTROLADA
  // 1. sp_crear_factura(p_cliente, p_cajero)
  const spCrearFactura = (idCliente: number): number => {
    const newId = Date.now();
    const nuevaFactura: Factura = {
      id_factura: newId,
      id_cliente: idCliente,
      id_usuario_cajero: currentUser.id_usuario,
      fecha: new Date().toISOString(),
      estado: 'BORRADOR',
      total: 0,
    };

    setFacturas((prev) => [nuevaFactura, ...prev]);
    addAuditoria('facturas', 'INSERT', `sp_crear_factura: Factura #${newId} iniciada en BORRADOR para cliente #${idCliente}`);
    return newId;
  };

  // 2. sp_agregar_detalle(p_factura, p_lote, p_cantidad)
  const spAgregarDetalle = (idFactura: number, idLote: number, cantidad: number) => {
    if (cantidad <= 0) {
      return { success: false, message: 'La cantidad debe ser positiva' };
    }

    const factura = facturas.find((f) => f.id_factura === idFactura);
    if (!factura || factura.estado !== 'BORRADOR') {
      return { success: false, message: 'La factura no existe o no está en borrador' };
    }

    const lote = lotes.find((l) => l.id_lote === idLote);
    if (!lote) {
      return { success: false, message: 'Lote inexistente' };
    }

    const prod = productos.find((p) => p.id_producto === lote.id_producto && p.activo);
    if (!prod) {
      return { success: false, message: 'Lote inexistente o producto inactivo' };
    }

    // Check expiration if required
    const today = new Date().toISOString().split('T')[0];
    if (lote.fecha_vencimiento && lote.fecha_vencimiento < today) {
      return {
        success: false,
        message: `El lote ${lote.codigo_lote} está vencido (${lote.fecha_vencimiento}). No se puede vender.`,
      };
    }

    // Check existing detail for same lot
    const existingDetalleIndex = detallesFactura.findIndex(
      (d) => d.id_factura === idFactura && d.id_lote === idLote
    );

    const precioUnitario = prod.precio_venta;

    if (existingDetalleIndex >= 0) {
      // Update existing
      const existing = detallesFactura[existingDetalleIndex];
      const nuevaCantidad = existing.cantidad + cantidad;
      if (nuevaCantidad > lote.stock_actual) {
        return { success: false, message: `Stock insuficiente en lote ${lote.codigo_lote}. Disponible: ${lote.stock_actual}` };
      }

      setDetallesFactura((prev) => {
        const copy = [...prev];
        copy[existingDetalleIndex] = {
          ...existing,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * precioUnitario,
        };
        return copy;
      });
    } else {
      if (cantidad > lote.stock_actual) {
        return { success: false, message: `Stock insuficiente en lote ${lote.codigo_lote}. Disponible: ${lote.stock_actual}` };
      }

      const nuevoDetalle: DetalleFactura = {
        id_detalle: Date.now() + Math.floor(Math.random() * 100),
        id_factura: idFactura,
        id_lote: idLote,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal: cantidad * precioUnitario,
      };

      setDetallesFactura((prev) => [...prev, nuevoDetalle]);
    }

    // Recalculate invoice total
    setTimeout(() => {
      setFacturas((prev) =>
        prev.map((f) => {
          if (f.id_factura === idFactura) {
            const items = detallesFactura
              .filter((d) => d.id_factura === idFactura)
              .map((d) => (d.id_lote === idLote ? { ...d, cantidad: d.cantidad + (existingDetalleIndex >= 0 ? 0 : cantidad), subtotal: (d.cantidad + (existingDetalleIndex >= 0 ? 0 : cantidad)) * d.precio_unitario } : d));
            const total = items.reduce((sum, d) => sum + d.subtotal, 0);
            return { ...f, total };
          }
          return f;
        })
      );
    }, 10);

    return { success: true, message: `Producto agregado a factura: ${prod.nombre}` };
  };

  // 3. sp_confirmar_factura(p_factura, p_responsable)
  const spConfirmarFactura = (idFactura: number) => {
    const factura = facturas.find((f) => f.id_factura === idFactura);
    if (!factura || factura.estado !== 'BORRADOR') {
      return { success: false, message: 'Factura inexistente o ya procesada' };
    }

    const items = detallesFactura.filter((d) => d.id_factura === idFactura);
    if (items.length === 0) {
      return { success: false, message: 'La factura necesita al menos un producto' };
    }

    const today = new Date().toISOString().split('T')[0];

    // Atomicity check across all items first
    for (const item of items) {
      const lote = lotes.find((l) => l.id_lote === item.id_lote);
      if (!lote) {
        return { success: false, message: `Error crítico: Lote #${item.id_lote} no existe` };
      }
      if (lote.fecha_vencimiento && lote.fecha_vencimiento < today) {
        return {
          success: false,
          message: `Stock insuficiente o lote vencido: venta revertida (${lote.codigo_lote} venció el ${lote.fecha_vencimiento})`,
        };
      }
      if (lote.stock_actual < item.cantidad) {
        return {
          success: false,
          message: `Stock insuficiente en lote ${lote.codigo_lote}: solicitado ${item.cantidad}, disponible ${lote.stock_actual}`,
        };
      }
    }

    // Execute deductions and movement logs
    const newMovimientos: MovimientoInventario[] = [];

    setLotes((prevLotes) => {
      const updated = [...prevLotes];
      for (const item of items) {
        const lIndex = updated.findIndex((l) => l.id_lote === item.id_lote);
        if (lIndex >= 0) {
          const l = updated[lIndex];
          updated[lIndex] = {
            ...l,
            stock_actual: l.stock_actual - item.cantidad,
          };
          newMovimientos.push({
            id_movimiento: Date.now() + Math.floor(Math.random() * 1000),
            id_lote: item.id_lote,
            id_detalle: item.id_detalle,
            id_usuario_responsable: currentUser.id_usuario,
            fecha: new Date().toISOString(),
            tipo: 'VENTA',
            cantidad_delta: -item.cantidad,
            motivo: `Venta factura #${idFactura}`,
          });
        }
      }
      return updated;
    });

    setMovimientos((prev) => [...newMovimientos, ...prev]);

    const totalFactura = items.reduce((sum, item) => sum + item.subtotal, 0);

    setFacturas((prev) =>
      prev.map((f) =>
        f.id_factura === idFactura
          ? {
              ...f,
              estado: 'PAGADA',
              total: totalFactura,
            }
          : f
      )
    );

    addAuditoria(
      'facturas',
      'UPDATE',
      `sp_confirmar_factura(#${idFactura}): Factura PAGADA por $${totalFactura.toFixed(2)}. ${items.length} productos descontados de inventario.`
    );

    return { success: true, message: `Factura #${idFactura} pagada y procesada con éxito.` };
  };

  const anularFactura = (idFactura: number) => {
    const factura = facturas.find((f) => f.id_factura === idFactura);
    if (!factura) return { success: false, message: 'Factura no encontrada' };

    setFacturas((prev) =>
      prev.map((f) => (f.id_factura === idFactura ? { ...f, estado: 'ANULADA' } : f))
    );
    addAuditoria('facturas', 'UPDATE', `Factura #${idFactura} anulada`);
    return { success: true, message: 'Factura anulada exitosamente.' };
  };

  // Crear Producto y Lote con validación de triggers
  const crearProducto = (prodData: Omit<Producto, 'id_producto'>) => {
    const existing = productos.find((p) => p.sku.trim().toUpperCase() === prodData.sku.trim().toUpperCase());
    if (existing) {
      return { success: false, message: `El SKU ${prodData.sku} ya está registrado.` };
    }

    const nuevo: Producto = {
      ...prodData,
      id_producto: Date.now(),
    };

    setProductos((prev) => [nuevo, ...prev]);
    addAuditoria('productos', 'INSERT', `Producto creado: ${nuevo.nombre} (${nuevo.sku})`);
    return { success: true, message: 'Producto registrado con éxito.' };
  };

  // Trigger trg_lote_vencimiento_bi
  const crearLote = (loteData: Omit<Lote, 'id_lote'>) => {
    const prod = productos.find((p) => p.id_producto === loteData.id_producto);
    if (!prod) return { success: false, message: 'Producto no encontrado' };

    // Trigger check
    if (prod.requiere_vencimiento && !loteData.fecha_vencimiento) {
      return {
        success: false,
        message: 'TRIGGER ERROR: El producto requiere fecha de vencimiento por lote (trg_lote_vencimiento_bi)',
      };
    }

    const nuevoLote: Lote = {
      ...loteData,
      id_lote: Date.now(),
    };

    setLotes((prev) => [nuevoLote, ...prev]);

    // Registro de apertura si stock > 0
    if (nuevoLote.stock_actual > 0) {
      const mov: MovimientoInventario = {
        id_movimiento: Date.now() + 1,
        id_lote: nuevoLote.id_lote,
        id_detalle: null,
        id_usuario_responsable: currentUser.id_usuario,
        fecha: new Date().toISOString(),
        tipo: 'APERTURA',
        cantidad_delta: nuevoLote.stock_actual,
        motivo: `Ingreso de lote ${nuevoLote.codigo_lote} (${prod.nombre})`,
      };
      setMovimientos((prev) => [mov, ...prev]);
    }

    addAuditoria(
      'lotes',
      'INSERT',
      `Lote ${nuevoLote.codigo_lote} creado para producto ${prod.nombre}. Stock inicial: ${nuevoLote.stock_actual}`
    );

    return { success: true, message: 'Lote registrado con éxito.' };
  };

  const ajustarStockLote = (
    idLote: number,
    cantidadDelta: number,
    motivo: string,
    tipo: 'APERTURA' | 'AJUSTE'
  ) => {
    if (cantidadDelta === 0) return { success: false, message: 'El delta debe ser diferente de 0' };

    const lote = lotes.find((l) => l.id_lote === idLote);
    if (!lote) return { success: false, message: 'Lote no encontrado' };

    const nuevoStock = lote.stock_actual + cantidadDelta;
    if (nuevoStock < 0) {
      return { success: false, message: `El ajuste resultaría en stock negativo (${nuevoStock})` };
    }

    setLotes((prev) =>
      prev.map((l) => (l.id_lote === idLote ? { ...l, stock_actual: nuevoStock } : l))
    );

    const mov: MovimientoInventario = {
      id_movimiento: Date.now(),
      id_lote: idLote,
      id_detalle: null,
      id_usuario_responsable: currentUser.id_usuario,
      fecha: new Date().toISOString(),
      tipo,
      cantidad_delta: cantidadDelta,
      motivo,
    };

    setMovimientos((prev) => [mov, ...prev]);
    addAuditoria(
      'movimientos_inventario',
      'INSERT',
      `Ajuste de inventario en lote #${idLote}: ${cantidadDelta > 0 ? '+' : ''}${cantidadDelta}. Motivo: ${motivo}`
    );

    return { success: true, message: 'Inventario actualizado con éxito.' };
  };

  // Reset demo database to initial state
  const resetDatabase = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    setUsuarios(INITIAL_USUARIOS);
    setPropietarios(INITIAL_PROPIETARIOS);
    setMascotas(INITIAL_MASCOTAS);
    setCitas(INITIAL_CITAS);
    setConsultas(INITIAL_CONSULTAS);
    setVacunas(INITIAL_VACUNAS);
    setHistoriaVacunas(INITIAL_HISTORIA_VACUNAS);
    setFichasIA(INITIAL_FICHAS_IA);
    setReportesIA(INITIAL_REPORTES_IA);
    setProductos(INITIAL_PRODUCTOS);
    setLotes(INITIAL_LOTES);
    setFacturas(INITIAL_FACTURAS);
    setDetallesFactura(INITIAL_DETALLE_FACTURA);
    setMovimientos(INITIAL_MOVIMIENTOS);
    setAuditoria(INITIAL_AUDITORIA);
    setCurrentUser(INITIAL_USUARIOS[0]);
    setCurrentRoleState('ADMINISTRADOR');
    setRecentAccountIds([]);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        switchUser,
        login,
        logout,
        jwtToken,
        recentAccountIds,
        switchOwnerAccount,
        verificarOtp,
        registerInternalUser,
        updateInternalUserAccess,
        usuarios,
        propietarios,
        veterinarios,
        mascotas,
        citas,
        consultas,
        vacunas,
        historiaVacunas,
        fichasIA,
        reportesIA,
        productos,
        lotes,
        facturas,
        detallesFactura,
        movimientos,
        auditoria,
        vwExistencias,
        vwAlertasStock,
        registrarMascota,
        actualizarMascota,
        registrarPropietario,
        agendarCita,
        cambiarEstadoCita,
        registrarConsulta,
        aplicarVacuna,
        guardarFichaIA,
        toggleAprobacionFichaIA,
        guardarReporteIA,
        spCrearFactura,
        spAgregarDetalle,
        spConfirmarFactura,
        anularFactura,
        crearProducto,
        crearLote,
        ajustarStockLote,
        resetDatabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

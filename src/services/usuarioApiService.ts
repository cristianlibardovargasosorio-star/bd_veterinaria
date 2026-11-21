import { Usuario, UserRole } from '../types';
import { apiVetSoft } from './apiVetSoft';

export interface RegistrarUsuarioInternoPayload {
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  rol: string;
}

/**
 * Servicio desacoplado de acceso HTTP para registro administrativo de usuarios (VET-RNF-06).
 */
export async function registrarUsuarioInternoApi(
  payload: RegistrarUsuarioInternoPayload,
  token: string | null = null
): Promise<Response | null> {
  try {
    return await fetch('/admin/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return null;
  }
}
type UsuarioApi = {
  idUsuario: number; nombreCompleto: string; correo: string; rol: string; activo: boolean; fechaCreacion: string;
};

function mapearUsuario(usuario: UsuarioApi): Usuario {
  const rol = usuario.rol.toUpperCase() as UserRole;
  const roles: Record<UserRole, number> = { ADMINISTRADOR: 1, VETERINARIO: 2, RECEPCIONISTA: 3, PROPIETARIO: 4 };
  return {
    id_usuario: usuario.idUsuario, nombre_completo: usuario.nombreCompleto, correo: usuario.correo,
    rol_nombre: rol, rol_id: roles[rol], estado: usuario.activo ? 'ACTIVO' : 'INACTIVO',
    fecha_creacion: usuario.fechaCreacion, contrasena: '', intentos_fallidos: 0, otp_code: null, otp_expiracion: null,
  };
}

const rutaUsuarios = '/api/admin/usuarios';

export async function listarUsuariosApi(token: string) {
  const usuarios: Usuario[] = [];
  let totalPaginas = 1;
  for (let pagina = 0; pagina < totalPaginas; pagina++) {
    const respuesta = await apiVetSoft<{ content: UsuarioApi[]; totalPages: number }>(
      `${rutaUsuarios}?size=100&page=${pagina}`, token,
    );
    usuarios.push(...respuesta.content.map(mapearUsuario));
    totalPaginas = respuesta.totalPages;
  }
  return usuarios;
}

export async function crearUsuarioApi(token: string, datos: RegistrarUsuarioInternoPayload) {
  return mapearUsuario(await apiVetSoft<UsuarioApi>(rutaUsuarios, token, 'POST', datos));
}

export async function actualizarUsuarioApi(token: string, id: number, cambio: { rol?: UserRole; activo?: boolean }) {
  const ruta = `${rutaUsuarios}/${id}`;
  const respuesta = cambio.activo === false && !cambio.rol
    ? await apiVetSoft<UsuarioApi>(ruta, token, 'DELETE')
    : await apiVetSoft<UsuarioApi>(ruta, token, 'PATCH', cambio);
  return mapearUsuario(respuesta);
}

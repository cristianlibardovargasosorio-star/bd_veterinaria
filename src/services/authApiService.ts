import { UserRole } from '../types';

export interface CuentaApi {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  rol: UserRole;
  fechaCreacion: string;
}

async function solicitar<T>(ruta: string, opciones: RequestInit): Promise<T> {
  const respuesta = await fetch(`/api/auth/${ruta}`, { ...opciones, redirect: 'error' });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok || !datos) {
    throw new Error(datos?.mensaje ?? 'No se pudo completar la solicitud. Intenta de nuevo.');
  }
  return datos as T;
}

export function crearCuenta(nombreCompleto: string, correo: string, contrasena: string) {
  return solicitar<{ mensaje: string }>('registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreCompleto, correo, contrasena }),
  });
}

export async function iniciarSesion(correo: string, contrasena: string) {
  const { token } = await solicitar<{ token: string }>('login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  });
  const cuenta = await solicitar<CuentaApi>('cuenta', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { cuenta, token };
}

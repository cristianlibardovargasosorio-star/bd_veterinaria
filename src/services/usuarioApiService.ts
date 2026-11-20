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

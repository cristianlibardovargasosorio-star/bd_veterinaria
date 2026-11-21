export async function apiVetSoft<T>(ruta: string, token: string, metodo = 'GET', datos?: unknown): Promise<T> {
  const respuesta = await fetch(ruta, {
    method: metodo,
    redirect: 'manual',
    headers: { Authorization: `Bearer ${token}`, ...(datos ? { 'Content-Type': 'application/json' } : {}) },
    body: datos ? JSON.stringify(datos) : undefined,
  });
  const resultado = await respuesta.json().catch(() => null);
  if (!respuesta.ok || !resultado) {
    throw new Error(resultado?.mensaje ?? resultado?.detail ?? 'No se pudo completar la operación en VetSoft.');
  }
  return resultado as T;
}

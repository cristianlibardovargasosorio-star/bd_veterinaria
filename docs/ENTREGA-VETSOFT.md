# Entrega de VetSoft

VetSoft usa React para la interfaz, Spring Boot para la API REST y PostgreSQL para guardar los datos. La versión local se abre en `http://localhost:3000`. El frontend envía las peticiones `/api` al backend a través de Nginx.

## Evidencias para la entrega

| Requisito | Evidencia que puedes adjuntar |
| --- | --- |
| Crear la base de datos | En `psql`, ejecuta `\dt` para mostrar las tablas. Si quieres mostrar un registro real, consulta la relación entre Max y su propietario con el SQL de abajo. |
| Implementar la API REST | Abre **Usuarios Internos** como administrador. En las herramientas del navegador, pestaña **Red** o **Network**, captura una solicitud `GET /api/admin/usuarios` con estado `200`. |
| Autenticación y autorización | Abre el sitio en dos ventanas y entra con una cuenta administrativa y una cuenta de propietario. Captura el panel del administrador y la pantalla **Pacientes** del propietario. Para demostrar el bloqueo del backend, puedes ejecutar la prueba de permisos de esta guía. |
| Implementar CRUD | En **Usuarios Internos**, crea una cuenta de prueba, búscala, cambia su rol y pulsa **Suspender**. En **Red**, las operaciones aparecen como `POST`, `GET`, `PATCH` y `DELETE`. |
| Documentar endpoints | Adjunta la referencia de endpoints de este documento y sus ejemplos de petición. |

Para capturar las peticiones en el navegador, pulsa **F12**, selecciona **Red / Network** y filtra por `/api/`. Selecciona una petición y, en **Encabezados / Headers**, abre la sección **General** para mostrar método, ruta y estado HTTP. Oculta los encabezados de autorización, las contraseñas y los datos personales que no hagan falta para la entrega.

En PostgreSQL, puedes mostrar la asociación de una mascota con su tutor así:

```sql
SELECT p.id_paciente, p.nombre AS mascota, u.nombre_completo AS propietario
FROM public.pacientes p
JOIN public.propietarios t ON t.id_propietario = p.id_propietario
JOIN public.usuarios u ON u.id_usuario = t.id_usuario
WHERE p.nombre = 'Max';
```

## Autenticación y permisos

El registro público crea cuentas con rol `PROPIETARIO` y guarda las contraseñas como hashes BCrypt. Al iniciar sesión, Spring Boot valida las credenciales y entrega un JWT. Las rutas protegidas reciben el encabezado `Authorization: Bearer <token>`. Spring Security verifica el permiso del usuario en el servidor. Las consultas de propietarios filtran por la identidad autenticada para devolver solo sus mascotas y sus registros.

## CRUD de cuentas

Usa una cuenta secundaria de prueba y haz el recorrido desde **Usuarios Internos**. La baja es lógica. Deja la cuenta inactiva, conserva sus referencias en PostgreSQL y permite reactivarla desde el panel.

| Operación | Método y ruta | Resultado esperado |
| --- | --- | --- |
| Crear | `POST /api/admin/usuarios` | `201`. Se crea el usuario interno con el rol elegido. |
| Leer | `GET /api/admin/usuarios?page=0&size=10` | `200`. Se devuelve una página de cuentas. |
| Actualizar | `PATCH /api/admin/usuarios/{id}` | `200`. Se guarda el cambio de rol o la reactivación. |
| Dar de baja | `DELETE /api/admin/usuarios/{id}` | `200`. La cuenta queda con `activo: false` y pierde acceso. |

**Prueba de permisos en PowerShell.** Ejecuta esto con una cuenta de prueba creada desde **Crear una cuenta**. Espera un `403` en la consulta administrativa. El comando conserva el token en una variable y no lo imprime.

```powershell
$credencial = Get-Credential -Message 'Cuenta de prueba de VetSoft con rol Propietario'
$cuerpo = @{
  correo = $credencial.UserName
  contrasena = $credencial.GetNetworkCredential().Password
} | ConvertTo-Json
$sesion = Invoke-RestMethod 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body $cuerpo
try {
  Invoke-WebRequest 'http://localhost:3000/api/admin/usuarios' -Headers @{ Authorization = "Bearer $($sesion.token)" } -ErrorAction Stop
} catch {
  [int]$_.Exception.Response.StatusCode
}
```

## Referencia de endpoints

La URL base es `http://localhost:3000`. Las peticiones con cuerpo usan `Content-Type: application/json`. Los parámetros `{id}` se reemplazan por el identificador del registro.

| Método y ruta | Acceso | Entrada y respuesta |
| --- | --- | --- |
| `POST /api/auth/registro` | Público | `nombreCompleto`, `correo`, `contrasena`. Devuelve `201` y un mensaje. |
| `POST /api/auth/login` | Público | `correo`, `contrasena`. Devuelve `200` con JWT y rol. |
| `GET /api/auth/cuenta` | Usuario autenticado | Devuelve el perfil de la sesión. |
| `GET /api/admin/usuarios` | Administrador | Acepta `page` y `size`. Devuelve una página de cuentas. |
| `POST /api/admin/usuarios` | Administrador | `nombreCompleto`, `correo`, `contrasena`, `rol`. Devuelve `201` y la cuenta creada. |
| `PATCH /api/admin/usuarios/{id}` | Administrador | `rol`, `activo` o ambos. Devuelve la cuenta actualizada. |
| `DELETE /api/admin/usuarios/{id}` | Administrador | Da de baja la cuenta y devuelve su estado actualizado. |
| `GET /api/pacientes` | Administrador, veterinario y recepción | Devuelve mascotas, tutores, citas y vacunas. El historial de consultas se incluye para administrador y veterinario. |
| `GET /api/pacientes/mis-mascotas` | Propietario | Devuelve mascotas y registros asociados a la cuenta autenticada. |
| `POST /api/pacientes` | Administrador, veterinario y recepción | Datos de la mascota y un `idPropietario` o un objeto `nuevoTutor`. Devuelve `201` con `idPaciente`. |
| `POST /api/pacientes/citas` | Personal y propietarios | `idPaciente`, `idVeterinario`, `fechaHora`, `tipoCita`, `motivoGeneral`. El propietario solo puede agendar para sus mascotas. |
| `PATCH /api/pacientes/citas/{id}` | Personal y propietarios | `estado` con `CONFIRMADA` o `CANCELADA`. El propietario solo puede cancelar sus citas. |
| `POST /api/pacientes/consultas` | Administrador y veterinario | `idCita`, `motivo`, `diagnostico`, `tratamiento` y datos clínicos opcionales. Devuelve `201` con `idConsulta`. |
| `POST /api/pacientes/vacunas` | Administrador y veterinario | `idPaciente`, `idVeterinario`, `nombre`, `lote`, `fechaAplicacion`, y opcionalmente `fechaRefuerzo` y `observaciones`. Devuelve `201` con `idVacuna`. |
| `GET /api/inventario` | Administrador, veterinario y recepción | Devuelve productos, lotes y movimientos. |
| `POST /api/inventario/productos` | Administrador, veterinario y recepción | `sku`, `nombre`, `precioVenta`, `stockMinimo`, `requiereVencimiento`. Devuelve `201` con `idProducto`. |
| `POST /api/inventario/lotes` | Administrador, veterinario y recepción | `idProducto`, `codigoLote`, `stockActual` y `fechaVencimiento` cuando el producto la requiere. Devuelve `201` con `idLote`. |
| `POST /api/inventario/ajustes` | Administrador, veterinario y recepción | `idLote`, `delta` y `motivo`. Aplica el ajuste y registra el movimiento. |
| `GET /api/facturacion` | Administrador y recepción | Devuelve facturas y sus detalles. |
| `POST /api/facturacion` | Administrador y recepción | `idCliente`. Crea un borrador y devuelve `201` con `idFactura`. |
| `POST /api/facturacion/{id}/detalles` | Administrador y recepción | `idLote` y `cantidad`. Agrega productos al borrador. |
| `POST /api/facturacion/{id}/confirmar` | Administrador y recepción | Confirma el borrador y descuenta el inventario en una transacción. |
| `POST /api/facturacion/{id}/anular` | Administrador y recepción | Anula una factura en borrador. |
| `GET /api/auditoria` | Administrador y recepción | Devuelve los últimos eventos de cuentas. |

### Ejemplos de petición

Registro público mediante `POST /api/auth/registro`:

```json
{
  "nombreCompleto": "Cuenta de prueba",
  "correo": "tutor.prueba@example.com",
  "contrasena": "CAMBIAR-POR-UNA-CLAVE-DE-PRUEBA"
}
```

Cambio de rol mediante `PATCH /api/admin/usuarios/{id}`:

```json
{
  "rol": "VETERINARIO"
}
```

Estados frecuentes: `200` para una operación completada, `201` para creación, `400` para datos inválidos, `401` para credenciales o sesión inválidas, `403` para permisos insuficientes y `409` para conflictos como correos duplicados.

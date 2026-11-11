// Definition of all data models adhering strictly to:
// 01_modelo_base_srs_sql_2b569787.md
// 02_facturacion_inventario_auditoria_v2_sql_41849be7.md
// 03_srs_matriz_trazabilidad_md_e696de06.md
// 04_manual_integracion_ia_api_md_c49966e2.md

export type UserRole = 'ADMINISTRADOR' | 'VETERINARIO' | 'RECEPCIONISTA' | 'PROPIETARIO';

export type UserState = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export interface Usuario {
  id_usuario: number;
  correo: string;
  contrasena: string; // BCrypt hash simulation
  rol_id: number;
  rol_nombre: UserRole;
  estado: UserState;
  intentos_fallidos: number;
  otp_code: string | null;
  otp_expiracion: string | null;
  fecha_creacion: string;
}

export interface Propietario {
  id_propietario: number;
  id_usuario: number | null;
  cedula_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
}

export interface Veterinario {
  id_veterinario: number;
  id_usuario: number;
  tarjeta_profesional: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  telefono: string;
}

export type GeneroMascota = 'MACHO' | 'HEMBRA';

export interface Mascota {
  id_mascota: number;
  id_propietario: number;
  codigo_expediente: string;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  genero: GeneroMascota;
  peso_kg: number;
  microchip_id: string | null;
  estado_salud: string;
  activo: boolean;
  fecha_registro: string;
}

export type TipoCita = 'CONSULTA' | 'VACUNACION' | 'CONTROL' | 'URGENCIA';
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Cita {
  id_cita: number;
  id_mascota: number;
  id_propietario: number;
  id_veterinario: number;
  fecha_hora: string; // ISO datetime YYYY-MM-DDTHH:mm
  motivo_general: string;
  tipo_cita: TipoCita;
  estado: EstadoCita;
  fecha_creacion: string;
}

export interface ConsultaMedica {
  id_consulta: number;
  id_cita: number;
  id_mascota: number;
  id_veterinario: number;
  fecha_consulta: string;
  frecuencia_cardiaca: number | null;
  temperatura_c: number | null;
  peso_actual: number;
  anamnesis_sintomas: string;
  diagnostico: string;
  tratamiento_recetado: string;
  observaciones: string | null;
}

export interface VacunaCatalogo {
  id_vacuna: number;
  nombre: string;
  marca: string;
  tipo_vacuna: string;
  dias_refuerzo_sugeridos: number;
}

export interface HistoriaVacunacion {
  id_historia_vacuna: number;
  id_mascota: number;
  id_vacuna: number;
  id_veterinario: number;
  lote: string;
  fecha_aplicacion: string;
  fecha_refuerzo: string | null;
  observaciones: string | null;
}

export interface FichaIA {
  id_ficha: number;
  id_consulta: number;
  resumen_propietario: string;
  sintesis_tecnica: string;
  modelo_utilizado: string;
  fecha_generacion: string;
  aprobado_por_veterinario: boolean;
}

export type TipoReporteIA = 'EPIDEMIOLOGICO' | 'FINANCIERO' | 'OPERATIVO' | 'GENERAL';

export interface ReporteEjecutivoIA {
  id_reporte: number;
  periodo_inicio: string;
  periodo_fin: string;
  tipo_reporte: TipoReporteIA;
  analisis_narrativo: string;
  recomendacion_operativa: string;
  metricas_json: {
    total_citas_atendidas: number;
    ingresos_totales: number;
    vacunas_aplicadas: number;
    top_diagnostico_frecuente: string;
    alertas_stock_critico: number;
  };
  id_usuario_admin: number;
  fecha_generacion: string;
}

// INVENTARIO Y FACTURACIÓN (Script 02)
export interface Producto {
  id_producto: number;
  sku: string;
  nombre: string;
  precio_venta: number;
  stock_minimo: number;
  requiere_vencimiento: boolean;
  activo: boolean;
}

export interface Lote {
  id_lote: number;
  id_producto: number;
  codigo_lote: string;
  fecha_vencimiento: string | null;
  stock_actual: number;
}

export type EstadoFactura = 'BORRADOR' | 'PAGADA' | 'ANULADA';

export interface Factura {
  id_factura: number;
  id_cliente: number; // id_propietario
  id_usuario_cajero: number | null;
  fecha: string;
  estado: EstadoFactura;
  total: number;
}

export interface DetalleFactura {
  id_detalle: number;
  id_factura: number;
  id_lote: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export type TipoMovimiento = 'APERTURA' | 'VENTA' | 'AJUSTE';

export interface MovimientoInventario {
  id_movimiento: number;
  id_lote: number;
  id_detalle: number | null;
  id_usuario_responsable: number | null;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad_delta: number;
  motivo: string;
}

export type OperacionAuditoria = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditoriaSistema {
  id_auditoria: number;
  id_usuario: number | null;
  usuario_nombre?: string;
  tabla_afectada: string;
  operacion: OperacionAuditoria;
  detalles: string;
  fecha: string;
}

// VISTAS CALCULADAS (vw_existencias & vw_alertas_stock)
export interface ViewExistencia {
  id_producto: number;
  sku: string;
  nombre: string;
  stock_minimo: number;
  activo: boolean;
  stock_fisico: number;
  stock_vendible: number;
  stock_vencido: number;
}

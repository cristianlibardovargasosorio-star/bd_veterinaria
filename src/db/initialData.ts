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
} from '../types';

export const DEMO_OWNER_EMAIL = 'camilo.propietario@vetsoft.com';
export const DEMO_OWNER_ID = 600_000;

export const DEMO_OWNER_PROFILE: Propietario = {
  id_propietario: DEMO_OWNER_ID,
  id_usuario: DEMO_OWNER_ID,
  cedula_documento: 'DEMO-CAMILO',
  nombres: 'Camilo',
  apellidos: 'Herrera',
  telefono: '',
  direccion: '',
};

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id_usuario: 1,
    correo: 'admin@vetsoft.com',
    contrasena: '$2a$12$e8xL4sQY1dCZbK0HqFmB8uV9mK6G7vJ5xW2nP3rT8uY9zB4xC7vE2', // bcrypt hash simulation
    rol_id: 1,
    rol_nombre: 'ADMINISTRADOR',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: '849201',
    otp_expiracion: '2026-11-11T12:00:00Z',
    fecha_creacion: '2026-01-10T08:00:00Z',
  },
  {
    id_usuario: 2,
    correo: 'camilo.vet@vetsoft.com',
    contrasena: '$2a$12$k8xL4sQY1dCZbK0HqFmB8uV9mK6G7vJ5xW2nP3rT8uY9zB4xC7vA1',
    rol_id: 2,
    rol_nombre: 'VETERINARIO',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: null,
    otp_expiracion: null,
    fecha_creacion: '2026-01-15T09:30:00Z',
  },
  {
    id_usuario: 3,
    correo: 'andrea.morales@vetsoft.com',
    contrasena: '$2a$12$m8xL4sQY1dCZbK0HqFmB8uV9mK6G7vJ5xW2nP3rT8uY9zB4xC7vC3',
    rol_id: 2,
    rol_nombre: 'VETERINARIO',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: null,
    otp_expiracion: null,
    fecha_creacion: '2026-02-01T10:00:00Z',
  },
  {
    id_usuario: 4,
    correo: 'recepcion@vetsoft.com',
    contrasena: '$2a$12$j8xL4sQY1dCZbK0HqFmB8uV9mK6G7vJ5xW2nP3rT8uY9zB4xC7vD4',
    rol_id: 3,
    rol_nombre: 'RECEPCIONISTA',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: null,
    otp_expiracion: null,
    fecha_creacion: '2026-02-10T11:00:00Z',
  },
  {
    id_usuario: 5,
    correo: 'carlos.mendoza@vetsoft.com',
    contrasena: '$2a$12$p8xL4sQY1dCZbK0HqFmB8uV9mK6G7vJ5xW2nP3rT8uY9zB4xC7vE5',
    rol_id: 4,
    rol_nombre: 'PROPIETARIO',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: null,
    otp_expiracion: null,
    fecha_creacion: '2026-03-01T14:20:00Z',
  },
  {
    id_usuario: DEMO_OWNER_ID,
    nombre_completo: 'Camilo Herrera',
    correo: DEMO_OWNER_EMAIL,
    contrasena: '$2a$12$demoPropietarioCamilo',
    rol_id: 4,
    rol_nombre: 'PROPIETARIO',
    estado: 'ACTIVO',
    intentos_fallidos: 0,
    otp_code: null,
    otp_expiracion: null,
    fecha_creacion: '2026-11-20T00:00:00-05:00',
  },
];

export const INITIAL_PROPIETARIOS: Propietario[] = [
  {
    id_propietario: 1,
    id_usuario: 5,
    cedula_documento: '1098472910',
    nombres: 'Carlos Andrés',
    apellidos: 'Mendoza Páez',
    telefono: '+57 312 849 2011',
    direccion: 'Carrera 45 # 128 - 22, Apt 402, Bogotá',
  },
  {
    id_propietario: 2,
    id_usuario: null,
    cedula_documento: '1020491822',
    nombres: 'Sofía Valentina',
    apellidos: 'Ramírez Castro',
    telefono: '+57 320 651 8932',
    direccion: 'Calle 100 # 19A - 36, Bogotá',
  },
  {
    id_propietario: 3,
    id_usuario: null,
    cedula_documento: '52891044',
    nombres: 'Jorge Enrique',
    apellidos: 'Martínez Gil',
    telefono: '+57 301 445 7812',
    direccion: 'Avenida Esperanza # 68 - 14, Bogotá',
  },
  {
    id_propietario: 4,
    id_usuario: null,
    cedula_documento: '1014285741',
    nombres: 'Elena Patricia',
    apellidos: 'Ríos Serrano',
    telefono: '+57 315 902 4410',
    direccion: 'Transversal 23 # 94 - 11, Bogotá',
  },
  DEMO_OWNER_PROFILE,
];

export const INITIAL_VETERINARIOS: Veterinario[] = [
  {
    id_veterinario: 1,
    id_usuario: 2,
    tarjeta_profesional: '19823-VET',
    nombres: 'Dr. Camilo',
    apellidos: 'Restrepo Vallejo',
    especialidad: 'Medicina Interna y Cirugía General',
    telefono: '+57 310 994 3321',
  },
  {
    id_veterinario: 2,
    id_usuario: 3,
    tarjeta_profesional: '24719-VET',
    nombres: 'Dra. Andrea',
    apellidos: 'Morales Silva',
    especialidad: 'Dermatología y Medicina Preventiva',
    telefono: '+57 316 482 1109',
  },
];

export const INITIAL_MASCOTAS: Mascota[] = [
  {
    id_mascota: 1,
    id_propietario: 1,
    codigo_expediente: 'EXP-2026-001',
    nombre: 'Lucas',
    especie: 'Canino',
    raza: 'Golden Retriever',
    fecha_nacimiento: '2023-04-12',
    genero: 'MACHO',
    peso_kg: 28.5,
    microchip_id: '985141002948123',
    estado_salud: 'EN TRATAMIENTO',
    activo: true,
    fecha_registro: '2026-01-20T10:15:00Z',
  },
  {
    id_mascota: 2,
    id_propietario: 1,
    codigo_expediente: 'EXP-2026-002',
    nombre: 'Luna',
    especie: 'Felino',
    raza: 'Siamés',
    fecha_nacimiento: '2024-01-08',
    genero: 'HEMBRA',
    peso_kg: 3.8,
    microchip_id: '985141004821902',
    estado_salud: 'SANO',
    activo: true,
    fecha_registro: '2026-02-05T15:30:00Z',
  },
  {
    id_mascota: 3,
    id_propietario: 2,
    codigo_expediente: 'EXP-2026-003',
    nombre: 'Rocky',
    especie: 'Canino',
    raza: 'Bulldog Francés',
    fecha_nacimiento: '2022-09-20',
    genero: 'MACHO',
    peso_kg: 12.4,
    microchip_id: '985141007739110',
    estado_salud: 'CRÓNICO CONTROLADO',
    activo: true,
    fecha_registro: '2026-02-12T09:00:00Z',
  },
  {
    id_mascota: 4,
    id_propietario: 3,
    codigo_expediente: 'EXP-2026-004',
    nombre: 'Mia',
    especie: 'Felino',
    raza: 'Persa',
    fecha_nacimiento: '2023-11-15',
    genero: 'HEMBRA',
    peso_kg: 4.1,
    microchip_id: '985141008892341',
    estado_salud: 'SANO',
    activo: true,
    fecha_registro: '2026-03-02T11:45:00Z',
  },
  {
    id_mascota: 5,
    id_propietario: 4,
    codigo_expediente: 'EXP-2026-005',
    nombre: 'Toby',
    especie: 'Canino',
    raza: 'Beagle',
    fecha_nacimiento: '2024-06-10',
    genero: 'MACHO',
    peso_kg: 9.6,
    microchip_id: '985141009941029',
    estado_salud: 'SANO',
    activo: true,
    fecha_registro: '2026-03-10T16:20:00Z',
  },
];

export const INITIAL_CITAS: Cita[] = [
  {
    id_cita: 101,
    id_mascota: 1,
    id_propietario: 1,
    id_veterinario: 1,
    fecha_hora: '2026-11-10T09:00',
    motivo_general: 'Decaimiento y vómitos ocasionales desde hace 2 días',
    tipo_cita: 'CONSULTA',
    estado: 'ATENDIDA',
    fecha_creacion: '2026-11-08T14:30:00Z',
  },
  {
    id_cita: 102,
    id_mascota: 2,
    id_propietario: 1,
    id_veterinario: 2,
    fecha_hora: '2026-11-12T10:30',
    motivo_general: 'Refuerzo de vacuna Triple Felina y desparasitación anual',
    tipo_cita: 'VACUNACION',
    estado: 'CONFIRMADA',
    fecha_creacion: '2026-11-09T10:15:00Z',
  },
  {
    id_cita: 103,
    id_mascota: 3,
    id_propietario: 2,
    id_veterinario: 2,
    fecha_hora: '2026-11-13T14:00',
    motivo_general: 'Prurito intenso en pliegues faciales y pérdida de pelo focal',
    tipo_cita: 'CONSULTA',
    estado: 'PENDIENTE',
    fecha_creacion: '2026-11-10T11:00:00Z',
  },
  {
    id_cita: 104,
    id_mascota: 5,
    id_propietario: 4,
    id_veterinario: 1,
    fecha_hora: '2026-11-14T16:00',
    motivo_general: 'Control posquirúrgico de esterilización y retiro de puntos',
    tipo_cita: 'CONTROL',
    estado: 'CONFIRMADA',
    fecha_creacion: '2026-11-10T15:20:00Z',
  },
];

export const INITIAL_CONSULTAS: ConsultaMedica[] = [
  {
    id_consulta: 105,
    id_cita: 101,
    id_mascota: 1, // Lucas
    id_veterinario: 1, // Dr. Camilo Restrepo
    fecha_consulta: '2026-11-10T09:40:00Z',
    frecuencia_cardiaca: 95,
    temperatura_c: 39.1,
    peso_actual: 28.5,
    anamnesis_sintomas:
      'El paciente presenta decaimiento, falta de apetito de 2 días de evolución y vómitos ocasionales con contenido espumoso amarillento. Propietario reporta que masticó un juguete de caucho hace 48 horas.',
    diagnostico: 'Gastritis aguda secundaria a ingesta de cuerpo extraño no obstructivo.',
    tratamiento_recetado:
      'Omeprazol 20mg c/24h por 5 días en ayunas. Dieta blanda a base de pollo y arroz sin sal en porciones fraccionadas. Hidratación constante con electrolitos orales. Control si presenta letargo o emesis persistente.',
    observaciones:
      'Se tomó radiografía abdominal simple; no se aprecian patrones radioopacos de obstrucción mecánica ni asas dilatadas.',
  },
];

export const INITIAL_VACUNAS: VacunaCatalogo[] = [
  {
    id_vacuna: 1,
    nombre: 'Antirrábica Rabisin-I',
    marca: 'Boehringer Ingelheim',
    tipo_vacuna: 'Inactivada Monovalente',
    dias_refuerzo_sugeridos: 365,
  },
  {
    id_vacuna: 2,
    nombre: 'Séxtuple Canina Vanguard Plus 5/L',
    marca: 'Zoetis',
    tipo_vacuna: 'Polivalente Canina',
    dias_refuerzo_sugeridos: 365,
  },
  {
    id_vacuna: 3,
    nombre: 'Parvovirus / Coronavirus Puppy DP',
    marca: 'MSD Animal Health',
    tipo_vacuna: 'Vírica Atenuada',
    dias_refuerzo_sugeridos: 180,
  },
  {
    id_vacuna: 4,
    nombre: 'Triple Felina Felocell 3',
    marca: 'Zoetis',
    tipo_vacuna: 'Atenuada Felina',
    dias_refuerzo_sugeridos: 365,
  },
  {
    id_vacuna: 5,
    nombre: 'Leucemia Viral Felina Leukocell 2',
    marca: 'Zoetis',
    tipo_vacuna: 'Recombinante Felina',
    dias_refuerzo_sugeridos: 365,
  },
];

export const INITIAL_HISTORIA_VACUNAS: HistoriaVacunacion[] = [
  {
    id_historia_vacuna: 1,
    id_mascota: 1, // Lucas
    id_vacuna: 1, // Antirrábica
    id_veterinario: 1,
    lote: 'RAB-2025-99B',
    fecha_aplicacion: '2025-11-20',
    fecha_refuerzo: '2026-11-20',
    observaciones: 'Aplicación subcutánea en región escapular derecha. Sin reacciones adversas inmediatas.',
  },
  {
    id_historia_vacuna: 2,
    id_mascota: 1, // Lucas
    id_vacuna: 2, // Séxtuple
    id_veterinario: 1,
    lote: 'SEX-2025-11X',
    fecha_aplicacion: '2025-12-05',
    fecha_refuerzo: '2026-12-05',
    observaciones: 'Buena tolerancia al biológico.',
  },
  {
    id_historia_vacuna: 3,
    id_mascota: 2, // Luna
    id_vacuna: 4, // Triple Felina
    id_veterinario: 2,
    lote: 'FEL-2025-44C',
    fecha_aplicacion: '2025-11-15',
    fecha_refuerzo: '2026-11-15',
    observaciones: 'Próxima a vencer refuerzo. Notificar al propietario.',
  },
];

export const INITIAL_FICHAS_IA: FichaIA[] = [
  {
    id_ficha: 1,
    id_consulta: 105,
    resumen_propietario:
      'Estimado tutor de Lucas: Durante la consulta evaluamos su estado físico general. Presenta un cuadro de inflamación en su estómago (gastritis) debido a algo que ingirió. Para ayudarlo a recuperarse, es muy importante administrar Omeprazol 20mg cada 24 horas durante 5 días y ofrecerle únicamente dieta blanda (pollo hervido sin sal con arroz). Ofrezca agua en pequeñas cantidades continuamente.',
    sintesis_tecnica:
      'Paciente canino con cuadro de gastritis aguda manifestada por hipertermia leve (39.1°C) y emesis. Plan de manejo sintomático mediante antisecretores gástricos y soporte nutricional blando sin evidencia radiográfica de obstrucción intestinal.',
    modelo_utilizado: 'Gemini 3.8 Flash',
    fecha_generacion: '2026-11-10T09:45:00Z',
    aprobado_por_veterinario: true,
  },
];

export const INITIAL_REPORTES_IA: ReporteEjecutivoIA[] = [
  {
    id_reporte: 1,
    periodo_inicio: '2026-10-01',
    periodo_fin: '2026-10-31',
    tipo_reporte: 'GENERAL',
    analisis_narrativo:
      'Durante el mes de Octubre de 2026, la clínica registró una alta operatividad con 142 citas atendidas y un rendimiento financiero positivo alcanzando $18,450.00 en facturación. Se observa una marcada prevalencia de patologías dermatológicas (22% de las consultas), lo que sugiere la oportunidad de promover paquetes preventivos de cuidado cutáneo. Se recomienda reponer urgentemente los 3 insumos biológicos en estado crítico para evitar el desabastecimiento.',
    recomendacion_operativa:
      'Programar compras de inventario antes del 5 de Noviembre e impulsar campaña de vacunación preventiva y chequeo dermatológico.',
    metricas_json: {
      total_citas_atendidas: 142,
      ingresos_totales: 18450.0,
      vacunas_aplicadas: 68,
      top_diagnostico_frecuente: 'Dermatitis atópica (22%)',
      alertas_stock_critico: 3,
    },
    id_usuario_admin: 1,
    fecha_generacion: '2026-11-01T08:00:00Z',
  },
];

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id_producto: 1,
    sku: 'MED-OME-20MG',
    nombre: 'Omeprazol 20mg Cápsulas x 30',
    precio_venta: 14.5,
    stock_minimo: 8,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 2,
    sku: 'MED-AMX-500MG',
    nombre: 'Amoxicilina + Clavulánico 500/125mg',
    precio_venta: 22.0,
    stock_minimo: 10,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 3,
    sku: 'MED-MEL-10ML',
    nombre: 'Meloxicam Gotas 0.5% 10ml',
    precio_venta: 18.0,
    stock_minimo: 6,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 4,
    sku: 'VAC-RAB-01',
    nombre: 'Dosis Vacuna Antirrábica Rabisin-I',
    precio_venta: 25.0,
    stock_minimo: 15,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 5,
    sku: 'VAC-SEX-02',
    nombre: 'Dosis Vacuna Séxtuple Vanguard Plus',
    precio_venta: 35.0,
    stock_minimo: 12,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 6,
    sku: 'ANT-BRV-20KG',
    nombre: 'Bravecto Antiparasitario 20-40kg',
    precio_venta: 48.0,
    stock_minimo: 5,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 7,
    sku: 'INS-SUE-500ML',
    nombre: 'Suero Lactato de Ringer 500ml',
    precio_venta: 9.0,
    stock_minimo: 20,
    requiere_vencimiento: true,
    activo: true,
  },
  {
    id_producto: 8,
    sku: 'ACC-COL-CONO',
    nombre: 'Collar Isabelino Ajustable Talla M',
    precio_venta: 12.0,
    stock_minimo: 4,
    requiere_vencimiento: false, // does not require expiry
    activo: true,
  },
];

export const INITIAL_LOTES: Lote[] = [
  {
    id_lote: 101,
    id_producto: 1, // Omeprazol
    codigo_lote: 'LOT-OME-2026A',
    fecha_vencimiento: '2027-05-30',
    stock_actual: 24,
  },
  {
    id_lote: 102,
    id_producto: 2, // Amoxicilina
    codigo_lote: 'LOT-AMX-2026B',
    fecha_vencimiento: '2026-12-15',
    stock_actual: 4, // Critical stock (min is 10)
  },
  {
    id_lote: 103,
    id_producto: 3, // Meloxicam
    codigo_lote: 'LOT-MEL-2027A',
    fecha_vencimiento: '2027-08-20',
    stock_actual: 14,
  },
  {
    id_lote: 104,
    id_producto: 4, // Vacuna Antirrábica
    codigo_lote: 'LOT-RAB-2026V',
    fecha_vencimiento: '2026-11-01', // Vencido! Demonstrates trigger & view logic
    stock_actual: 8,
  },
  {
    id_lote: 105,
    id_producto: 4, // Vacuna Antirrábica (lote vigente)
    codigo_lote: 'LOT-RAB-2027N',
    fecha_vencimiento: '2027-10-15',
    stock_actual: 18,
  },
  {
    id_lote: 106,
    id_producto: 5, // Séxtuple
    codigo_lote: 'LOT-SEX-2027X',
    fecha_vencimiento: '2027-04-10',
    stock_actual: 3, // Critical stock (min 12)
  },
  {
    id_lote: 107,
    id_producto: 6, // Bravecto
    codigo_lote: 'LOT-BRV-2028',
    fecha_vencimiento: '2028-02-28',
    stock_actual: 11,
  },
  {
    id_lote: 108,
    id_producto: 7, // Suero Ringer
    codigo_lote: 'LOT-SUE-2027',
    fecha_vencimiento: '2027-09-30',
    stock_actual: 35,
  },
  {
    id_lote: 109,
    id_producto: 8, // Collar Isabelino (no exp)
    codigo_lote: 'LOT-COL-2026',
    fecha_vencimiento: null,
    stock_actual: 9,
  },
];

export const INITIAL_FACTURAS: Factura[] = [
  {
    id_factura: 1001,
    id_cliente: 1, // Carlos Mendoza
    id_usuario_cajero: 4, // Recepcionista
    fecha: '2026-11-10T10:15:00Z',
    estado: 'PAGADA',
    total: 39.0,
  },
  {
    id_factura: 1002,
    id_cliente: 2, // Sofía Ramírez
    id_usuario_cajero: 4,
    fecha: '2026-11-10T11:45:00Z',
    estado: 'PAGADA',
    total: 48.0,
  },
  {
    id_factura: 1003,
    id_cliente: 3, // Jorge Martínez
    id_usuario_cajero: 4,
    fecha: '2026-11-11T09:10:00Z',
    estado: 'BORRADOR',
    total: 0.0,
  },
];

export const INITIAL_DETALLE_FACTURA: DetalleFactura[] = [
  {
    id_detalle: 1,
    id_factura: 1001,
    id_lote: 101, // Omeprazol (c/u 14.50)
    cantidad: 1,
    precio_unitario: 14.5,
    subtotal: 14.5,
  },
  {
    id_detalle: 2,
    id_factura: 1001,
    id_lote: 105, // Vacuna Rabia Vigente (c/u 25.0)
    cantidad: 1,
    precio_unitario: 24.5,
    subtotal: 24.5,
  },
  {
    id_detalle: 3,
    id_factura: 1002,
    id_lote: 107, // Bravecto (48.0)
    cantidad: 1,
    precio_unitario: 48.0,
    subtotal: 48.0,
  },
];

export const INITIAL_MOVIMIENTOS: MovimientoInventario[] = [
  {
    id_movimiento: 1,
    id_lote: 101,
    id_detalle: null,
    id_usuario_responsable: 1,
    fecha: '2026-11-01T08:00:00Z',
    tipo: 'APERTURA',
    cantidad_delta: 25,
    motivo: 'Apertura de inventario mensual inicial',
  },
  {
    id_movimiento: 2,
    id_lote: 101,
    id_detalle: 1,
    id_usuario_responsable: 4,
    fecha: '2026-11-10T10:15:00Z',
    tipo: 'VENTA',
    cantidad_delta: -1,
    motivo: 'Venta factura 1001',
  },
  {
    id_movimiento: 3,
    id_lote: 107,
    id_detalle: 3,
    id_usuario_responsable: 4,
    fecha: '2026-11-10T11:45:00Z',
    tipo: 'VENTA',
    cantidad_delta: -1,
    motivo: 'Venta factura 1002',
  },
];

export const INITIAL_AUDITORIA: AuditoriaSistema[] = [
  {
    id_auditoria: 1,
    id_usuario: 1,
    usuario_nombre: 'admin@vetsoft.com',
    tabla_afectada: 'usuarios',
    operacion: 'INSERT',
    detalles: 'Creación de credenciales y roles iniciales del sistema VETSOFT.',
    fecha: '2026-01-10T08:00:00Z',
  },
  {
    id_auditoria: 2,
    id_usuario: 4,
    usuario_nombre: 'recepcion@vetsoft.com',
    tabla_afectada: 'mascotas',
    operacion: 'INSERT',
    detalles: 'Registro de expediente EXP-2026-001 (Lucas, Golden Retriever) con microchip 985141002948123.',
    fecha: '2026-01-20T10:15:00Z',
  },
  {
    id_auditoria: 3,
    id_usuario: 2,
    usuario_nombre: 'camilo.restrepo@vetsoft.com',
    tabla_afectada: 'consultas',
    operacion: 'INSERT',
    detalles: 'Registro de consulta médica #105 para paciente Lucas: diagnóstico de gastritis aguda.',
    fecha: '2026-11-10T09:40:00Z',
  },
  {
    id_auditoria: 4,
    id_usuario: 2,
    usuario_nombre: 'camilo.restrepo@vetsoft.com',
    tabla_afectada: 'fichas_ia',
    operacion: 'INSERT',
    detalles: 'Generación y aprobación de Ficha Médica IA #1 con Gemini 3.8 Flash.',
    fecha: '2026-11-10T09:45:00Z',
  },
  {
    id_auditoria: 5,
    id_usuario: 4,
    usuario_nombre: 'recepcion@vetsoft.com',
    tabla_afectada: 'facturas',
    operacion: 'UPDATE',
    detalles: 'Ejecución de sp_confirmar_factura(1001): estado PAGADA, descuento en lotes 101 y 105.',
    fecha: '2026-11-10T10:15:00Z',
  },
];

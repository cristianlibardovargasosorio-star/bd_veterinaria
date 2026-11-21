import { Cita, ConsultaMedica, FichaIA, HistoriaVacunacion, Mascota, Propietario, VacunaCatalogo, Veterinario } from '../types';
import { apiVetSoft } from './apiVetSoft';

type Listado = {
  fichas: FichaIA[];
  citas: Omit<Cita, 'fecha_creacion'>[];
  consultas: (Omit<ConsultaMedica, 'peso_actual' | 'id_cita' | 'tratamiento_recetado'> & {
    peso_actual: number | null; id_cita: number | null; tratamiento_recetado: string | null;
  })[];
  vacunas: (Omit<HistoriaVacunacion, 'id_vacuna' | 'lote'> & { nombre_vacuna: string; lote: string | null })[];
  veterinarios: { id_veterinario: number; id_usuario: number; nombre: string }[];
  pacientes: {
    idMascota: number; idPropietario: number; expediente: string; nombre: string; especie: string;
    raza: string | null; sexo: string | null; fechaNacimiento: string | null; pesoKg: number | null;
    microchipId: string | null; activo: boolean; fechaRegistro: string | null;
  }[];
  propietarios: {
    idPropietario: number; idUsuario: number | null; nombre: string;
    documento: string; telefono: string; direccion: string | null;
  }[];
};

export async function listarPacientes(token: string, propias: boolean) {
  const datos = await apiVetSoft<Listado>(propias ? '/api/pacientes/mis-mascotas' : '/api/pacientes', token);
  const mascotas: Mascota[] = datos.pacientes.map((p) => ({
    id_mascota: p.idMascota, id_propietario: p.idPropietario, codigo_expediente: p.expediente,
    nombre: p.nombre, especie: p.especie, raza: p.raza ?? '',
    genero: (p.sexo?.toUpperCase() ?? '') as Mascota['genero'],
    fecha_nacimiento: p.fechaNacimiento ?? '', peso_kg: p.pesoKg ?? 0, microchip_id: p.microchipId,
    activo: p.activo, estado_salud: 'Sin valoración', fecha_registro: p.fechaRegistro ?? '',
  }));
  const propietarios: Propietario[] = datos.propietarios.map((p) => ({
    id_propietario: p.idPropietario, id_usuario: p.idUsuario, nombres: p.nombre, apellidos: '',
    cedula_documento: p.documento, telefono: p.telefono, direccion: p.direccion ?? '',
  }));
  const citas: Cita[] = datos.citas.map((cita) => ({ ...cita, fecha_creacion: '' }));
  const consultas: ConsultaMedica[] = datos.consultas.map((consulta) => ({
    ...consulta, id_cita: consulta.id_cita ?? 0, peso_actual: consulta.peso_actual ?? 0,
    tratamiento_recetado: consulta.tratamiento_recetado ?? '',
  }));
  const vacunasPorNombre = new Map<string, VacunaCatalogo>();
  const historiaVacunas: HistoriaVacunacion[] = datos.vacunas.map(({ nombre_vacuna, ...dosis }) => {
    let vacuna = vacunasPorNombre.get(nombre_vacuna);
    if (!vacuna) {
      vacuna = { id_vacuna: dosis.id_historia_vacuna, nombre: nombre_vacuna, marca: '', tipo_vacuna: '', dias_refuerzo_sugeridos: 0 };
      vacunasPorNombre.set(nombre_vacuna, vacuna);
    }
    return { ...dosis, lote: dosis.lote ?? '', id_vacuna: vacuna.id_vacuna };
  });
  const veterinarios: Veterinario[] = datos.veterinarios.map((veterinario) => ({
    id_veterinario: veterinario.id_veterinario, id_usuario: veterinario.id_usuario,
    nombres: veterinario.nombre, apellidos: '', tarjeta_profesional: '', especialidad: '', telefono: '',
  }));
  return { mascotas, propietarios, citas, consultas, historiaVacunas, vacunas: [...vacunasPorNombre.values()], veterinarios, fichas: datos.fichas };
}

export function aprobarFichaApi(token: string, idFicha: number, aprobada: boolean) {
  return apiVetSoft<{ aprobada: boolean }>(`/api/pacientes/fichas/${idFicha}`, token, 'PATCH', { aprobada });
}

export function generarFichaApi(token: string, idConsulta: number) {
  return apiVetSoft<{ idFicha: number }>(`/api/pacientes/fichas/consulta/${idConsulta}`, token, 'POST');
}

export function guardarPaciente(token: string, mascota: Omit<Mascota, 'id_mascota' | 'fecha_registro'>, tutor?: {
  correo: string; cedula_documento: string; telefono: string; direccion: string;
}) {
  return apiVetSoft<{ idPaciente: number }>('/api/pacientes', token, 'POST', {
    idPropietario: mascota.id_propietario,
    nombre: mascota.nombre,
    especie: mascota.especie,
    raza: mascota.raza || null,
    sexo: mascota.genero,
    fechaNacimiento: mascota.fecha_nacimiento || null,
    pesoKg: mascota.peso_kg,
    codigoExpediente: mascota.codigo_expediente,
    microchipId: mascota.microchip_id || null,
    nuevoTutor: tutor ? {
      correo: tutor.correo, documento: tutor.cedula_documento, telefono: tutor.telefono, direccion: tutor.direccion || null,
    } : null,
  });
}

export function agendarCitaApi(token: string, cita: Omit<Cita, 'id_cita' | 'fecha_creacion'>) {
  return apiVetSoft<{ idCita: number }>('/api/pacientes/citas', token, 'POST', {
    idPaciente: cita.id_mascota, idVeterinario: cita.id_veterinario,
    fechaHora: new Date(cita.fecha_hora).toISOString(), tipoCita: cita.tipo_cita, motivoGeneral: cita.motivo_general,
  });
}

export function cambiarEstadoCitaApi(token: string, id: number, estado: Cita['estado']) {
  return apiVetSoft<{ estado: string }>(`/api/pacientes/citas/${id}`, token, 'PATCH', { estado });
}

export function registrarConsultaApi(token: string, consulta: Omit<ConsultaMedica, 'id_consulta' | 'fecha_consulta'>) {
  return apiVetSoft<{ idConsulta: number }>('/api/pacientes/consultas', token, 'POST', {
    idCita: consulta.id_cita, motivo: consulta.anamnesis_sintomas, diagnostico: consulta.diagnostico,
    tratamiento: consulta.tratamiento_recetado, observaciones: consulta.observaciones,
    pesoKg: consulta.peso_actual, frecuenciaCardiaca: consulta.frecuencia_cardiaca, temperatura: consulta.temperatura_c,
  });
}

export function registrarVacunaApi(token: string, dosis: Omit<HistoriaVacunacion, 'id_historia_vacuna' | 'id_vacuna'>, nombre: string) {
  return apiVetSoft<{ idVacuna: number }>('/api/pacientes/vacunas', token, 'POST', {
    idPaciente: dosis.id_mascota, idVeterinario: dosis.id_veterinario,
    nombre, lote: dosis.lote, fechaAplicacion: dosis.fecha_aplicacion,
    fechaRefuerzo: dosis.fecha_refuerzo || null, observaciones: dosis.observaciones,
  });
}

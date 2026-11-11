# Manual de Integración del Motor de IA (Gemini API) en Spring Boot 3.x

Este documento especifica los contratos JSON e integración para cumplir con los requerimientos **RF10** y **RF11** del SRS.

---

## 1. Servicio RF10: Generación de Fichas Médicas

### Prompt del Sistema (System Instruction)
> "Eres un asistente médico veterinario experto. Procesa el diagnóstico técnico del médico y genera dos salidas: 
> 1. Un resumen claro, empático y explicativo estructurado para el propietario de la mascota.
> 2. Una síntesis técnica médica estructurada para el expediente interno."

### Estructura del Payload de Entrada (Backend Spring Boot -> API IA)

```json
{
  "id_consulta": 105,
  "mascota": {
    "nombre": "Lucas",
    "especie": "Canino",
    "raza": "Golden Retriever",
    "peso_kg": 28.5
  },
  "datos_clinicos": {
    "frecuencia_cardiaca": 95,
    "temperatura_c": 39.1,
    "anamnesis": "El paciente presenta decaimiento, falta de apetito de 2 días de evolución y vómitos ocasionales.",
    "diagnostico": "Gastritis aguda secundaria a ingesta de cuerpo extraño no obstructivo.",
    "tratamiento": "Omeprazol 20mg c/24h por 5 días. Dieta blanda a base de pollo y arroz sin sal."
  }
}
```

### Respuesta JSON Esperada de la IA

```json
{
  "resumen_propietario": "Estimado tutor de Lucas: Durante la consulta evaluamos su estado físico general. Presenta un cuadro de inflamación en su estómago (gastritis) debido a algo que ingirió. Para ayudarlo a recuperarse, es muy importante administrar Omeprazol 20mg cada 24 horas durante 5 días y ofrecerle únicamente dieta blanda (pollo hervido sin sal con arroz). Ofrezca agua en pequeñas cantidades continuamente.",
  "sintesis_tecnica": "Paciente canino con cuadro de gastritis aguda manifestada por hipertermia leve (39.1°C) y emesis. Plan de manejo sintomático mediante antisecretores gástricos y soporte nutricional blando."
}
```

---

## 2. Servicio RF11: Reportes Administrativos e Inteligencia de Negocio

### Payload de Entrada para Análisis Gerencial

```json
{
  "periodo": {
    "fecha_inicio": "2026-10-01",
    "fecha_fin": "2026-10-31"
  },
  "metricas": {
    "total_citas_atendidas": 142,
    "ingresos_totales": 18450.00,
    "vacunas_aplicadas": 68,
    "top_diagnostico_frecuente": "Dermatitis atópica (22%)",
    "alertas_stock_critico": 3
  }
}
```

### Respuesta Redactada por la IA

```json
{
  "analisis_narrativo": "Durante el mes de Octubre de 2026, la clínica registró una alta operatividad con 142 citas atendidas y un rendimiento financiero positivo alcanzando $18,450.00 en facturación. Se observa una marcada prevalencia de patologías dermatológicas (22% de las consultas), lo que sugiere la oportunidad de promover paquetes preventivos de cuidado cutáneo. Se recomienda reponer urgentemente los 3 insumos biológicos en estado crítico para evitar el desabastecimiento.",
  "recomendacion_operativa": "Programar compras de inventario antes del 5 de Noviembre e impulsar campaña de vacunación preventiva."
}
```
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// RF10: Generación de Fichas Médicas con IA (Gemini 3.8 Flash)
app.post('/api/ai/ficha-medica', async (req: Request, res: Response) => {
  try {
    const { id_consulta, mascota, datos_clinicos } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Fallback simulating expert AI synthesis if API key is pending
      const mockResumen = `Estimado tutor de ${mascota?.nombre || 'su mascota'}: Durante la consulta médica evaluamos integralmente su estado de salud. Encontramos signos clínicos compatibles con ${datos_clinicos?.diagnostico || 'el diagnóstico evaluado'}. Para asegurar su pronta recuperación, es fundamental cumplir estrictamente el plan terapéutico: ${datos_clinicos?.tratamiento || 'indicado por su médico tratante'}. Por favor manténgalo hidratado y en reposo, y acuda de inmediato si nota decaimiento persistente.`;
      const mockSintesis = `Paciente ${mascota?.especie || 'especie'} (${mascota?.raza || 'raza'}), peso ${mascota?.peso_kg || 'N/A'} kg. Presenta FC: ${datos_clinicos?.frecuencia_cardiaca || '--'} lpm, Temp: ${datos_clinicos?.temperatura_c || '--'}°C. Anamnesis: ${datos_clinicos?.anamnesis || 'Sin datos'}. Diagnóstico definitivo: ${datos_clinicos?.diagnostico || 'Evaluación médica'}. Plan terapéutico instaurado con monitoreo de respuesta clínica a las 48-72h.`;

      return res.json({
        success: true,
        data: {
          resumen_propietario: mockResumen,
          sintesis_tecnica: mockSintesis,
          modelo_utilizado: 'Gemini 3.8 Flash (Simulado local)',
          id_consulta,
        },
      });
    }

    const prompt = `
Procesa la siguiente consulta veterinaria:
ID Consulta: ${id_consulta}
Mascota: ${JSON.stringify(mascota, null, 2)}
Datos Clínicos y Diagnóstico: ${JSON.stringify(datos_clinicos, null, 2)}

Genera la respuesta estrictamente con los dos campos solicitados:
1. resumen_propietario: Lenguaje empático, cálido, educativo y claro para el dueño, explicando qué le pasa y cómo suministrar el tratamiento.
2. sintesis_tecnica: Síntesis médica concisa, terminología veterinaria precisa para el expediente interno.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un asistente médico veterinario experto. Procesa el diagnóstico técnico del médico y genera dos salidas: 1. Un resumen claro, empático y explicativo estructurado para el propietario de la mascota. 2. Una síntesis técnica médica estructurada para el expediente interno.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumen_propietario: {
              type: Type.STRING,
              description: 'Explicación empática y clara para el tutor de la mascota',
            },
            sintesis_tecnica: {
              type: Type.STRING,
              description: 'Resumen clínico formal con terminología técnica para el expediente',
            },
          },
          required: ['resumen_propietario', 'sintesis_tecnica'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: {
        resumen_propietario: parsed.resumen_propietario,
        sintesis_tecnica: parsed.sintesis_tecnica,
        modelo_utilizado: 'Gemini 3.8 Flash',
        id_consulta,
      },
    });
  } catch (error: any) {
    console.error('Error generando ficha médica con IA:', error);
    // Return gracefully structured fallback
    return res.json({
      success: true,
      data: {
        resumen_propietario: `Estimado tutor de ${req.body?.mascota?.nombre || 'su mascota'}: En la consulta médica diagnosticamos: ${req.body?.datos_clinicos?.diagnostico || 'cuadro clínico evaluado'}. Plan indicado: ${req.body?.datos_clinicos?.tratamiento || 'Tratamiento prescrito'}. Mantener bajo vigilancia y contactar en caso de dudas.`,
        sintesis_tecnica: `Paciente ${req.body?.mascota?.nombre || 'Paciente'} atendido. Dx: ${req.body?.datos_clinicos?.diagnostico || 'N/A'}. Tratamiento: ${req.body?.datos_clinicos?.tratamiento || 'N/A'}. Evolución pendiente.`,
        modelo_utilizado: 'Gemini 3.8 Flash (Fallback de contingencia)',
        id_consulta: req.body?.id_consulta,
      },
    });
  }
});

// RF11: Reportes Administrativos e Inteligencia de Negocio con IA (Gemini 3.8 Flash)
app.post('/api/ai/reporte-ejecutivo', async (req: Request, res: Response) => {
  try {
    const { periodo, metricas, tipo_reporte } = req.body;
    const ai = getAIClient();

    if (!ai) {
      const mockNarrativo = `Durante el periodo comprendido entre ${periodo?.fecha_inicio || 'inicio'} y ${periodo?.fecha_fin || 'fin'}, la clínica veterinaria registró un desempeño operativo sólido con ${metricas?.total_citas_atendidas || 0} consultas atendidas y una recaudación global de $${(metricas?.ingresos_totales || 0).toLocaleString()} USD. El programa de inmunización reportó ${metricas?.vacunas_aplicadas || 0} dosis aplicadas. En el perfil epidemiológico, el diagnóstico más frecuente fue "${metricas?.top_diagnostico_frecuente || 'Consultas generales'}", sugiriendo oportunidades para campañas profilácticas especializadas. Asimismo, se detectaron ${metricas?.alertas_stock_critico || 0} medicamentos en nivel crítico que requieren reposición prioritaria.`;
      const mockRecomendacion = `1. Emitir órdenes de compra inmediatas para insumos en stock crítico. 2. Desplegar una campaña preventiva enfocada en la patología recurrente identificada. 3. Reforzar el control de agendamientos en turnos pico.`;

      return res.json({
        success: true,
        data: {
          analisis_narrativo: mockNarrativo,
          recomendacion_operativa: mockRecomendacion,
          modelo_utilizado: 'Gemini 3.8 Flash (Simulado local)',
          tipo_reporte: tipo_reporte || 'GENERAL',
        },
      });
    }

    const prompt = `
Genera un análisis ejecutivo y recomendaciones para la gestión de la clínica veterinaria VETSOFT.
Tipo de Reporte: ${tipo_reporte || 'GENERAL'}
Periodo: ${JSON.stringify(periodo, null, 2)}
Métricas Operativas y Financieras: ${JSON.stringify(metricas, null, 2)}

Produce un objeto JSON con:
- analisis_narrativo: Análisis ejecutivo fluido, riguroso y cuantitativo del rendimiento operativo, financiero y clínico de la clínica.
- recomendacion_operativa: Recomendaciones prácticas, accionables y priorizadas para la gerencia y el equipo médico.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un consultor ejecutivo sénior y director médico veterinario experto en gestión hospitalaria de clínicas veterinarias. Analiza las métricas y proporciona diagnósticos de negocio, alertas operativas y recomendaciones estratégicas claras.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analisis_narrativo: {
              type: Type.STRING,
              description: 'Análisis gerencial detallado y cuantitativo del periodo',
            },
            recomendacion_operativa: {
              type: Type.STRING,
              description: 'Estrategias y acciones correctivas/preventivas inmediatas',
            },
          },
          required: ['analisis_narrativo', 'recomendacion_operativa'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: {
        analisis_narrativo: parsed.analisis_narrativo,
        recomendacion_operativa: parsed.recomendacion_operativa,
        modelo_utilizado: 'Gemini 3.8 Flash',
        tipo_reporte: tipo_reporte || 'GENERAL',
      },
    });
  } catch (error: any) {
    console.error('Error generando reporte ejecutivo:', error);
    return res.json({
      success: true,
      data: {
        analisis_narrativo: `Periodo evaluado con ${req.body?.metricas?.total_citas_atendidas || 0} citas y facturación acumulada de $${req.body?.metricas?.ingresos_totales || 0}. El control de inventario detectó ${req.body?.metricas?.alertas_stock_critico || 0} alertas activas.`,
        recomendacion_operativa: 'Monitorear niveles de stock y coordinar citas de seguimiento preventivo.',
        modelo_utilizado: 'Gemini 3.8 Flash (Fallback)',
      },
    });
  }
});

// Asistente Clínico Veterinario Interactivo (Cálculo de dosis, interacciones farmacológicas, triaje)
app.post('/api/ai/asistente-clinico', async (req: Request, res: Response) => {
  try {
    const { pregunta, contexto_paciente } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        respuesta: `Asistente VETSOFT Clínico: Basado en el paciente (${contexto_paciente?.especie || 'Canino'}, ${contexto_paciente?.peso_kg || 10} kg), asegúrate de calcular la dosis en mg/kg según la literatura veterinaria y verificar la función renal y hepática antes de administrar fármacos combinados.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Pregunta médica: ${pregunta}\nContexto del paciente: ${JSON.stringify(contexto_paciente || {})}`,
      config: {
        systemInstruction:
          'Eres un especialista en farmacología y medicina interna veterinaria para el sistema VETSOFT. Brinda orientación clínica concisa, precisa, con rangos de dosis habituales (mg/kg), precauciones por especie (especialmente felinos vs caninos) y advertencias de interacciones.',
      },
    });

    return res.json({
      success: true,
      respuesta: response.text || 'Sin respuesta generada.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error en asistente clínico' });
  }
});

// Setup Vite in Dev or Static in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VETSOFT] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

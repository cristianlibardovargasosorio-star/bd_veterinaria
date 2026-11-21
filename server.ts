import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { mostrarPesoEnLibras } from './src/utils/peso';
import { GoogleGenAI, Type, type Content } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Compresión Gzip/Brotli activa para todos los recursos
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Headers de Cache-Control y CDN para estáticos
app.use((req, res, next) => {
  if (req.url.match(/\.(webp|avif|jpg|png|svg|css|js|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  next();
});

// Middleware de Rastreo / OpenTelemetry Light & Timeout Guard (10 segundos)
app.use((req, res, next) => {
  const start = Date.now();
  const traceId = 'trace-' + Math.random().toString(36).substring(2, 10);
  res.setHeader('X-Trace-Id', traceId);

  // Timeout guard para evitar peticiones colgadas
  req.setTimeout(10000, () => {
    if (!res.headersSent) {
      console.warn(`[TELEMETRY] Request timeout: ${req.method} ${req.url} (Trace: ${traceId})`);
      res.status(504).json({ error: 'Gateway / API Timeout (10s limit exceeded)' });
    }
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 800) {
      console.warn(`[TELEMETRY SLOW QUERY] ${req.method} ${req.url} tomó ${duration}ms (Trace: ${traceId})`);
    }
  });
  next();
});

app.use(express.json());

// In-Memory Redis Simulation for Fast Query Caching
const redisCache = new Map<string, { data: any; expiry: number }>();
const getCached = (key: string) => {
  const item = redisCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    redisCache.delete(key);
    return null;
  }
  return item.data;
};
const setCached = (key: string, data: any, ttlSecs = 60) => {
  redisCache.set(key, { data, expiry: Date.now() + ttlSecs * 1000 });
};

// Initialize GoogleGenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'REEMPLAZAR_API_KEY_GEMINI') {
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
      const mockSintesis = `Paciente ${mascota?.especie || 'especie'} (${mascota?.raza || 'raza'}). Peso: ${mostrarPesoEnLibras(mascota?.peso_kg)}. Presenta FC: ${datos_clinicos?.frecuencia_cardiaca || '--'} lpm, Temp: ${datos_clinicos?.temperatura_c || '--'}°C. Anamnesis: ${datos_clinicos?.anamnesis || 'Sin datos'}. Diagnóstico definitivo: ${datos_clinicos?.diagnostico || 'Evaluación médica'}. Plan terapéutico instaurado con monitoreo de respuesta clínica a las 48-72h.`;

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
Peso para mostrar en la ficha: ${mostrarPesoEnLibras(mascota?.peso_kg)}. Conserva las unidades de las dosis prescritas.

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

// Asistente Clínico Veterinario Interactivo - Streaming Token a Token (SSE / Chunked)
// Endpoint paginado con proyección de columnas (Anti N+1 y reducción de carga)
app.get('/api/pacientes', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const columns = (req.query.columns as string)?.split(',') || ['id_mascota', 'nombre', 'especie', 'raza', 'activo'];

  const cacheKey = `pacientes_page_${page}_${limit}_${columns.join('_')}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ ...cached, _fromCache: true });
  }

  // Simulación de consulta optimizada SELECT columns FROM mascotas LIMIT limit OFFSET offset
  const mockPets = Array.from({ length: 45 }).map((_, idx) => ({
    id_mascota: idx + 1,
    nombre: `Paciente ${idx + 1}`,
    especie: idx % 2 === 0 ? 'Canino' : 'Felino',
    raza: idx % 2 === 0 ? 'Labrador' : 'Siamés',
    activo: true,
  }));

  const offset = (page - 1) * limit;
  const paged = mockPets.slice(offset, offset + limit).map((pet) => {
    const projected: Record<string, any> = {};
    columns.forEach((col) => {
      if ((pet as any)[col] !== undefined) projected[col] = (pet as any)[col];
    });
    return projected;
  });

  const responseData = {
    page,
    limit,
    total: mockPets.length,
    totalPages: Math.ceil(mockPets.length / limit),
    data: paged,
  };

  setCached(cacheKey, responseData, 30);
  return res.json(responseData);
});

const instruccionAsistenteClinico =
  'Eres un asistente de referencia para profesionales veterinarios. Responde específicamente a la pregunta en español. ' +
  'Explica los fundamentos, distingue evidencia de incertidumbre y sugiere referencias comprobables si las conoces. ' +
  'No inventes citas, enlaces ni resultados de búsquedas. Si faltan datos, pide aclaraciones. ' +
  'Evita prescribir o calcular dosis para un paciente concreto y remite al protocolo, ficha técnica y criterio clínico para decisiones de tratamiento.';

async function responderConsultaVeterinaria(req: Request, res: Response, streaming = false) {
  const { pregunta, especie, historial } = req.body ?? {};
  if (typeof pregunta !== 'string' || !pregunta.trim() || pregunta.length > 2000) {
    return res.status(400).json({ error: 'Escribe una pregunta de hasta 2.000 caracteres.' });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({ error: 'El asistente requiere una clave de Gemini configurada en el servidor.' });
  }

  const contents: Content[] = [];
  if (Array.isArray(historial)) {
    for (const mensaje of historial.slice(-8)) {
      if ((mensaje?.role === 'user' || mensaje?.role === 'model') && typeof mensaje.text === 'string' && mensaje.text.trim()) {
        contents.push({ role: mensaje.role, parts: [{ text: mensaje.text.slice(0, 4000) }] });
      }
    }
  }
  const especieReferencia = typeof especie === 'string' ? especie.trim().slice(0, 60) : '';
  contents.push({
    role: 'user',
    parts: [{ text: especieReferencia ? `Especie de referencia: ${especieReferencia}\n\n${pregunta.trim()}` : pregunta.trim() }],
  });

  const request = {
    model: process.env.GEMINI_CLINICAL_MODEL?.trim() || 'gemini-3.8-flash',
    contents,
    config: { systemInstruction: instruccionAsistenteClinico },
  };

  try {
    if (streaming) {
      const chunks = await ai.models.generateContentStream(request);
      res.type('text/plain').set('Cache-Control', 'no-store');
      for await (const chunk of chunks) {
        if (chunk.text) res.write(chunk.text);
      }
      if (!res.headersSent) return res.status(502).end('El modelo no devolvió una respuesta.');
      return res.end();
    }

    const response = await ai.models.generateContent(request);
    const respuesta = response.text?.trim();
    if (!respuesta) return res.status(502).json({ error: 'El modelo no devolvió una respuesta. Prueba a reformular la pregunta.' });
    return res.json({ success: true, respuesta });
  } catch (error) {
    if (res.headersSent) return res.destroy();
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
    if (status === 429) return res.status(429).json({ error: 'El servicio alcanzó su límite de solicitudes. Intenta más tarde.' });
    return res.status(502).json({ error: 'No se pudo consultar Gemini. Revisa la clave y el modelo configurados en el servidor.' });
  }
}

app.post('/api/ai/asistente-clinico', (req, res) => responderConsultaVeterinaria(req, res));
app.post('/api/ai/asistente-clinico/stream', (req, res) => responderConsultaVeterinaria(req, res, true));

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

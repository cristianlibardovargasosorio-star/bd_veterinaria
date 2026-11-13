import React, { useState } from 'react';
import { useStore } from '../../db/store';
import {
  BotMessageSquare,
  Send,
  RotateCw,
  Sparkles,
  Stethoscope,
  Pill,
  Scale,
  AlertTriangle,
} from 'lucide-react';

export const AsistenteClinicoView: React.FC = () => {
  const { mascotas } = useStore();

  const [selectedPetId, setSelectedPetId] = useState<number>(mascotas[0]?.id_mascota || 1);
  const [pregunta, setPregunta] = useState('');
  const [chatLog, setChatLog] = useState<
    { sender: 'user' | 'ia'; text: string; time: string }[]
  >([
    {
      sender: 'ia',
      text: 'Hola doctor(a). Soy el Asistente Clínico Veterinario de VETSOFT impulsado por Gemini 3.8 Flash. Puedo orientarte en rangos de dosificación en mg/kg, contraindicaciones específicas entre caninos y felinos, o protocolos de fluidoterapia.',
      time: '10:00',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const activePet = mascotas.find((m) => m.id_mascota === selectedPetId) || mascotas[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregunta.trim() || loading) return;

    const userText = pregunta;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setPregunta('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/asistente-clinico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: userText,
          contexto_paciente: {
            nombre: activePet?.nombre,
            especie: activePet?.especie,
            raza: activePet?.raza,
            peso_kg: activePet?.peso_kg,
            estado_salud: activePet?.estado_salud,
          },
        }),
      });

      const json = await response.json();
      const iaText = json.respuesta || 'No se obtuvo respuesta del asistente clínico.';
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: iaText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: 'Error de comunicación con el motor de IA.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    `¿Dosis recomendada de Amoxicilina para ${activePet?.nombre} (${activePet?.peso_kg} kg, ${activePet?.especie})?`,
    '¿Qué precauciones tener al combinar Meloxicam con Omeprazol?',
    `Calcular tasa de fluidoterapia de mantenimiento para ${activePet?.nombre}.`,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#fafafa] tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-[#3ecf8e]" />
            <span>Asistente Clínico Veterinario Interactivo (Gemini 3.8 Flash)</span>
          </h2>
          <p className="text-xs text-[#898989] mt-0.5">
            Cálculo de posología en mg/kg, interacciones farmacológicas y triaje médico por especie y peso.
          </p>
        </div>
      </div>

      {/* Patient Context Selector */}
      <div className="p-4 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-[#3ecf8e]" />
          <span className="font-bold text-[#b4b4b4]">Contexto de Paciente Activo:</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(Number(e.target.value))}
            className="p-2 border border-[#393939] rounded-xl bg-[#121212] font-medium"
          >
            {mascotas.map((m) => (
              <option key={m.id_mascota} value={m.id_mascota}>
                {m.nombre} ({m.especie} - {m.raza}, {m.peso_kg} kg)
              </option>
            ))}
          </select>

          <span className="px-3 py-1 bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] rounded-lg border border-[#1f4b37] font-bold">
            Peso: {activePet?.peso_kg} kg
          </span>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ia' && (
                <div className="w-8 h-8 rounded-xl bg-[#3ecf8e] text-[#121212] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#121212] text-white rounded-tr-xs'
                    : 'bg-[#121212] text-[#fafafa] rounded-tl-xs border border-[#2e2e2e] shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-[#898989]' : 'text-[#898989]'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#898989] italic">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#3ecf8e]" />
              <span>Gemini 3.8 Flash está consultando la literatura veterinaria...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-[#121212] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#898989] shrink-0">Sugerencias:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setPregunta(p)}
              className="px-2.5 py-1 bg-[#121212] hover:bg-[#181818] text-[#b4b4b4] rounded-lg border border-[#2e2e2e] text-[11px] font-medium shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#2e2e2e] bg-[#121212] flex items-center gap-2">
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder={`Consulta clínica para ${activePet?.nombre || 'el paciente'} (ej. dosis de Meloxicam, fluidos...)`}
            className="flex-1 text-xs p-2.5 border border-[#393939] rounded-xl focus:outline-hidden focus:border-[#3ecf8e] focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !pregunta.trim()}
            className="px-4 py-2.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

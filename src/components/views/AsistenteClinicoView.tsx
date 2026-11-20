import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../db/store';
import {
  BotMessageSquare,
  Send,
  RotateCw,
  Sparkles,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';

export const AsistenteClinicoView: React.FC = () => {
  const { mascotas } = useStore();

  const [selectedPetId, setSelectedPetId] = useState<number>(0);
  const [pregunta, setPregunta] = useState('');
  const [chatLog, setChatLog] = useState<
    { sender: 'user' | 'ia'; text: string; time: string }[]
  >([
    {
      sender: 'ia',
      text: 'Escribe una pregunta veterinaria para revisar conceptos o comprobar información clínica. Usa términos generales y omite datos que identifiquen a pacientes o tutores.',
      time: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = messagesRef.current;
    if (messages) messages.scrollTop = messages.scrollHeight;
  }, [chatLog, loading, error]);

  const activePet = mascotas.find((m) => m.id_mascota === selectedPetId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregunta.trim() || loading) return;

    const userText = pregunta.trim();
    setError(null);
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
          especie: activePet?.especie,
          historial: chatLog.slice(1).slice(-8).map(({ sender, text }) => ({
            role: sender === 'user' ? 'user' : 'model',
            text: text.slice(0, 4000),
          })),
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success || typeof json.respuesta !== 'string' || !json.respuesta.trim()) {
        setChatLog((prev) => prev.slice(0, -1));
        setError(json.error || 'No se obtuvo una respuesta del asistente.');
        setPregunta(userText);
        return;
      }
      const iaText = json.respuesta;
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: iaText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setChatLog((prev) => prev.slice(0, -1));
      setError('No se pudo conectar con el asistente. Intenta nuevamente.');
      setPregunta(userText);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '¿Cómo comparar guías de vacunación canina?',
    '¿Qué debo revisar al interpretar un hemograma felino?',
    '¿Dónde puedo comprobar información sobre nutrición clínica?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-vet-navy" />
            <span>Asistente Clínico Veterinario Interactivo</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Haz preguntas veterinarias y pide referencias para contrastar las respuestas.
          </p>
        </div>
      </div>

      {/* Patient Context Selector */}
      <div className="p-4 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-vet-navy" />
          <span className="font-bold text-vet-muted">Paciente de referencia opcional</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Paciente de referencia opcional"
            disabled={loading}
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(Number(e.target.value))}
            className="p-2 border border-vet-border rounded-xl bg-vet-surface font-medium"
          >
            <option value={0}>Consulta general</option>
            {mascotas.map((m) => (
              <option key={m.id_mascota} value={m.id_mascota}>
                {m.nombre} ({m.especie} - {m.raza}, {m.peso_kg} kg)
              </option>
            ))}
          </select>


        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-vet-surface rounded-[20px] border border-vet-border shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div ref={messagesRef} role="log" aria-label="Conversación clínica" className="flex-1 overflow-y-auto space-y-4 p-[16px]">
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ia' && (
                <div className="w-8 h-8 rounded-xl bg-vet-emerald text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-[20px] max-w-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-vet-emerald text-white rounded-tr-xs'
                    : 'bg-vet-surface text-vet-navy rounded-tl-xs border border-vet-border shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-vet-muted' : 'text-vet-muted'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-vet-muted italic">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-vet-navy" />
              <span>Preparando respuesta...</span>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-2 border-t border-vet-border bg-vet-danger-soft px-4 py-2 text-sm text-vet-danger-ink">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}
        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-vet-surface flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-vet-muted shrink-0">Sugerencias:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => setPregunta(p)}
              className="px-2.5 py-1 bg-vet-surface hover:bg-vet-ice text-vet-muted rounded-lg border border-vet-border text-[11px] font-medium shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-vet-border bg-vet-surface flex items-center gap-2">
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            aria-label="Pregunta veterinaria"
            placeholder="Escribe tu pregunta veterinaria"
            maxLength={2000}
            disabled={loading}
            className="flex-1 text-xs p-2.5 border border-vet-border rounded-xl focus:outline-hidden focus:border-vet-navy focus:ring-1 focus:ring-vet-emerald/40"
          />
          <button
            type="submit"
            disabled={loading || !pregunta.trim()}
            className="px-4 py-2.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

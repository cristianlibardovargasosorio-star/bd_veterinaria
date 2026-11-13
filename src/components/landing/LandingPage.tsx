import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { LazyScrollSection } from '../common/LazyScrollSection';
import { SkeletonCard, SkeletonKPI, SkeletonTable } from '../common/Skeleton';
import confetti from 'canvas-confetti';
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Syringe,
  Boxes,
  Receipt,
  Heart,
  Thermometer,
  QrCode,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Activity,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Search,
  AlertTriangle,
  Send,
  Check,
  MessageSquare,
  Smile,
  Info,
  ExternalLink,
  ChevronRight,
  UserCheck,
  BadgeCheck,
  Flame,
  PhoneCall,
} from 'lucide-react';
import { TipoCita } from '../../types';

interface LandingPageProps {
  onEnterERP: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterERP, onOpenLogin }) => {
  const {
    mascotas,
    propietarios,
    veterinarios,
    historiaVacunas,
    vacunas,
    citas,
    agendarCita,
    registrarMascota,
    registrarPropietario,
  } = useStore();

  const [showSkeletonMode, setShowSkeletonMode] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'ia' | 'carne' | 'lotes' | 'pos'>('ia');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Images
  const heroImg = '/src/assets/images/landing_vet_hero_1794425108227.jpg';
  const aiTabletImg = '/src/assets/images/landing_ai_diagnostics_1794425109106.jpg';
  const petCareImg = '/src/assets/images/landing_pet_care_1794425109279.jpg';

  // --- ONLINE APPOINTMENT BOOKING STATE ---
  const [bookingPetName, setBookingPetName] = useState('');
  const [bookingOwnerName, setBookingOwnerName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEspecie, setBookingEspecie] = useState('Canino');
  const [bookingType, setBookingType] = useState<TipoCita>('CONSULTA');
  const [bookingVetId, setBookingVetId] = useState<number>(veterinarios[0]?.id_veterinario || 1);
  const [bookingDate, setBookingDate] = useState('2026-11-15');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingReason, setBookingReason] = useState('Chequeo general preventivo y desparasitación');
  const [bookingSuccess, setBookingSuccess] = useState<{
    idCita: number;
    pet: string;
    owner: string;
    vet: string;
    dateTime: string;
  } | null>(null);

  // --- PET PORTAL & VACCINE SEARCH STATE ---
  const [searchPetQuery, setSearchPetQuery] = useState('Lucas');
  const [searchedPetId, setSearchedPetId] = useState<number>(1);

  // Selected pet for vaccine passport
  const selectedPet = mascotas.find(
    (m) =>
      m.id_mascota === searchedPetId ||
      m.nombre.toLowerCase().includes(searchPetQuery.toLowerCase()) ||
      (m.microchip_id && m.microchip_id.includes(searchPetQuery))
  ) || mascotas[0];

  const petOwner = propietarios.find((p) => p.id_propietario === selectedPet?.id_propietario);
  const petVaccines = historiaVacunas.filter((h) => h.id_mascota === selectedPet?.id_mascota);

  // --- AI HEALTH ASSISTANT INTERACTIVE STATE ---
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    '¡Hola! Soy el Asistente Clínico Inteligente de la Clínica Veterinaria San Antón. Puedes consultarme dudas sobre el cuidado de tu mascota, síntomas habituales, calendario de vacunación o nutrición preventiva.'
  );

  const handleAskAI = async (customQ?: string) => {
    const questionToAsk = customQ || aiQuestion;
    if (!questionToAsk.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ai/asistente-clinico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: questionToAsk,
          contexto_paciente: {
            mascota: selectedPet?.nombre || 'Mascota',
            especie: selectedPet?.especie || 'Canino',
            peso_kg: selectedPet?.peso_kg || 15,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.respuesta || 'Orientación médica generada con éxito.');
      } else {
        throw new Error('Respuesta no disponible');
      }
    } catch {
      // Friendly structured local guidance
      setTimeout(() => {
        setAiResponse(
          `Orientación Veterinaria para ${questionToAsk}: Mantén en observación a tu mascota. Si presenta decaimiento marcado, temperatura corporal superior a 39.2°C o vómito persistente por más de 12 horas, comunícate de inmediato a nuestra línea de urgencias 24h (+57 300 912 3456). Recuerda no suministrar medicamentos de uso humano como ibuprofeno o paracetamol.`
        );
        setAiLoading(false);
      }, 600);
      return;
    } finally {
      setAiLoading(false);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if pet exists or register new
    let targetPet = mascotas.find(
      (m) => m.nombre.toLowerCase() === bookingPetName.trim().toLowerCase()
    );

    let targetOwnerId = targetPet ? targetPet.id_propietario : 1;

    if (!targetPet && bookingPetName.trim()) {
      // Auto-register owner and pet smoothly
      const newOwnerRes = registrarPropietario({
        id_usuario: null,
        cedula_documento: `CC-${Math.floor(10000000 + Math.random() * 90000000)}`,
        nombres: bookingOwnerName || 'Tutor Familiar',
        apellidos: 'Registrado Online',
        telefono: bookingPhone || '+57 300 000 0000',
        direccion: 'Sede Principal Bogotá',
      });

      if (newOwnerRes.data) {
        targetOwnerId = newOwnerRes.data.id_propietario;
      }

      const newPetRes = registrarMascota({
        id_propietario: targetOwnerId,
        codigo_expediente: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
        nombre: bookingPetName.trim(),
        especie: bookingEspecie,
        raza: 'Mestizo / Compañía',
        fecha_nacimiento: '2024-01-01',
        genero: 'MACHO',
        peso_kg: 10,
        microchip_id: `9410000${Math.floor(100000 + Math.random() * 900000)}`,
        estado_salud: 'ESTABLE',
        activo: true,
      });

      if (newPetRes.data) {
        targetPet = newPetRes.data;
      }
    }

    const assignedPetId = targetPet ? targetPet.id_mascota : 1;
    const assignedVet = veterinarios.find((v) => v.id_veterinario === bookingVetId) || veterinarios[0];

    const result = agendarCita({
      id_mascota: assignedPetId,
      id_propietario: targetOwnerId,
      id_veterinario: assignedVet.id_veterinario,
      fecha_hora: `${bookingDate}T${bookingTime}:00`,
      motivo_general: bookingReason,
      tipo_cita: bookingType,
      estado: 'PENDIENTE',
    });

    if (result.success && result.data) {
      // Confetti celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#0d9488', '#f59e0b'],
        });
      } catch (err) {
        // ignore if confetti canvas fails
      }

      setBookingSuccess({
        idCita: result.data.id_cita,
        pet: targetPet?.nombre || bookingPetName || 'Mascota',
        owner: bookingOwnerName || 'Tutor',
        vet: `${assignedVet.nombres} ${assignedVet.apellidos}`,
        dateTime: `${bookingDate} a las ${bookingTime} hrs`,
      });
    }
  };

  const faqs = [
    {
      q: '¿Qué servicios atiende la clínica en horario de urgencias 24/7?',
      a: 'Nuestra unidad de cuidados críticos y urgencias opera ininterrumpidamente las 24 horas del día, los 365 días del año. Atendemos politraumatismos, intoxicaciones, torsión gástrica, dificultades respiratorias, cesáreas de emergencia y soporte intensivo con monitores multiparamétricos.',
    },
    {
      q: '¿Cómo funciona el Carné Digital de Vacunación con Código QR?',
      a: 'Cada dosis aplicada en la clínica se asocia a su biológico y lote verificado. El sistema genera un pasaporte digital que los tutores pueden consultar en línea desde cualquier dispositivo y descargar o validar mediante código QR para viajes y requisitos legales.',
    },
    {
      q: '¿Qué es la tecnología de Fichas Médicas con IA Gemini 3.8 Flash?',
      a: 'Al culminar cada consulta, el equipo médico procesa los datos clínicos con Gemini 3.8 Flash para generar un informe comprensible, cálido y educativo para la familia, garantizando que el tutor entienda con total claridad el diagnóstico y el tratamiento de su mascota.',
    },
    {
      q: '¿Cómo se agendan las cirugías y qué exámenes prequirúrgicos se requieren?',
      a: 'Toda cirugía requiere valoración previa con perfil sanguíneo completo (hemograma, química renal y hepática) y valoración cardiorrespiratoria para minimizar cualquier riesgo anestésico.',
    },
    {
      q: '¿Tienen servicio de peluquería, spa y medicina preventiva?',
      a: 'Sí, disponemos de servicio de peluquería canina y felina estética y medicada, baño dermatológico con ozonoterapia, limpieza de oídos y corte de uñas, todo bajo supervisión médico-veterinaria.',
    },
  ];

  const medicalServices = [
    {
      icon: Stethoscope,
      title: 'Consulta General & Especializada',
      desc: 'Examen clínico integral, evaluación de constantes vitales, medicina interna, cardiología y dermatología.',
      color: 'bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] border-[#1f4b37]',
      badge: 'Atención Diaria',
    },
    {
      icon: Activity,
      title: 'Urgencias & Cuidados Críticos 24/7',
      desc: 'Quirófano de choque, oxigenoterapia, hospitalización y monitoreo hemodinámico ininterrumpido.',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      badge: '24 Horas Activo',
    },
    {
      icon: Syringe,
      title: 'Vacunación & Inmunización Oficial',
      desc: 'Esquema completo para cachorros y adultos. Biológicos certificados con trazabilidad estricta de lote y carné digital QR.',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      badge: 'Pasaporte Sanitario',
    },
    {
      icon: Heart,
      title: 'Cirugía General & Quirófano',
      desc: 'Cirugía de tejidos blandos, traumatología, esterilizaciones profilácticas y anestesia inhalatoria monitorizada.',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      badge: 'Quirófano Certificado',
    },
    {
      icon: Sparkles,
      title: 'Laboratorio Clínico & Imagen Digital',
      desc: 'Hemogramas, química sanguínea, citologías, rayos X digitales y ecografía abdominal de alta resolución.',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      badge: 'Resultados Inmediatos',
    },
    {
      icon: Smile,
      title: 'Odontología & Profilaxis',
      desc: 'Profilaxis ultrasónica, extracción dental atraumática y tratamiento preventivo de la enfermedad periodontal.',
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      badge: 'Salud Oral',
    },
    {
      icon: Boxes,
      title: 'Farmacia Veterinaria & Lotes Seguros',
      desc: 'Dispensación segura con verificación estricta de caducidad. Medicamentos, antibióticos y dietas clínicas formuladas.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      badge: 'Anti-Vencimiento SQL',
    },
    {
      icon: Award,
      title: 'Spa & Peluquería Canina/Felina',
      desc: 'Estética profesional, baños medicados hipoalergénicos, corte de raza y cepillado deslanado sin estrés.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      badge: 'Bienestar y Confort',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#fafafa] font-sans selection:bg-[#3ecf8e] text-[#121212] selection:text-white scroll-smooth">
      {/* TOP EMERGENCY AND CONTACT TICKER */}
      <div className="bg-[#121212] text-slate-200 text-xs py-2 px-4 border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-[#3ecf8e]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              URGENCIAS VETERINARIAS 24 HORAS
            </span>
            <span className="text-[#898989] hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[#b4b4b4]">
              Sede Principal: Cra. 45 # 128-22, Bogotá
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="tel:+573009123456"
              className="flex items-center gap-1.5 text-[#3ecf8e] hover:text-emerald-300 font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+57 (300) 912-3456</span>
            </a>
            <span className="text-[#898989]">|</span>
            <button
              onClick={onOpenLogin}
              className="text-[#3ecf8e] hover:text-emerald-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
              title="Módulo 1: Autenticación y Acceso (/login)"
            >
              <Lock className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>Login RF-01 (/login)</span>
            </button>
            <span className="text-[#898989]">|</span>
            <button
              onClick={onEnterERP}
              className="text-[#b4b4b4] hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <span>Acceso ERP</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#2e2e2e] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Brand Identity */}
          <a href="#" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#fafafa]">SAN ANTÓN</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] rounded font-mono">
                  VETSOFT
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#898989] block leading-tight">
                Hospital Clínico Veterinario & IA
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#b4b4b4]">
            <a href="#servicios" className="hover:text-[#3ecf8e] transition-colors">
              Servicios
            </a>
            <a href="#agendar" className="hover:text-[#3ecf8e] transition-colors">
              Agendar Cita
            </a>
            <a href="#carne" className="hover:text-[#3ecf8e] transition-colors">
              Carné Digital
            </a>
            <a href="#equipo" className="hover:text-[#3ecf8e] transition-colors">
              Especialistas
            </a>
            <a href="#asistente-ia" className="hover:text-[#3ecf8e] transition-colors">
              Asistente IA
            </a>
            <a href="#planes" className="hover:text-[#3ecf8e] transition-colors">
              Planes de Salud
            </a>
            <a href="#testimonios" className="hover:text-[#3ecf8e] transition-colors">
              Testimonios
            </a>
            <a href="#contacto" className="hover:text-[#3ecf8e] transition-colors">
              Contacto
            </a>
          </nav>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#fafafa] bg-[#181818] hover:bg-[#242424] border border-[#393939] shadow-2xs transition-all cursor-pointer"
              title="Ir al Módulo 1: Login de Usuarios (/login)"
            >
              <Lock className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span>Iniciar Sesión (/login)</span>
            </button>

            <a
              href="#agendar"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Cita</span>
            </a>

            <button
              onClick={onEnterERP}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#121212] hover:bg-[#1e1e1e] text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Abrir el software integral de gestión clínica, historias, POS e inventario"
            >
              <span>ERP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-linear-to-b from-white via-emerald-50/20 to-slate-50 border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <LazyScrollSection className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hospital Veterinario Certificado · Urgencias 24/7 · Motor Gemini 3.8</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#fafafa] tracking-tight leading-[1.08] text-balance">
                Cuidamos la salud de tu mascota con{' '}
                <span className="text-[#3ecf8e] underline decoration-emerald-300 underline-offset-4">
                  amor, ciencia
                </span>{' '}
                y alta tecnología.
              </h1>

              <p className="text-base sm:text-lg text-[#898989] max-w-2xl leading-relaxed text-balance">
                En la <strong>Clínica Veterinaria San Antón</strong> brindamos atención médica integral:
                consultas especializadas, cirugías con monitoreo avanzado, carné digital de vacunas con código
                QR y explicaciones médicas claras gracias a inteligencia artificial.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#agendar"
                  className="px-6 py-3.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Cita en Línea</span>
                </a>

                <button
                  onClick={onOpenLogin}
                  className="px-5 py-3.5 bg-[#121212] hover:bg-[#1e1e1e] text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  title="Acceso RF-01: Login con Spring Security y PostgreSQL"
                >
                  <Lock className="w-4 h-4 text-[#3ecf8e]" />
                  <span>Iniciar Sesión (/login)</span>
                </button>

                <a
                  href="#carne"
                  className="px-5 py-3.5 bg-[#121212] hover:bg-[#181818] text-[#fafafa] font-bold text-sm rounded-xl border border-[#393939] shadow-xs flex items-center gap-2 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-[#3ecf8e]" />
                  <span>Consultar Carné Digital</span>
                </a>

                <a
                  href="tel:+573009123456"
                  className="px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm rounded-xl border border-rose-200 shadow-xs flex items-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>Llamar Urgencias</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#2e2e2e]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#3ecf8e] shrink-0" />
                  <span className="text-xs text-[#898989] font-semibold">
                    Médicos Veterinarios Titulados
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#3ecf8e] shrink-0" />
                  <span className="text-xs text-[#898989] font-semibold">
                    Hospitalización 24 Horas
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
                  <span className="text-xs text-[#898989] font-semibold">
                    4.9 / 5 (+2,500 Familias)
                  </span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Right Column: Hero Visual Card */}
            <LazyScrollSection delay={150} className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#2e2e2e] shadow-2xl bg-[#121212] group">
                <img
                  src={heroImg}
                  alt="Instalaciones del Hospital Veterinario San Antón con médico veterinario examinando paciente"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 lg:h-[480px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-6">
                  <div className="w-full space-y-2 text-white">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3ecf8e]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ATENCIÓN EN CURSO EN CLÍNICA</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">
                      Instalaciones modernas equipadas con ecógrafo Doppler, quirófano de flujo laminar y
                      farmacia clínica integrada.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-mono">
                        Expediente activo: EXP-2026-001 (Lucas)
                      </span>
                      <button
                        onClick={onEnterERP}
                        className="text-xs px-3 py-1 bg-[#3ecf8e] text-[#121212] hover:bg-emerald-500 rounded-lg font-bold text-white transition-colors"
                      >
                        Ver en ERP →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </LazyScrollSection>
          </div>

          {/* KEY PROOF STATS BAR */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs text-center">
              <span className="text-3xl font-black text-[#fafafa] font-mono tabular-nums">+14,200</span>
              <span className="block text-xs font-semibold text-[#898989] mt-1">
                Pacientes Atendidos con Éxito
              </span>
            </div>
            <div className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs text-center">
              <span className="text-3xl font-black text-[#3ecf8e] font-mono tabular-nums">24 / 7</span>
              <span className="block text-xs font-semibold text-[#898989] mt-1">
                Urgencias & Cuidados Críticos
              </span>
            </div>
            <div className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs text-center">
              <span className="text-3xl font-black text-[#fafafa] font-mono tabular-nums">100%</span>
              <span className="block text-xs font-semibold text-[#898989] mt-1">
                Vacunas con Lote Trazable
              </span>
            </div>
            <div className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs text-center">
              <span className="text-3xl font-black text-[#3ecf8e] font-mono tabular-nums">IA Dual</span>
              <span className="block text-xs font-semibold text-[#898989] mt-1">
                Fichas Claras para Tutores
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL SERVICES CATALOG */}
      <section id="servicios" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Especialidades y Procedimientos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
              Servicios Clínicos de Alta Calidad para tu Mascota
            </h2>
            <p className="text-sm text-[#898989] leading-relaxed">
              Equipamiento hospitalario moderno y médicos veterinarios dedicados a cada etapa del ciclo de vida
              de perros, gatos y animales de compañía.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicalServices.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <LazyScrollSection
                  key={idx}
                  delay={idx * 40}
                  className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 hover:bg-[#121212] hover:border-[#1f4b37] hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${svc.color} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#242424] text-[#b4b4b4] font-mono">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#fafafa] leading-snug group-hover:text-[#3ecf8e] transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-[#898989] leading-relaxed">{svc.desc}</p>
                  </div>

                  <a
                    href="#agendar"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3ecf8e] hover:text-[#3ecf8e] transition-colors pt-2 border-t border-slate-100"
                  >
                    <span>Agendar este servicio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </LazyScrollSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE APPOINTMENT BOOKING FORM */}
      <section id="agendar" className="py-20 bg-[#181818] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Context Column */}
            <LazyScrollSection className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
                Agendamiento Online Inmediato
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
                Reserva la Cita Médica de tu Mascota en Minutos
              </h2>
              <p className="text-sm text-[#898989] leading-relaxed">
                Selecciona la especialidad médica, el veterinario tratante, la fecha y la hora de tu
                preferencia. Tu cita quedará registrada automáticamente en el sistema clínico del hospital.
              </p>

              <div className="p-5 bg-[#121212] rounded-2xl border border-[#2e2e2e] shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#fafafa] block">Confirmación en Tiempo Real</strong>
                    <span className="text-[#898989]">
                      Sin tiempos de espera telefónicos. Recibes tu número de radicado al instante.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#fafafa] block">Historial Clínico Digital</strong>
                    <span className="text-[#898989]">
                      Todos los datos de la consulta se asocian de por vida al expediente de tu mascota.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#fafafa] block">¿Es una Emergencia Grave?</strong>
                    <span className="text-[#898989]">
                      Si tu mascota está inconsciente o convulsionando, tráela de inmediato sin cita previa a
                      Urgencias 24h.
                    </span>
                  </div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Right Booking Form */}
            <LazyScrollSection delay={100} className="lg:col-span-7">
              <div className="bg-[#121212] rounded-3xl border-2 border-[#2e2e2e] p-6 sm:p-8 shadow-xl">
                {bookingSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] mx-auto flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#3ecf8e] bg-[#1c2e24] text-[#3ecf8e] px-3 py-1 rounded-full">
                        CITA AGENDADA CON ÉXITO #RAD-{bookingSuccess.idCita}
                      </span>
                      <h3 className="text-2xl font-black text-[#fafafa] pt-2">
                        ¡Cita Confirmada para {bookingSuccess.pet}!
                      </h3>
                      <p className="text-sm text-[#898989] max-w-md mx-auto">
                        Hemos registrado tu cita con el <strong>{bookingSuccess.vet}</strong> para el día{' '}
                        <strong>{bookingSuccess.dateTime}</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-[#121212] rounded-2xl border border-[#2e2e2e] max-w-md mx-auto text-xs text-left space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#898989]">Paciente:</span>
                        <span className="font-bold text-[#fafafa]">{bookingSuccess.pet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#898989]">Tutor:</span>
                        <span className="font-bold text-[#fafafa]">{bookingSuccess.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#898989]">Veterinario Asignado:</span>
                        <span className="font-bold text-[#3ecf8e]">{bookingSuccess.vet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#898989]">Fecha y Hora:</span>
                        <span className="font-bold text-[#fafafa]">{bookingSuccess.dateTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#898989]">Sede:</span>
                        <span className="font-bold text-[#fafafa]">Hospital San Antón Bogotá</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setBookingSuccess(null)}
                        className="px-5 py-2.5 bg-[#181818] hover:bg-[#242424] text-[#fafafa] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Agendar otra cita
                      </button>

                      <button
                        onClick={onEnterERP}
                        className="px-5 py-2.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Ver cita en el Sistema ERP →
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-[#fafafa]">Formulario de Reserva Médica</h3>
                      <p className="text-[#898989] text-[11px]">
                        Ingresa los datos para apartar el turno médico de tu mascota.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">
                          Nombre del Tutor / Propietario *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingOwnerName}
                          onChange={(e) => setBookingOwnerName(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">
                          Teléfono de Contacto (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="+57 310 123 4567"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">
                          Nombre de la Mascota *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingPetName}
                          onChange={(e) => setBookingPetName(e.target.value)}
                          placeholder="Ej. Lucas, Max, Luna"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">Especie</label>
                        <select
                          value={bookingEspecie}
                          onChange={(e) => setBookingEspecie(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        >
                          <option value="Canino">Canino (Perro)</option>
                          <option value="Felino">Felino (Gato)</option>
                          <option value="Conejo">Lagomorfo (Conejo)</option>
                          <option value="Ave">Ave de Compañía</option>
                          <option value="Otro">Otra Especie</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">
                          Tipo de Servicio / Cita
                        </label>
                        <select
                          value={bookingType}
                          onChange={(e) => setBookingType(e.target.value as TipoCita)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212] font-medium"
                        >
                          <option value="CONSULTA">Consulta General Preventiva</option>
                          <option value="VACUNACION">Vacunación & Desparasitación</option>
                          <option value="CONTROL">Control Postoperatorio</option>
                          <option value="URGENCIA">Urgencia Médica Prioritaria</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">
                          Médico Veterinario Especialista
                        </label>
                        <select
                          value={bookingVetId}
                          onChange={(e) => setBookingVetId(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212] font-medium"
                        >
                          {veterinarios.map((v) => (
                            <option key={v.id_veterinario} value={v.id_veterinario}>
                              {v.nombres} {v.apellidos} ({v.especialidad})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">Fecha Deseada</label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#b4b4b4] block mb-1">Hora Estimada</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212]"
                        >
                          <option value="08:30">08:30 AM</option>
                          <option value="09:30">09:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="15:30">03:30 PM</option>
                          <option value="17:00">05:00 PM</option>
                          <option value="18:30">06:30 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#b4b4b4] block mb-1">
                        Motivo de la Consulta o Síntomas Notados
                      </label>
                      <textarea
                        rows={2}
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        placeholder="Ej. Chequeo semestral, decaimiento leve, vacunas anuales pendientes..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#393939] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#121212] text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Confirmar y Agendar Cita Ahora</span>
                    </button>
                  </form>
                )}
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* PATIENT PORTAL & DIGITAL VACCINE CARD LOOKUP */}
      <section id="carne" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Portal del Paciente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
              Carné Digital de Vacunación & Historial Médico
            </h2>
            <p className="text-sm text-[#898989]">
              ¿Tu mascota ya es paciente de la Clínica San Antón? Consulta al instante su estado vacunal,
              próximos refuerzos y pasaporte oficial con código QR.
            </p>

            {/* Quick pet search chips */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[#898989] font-semibold">Pacientes de demostración:</span>
              {mascotas.slice(0, 5).map((m) => (
                <button
                  key={m.id_mascota}
                  onClick={() => {
                    setSearchedPetId(m.id_mascota);
                    setSearchPetQuery(m.nombre);
                  }}
                  className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                    selectedPet?.id_mascota === m.id_mascota
                      ? 'bg-[#3ecf8e] text-[#121212] text-white border-emerald-600 shadow-sm'
                      : 'bg-[#181818] text-[#b4b4b4] border-[#2e2e2e] hover:bg-[#242424]'
                  }`}
                >
                  🐾 {m.nombre} ({m.especie})
                </button>
              ))}
            </div>
          </LazyScrollSection>

          {/* Digital Vaccine Card Display */}
          <LazyScrollSection className="max-w-4xl mx-auto">
            <div className="bg-linear-to-br from-white to-slate-50 rounded-3xl border-2 border-[#1f4b37] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2e2e2e] pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl shadow-md">
                    {selectedPet?.especie.toLowerCase().includes('fel') ? '🐱' : '🐶'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-[#fafafa]">{selectedPet?.nombre}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e]">
                        {selectedPet?.estado_salud}
                      </span>
                    </div>
                    <p className="text-xs text-[#898989] font-mono">
                      Expediente: {selectedPet?.codigo_expediente} · Microchip:{' '}
                      {selectedPet?.microchip_id || '941000028192'}
                    </p>
                    <p className="text-xs text-[#898989] mt-0.5">
                      Raza: <strong>{selectedPet?.raza}</strong> · Peso: <strong>{selectedPet?.peso_kg} kg</strong> ·
                      Tutor:{' '}
                      <strong>
                        {petOwner?.nombres} {petOwner?.apellidos}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#121212] rounded-2xl border border-[#2e2e2e] text-center shrink-0 self-start sm:self-auto shadow-xs">
                  <QrCode className="w-16 h-16 mx-auto text-[#fafafa]" />
                  <span className="text-[10px] font-mono text-[#898989] block mt-1 font-bold">
                    VALIDACIÓN QR OFICIAL
                  </span>
                </div>
              </div>

              {/* Vaccine records table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#fafafa] flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#3ecf8e]" />
                    <span>Inmunizaciones Registradas en la Clínica</span>
                  </h4>
                  <span className="text-xs text-[#898989] font-mono">
                    {petVaccines.length} Dosis Aplicadas
                  </span>
                </div>

                {petVaccines.length === 0 ? (
                  <div className="p-6 bg-[#121212] rounded-2xl text-center text-xs text-[#898989] border border-[#2e2e2e]">
                    No hay dosis registradas en este expediente clínico.
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#2e2e2e] text-[#898989] font-mono">
                          <th className="py-2.5 font-bold">Biológico / Vacuna</th>
                          <th className="py-2.5">Lote Oficial</th>
                          <th className="py-2.5">Fecha Aplicación</th>
                          <th className="py-2.5 font-bold text-[#3ecf8e]">Próximo Refuerzo</th>
                          <th className="py-2.5 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {petVaccines.map((v, i) => {
                          const catVac = vacunas.find((vac) => vac.id_vacuna === v.id_vacuna);
                          return (
                            <tr key={i} className="hover:bg-[#1c2e24] text-[#3ecf8e]/40 transition-colors">
                              <td className="py-3 font-bold text-[#fafafa]">
                                {catVac?.nombre || 'Vacuna Inmunizante'}
                                <span className="block text-[10px] font-normal text-[#898989] font-mono">
                                  {catVac?.marca || 'Marca Certificada'}
                                </span>
                              </td>
                              <td className="py-3 font-mono text-[#b4b4b4]">{v.lote}</td>
                              <td className="py-3 font-mono text-[#898989]">{v.fecha_aplicacion}</td>
                              <td className="py-3 font-mono font-bold text-[#3ecf8e]">
                                {v.fecha_refuerzo || 'Anual'}
                              </td>
                              <td className="py-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e]">
                                  <Check className="w-3 h-3" />
                                  <span>Al Día</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer card action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2e2e2e] text-xs">
                <span className="text-[#898989] text-center sm:text-left">
                  Certificado bajo estándar médico veterinario nacional y normas de sanidad animal.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(
                        `Descargando pasaporte sanitario oficial de ${selectedPet?.nombre} en formato PDF.`
                      );
                    }}
                    className="px-4 py-2 bg-[#181818] hover:bg-[#242424] text-[#fafafa] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Descargar Certificado PDF
                  </button>
                  <button
                    onClick={onEnterERP}
                    className="px-4 py-2 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Abrir Carné en el ERP →
                  </button>
                </div>
              </div>
            </div>
          </LazyScrollSection>
        </div>
      </section>

      {/* AI VIRTUAL HEALTH ASSISTANT FOR PET PARENTS */}
      <section id="asistente-ia" className="py-20 bg-linear-to-b from-slate-900 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <LazyScrollSection className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-[#3ecf8e]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tecnología Gemini 3.8 Flash para Familias</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Asistente Clínico Inteligente para Dudas de Salud
            </h2>
            <p className="text-sm text-[#b4b4b4] max-w-2xl mx-auto">
              ¿Notas un comportamiento inusual o tienes dudas sobre la nutrición o calendario preventivo de tu
              mascota? Consulta a nuestro asistente entrenado en medicina veterinaria.
            </p>
          </LazyScrollSection>

          {/* Interactive AI Widget */}
          <LazyScrollSection delay={80} className="bg-[#1e1e1e]/80 rounded-3xl border border-[#2e2e2e] p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xs">
            {/* Quick question prompt pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#898989] font-semibold">Consultas frecuentes:</span>
              {[
                '¿A qué edad se aplica la primera vacuna a un cachorro?',
                '¿Qué alimentos son estrictamente tóxicos para un gato?',
                'Mi perro vomitó una vez, ¿cuándo es una urgencia médica?',
                '¿Cómo saber si mi mascota tiene fiebre en casa?',
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuestion(pill);
                    handleAskAI(pill);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-700/80 hover:bg-[#3ecf8e] text-[#121212]/30 hover:border-emerald-400 border border-slate-600 text-slate-200 text-xs font-medium transition-all text-left cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* AI Response Display */}
            <div className="p-5 rounded-2xl bg-[#121212]/90 border border-[#2e2e2e] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[#2e2e2e] pb-2">
                <div className="flex items-center gap-2 text-[#3ecf8e] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Respuesta del Asistente Clínico VETSOFT</span>
                </div>
                <span className="text-[#898989] font-mono text-[11px]">Motor Gemini 3.8 Flash</span>
              </div>

              {aiLoading ? (
                <div className="py-6 flex items-center justify-center gap-3 text-[#898989] text-xs animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>Analizando consulta y literatura veterinaria...</span>
                </div>
              ) : (
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiResponse}
                </p>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#898989]">
                <span className="flex items-center gap-1 text-amber-400/90">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  La orientación virtual complementa, pero no sustituye el examen clínico presencial.
                </span>
                <a href="#agendar" className="text-[#3ecf8e] font-bold hover:underline">
                  Agendar consulta médica →
                </a>
              </div>
            </div>

            {/* Custom input bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAI();
                }}
                placeholder="Escribe tu consulta sobre síntomas, alimentación o prevención..."
                className="flex-1 px-4 py-3 bg-[#121212] rounded-xl border border-slate-600 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading}
                className="px-5 py-3 bg-[#3ecf8e] text-[#121212] hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Consultar</span>
              </button>
            </div>
          </LazyScrollSection>
        </div>
      </section>

      {/* MEDICAL TEAM / SPECIALISTS */}
      <section id="equipo" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Cuerpo Médico Especialista
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
              Veterinarios con Vocación, Rigor y Experiencia
            </h2>
            <p className="text-sm text-[#898989]">
              Nuestro equipo cuenta con especializaciones médico-quirúrgicas avaladas y continua formación
              clínica.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vet 1: Dr. Camilo */}
            <LazyScrollSection delay={50} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 hover:bg-[#121212] hover:border-[#1f4b37] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00c573] text-[#121212] text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">Dr. Camilo Restrepo</h3>
                  <span className="text-xs font-bold text-[#3ecf8e] block">
                    Cirugía de Tejidos Blandos & Urgencias
                  </span>
                  <span className="text-[11px] font-mono text-[#898989]">TP: 19823-VET · 12 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#898989] leading-relaxed">
                Director médico del hospital. Especialista en intervenciones quirúrgicas complejas, manejo de
                pacientes politraumatizados y medicina interna avanzada.
              </p>

              <div className="p-3 bg-[#121212] rounded-xl border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Horario de consulta:</span>
                  <strong>Lunes a Viernes</strong>
                </div>
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Atención quirúrgica:</span>
                  <strong className="text-[#3ecf8e]">Programada y Urgencias</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con el Dr. Camilo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>

            {/* Vet 2: Dra. Andrea */}
            <LazyScrollSection delay={100} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 hover:bg-[#121212] hover:border-[#1f4b37] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">Dra. Andrea Morales</h3>
                  <span className="text-xs font-bold text-teal-700 block">
                    Medicina Felina & Dermatología
                  </span>
                  <span className="text-[11px] font-mono text-[#898989]">TP: 21450-VET · 9 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#898989] leading-relaxed">
                Especialista en etología y medicina amigable con los gatos (Cat Friendly Practice), diagnóstico
                de dermatitis alérgicas complejas y planes de longevidad felina.
              </p>

              <div className="p-3 bg-[#121212] rounded-xl border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Horario de consulta:</span>
                  <strong>Martes a Sábado</strong>
                </div>
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Especialidad:</span>
                  <strong className="text-teal-700">Gatos y Dermatología Canina</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con la Dra. Andrea</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>

            {/* Vet 3: Dra. Mariana */}
            <LazyScrollSection delay={150} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 hover:bg-[#121212] hover:border-[#1f4b37] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">Dra. Mariana Gómez</h3>
                  <span className="text-xs font-bold text-indigo-700 block">
                    Cardiología & Diagnóstico por Imagen
                  </span>
                  <span className="text-[11px] font-mono text-[#898989]">TP: 24119-VET · 8 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#898989] leading-relaxed">
                Experta en ecocardiografía Doppler color, monitoreo electrocardiográfico Holter y detección
                temprana de patologías cardiorrespiratorias en pacientes geriátricos.
              </p>

              <div className="p-3 bg-[#121212] rounded-xl border border-[#2e2e2e] text-xs space-y-1">
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Horario de consulta:</span>
                  <strong>Lunes, Miércoles y Viernes</strong>
                </div>
                <div className="flex justify-between text-[#b4b4b4]">
                  <span>Especialidad:</span>
                  <strong className="text-indigo-700">Ecografía y Cardiología</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con la Dra. Mariana</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* HEALTH PLANS & PREVENTIVE SUBSCRIPTIONS */}
      <section id="planes" className="py-20 bg-[#181818] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Planes de Salud Preventiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
              Protección Integral Todo el Año para tu Compañero
            </h2>
            <p className="text-sm text-[#898989]">
              Membresías diseñadas para cuidar su bienestar continuo sin gastos imprevistos.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1: Cachorro */}
            <LazyScrollSection delay={50} className="p-8 rounded-3xl border border-[#2e2e2e] bg-[#121212] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#898989] font-mono">
                  Plan Cachorro / Gatito
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#fafafa]">$35</span>
                  <span className="text-xs text-[#898989]">/ mes</span>
                </div>
                <p className="text-xs text-[#898989]">
                  Para cachorros y gatitos hasta los 12 meses de edad.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#b4b4b4]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Esquema completo de vacunación inicial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Desparasitación interna cada mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Carné digital con código QR oficial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>3 Consultas pediátricas gratuitas al año</span>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3 bg-[#181818] hover:bg-[#242424] text-[#fafafa] rounded-xl text-xs font-bold text-center transition-colors block"
              >
                Suscribir Plan Cachorro
              </a>
            </LazyScrollSection>

            {/* Plan 2: Adulto Total (Featured) */}
            <LazyScrollSection delay={100} className="p-8 rounded-3xl border-2 border-[#3ecf8e] bg-linear-to-b from-emerald-50/50 via-white to-white flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#3ecf8e] text-[#121212] text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                Más Recomendado por Veterinarios
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
                  Plan Salud Total Adulto
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#fafafa]">$49</span>
                  <span className="text-xs text-[#898989]">/ mes</span>
                </div>
                <p className="text-xs text-[#898989]">
                  Cobertura preventiva total para perros y gatos entre 1 y 7 años.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#b4b4b4]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Todas las vacunas anuales de refuerzo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Examen sanguíneo de rutina semestral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>1 Limpieza dental con ultrasonido al año</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <strong className="text-emerald-900">Consultas ilimitadas de medicina general</strong>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3.5 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white rounded-xl text-xs font-bold text-center shadow-md shadow-emerald-600/30 transition-all block"
              >
                Suscribir Salud Total
              </a>
            </LazyScrollSection>

            {/* Plan 3: Senior Care */}
            <LazyScrollSection delay={150} className="p-8 rounded-3xl border border-[#2e2e2e] bg-[#121212] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#898989] font-mono">
                  Plan Senior Vital (7+ Años)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#fafafa]">$69</span>
                  <span className="text-xs text-[#898989]">/ mes</span>
                </div>
                <p className="text-xs text-[#898989]">
                  Cuidados geriátricos especializados para su etapa dorada.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#b4b4b4]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Chequeo renal, hepático y cardíaco periódico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Ecografía abdominal preventiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Manejo articular y nutrición geriátrica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3ecf8e] shrink-0" />
                    <span>Atención de urgencias con 20% de descuento</span>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3 bg-[#121212] hover:bg-[#1e1e1e] text-white rounded-xl text-xs font-bold text-center transition-colors block"
              >
                Suscribir Plan Senior
              </a>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & SUCCESS STORIES */}
      <section id="testimonios" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Opiniones de Familias Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fafafa] tracking-tight">
              Lo que Dicen Quienes Confían en Nosotros
            </h2>
            <p className="text-sm text-[#898989]">
              Más de 2,500 tutores confían la vida de sus mascotas a nuestro hospital cada año.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <LazyScrollSection delay={50} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#b4b4b4] leading-relaxed italic">
                  "El Dr. Camilo salvó a Lucas tras un episodio agudo de gastritis e intoxicación. La atención
                  en urgencias fue impecable, y el resumen que me enviaron a través del sistema explicaba con
                  total claridad la dosis exacta del tratamiento."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#2e2e2e]">
                <div className="w-9 h-9 rounded-full bg-[#3ecf8e] text-[#121212] text-white flex items-center justify-center font-bold text-xs">
                  CM
                </div>
                <div>
                  <strong className="text-xs text-[#fafafa] block">Carlos Mendoza</strong>
                  <span className="text-[11px] text-[#898989]">Tutor de Lucas (Golden Retriever)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 2 */}
            <LazyScrollSection delay={100} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#b4b4b4] leading-relaxed italic">
                  "Tengo dos gatas y la Dra. Andrea es maravillosa con la medicina felina. La clínica tiene un
                  área tranquila para evitar el estrés y el carné de vacunación en el celular con código QR nos
                  facilitó viajar sin papeles extraviados."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#2e2e2e]">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  SR
                </div>
                <div>
                  <strong className="text-xs text-[#fafafa] block">Sofía Ramírez</strong>
                  <span className="text-[11px] text-[#898989]">Tutora de Luna y Mia (Siamesa y Persa)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 3 */}
            <LazyScrollSection delay={150} className="p-6 rounded-3xl border border-[#2e2e2e] bg-[#121212]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#b4b4b4] leading-relaxed italic">
                  "Poder agendar la cita desde la página y recibir confirmación inmediata nos ahorró mucho
                  tiempo. Las instalaciones son de primer nivel, limpias y el personal de recepción es
                  sumamente cálido."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#2e2e2e]">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  DA
                </div>
                <div>
                  <strong className="text-xs text-[#fafafa] block">Diego Álvarez</strong>
                  <span className="text-[11px] text-[#898989]">Tutor de Rocky (Bulldog Francés)</span>
                </div>
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
              Dudas Resueltas
            </span>
            <h2 className="text-3xl font-black text-[#fafafa] tracking-tight">
              Preguntas Frecuentes de Tutores
            </h2>
          </LazyScrollSection>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <LazyScrollSection key={idx} delay={idx * 50}>
                <div className="bg-[#121212] rounded-2xl border border-[#2e2e2e] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#fafafa] hover:text-[#3ecf8e] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-[#3ecf8e]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-[#898989]" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-[#898989] leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </LazyScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION, MAP & CONTACT SECTION */}
      <section id="contacto" className="py-20 bg-[#121212] border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <LazyScrollSection className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3ecf8e] font-mono">
                Contacto & Ubicación
              </span>
              <h2 className="text-3xl font-black text-[#fafafa] tracking-tight">
                Estamos Listos para Atenderte Cuando Más lo Necesites
              </h2>
              <p className="text-sm text-[#898989] leading-relaxed">
                Nuestra clínica cuenta con estacionamiento privado para clientes, acceso adaptado para camillas
                y sala de espera climatizada.
              </p>

              <div className="space-y-4 text-xs text-[#b4b4b4]">
                <div className="flex items-start gap-3 p-3 bg-[#121212] rounded-xl border border-[#2e2e2e]">
                  <MapPin className="w-5 h-5 text-[#3ecf8e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#fafafa] block font-semibold">Sede Principal:</strong>
                    <span>Carrera 45 # 128 - 22, Barrio Bella Suiza, Bogotá D.C., Colombia</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#121212] rounded-xl border border-[#2e2e2e]">
                  <Clock className="w-5 h-5 text-[#3ecf8e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#fafafa] block font-semibold">Horarios de Atención:</strong>
                    <span>Consultas Programadas: Lunes a Sábado de 7:00 AM a 8:00 PM</span>
                    <span className="block font-bold text-rose-600 mt-0.5">
                      🚨 Urgencias & Hospitalización: 24 Horas al Día los 365 Días
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#121212] rounded-xl border border-[#2e2e2e]">
                  <Phone className="w-5 h-5 text-[#3ecf8e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#fafafa] block font-semibold">Teléfonos y WhatsApp:</strong>
                    <span>Línea Directa Urgencias: +57 (300) 912-3456</span>
                    <span className="block">Recepción y Citas: +57 (601) 749-8020</span>
                  </div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Visual Interactive Map / Location Card */}
            <LazyScrollSection delay={100} className="lg:col-span-7">
              <div className="rounded-3xl border-2 border-[#2e2e2e] overflow-hidden shadow-xl bg-[#121212] h-96 relative flex items-center justify-center p-6 text-center">
                <img
                  src={petCareImg}
                  alt="Instalaciones exteriores de la Clínica Veterinaria San Antón"
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="relative z-10 max-w-md bg-[#121212]/95 backdrop-blur-md rounded-2xl p-6 border border-[#2e2e2e] text-[#fafafa] shadow-xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c2e24] text-[#3ecf8e] text-[#3ecf8e] mx-auto flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#fafafa]">Hospital Clínico Veterinario San Antón</h4>
                  <p className="text-xs text-[#898989]">
                    Fácil acceso vial por la Autopista Norte y Calle 127. Contamos con bahía de parqueo y
                    recepción de urgencias independiente.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#121212] hover:bg-[#1e1e1e] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Abrir en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="#agendar"
                      className="px-4 py-2 bg-[#3ecf8e] text-[#121212] hover:bg-[#00c573] text-[#121212] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Pedir Cita</span>
                    </a>
                  </div>
                </div>
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FINAL CLINICAL ERP / MEDICAL STAFF PROMO BANNER */}
      <section className="py-16 bg-linear-to-r from-slate-950 via-emerald-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3ecf8e] font-mono">
            SISTEMA HOSPITALARIO VETSOFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ¿Eres Médico Veterinario o Parte del Equipo de la Clínica?
          </h2>
          <p className="text-sm text-[#b4b4b4] max-w-xl mx-auto leading-relaxed">
            Ingresa a la plataforma integral para gestionar expedientes clínicos, registrar constantes
            vitales, dispensar inventario por lotes, facturar en POS y generar fichas médicas asistidas con IA.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterERP}
              className="px-8 py-4 bg-[#3ecf8e] text-[#121212] hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Ingresar al Sistema de Gestión Médica ERP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* QUIET PROFESSIONAL FOOTER */}
      <footer className="py-12 bg-[#121212] text-[#898989] text-xs border-t border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3ecf8e] text-[#121212] text-white flex items-center justify-center font-bold text-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200">Clínica Veterinaria San Antón</span>
              <span className="text-[#898989] block text-[10px]">
                Impulsado por el Sistema de Gestión VETSOFT & Gemini 3.8 Flash
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[#898989]">
            <a href="#servicios" className="hover:text-slate-200 transition-colors">
              Servicios
            </a>
            <a href="#agendar" className="hover:text-slate-200 transition-colors">
              Agendar Cita
            </a>
            <a href="#carne" className="hover:text-slate-200 transition-colors">
              Carné Digital
            </a>
            <a href="#equipo" className="hover:text-slate-200 transition-colors">
              Especialistas
            </a>
            <a href="#planes" className="hover:text-slate-200 transition-colors">
              Planes
            </a>
            <button onClick={onEnterERP} className="text-[#3ecf8e] font-bold hover:underline">
              Acceso ERP
            </button>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Clínica Veterinaria San Antón · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

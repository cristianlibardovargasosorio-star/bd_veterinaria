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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Images (WebP & AVIF modern next-gen formats with native fallback)
  const heroImg = '/src/assets/images/landing_vet_hero_1794425108227.webp';
  const heroImgAvif = '/src/assets/images/landing_vet_hero_1794425108227.avif';
  const heroImgJpg = '/src/assets/images/landing_vet_hero_1794425108227.jpg';

  const aiTabletImg = '/src/assets/images/landing_ai_diagnostics_1794425109106.webp';
  const aiTabletImgAvif = '/src/assets/images/landing_ai_diagnostics_1794425109106.avif';
  const aiTabletImgJpg = '/src/assets/images/landing_ai_diagnostics_1794425109106.jpg';

  const petCareImg = '/src/assets/images/landing_pet_care_1794425109279.webp';
  const petCareImgAvif = '/src/assets/images/landing_pet_care_1794425109279.avif';
  const petCareImgJpg = '/src/assets/images/landing_pet_care_1794425109279.jpg';

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

  // --- PET PORTAL & VACCINE SEARCH STATE (With Debounce & Autocomplete) ---
  const [searchPetQuery, setSearchPetQuery] = useState('Lucas');
  const [debouncedSearchPetQuery, setDebouncedSearchPetQuery] = useState('Lucas');
  const [searchedPetId, setSearchedPetId] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce effect (300ms) to prevent duplicated calls / unneeded calculations
  React.useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchPetQuery(searchPetQuery);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchPetQuery]);

  // Autocomplete matching list
  const matchingPets = React.useMemo(() => {
    if (!searchPetQuery.trim()) return mascotas.slice(0, 5);
    const q = searchPetQuery.toLowerCase();
    return mascotas.filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        (m.microchip_id && m.microchip_id.includes(q)) ||
        m.especie.toLowerCase().includes(q)
    );
  }, [mascotas, searchPetQuery]);

  // Selected pet for vaccine passport
  const selectedPet = React.useMemo(() => {
    return (
      mascotas.find(
        (m) =>
          m.id_mascota === searchedPetId ||
          m.nombre.toLowerCase().includes(debouncedSearchPetQuery.toLowerCase()) ||
          (m.microchip_id && m.microchip_id.includes(debouncedSearchPetQuery))
      ) || mascotas[0]
    );
  }, [mascotas, searchedPetId, debouncedSearchPetQuery]);

  const petOwner = propietarios.find((p) => p.id_propietario === selectedPet?.id_propietario);
  const petVaccines = historiaVacunas.filter((h) => h.id_mascota === selectedPet?.id_mascota);

  // --- AI HEALTH ASSISTANT INTERACTIVE STATE ---
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    '¡Hola! Soy el Asistente Clínico Inteligente de la Clínica Veterinaria VetSoft. Puedes consultarme dudas sobre el cuidado de tu mascota, síntomas habituales, calendario de vacunación o nutrición preventiva.'
  );

  const handleAskAI = async (customQ?: string) => {
    const questionToAsk = customQ || aiQuestion;
    if (!questionToAsk.trim()) return;

    // OPTIMISTIC UI: Instantly clear and prepare state without blocking UI
    setAiLoading(true);
    setAiResponse('');

    // Stream token-a-token Simulation or Server-Sent Events (SSE)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout prevention

      const response = await fetch('/api/ai/asistente-clinico/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          pregunta: questionToAsk,
          contexto_paciente: {
            mascota: selectedPet?.nombre || 'Mascota',
            especie: selectedPet?.especie || 'Canino',
            peso_kg: selectedPet?.peso_kg || 15,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setAiResponse(accumulated);
        }
      } else {
        throw new Error('Fallback streaming');
      }
    } catch {
      // Stream tokens locally with realistic typewriter effect (token-a-token)
      const fullText = `Orientación Veterinaria Especializada para "${questionToAsk}": Para ${selectedPet?.nombre} (${selectedPet?.especie}, ${selectedPet?.peso_kg}kg), es fundamental priorizar el bienestar y la observación continua. Si detectas temperatura superior a 39.2°C, letargo acentuado o signos gastrointestinales por más de 12 horas, acude a nuestra unidad de urgencias 24/7 (+57 300 912 3456). Nunca administres analgésicos de uso humano.`;
      
      const words = fullText.split(' ');
      let currentIdx = 0;
      let streamed = '';

      const timer = setInterval(() => {
        if (currentIdx < words.length) {
          streamed += (currentIdx === 0 ? '' : ' ') + words[currentIdx];
          setAiResponse(streamed);
          currentIdx++;
        } else {
          clearInterval(timer);
          setAiLoading(false);
        }
      }, 35);
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
      color: 'bg-[#fbe1d1] text-[#5d2a1a] border-[#cbd5e1]',
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
    <div className="min-h-screen relative bg-transparent text-[#1E293B] font-sans selection:bg-[#F0FDFA] selection:text-[#0D9488] scroll-smooth">
      <div className="relative z-10">
      {/* TOP EMERGENCY STRIP (Sleek Dark Ink Black Strip) */}
      <div className="bg-[#0F766E] text-[#a3a6af] text-xs py-2.5 px-4 border-b border-[#272a30]">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#5d2a1a] bg-[#fbe1d1] px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              Urgencias 24 Horas
            </span>
            <span className="text-[#64748B] hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[#a3a6af] text-[12px]">
              Cra. 45 # 128-22, Bogotá
            </span>
          </div>

          <a
            href="tel:+573009123456"
            className="flex items-center gap-1.5 text-[#ffffff] hover:text-[#fbe1d1] transition-colors text-[12px] whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-[#fbe1d1]" />
            <span>+57 (300) 912-3456</span>
          </a>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR — Steep Editorial Top Bar */}
      <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#cbd5e1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-[#0F766E] flex items-center justify-center text-[#ffffff] shrink-0">
              <Stethoscope size={18} className="w-[18px] h-[18px] text-[#ffffff] shrink-0" strokeWidth={2} />
            </div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-serif-editorial text-[22px] tracking-tight text-[#1E293B] leading-none">
                VetSoft
              </span>
              <span className="text-[11px] text-[#64748B] font-normal hidden sm:inline">
                Clínica Veterinaria
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-normal text-[#1E293B]">
            <a href="#servicios" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Servicios
            </a>
            <a href="#agendar" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Agendar cita
            </a>
            <a href="#carne" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Carné digital
            </a>
            <a href="#equipo" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Especialistas
            </a>
            <a href="#asistente-ia" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Asistente IA
            </a>
            <a href="#planes" className="whitespace-nowrap hover:text-[#64748B] transition-colors py-1">
              Planes
            </a>
          </nav>

          {/* Primary Action Buttons: Compact Proportional Pill Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenLogin}
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-[13px] font-normal text-[#1E293B] bg-transparent hover:bg-[#f2f2f3] border border-[#1E293B] transition-colors cursor-pointer whitespace-nowrap"
              title="Ir al Módulo 1: Login de Usuarios (/login)"
            >
              Iniciar sesión
            </button>

            <a
              href="#agendar"
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-[13px] font-normal bg-[#0F766E] text-[#ffffff] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              Reservar cita
            </a>

            <button
              onClick={onEnterERP}
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-full text-[13px] font-normal bg-[#f2f2f3] hover:bg-[#e5e5e7] text-[#1E293B] transition-colors gap-1 cursor-pointer whitespace-nowrap"
              title="Abrir el software integral de gestión clínica"
            >
              <span>ERP →</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-[#1E293B] hover:bg-[#f2f2f3] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-5 pt-2 bg-[#ffffff] border-t border-[#cbd5e1]">
            <nav className="flex flex-col space-y-1 text-[15px] text-[#1E293B]">
              {[
                { href: '#servicios', label: 'Servicios' },
                { href: '#agendar', label: 'Agendar cita' },
                { href: '#carne', label: 'Carné digital' },
                { href: '#equipo', label: 'Especialistas' },
                { href: '#asistente-ia', label: 'Asistente IA' },
                { href: '#planes', label: 'Planes' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-[16px] hover:bg-[#f2f2f3] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 pt-3 border-t border-[#cbd5e1] flex flex-col sm:hidden gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2.5 px-5 rounded-full text-sm text-[#1E293B] border border-[#1E293B] text-center cursor-pointer"
              >
                Iniciar sesión
              </button>
              <a
                href="#agendar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-5 rounded-full text-sm bg-[#0F766E] text-[#ffffff] text-center"
              >
                Reservar cita
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION — Steep Editorial Magazine Spread + Floating Product Artifacts */}
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Signifier Editorial Headline and Matched Pill Buttons */}
            <LazyScrollSection className="lg:col-span-7 space-y-6">
              <div className="text-[14px] text-[#64748B] font-normal">
                Medicina Veterinaria · Diagnóstico Asistido · Urgencias 24/7
              </div>

              <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-[72px] text-[#1E293B] tracking-[-1.5px] leading-[1.12] text-balance">
                Cuidado clínico para tu mascota con <span className="italic">ciencia, calidez</span> y precisión.
              </h1>

              <p className="text-[17px] text-[#64748B] max-w-xl leading-[1.45]">
                En la Clínica Veterinaria VetSoft integramos medicina especializada, carné digital de vacunación con validación QR y síntesis clínica asistida por inteligencia artificial.
              </p>

              {/* Matched Pill Button Pair (Filled #1E293B + Ghost #1E293B border) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#agendar"
                  className="px-6 py-3 bg-[#0F766E] text-[#ffffff] hover:opacity-90 font-normal text-[16px] rounded-full flex items-center gap-2 transition-opacity cursor-pointer"
                >
                  <span>Agendar cita en línea</span>
                </a>

                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 bg-transparent hover:bg-[#f2f2f3] text-[#1E293B] border border-[#1E293B] font-normal text-[16px] rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                  title="Acceso RF-01: Login con Spring Security y PostgreSQL"
                >
                  <span>Iniciar sesión (/login)</span>
                </button>

                <a
                  href="#carne"
                  className="px-4 py-3 text-[#1E293B] hover:underline font-normal text-[16px] flex items-center gap-1.5 transition-all"
                >
                  <span>Consultar carné digital →</span>
                </a>
              </div>

              {/* Floating Stat Artifact Row — Rich Dark Clinical Cards */}
              <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg">
                <div className="p-4 rounded-[20px] bg-[#1E293B] text-[#ffffff] border border-[#334155] shadow-md">
                  <div className="text-xl font-bold text-[#ffffff]">2,540+</div>
                  <div className="text-xs text-[#5eead4] mt-0.5">↑ 18% pacientes activos</div>
                </div>
                <div className="p-4 rounded-[20px] bg-[#134E4A] text-[#ffffff] border border-[#0F766E] shadow-md">
                  <div className="text-xl font-bold text-[#ffffff]">99.4%</div>
                  <div className="text-xs text-[#99f6e4] mt-0.5">Trazabilidad vacunal</div>
                </div>
                <div className="p-4 rounded-[20px] bg-[#5d2a1a] text-[#ffffff] border border-[#7c3a25] shadow-md">
                  <div className="text-xl font-bold text-[#fbe1d1]">24 / 7</div>
                  <div className="text-xs text-[#fbe1d1]/85 mt-0.5">Unidad crítica</div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Right Column: Clean Editorial Clinical Showcase Card */}
            <LazyScrollSection delay={150} className="lg:col-span-5 relative space-y-4">
              <div className="rounded-[24px] overflow-hidden bg-[#1E293B] border border-[#334155] shadow-lg">
                <div className="aspect-4/3 w-full overflow-hidden">
                  <picture>
                    <source srcSet={heroImgAvif} type="image/avif" />
                    <source srcSet={heroImg} type="image/webp" />
                    <img
                      src={heroImgJpg}
                      alt="Instalaciones del Hospital Veterinario VetSoft"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </picture>
                </div>
                <div className="p-5 flex items-center justify-between gap-4 bg-[#1E293B]">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5eead4]">
                      Quirófano &amp; Diagnóstico por Imagen
                    </div>
                    <div className="text-sm font-semibold text-[#ffffff] truncate mt-0.5">
                      Monitoreo multiparamétrico 24/7 en sede principal
                    </div>
                  </div>
                  <button
                    onClick={onEnterERP}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D9488] text-[#ffffff] text-xs font-medium hover:bg-[#0F766E] transition-colors cursor-pointer"
                  >
                    <span>Abrir ERP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </LazyScrollSection>
          </div>

          {/* KEY PROOF STATS BAR — Rich Dark Slate & Clinical Emerald Cards */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-[#1E293B] rounded-[20px] border border-[#334155] shadow-md text-center">
              <span className="text-3xl font-black text-[#ffffff] font-mono tabular-nums">+14,200</span>
              <span className="block text-xs font-semibold text-[#cbd5e1] mt-1.5">
                Pacientes Atendidos con Éxito
              </span>
            </div>
            <div className="p-6 bg-[#134E4A] rounded-[20px] border border-[#0F766E] shadow-md text-center">
              <span className="text-3xl font-black text-[#5eead4] font-mono tabular-nums">24 / 7</span>
              <span className="block text-xs font-semibold text-[#ccfbf1] mt-1.5">
                Urgencias &amp; Cuidados Críticos
              </span>
            </div>
            <div className="p-6 bg-[#1E293B] rounded-[20px] border border-[#334155] shadow-md text-center">
              <span className="text-3xl font-black text-[#ffffff] font-mono tabular-nums">100%</span>
              <span className="block text-xs font-semibold text-[#cbd5e1] mt-1.5">
                Vacunas con Lote Trazable
              </span>
            </div>
            <div className="p-6 bg-[#5d2a1a] rounded-[20px] border border-[#7c3a25] shadow-md text-center">
              <span className="text-3xl font-black text-[#fbe1d1] font-mono tabular-nums">IA Dual</span>
              <span className="block text-xs font-semibold text-[#fbe1d1]/85 mt-1.5">
                Fichas Claras para Tutores
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL SERVICES CATALOG */}
      <section id="servicios" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Especialidades y Procedimientos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Servicios Clínicos de Alta Calidad para tu Mascota
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
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
                  className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 hover:bg-[#ffffff] hover:border-[#cbd5e1] hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-bold border ${svc.color} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f2f3] text-[#64748B] font-mono">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1E293B] leading-snug group-hover:text-[#5d2a1a] transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-[#64748B] leading-relaxed">{svc.desc}</p>
                  </div>

                  <a
                    href="#agendar"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5d2a1a] hover:text-[#5d2a1a] transition-colors pt-2 border-t border-slate-100"
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
      <section id="agendar" className="py-20 bg-[#f2f2f3]/75 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Context Column */}
            <LazyScrollSection className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
                Agendamiento Online Inmediato
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
                Reserva la Cita Médica de tu Mascota en Minutos
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Selecciona la especialidad médica, el veterinario tratante, la fecha y la hora de tu
                preferencia. Tu cita quedará registrada automáticamente en el sistema clínico del hospital.
              </p>

              <div className="p-5 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#1E293B] block">Confirmación en Tiempo Real</strong>
                    <span className="text-[#64748B]">
                      Sin tiempos de espera telefónicos. Recibes tu número de radicado al instante.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#1E293B] block">Historial Clínico Digital</strong>
                    <span className="text-[#64748B]">
                      Todos los datos de la consulta se asocian de por vida al expediente de tu mascota.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 font-bold" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#1E293B] block">¿Es una Emergencia Grave?</strong>
                    <span className="text-[#64748B]">
                      Si tu mascota está inconsciente o convulsionando, tráela de inmediato sin cita previa a
                      Urgencias 24h.
                    </span>
                  </div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Right Booking Form */}
            <LazyScrollSection delay={100} className="lg:col-span-7">
              <div className="bg-[#ffffff] rounded-[24px] border-2 border-[#cbd5e1] p-6 sm:p-8 shadow-xl">
                {bookingSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#fbe1d1] text-[#5d2a1a] mx-auto flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#5d2a1a] bg-[#fbe1d1] text-[#5d2a1a] px-3 py-1 rounded-full">
                        CITA AGENDADA CON ÉXITO #RAD-{bookingSuccess.idCita}
                      </span>
                      <h3 className="text-2xl font-black text-[#1E293B] pt-2">
                        ¡Cita Confirmada para {bookingSuccess.pet}!
                      </h3>
                      <p className="text-sm text-[#64748B] max-w-md mx-auto">
                        Hemos registrado tu cita con el <strong>{bookingSuccess.vet}</strong> para el día{' '}
                        <strong>{bookingSuccess.dateTime}</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] max-w-md mx-auto text-xs text-left space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Paciente:</span>
                        <span className="font-bold text-[#1E293B]">{bookingSuccess.pet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Tutor:</span>
                        <span className="font-bold text-[#1E293B]">{bookingSuccess.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Veterinario Asignado:</span>
                        <span className="font-bold text-[#5d2a1a]">{bookingSuccess.vet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Fecha y Hora:</span>
                        <span className="font-bold text-[#1E293B]">{bookingSuccess.dateTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Sede:</span>
                        <span className="font-bold text-[#1E293B]">Hospital VetSoft Bogotá</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setBookingSuccess(null)}
                        className="px-5 py-2.5 bg-[#f2f2f3] hover:bg-[#f2f2f3] text-[#1E293B] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Agendar otra cita
                      </button>

                      <button
                        onClick={onEnterERP}
                        className="px-5 py-2.5 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Ver cita en el Sistema ERP →
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-[#1E293B]">Formulario de Reserva Médica</h3>
                      <p className="text-[#64748B] text-[11px]">
                        Ingresa los datos para apartar el turno médico de tu mascota.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">
                          Nombre del Tutor / Propietario *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingOwnerName}
                          onChange={(e) => setBookingOwnerName(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">
                          Teléfono de Contacto (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="+57 310 123 4567"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">
                          Nombre de la Mascota *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingPetName}
                          onChange={(e) => setBookingPetName(e.target.value)}
                          placeholder="Ej. Lucas, Max, Luna"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">Especie</label>
                        <select
                          value={bookingEspecie}
                          onChange={(e) => setBookingEspecie(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
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
                        <label className="font-bold text-[#64748B] block mb-1">
                          Tipo de Servicio / Cita
                        </label>
                        <select
                          value={bookingType}
                          onChange={(e) => setBookingType(e.target.value as TipoCita)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff] font-medium"
                        >
                          <option value="CONSULTA">Consulta General Preventiva</option>
                          <option value="VACUNACION">Vacunación & Desparasitación</option>
                          <option value="CONTROL">Control Postoperatorio</option>
                          <option value="URGENCIA">Urgencia Médica Prioritaria</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">
                          Médico Veterinario Especialista
                        </label>
                        <select
                          value={bookingVetId}
                          onChange={(e) => setBookingVetId(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff] font-medium"
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
                        <label className="font-bold text-[#64748B] block mb-1">Fecha Deseada</label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#64748B] block mb-1">Hora Estimada</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff]"
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
                      <label className="font-bold text-[#64748B] block mb-1">
                        Motivo de la Consulta o Síntomas Notados
                      </label>
                      <textarea
                        rows={2}
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        placeholder="Ej. Chequeo semestral, decaimiento leve, vacunas anuales pendientes..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e2e5] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-[#ffffff] text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] font-black text-sm rounded-xl shadow-lg  transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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
      <section id="carne" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Portal del Paciente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Carné Digital de Vacunación & Historial Médico
            </h2>
            <p className="text-sm text-[#64748B]">
              ¿Tu mascota ya es paciente de la Clínica VetSoft? Consulta al instante su estado vacunal,
              próximos refuerzos y pasaporte oficial con código QR.
            </p>

            {/* Debounced Search Input with Autocomplete Dropdown */}
            <div className="max-w-md mx-auto relative pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchPetQuery}
                  onChange={(e) => setSearchPetQuery(e.target.value)}
                  placeholder="Buscar por nombre, especie o microchip..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-full bg-[#f2f2f3] border border-[#e2e2e5] focus:border-[#1E293B] text-xs text-[#1E293B] placeholder-[#898989] outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-[#64748B] font-mono">
                  {isSearching ? (
                    <span className="text-[#5d2a1a] animate-pulse">Buscando...</span>
                  ) : (
                    <span>Debounce 300ms</span>
                  )}
                </div>
              </div>

              {/* Autocomplete suggestions pill preview */}
              {matchingPets.length > 0 && searchPetQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-1 bg-[#f2f2f3] border border-[#cbd5e1] rounded-[12px] p-2 z-30 shadow-2xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-[#64748B] px-2 py-1">
                    Resultados de Autocompletado:
                  </div>
                  {matchingPets.slice(0, 4).map((pet) => (
                    <button
                      key={pet.id_mascota}
                      type="button"
                      onClick={() => {
                        setSearchedPetId(pet.id_mascota);
                        setSearchPetQuery(pet.nombre);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-[8px] hover:bg-[#f2f2f3] text-xs flex items-center justify-between text-[#1E293B] transition-colors cursor-pointer"
                    >
                      <span className="font-medium">🐾 {pet.nombre} ({pet.especie} - {pet.raza})</span>
                      <span className="text-[10px] font-mono text-[#5d2a1a]">ID: #{pet.id_mascota}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick pet search chips */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[#64748B] font-semibold">Pacientes de demostración:</span>
              {mascotas.slice(0, 5).map((m) => (
                <button
                  key={m.id_mascota}
                  onClick={() => {
                    setSearchedPetId(m.id_mascota);
                    setSearchPetQuery(m.nombre);
                  }}
                  className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                    selectedPet?.id_mascota === m.id_mascota
                      ? 'bg-[#0F766E] text-[#ffffff] border-emerald-600 shadow-sm'
                      : 'bg-[#f2f2f3] text-[#64748B] border-[#cbd5e1] hover:bg-[#f2f2f3]'
                  }`}
                >
                  🐾 {m.nombre} ({m.especie})
                </button>
              ))}
            </div>
          </LazyScrollSection>

          {/* Digital Vaccine Card Display */}
          <LazyScrollSection className="max-w-4xl mx-auto">
            <div className="bg-linear-to-br from-white to-slate-50 rounded-[24px] border-2 border-[#cbd5e1] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd5e1] pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[20px] bg-linear-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl shadow-md">
                    {selectedPet?.especie.toLowerCase().includes('fel') ? '🐱' : '🐶'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-[#1E293B]">{selectedPet?.nombre}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fbe1d1] text-[#5d2a1a]">
                        {selectedPet?.estado_salud}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] font-mono">
                      Expediente: {selectedPet?.codigo_expediente} · Microchip:{' '}
                      {selectedPet?.microchip_id || '941000028192'}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Raza: <strong>{selectedPet?.raza}</strong> · Peso: <strong>{selectedPet?.peso_kg} kg</strong> ·
                      Tutor:{' '}
                      <strong>
                        {petOwner?.nombres} {petOwner?.apellidos}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] text-center shrink-0 self-start sm:self-auto shadow-xs">
                  <QrCode className="w-16 h-16 mx-auto text-[#1E293B]" />
                  <span className="text-[10px] font-mono text-[#64748B] block mt-1 font-bold">
                    VALIDACIÓN QR OFICIAL
                  </span>
                </div>
              </div>

              {/* Vaccine records table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#5d2a1a]" />
                    <span>Inmunizaciones Registradas en la Clínica</span>
                  </h4>
                  <span className="text-xs text-[#64748B] font-mono">
                    {petVaccines.length} Dosis Aplicadas
                  </span>
                </div>

                {petVaccines.length === 0 ? (
                  <div className="p-6 bg-[#ffffff] rounded-[20px] text-center text-xs text-[#64748B] border border-[#cbd5e1]">
                    No hay dosis registradas en este expediente clínico.
                  </div>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#cbd5e1] text-[#64748B] font-mono">
                          <th className="py-2.5 font-bold">Biológico / Vacuna</th>
                          <th className="py-2.5">Lote Oficial</th>
                          <th className="py-2.5">Fecha Aplicación</th>
                          <th className="py-2.5 font-bold text-[#5d2a1a]">Próximo Refuerzo</th>
                          <th className="py-2.5 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {petVaccines.map((v, i) => {
                          const catVac = vacunas.find((vac) => vac.id_vacuna === v.id_vacuna);
                          return (
                            <tr key={i} className="hover:bg-[#fbe1d1] text-[#5d2a1a]/40 transition-colors">
                              <td className="py-3 font-bold text-[#1E293B]">
                                {catVac?.nombre || 'Vacuna Inmunizante'}
                                <span className="block text-[10px] font-normal text-[#64748B] font-mono">
                                  {catVac?.marca || 'Marca Certificada'}
                                </span>
                              </td>
                              <td className="py-3 font-mono text-[#64748B]">{v.lote}</td>
                              <td className="py-3 font-mono text-[#64748B]">{v.fecha_aplicacion}</td>
                              <td className="py-3 font-mono font-bold text-[#5d2a1a]">
                                {v.fecha_refuerzo || 'Anual'}
                              </td>
                              <td className="py-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fbe1d1] text-[#5d2a1a]">
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
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#cbd5e1] text-xs">
                <span className="text-[#64748B] text-center sm:text-left">
                  Certificado bajo estándar médico veterinario nacional y normas de sanidad animal.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(
                        `Descargando pasaporte sanitario oficial de ${selectedPet?.nombre} en formato PDF.`
                      );
                    }}
                    className="px-4 py-2 bg-[#f2f2f3] hover:bg-[#f2f2f3] text-[#1E293B] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Descargar Certificado PDF
                  </button>
                  <button
                    onClick={onEnterERP}
                    className="px-4 py-2 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Abrir Carné en el ERP →
                  </button>
                </div>
              </div>
            </div>
          </LazyScrollSection>
        </div>
      </section>

      {/* AI VIRTUAL HEALTH ASSISTANT FOR PET PARENTS — Steep Light Editorial Section */}
      <section id="asistente-ia" className="py-20 bg-[#f1f5f9]/90 border-b border-[#cbd5e1] text-[#1E293B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <LazyScrollSection className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tecnología Gemini 3.8 Flash para Familias</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-[44px] font-normal tracking-[-0.66px] text-[#1E293B] leading-[1.2]">
              Asistente Clínico Inteligente para Dudas de Salud
            </h2>
            <p className="text-[17px] text-[#64748B] max-w-2xl mx-auto">
              ¿Notas un comportamiento inusual o tienes dudas sobre la nutrición o calendario preventivo de tu
              mascota? Consulta a nuestro asistente entrenado en medicina veterinaria.
            </p>
          </LazyScrollSection>

          {/* Interactive AI Widget */}
          <LazyScrollSection delay={80} className="bg-[#f2f2f3] rounded-[24px] border border-[#cbd5e1] p-6 sm:p-8 space-y-6">
            {/* Visual showcase with AI tablet image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-[#cbd5e1] pb-6">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[11px] font-mono text-[#5d2a1a] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fbe1d1]">
                  Gemini 3.8 Streaming Token a Token
                </span>
                <h3 className="text-lg font-medium text-[#1E293B]">Diagnóstico Clínico Asistido por Inteligencia Artificial</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Algoritmos clínicos entrenados para orientación médica inmediata, cálculo posológico seguro y triaje preventivo 24/7 sin latencia.
                </p>
              </div>
              <div className="md:col-span-4 rounded-[12px] overflow-hidden border border-[#cbd5e1] h-32 relative">
                <picture>
                  <source srcSet={aiTabletImgAvif} type="image/avif" />
                  <source srcSet={aiTabletImg} type="image/webp" />
                  <img
                    src={aiTabletImgJpg}
                    alt="Tableta médica con telemetría veterinaria e IA diagnóstica"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              </div>
            </div>

            {/* Quick question prompt pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#64748B] font-medium">Consultas frecuentes:</span>
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
                  className="px-3.5 py-1.5 rounded-full bg-[#ffffff] hover:bg-[#fbe1d1] border border-[#cbd5e1] text-[#1E293B] hover:text-[#5d2a1a] text-xs font-normal transition-colors text-left cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* AI Response Display */}
            <div className="p-5 rounded-[20px] bg-[#ffffff] border border-[#cbd5e1] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[#cbd5e1] pb-2">
                <div className="flex items-center gap-2 text-[#5d2a1a] font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Respuesta del Asistente Clínico VETSOFT</span>
                </div>
                <span className="text-[#979799] font-mono text-[11px]">Motor Gemini 3.8 Flash</span>
              </div>

              {aiLoading ? (
                <div className="py-6 flex items-center justify-center gap-3 text-[#64748B] text-xs animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-[#5d2a1a] border-t-transparent animate-spin" />
                  <span>Analizando consulta y literatura veterinaria...</span>
                </div>
              ) : (
                <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-line">
                  {aiResponse}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1 text-[#64748B]">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#5d2a1a]" />
                  La orientación virtual complementa, pero no sustituye el examen clínico presencial.
                </span>
                <a href="#agendar" className="text-[#1E293B] hover:underline">
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
                className="flex-1 px-4 py-3 bg-[#ffffff] rounded-[16px] border border-[#cbd5e1] text-[#1E293B] placeholder:text-[#a3a6af] text-sm focus:border-[#5d2a1a] focus:outline-none"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading}
                className="px-6 py-3 bg-[#0F766E] text-[#ffffff] hover:bg-[#115E59] disabled:opacity-50 font-normal text-sm rounded-full transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Consultar</span>
              </button>
            </div>
          </LazyScrollSection>
        </div>
      </section>

      {/* MEDICAL TEAM / SPECIALISTS */}
      <section id="equipo" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Cuerpo Médico Especialista
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Veterinarios con Vocación, Rigor y Experiencia
            </h2>
            <p className="text-sm text-[#64748B]">
              Nuestro equipo cuenta con especializaciones médico-quirúrgicas avaladas y continua formación
              clínica.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vet 1: Dr. Camilo */}
            <LazyScrollSection delay={50} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 hover:bg-[#ffffff] hover:border-[#cbd5e1] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-[#0F766E] text-[#ffffff] flex items-center justify-center text-xl font-bold shadow-md">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Dr. Camilo Restrepo</h3>
                  <span className="text-xs font-bold text-[#5d2a1a] block">
                    Cirugía de Tejidos Blandos & Urgencias
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B]">TP: 19823-VET · 12 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Director médico del hospital. Especialista en intervenciones quirúrgicas complejas, manejo de
                pacientes politraumatizados y medicina interna avanzada.
              </p>

              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1] text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Horario de consulta:</span>
                  <strong>Lunes a Viernes</strong>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Atención quirúrgica:</span>
                  <strong className="text-[#5d2a1a]">Programada y Urgencias</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:opacity-90 text-[#ffffff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con el Dr. Camilo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>

            {/* Vet 2: Dra. Andrea */}
            <LazyScrollSection delay={100} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 hover:bg-[#ffffff] hover:border-[#cbd5e1] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Dra. Andrea Morales</h3>
                  <span className="text-xs font-bold text-teal-700 block">
                    Medicina Felina & Dermatología
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B]">TP: 21450-VET · 9 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Especialista en etología y medicina amigable con los gatos (Cat Friendly Practice), diagnóstico
                de dermatitis alérgicas complejas y planes de longevidad felina.
              </p>

              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1] text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Horario de consulta:</span>
                  <strong>Martes a Sábado</strong>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Especialidad:</span>
                  <strong className="text-teal-700">Gatos y Dermatología Canina</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:opacity-90 text-[#ffffff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con la Dra. Andrea</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>

            {/* Vet 3: Dra. Mariana */}
            <LazyScrollSection delay={150} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 hover:bg-[#ffffff] hover:border-[#cbd5e1] hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Dra. Mariana Gómez</h3>
                  <span className="text-xs font-bold text-indigo-700 block">
                    Cardiología & Diagnóstico por Imagen
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B]">TP: 24119-VET · 8 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Experta en ecocardiografía Doppler color, monitoreo electrocardiográfico Holter y detección
                temprana de patologías cardiorrespiratorias en pacientes geriátricos.
              </p>

              <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1] text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Horario de consulta:</span>
                  <strong>Lunes, Miércoles y Viernes</strong>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Especialidad:</span>
                  <strong className="text-indigo-700">Ecografía y Cardiología</strong>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:opacity-90 text-[#ffffff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Agendar con la Dra. Mariana</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* HEALTH PLANS & PREVENTIVE SUBSCRIPTIONS */}
      <section id="planes" className="py-20 bg-[#f2f2f3]/75 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Planes de Salud Preventiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Protección Integral Todo el Año para tu Compañero
            </h2>
            <p className="text-sm text-[#64748B]">
              Membresías diseñadas para cuidar su bienestar continuo sin gastos imprevistos.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1: Cachorro */}
            <LazyScrollSection delay={50} className="p-8 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
                  Plan Cachorro / Gatito
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#1E293B]">$35</span>
                  <span className="text-xs text-[#64748B]">/ mes</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Para cachorros y gatitos hasta los 12 meses de edad.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Esquema completo de vacunación inicial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Desparasitación interna cada mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Carné digital con código QR oficial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>3 Consultas pediátricas gratuitas al año</span>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3 bg-[#f2f2f3] hover:bg-[#f2f2f3] text-[#1E293B] rounded-xl text-xs font-bold text-center transition-colors block"
              >
                Suscribir Plan Cachorro
              </a>
            </LazyScrollSection>

            {/* Plan 2: Adulto Total (Featured) */}
            <LazyScrollSection delay={100} className="p-8 rounded-[24px] border-2 border-[#1E293B] bg-linear-to-b from-emerald-50/50 via-white to-white flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0F766E] text-[#ffffff] text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                Más Recomendado por Veterinarios
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
                  Plan Salud Total Adulto
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#1E293B]">$49</span>
                  <span className="text-xs text-[#64748B]">/ mes</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Cobertura preventiva total para perros y gatos entre 1 y 7 años.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Todas las vacunas anuales de refuerzo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Examen sanguíneo de rutina semestral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>1 Limpieza dental con ultrasonido al año</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <strong className="text-emerald-900">Consultas ilimitadas de medicina general</strong>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3.5 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] rounded-xl text-xs font-bold text-center shadow-md  transition-all block"
              >
                Suscribir Salud Total
              </a>
            </LazyScrollSection>

            {/* Plan 3: Senior Care */}
            <LazyScrollSection delay={150} className="p-8 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff] flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
                  Plan Senior Vital (7+ Años)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#1E293B]">$69</span>
                  <span className="text-xs text-[#64748B]">/ mes</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Cuidados geriátricos especializados para su etapa dorada.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Chequeo renal, hepático y cardíaco periódico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Ecografía abdominal preventiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Manejo articular y nutrición geriátrica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a1a] shrink-0" />
                    <span>Atención de urgencias con 20% de descuento</span>
                  </div>
                </div>
              </div>

              <a
                href="#agendar"
                className="w-full py-3 bg-[#0F766E] hover:opacity-90 text-[#ffffff] rounded-xl text-xs font-bold text-center transition-colors block"
              >
                Suscribir Plan Senior
              </a>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & SUCCESS STORIES */}
      <section id="testimonios" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Opiniones de Familias Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Lo que Dicen Quienes Confían en Nosotros
            </h2>
            <p className="text-sm text-[#64748B]">
              Más de 2,500 tutores confían la vida de sus mascotas a nuestro hospital cada año.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <LazyScrollSection delay={50} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed italic">
                  "El Dr. Camilo salvó a Lucas tras un episodio agudo de gastritis e intoxicación. La atención
                  en urgencias fue impecable, y el resumen que me enviaron a través del sistema explicaba con
                  total claridad la dosis exacta del tratamiento."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#cbd5e1]">
                <div className="w-9 h-9 rounded-full bg-[#0F766E] text-[#ffffff] flex items-center justify-center font-bold text-xs">
                  CM
                </div>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Carlos Mendoza</strong>
                  <span className="text-[11px] text-[#64748B]">Tutor de Lucas (Golden Retriever)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 2 */}
            <LazyScrollSection delay={100} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed italic">
                  "Tengo dos gatas y la Dra. Andrea es maravillosa con la medicina felina. La clínica tiene un
                  área tranquila para evitar el estrés y el carné de vacunación en el celular con código QR nos
                  facilitó viajar sin papeles extraviados."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#cbd5e1]">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  SR
                </div>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Sofía Ramírez</strong>
                  <span className="text-[11px] text-[#64748B]">Tutora de Luna y Mia (Siamesa y Persa)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 3 */}
            <LazyScrollSection delay={150} className="p-6 rounded-[24px] border border-[#cbd5e1] bg-[#ffffff]/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed italic">
                  "Poder agendar la cita desde la página y recibir confirmación inmediata nos ahorró mucho
                  tiempo. Las instalaciones son de primer nivel, limpias y el personal de recepción es
                  sumamente cálido."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#cbd5e1]">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  DA
                </div>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Diego Álvarez</strong>
                  <span className="text-[11px] text-[#64748B]">Tutor de Rocky (Bulldog Francés)</span>
                </div>
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
              Dudas Resueltas
            </span>
            <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">
              Preguntas Frecuentes de Tutores
            </h2>
          </LazyScrollSection>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <LazyScrollSection key={idx} delay={idx * 50}>
                <div className="bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1E293B] hover:text-[#5d2a1a] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-[#5d2a1a]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-[#64748B]" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
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
      <section id="contacto" className="py-20 bg-[#ffffff]/60 backdrop-blur-[1px] border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <LazyScrollSection className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5d2a1a] font-mono">
                Contacto & Ubicación
              </span>
              <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">
                Estamos Listos para Atenderte Cuando Más lo Necesites
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Nuestra clínica cuenta con estacionamiento privado para clientes, acceso adaptado para camillas
                y sala de espera climatizada.
              </p>

              <div className="space-y-4 text-xs text-[#64748B]">
                <div className="flex items-start gap-3 p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <MapPin className="w-5 h-5 text-[#5d2a1a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E293B] block font-semibold">Sede Principal:</strong>
                    <span>Carrera 45 # 128 - 22, Barrio Bella Suiza, Bogotá D.C., Colombia</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <Clock className="w-5 h-5 text-[#5d2a1a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E293B] block font-semibold">Horarios de Atención:</strong>
                    <span>Consultas Programadas: Lunes a Sábado de 7:00 AM a 8:00 PM</span>
                    <span className="block font-bold text-rose-600 mt-0.5">
                      🚨 Urgencias & Hospitalización: 24 Horas al Día los 365 Días
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <Phone className="w-5 h-5 text-[#5d2a1a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E293B] block font-semibold">Teléfonos y WhatsApp:</strong>
                    <span>Línea Directa Urgencias: +57 (300) 912-3456</span>
                    <span className="block">Recepción y Citas: +57 (601) 749-8020</span>
                  </div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Visual Interactive Map / Location Card */}
            <LazyScrollSection delay={100} className="lg:col-span-7">
              <div className="rounded-[24px] border border-[#cbd5e1] overflow-hidden bg-[#ffffff] h-96 relative flex items-center justify-center p-6 text-center">
                <picture className="absolute inset-0 w-full h-full">
                  <source srcSet={petCareImgAvif} type="image/avif" />
                  <source srcSet={petCareImg} type="image/webp" />
                  <img
                    src={petCareImgJpg}
                    alt="Instalaciones exteriores de la Clínica Veterinaria VetSoft"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-25"
                  />
                </picture>
                <div className="relative z-10 max-w-md bg-[#ffffff]/95 backdrop-blur-md rounded-[24px] p-6 border border-[#cbd5e1] text-[#1E293B] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fbe1d1] text-[#5d2a1a] mx-auto flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#1E293B]">Hospital Clínico Veterinario VetSoft</h4>
                  <p className="text-xs text-[#64748B]">
                    Fácil acceso vial por la Autopista Norte y Calle 127. Contamos con bahía de parqueo y
                    recepción de urgencias independiente.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#0F766E] hover:opacity-90 text-[#ffffff] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Abrir en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="#agendar"
                      className="px-4 py-2 bg-[#0F766E] text-[#ffffff] hover:bg-[#0F766E] text-[#ffffff] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
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

      {/* FINAL CLINICAL ERP / MEDICAL STAFF PROMO BANNER — Steep Accent Peach Card */}
      <section className="py-20 bg-[#ffffff] border-b border-[#cbd5e1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-[#fbe1d1] text-[#5d2a1a] p-8 sm:p-12 text-center space-y-5">
            <span className="text-xs font-medium uppercase tracking-widest text-[#5d2a1a] font-mono">
              SISTEMA HOSPITALARIO VETSOFT
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-[44px] font-normal tracking-[-0.66px] text-[#5d2a1a] leading-[1.2]">
              ¿Eres Médico Veterinario o Parte del Equipo de la Clínica?
            </h2>
            <p className="text-[17px] text-[#5d2a1a]/85 max-w-xl mx-auto leading-relaxed">
              Ingresa a la plataforma integral para gestionar expedientes clínicos, registrar constantes
              vitales, dispensar inventario por lotes, facturar en POS y generar fichas médicas asistidas con IA.
            </p>

            <div className="pt-2">
              <button
                onClick={onEnterERP}
                className="px-7 py-3.5 bg-[#0F766E] hover:bg-[#115E59] text-[#ffffff] font-normal text-[16px] rounded-full inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Ingresar al Sistema de Gestión Médica ERP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DARK INK BLACK EDITORIAL FOOTER */}
      <footer className="py-12 bg-[#0F766E] text-[#a3a6af] text-xs border-t border-[#272a30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fbe1d1] text-[#5d2a1a] flex items-center justify-center font-bold text-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#ffffff]">Clínica Veterinaria VetSoft</span>
              <span className="text-[#a3a6af] block text-[10px]">
                Impulsado por el Sistema de Gestión VETSOFT &amp; Gemini 3.8 Flash
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[#a3a6af]">
            <a href="#servicios" className="hover:text-[#ffffff] transition-colors">
              Servicios
            </a>
            <a href="#agendar" className="hover:text-[#ffffff] transition-colors">
              Agendar Cita
            </a>
            <a href="#carne" className="hover:text-[#ffffff] transition-colors">
              Carné Digital
            </a>
            <a href="#equipo" className="hover:text-[#ffffff] transition-colors">
              Especialistas
            </a>
            <a href="#planes" className="hover:text-[#ffffff] transition-colors">
              Planes
            </a>
            <button onClick={onEnterERP} className="text-[#fbe1d1] font-bold hover:underline cursor-pointer">
              Acceso ERP →
            </button>
          </div>

          <div className="text-center md:text-right text-[#a3a6af]">
            <span>© {new Date().getFullYear()} Clínica Veterinaria VetSoft · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

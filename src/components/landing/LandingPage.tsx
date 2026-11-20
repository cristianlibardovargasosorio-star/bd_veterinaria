import React, { useState } from 'react';
import { LazyScrollSection } from '../common/LazyScrollSection';
import { SkeletonCard, SkeletonKPI, SkeletonTable } from '../common/Skeleton';
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
import { ProtectedRoutePath } from '../../utils/rbac';

interface LandingPageProps {
  onEnterERP: () => void;
  onOpenLogin: () => void;
  onProtectedAction?: (route: ProtectedRoutePath) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterERP,
  onOpenLogin,
  onProtectedAction,
}) => {
  const triggerProtected = (route: ProtectedRoutePath, fallback: () => void) => {
    if (onProtectedAction) {
      onProtectedAction(route);
    } else {
      fallback();
    }
  };

  const [showSkeletonMode, setShowSkeletonMode] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'ia' | 'carne' | 'lotes' | 'pos'>('ia');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Images (WebP & AVIF modern next-gen formats with native fallback)
  const heroImg = '/src/assets/images/landing_vet_hero_1794425108227.webp';
  const heroImgAvif = '/src/assets/images/landing_vet_hero_1794425108227.avif';
  const heroImgJpg = '/src/assets/images/landing_vet_hero_1794425108227.jpg';

  const petCareImg = '/src/assets/images/landing_pet_care_1794425109279.webp';
  const petCareImgAvif = '/src/assets/images/landing_pet_care_1794425109279.avif';
  const petCareImgJpg = '/src/assets/images/landing_pet_care_1794425109279.jpg';

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
      color: 'bg-vet-ice text-vet-navy border-vet-border',
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
      color: 'bg-vet-ice text-vet-navy border-vet-border',
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
    <div className="min-h-screen relative bg-transparent text-vet-navy font-sans selection:bg-vet-emerald/15 selection:text-vet-navy scroll-smooth">
      <div className="relative z-10">
      {/* TOP EMERGENCY STRIP (Carbón sereno #1E293B para enmarcar el portal con buen contraste) */}
      <div className="bg-brand-elevated text-slate-200 text-xs py-2.5 px-4 border-b border-slate-700">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white bg-brand px-2.5 py-0.5 rounded-full text-[11px] border border-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-action-mint" />
              Urgencias 24 Horas
            </span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-slate-200 text-[12px]">
              Cra. 45 # 128-22, Bogotá
            </span>
          </div>

          <a
            href="tel:+573009123456"
            className="flex items-center gap-1.5 text-white font-semibold hover:text-action-mint transition-colors text-[12px] whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-action-mint" />
            <span>+57 (300) 912-3456</span>
          </a>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR — Steep Editorial Top Bar */}
      <header className="sticky top-0 z-50 bg-vet-surface/95 backdrop-blur-md border-b border-vet-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-vet-navy flex items-center justify-center text-white shrink-0">
              <Stethoscope size={18} className="w-[18px] h-[18px] text-white shrink-0" strokeWidth={2} />
            </div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-serif-editorial text-[22px] tracking-tight text-vet-navy leading-none">
                VetSoft
              </span>
              <span className="text-[11px] text-vet-muted font-normal hidden sm:inline">
                Clínica Veterinaria
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-normal text-vet-navy">
            <a href="#servicios" className="whitespace-nowrap hover:text-vet-muted transition-colors py-1">
              Servicios
            </a>
            <button
              type="button"
              onClick={() => triggerProtected('/citas', onOpenLogin)}
              className="whitespace-nowrap hover:text-vet-muted transition-colors py-1 cursor-pointer"
            >
              Agendar cita
            </button>
            <button
              type="button"
              onClick={() => triggerProtected('/carne-vacunacion', onOpenLogin)}
              className="whitespace-nowrap hover:text-vet-muted transition-colors py-1 cursor-pointer"
            >
              Carné digital
            </button>
            <a href="#equipo" className="whitespace-nowrap hover:text-vet-muted transition-colors py-1">
              Especialistas
            </a>
            <a href="#planes" className="whitespace-nowrap hover:text-vet-muted transition-colors py-1">
              Planes
            </a>
          </nav>

          {/* Primary Action Buttons: Compact Proportional Pill Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenLogin}
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-[13px] font-normal text-vet-navy bg-transparent hover:bg-vet-ice border border-vet-navy transition-colors cursor-pointer whitespace-nowrap"
              title="Ir al Módulo 1: Login de Usuarios (/login)"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => triggerProtected('/citas', onOpenLogin)}
              className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-[13px] font-normal bg-vet-emerald hover:bg-vet-emerald-hover text-white transition-opacity cursor-pointer whitespace-nowrap"
            >
              Reservar cita
            </button>

            <button
              type="button"
              onClick={() => triggerProtected('/erp', onEnterERP)}
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-full text-[13px] font-normal bg-vet-ice hover:bg-[#e5e5e7] text-vet-navy transition-colors gap-1 cursor-pointer whitespace-nowrap"
              title="Abrir el software integral de gestión clínica"
            >
              <span>ERP →</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-vet-navy hover:bg-vet-ice transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-5 pt-2 bg-vet-surface border-t border-vet-border">
            <nav className="flex flex-col space-y-1 text-[15px] text-vet-navy">
              <a
                href="#servicios"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-[16px] hover:bg-vet-ice transition-colors"
              >
                Servicios
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerProtected('/citas', onOpenLogin);
                }}
                className="px-4 py-2.5 rounded-[16px] hover:bg-vet-ice transition-colors text-left cursor-pointer"
              >
                Agendar cita
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerProtected('/carne-vacunacion', onOpenLogin);
                }}
                className="px-4 py-2.5 rounded-[16px] hover:bg-vet-ice transition-colors text-left cursor-pointer"
              >
                Carné digital
              </button>
              <a
                href="#equipo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-[16px] hover:bg-vet-ice transition-colors"
              >
                Especialistas
              </a>
              <a
                href="#planes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-[16px] hover:bg-vet-ice transition-colors"
              >
                Planes
              </a>
            </nav>

            <div className="mt-4 pt-3 border-t border-vet-border flex flex-col sm:hidden gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2.5 px-5 rounded-full text-sm text-vet-navy border border-vet-navy text-center cursor-pointer"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerProtected('/citas', onOpenLogin);
                }}
                className="w-full py-2.5 px-5 rounded-full text-sm bg-vet-emerald text-white text-center cursor-pointer"
              >
                Reservar cita
              </button>
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
              <div className="text-[14px] text-vet-muted font-normal">
                Medicina Veterinaria · Diagnóstico Asistido · Urgencias 24/7
              </div>

              <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-[72px] text-vet-navy tracking-[-1.5px] leading-[1.12] text-balance">
                Cuidado clínico para tu mascota con <span className="italic">ciencia, calidez</span> y precisión.
              </h1>

              <p className="text-[17px] text-vet-muted max-w-xl leading-[1.45]">
                En la Clínica Veterinaria VetSoft integramos medicina especializada, carné digital de vacunación con validación QR y síntesis clínica asistida por inteligencia artificial.
              </p>

              {/* Matched Pill Button Pair (Filled #0f172a + Ghost #0f172a border) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => triggerProtected('/citas', onOpenLogin)}
                  className="px-6 py-3 bg-vet-emerald hover:bg-vet-emerald-hover text-white font-normal text-[16px] rounded-full flex items-center gap-2 transition-opacity cursor-pointer"
                >
                  <span>Agendar cita en línea</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 bg-transparent hover:bg-vet-ice text-vet-navy border border-vet-navy font-normal text-[16px] rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                  title="Acceso RF-01: Login con Spring Security y PostgreSQL"
                >
                  <span>Iniciar sesión (/login)</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerProtected('/carne-vacunacion', onOpenLogin)}
                  className="px-4 py-3 text-vet-navy hover:underline font-normal text-[16px] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Consultar carné digital →</span>
                </button>
              </div>

              {/* Floating Stat Artifact Row — Contraste suave en esmeralda, azul médico y ámbar */}
              <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg">
                <div className="p-4 rounded-[20px] bg-vet-surface border border-vet-border shadow-xs">
                  <div className="text-xl font-semibold text-vet-navy">2,540+</div>
                  <div className="text-xs text-action-hover font-semibold mt-0.5">↑ 18% pacientes activos</div>
                </div>
                <div className="p-4 rounded-[20px] bg-info-soft border border-info/25 shadow-xs">
                  <div className="text-xl font-semibold text-info-ink">99.4%</div>
                  <div className="text-xs text-info-ink mt-0.5">Trazabilidad vacunal</div>
                </div>
                <div className="p-4 rounded-[20px] bg-warning-soft border border-warning/35 shadow-xs">
                  <div className="text-xl font-semibold text-warning-ink">24 / 7</div>
                  <div className="text-xs text-warning-ink mt-0.5">Unidad crítica</div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Right Column: Clean Editorial Clinical Showcase Card */}
            <LazyScrollSection delay={150} className="lg:col-span-5 relative space-y-4">
              <div className="rounded-[24px] overflow-hidden bg-vet-surface border border-vet-border shadow-sm">
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
                <div className="p-5 flex items-center justify-between gap-4 bg-vet-surface border-t border-vet-border">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-vet-muted">
                      Quirófano &amp; Diagnóstico por Imagen
                    </div>
                    <div className="text-sm font-semibold text-vet-navy truncate mt-0.5">
                      Monitoreo multiparamétrico 24/7 en sede principal
                    </div>
                  </div>
                  <button
                    onClick={onEnterERP}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-vet-emerald text-white text-xs font-semibold hover:bg-vet-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-emerald/40 transition-colors cursor-pointer"
                  >
                    <span>Abrir ERP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </LazyScrollSection>
          </div>

          {/* KEY PROOF STATS BAR — Contraste equilibrado en carbón, ámbar, azul médico y esmeralda */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-brand-elevated rounded-[20px] border border-slate-700 shadow-xs text-center">
              <span className="text-3xl font-black text-white font-mono tabular-nums">+14,200</span>
              <span className="block text-xs font-semibold text-slate-300 mt-1.5">
                Pacientes Atendidos con Éxito
              </span>
            </div>
            <div className="p-6 bg-warning-soft rounded-[20px] border border-warning/35 shadow-xs text-center">
              <span className="text-3xl font-black text-warning-ink font-mono tabular-nums">24 / 7</span>
              <span className="block text-xs font-semibold text-warning-ink mt-1.5">
                Urgencias &amp; Cuidados Críticos
              </span>
            </div>
            <div className="p-6 bg-info-soft rounded-[20px] border border-info/25 shadow-xs text-center">
              <span className="text-3xl font-black text-info-ink font-mono tabular-nums">100%</span>
              <span className="block text-xs font-semibold text-info-ink mt-1.5">
                Vacunas con Lote Trazable
              </span>
            </div>
            <div className="p-6 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs text-center">
              <span className="text-3xl font-black text-action-hover font-mono tabular-nums">IA Dual</span>
              <span className="block text-xs font-semibold text-vet-muted mt-1.5">
                Fichas Claras para Tutores
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL SERVICES CATALOG */}
      <section id="servicios" className="py-20 bg-vet-surface/60 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
              Especialidades y Procedimientos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-vet-navy tracking-tight">
              Servicios Clínicos de Alta Calidad para tu Mascota
            </h2>
            <p className="text-sm text-vet-muted leading-relaxed">
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
                  className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 hover:bg-vet-surface hover:border-vet-border hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-bold border ${svc.color} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vet-ice text-vet-muted font-mono">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-vet-navy leading-snug group-hover:text-vet-navy transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-vet-muted leading-relaxed">{svc.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerProtected('/citas', onOpenLogin)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-vet-navy hover:text-vet-navy transition-colors pt-2 border-t border-slate-100 cursor-pointer"
                  >
                    <span>Agendar este servicio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </LazyScrollSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEDICAL TEAM / SPECIALISTS */}
      <section id="equipo" className="py-20 bg-vet-surface/60 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
              Cuerpo Médico Especialista
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-vet-navy tracking-tight">
              Veterinarios con Vocación, Rigor y Experiencia
            </h2>
            <p className="text-sm text-vet-muted">
              Nuestro equipo cuenta con especializaciones médico-quirúrgicas avaladas y continua formación
              clínica.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vet 1: Dr. Camilo */}
            <LazyScrollSection delay={50} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 hover:bg-vet-surface hover:border-vet-border hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-vet-emerald text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-vet-navy">Dr. Camilo Restrepo</h3>
                  <span className="text-xs font-bold text-vet-navy block">
                    Cirugía de Tejidos Blandos & Urgencias
                  </span>
                  <span className="text-[11px] font-mono text-vet-muted">TP: 19823-VET · 12 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-vet-muted leading-relaxed">
                Director médico del hospital. Especialista en intervenciones quirúrgicas complejas, manejo de
                pacientes politraumatizados y medicina interna avanzada.
              </p>

              <div className="p-3 bg-vet-surface rounded-xl border border-vet-border text-xs space-y-1">
                <div className="flex justify-between text-vet-muted">
                  <span>Horario de consulta:</span>
                  <strong>Lunes a Viernes</strong>
                </div>
                <div className="flex justify-between text-vet-muted">
                  <span>Atención quirúrgica:</span>
                  <strong className="text-vet-navy">Programada y Urgencias</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-2.5 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Agendar con el Dr. Camilo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </LazyScrollSection>

            {/* Vet 2: Dra. Andrea */}
            <LazyScrollSection delay={100} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 hover:bg-vet-surface hover:border-vet-border hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-vet-navy">Dra. Andrea Morales</h3>
                  <span className="text-xs font-bold text-vet-emerald block">
                    Medicina Felina & Dermatología
                  </span>
                  <span className="text-[11px] font-mono text-vet-muted">TP: 21450-VET · 9 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-vet-muted leading-relaxed">
                Especialista en etología y medicina amigable con los gatos (Cat Friendly Practice), diagnóstico
                de dermatitis alérgicas complejas y planes de longevidad felina.
              </p>

              <div className="p-3 bg-vet-surface rounded-xl border border-vet-border text-xs space-y-1">
                <div className="flex justify-between text-vet-muted">
                  <span>Horario de consulta:</span>
                  <strong>Martes a Sábado</strong>
                </div>
                <div className="flex justify-between text-vet-muted">
                  <span>Especialidad:</span>
                  <strong className="text-vet-emerald">Gatos y Dermatología Canina</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-2.5 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Agendar con la Dra. Andrea</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </LazyScrollSection>

            {/* Vet 3: Dra. Mariana */}
            <LazyScrollSection delay={150} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 hover:bg-vet-surface hover:border-vet-border hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-vet-navy">Dra. Mariana Gómez</h3>
                  <span className="text-xs font-bold text-indigo-700 block">
                    Cardiología & Diagnóstico por Imagen
                  </span>
                  <span className="text-[11px] font-mono text-vet-muted">TP: 24119-VET · 8 Años Exp.</span>
                </div>
              </div>

              <p className="text-xs text-vet-muted leading-relaxed">
                Experta en ecocardiografía Doppler color, monitoreo electrocardiográfico Holter y detección
                temprana de patologías cardiorrespiratorias en pacientes geriátricos.
              </p>

              <div className="p-3 bg-vet-surface rounded-xl border border-vet-border text-xs space-y-1">
                <div className="flex justify-between text-vet-muted">
                  <span>Horario de consulta:</span>
                  <strong>Lunes, Miércoles y Viernes</strong>
                </div>
                <div className="flex justify-between text-vet-muted">
                  <span>Especialidad:</span>
                  <strong className="text-indigo-700">Ecografía y Cardiología</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-2.5 rounded-xl bg-vet-emerald hover:bg-vet-emerald-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Agendar con la Dra. Mariana</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* HEALTH PLANS & PREVENTIVE SUBSCRIPTIONS */}
      <section id="planes" className="py-20 bg-vet-ice/75 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
              Planes de Salud Preventiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-vet-navy tracking-tight">
              Protección Integral Todo el Año para tu Compañero
            </h2>
            <p className="text-sm text-vet-muted">
              Membresías diseñadas para cuidar su bienestar continuo sin gastos imprevistos.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1: Cachorro */}
            <LazyScrollSection delay={50} className="p-8 rounded-[24px] border border-vet-border bg-vet-surface flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-vet-muted font-mono">
                  Plan Cachorro / Gatito
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-vet-navy">$35</span>
                  <span className="text-xs text-vet-muted">/ mes</span>
                </div>
                <p className="text-xs text-vet-muted">
                  Para cachorros y gatitos hasta los 12 meses de edad.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-vet-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Esquema completo de vacunación inicial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Desparasitación interna cada mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Carné digital con código QR oficial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>3 Consultas pediátricas gratuitas al año</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-3 bg-vet-ice hover:bg-vet-ice text-vet-navy rounded-xl text-xs font-bold text-center transition-colors block cursor-pointer"
              >
                Suscribir Plan Cachorro
              </button>
            </LazyScrollSection>

            {/* Plan 2: Adulto Total (Featured) */}
            <LazyScrollSection delay={100} className="p-8 rounded-[24px] border-2 border-vet-navy bg-linear-to-b from-emerald-50/50 via-white to-white flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-vet-emerald text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                Más Recomendado por Veterinarios
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
                  Plan Salud Total Adulto
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-vet-navy">$49</span>
                  <span className="text-xs text-vet-muted">/ mes</span>
                </div>
                <p className="text-xs text-vet-muted">
                  Cobertura preventiva total para perros y gatos entre 1 y 7 años.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-vet-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Todas las vacunas anuales de refuerzo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Examen sanguíneo de rutina semestral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>1 Limpieza dental con ultrasonido al año</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <strong className="text-vet-navy">Consultas ilimitadas de medicina general</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-3.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-xl text-xs font-bold text-center shadow-md  transition-all block cursor-pointer"
              >
                Suscribir Salud Total
              </button>
            </LazyScrollSection>

            {/* Plan 3: Senior Care */}
            <LazyScrollSection delay={150} className="p-8 rounded-[24px] border border-vet-border bg-vet-surface flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-vet-muted font-mono">
                  Plan Senior Vital (7+ Años)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-vet-navy">$69</span>
                  <span className="text-xs text-vet-muted">/ mes</span>
                </div>
                <p className="text-xs text-vet-muted">
                  Cuidados geriátricos especializados para su etapa dorada.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-vet-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Chequeo renal, hepático y cardíaco periódico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Ecografía abdominal preventiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Manejo articular y nutrición geriátrica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vet-navy shrink-0" />
                    <span>Atención de urgencias con 20% de descuento</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerProtected('/citas', onOpenLogin)}
                className="w-full py-3 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-xl text-xs font-bold text-center transition-colors block cursor-pointer"
              >
                Suscribir Plan Senior
              </button>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & SUCCESS STORIES */}
      <section id="testimonios" className="py-20 bg-vet-surface/60 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
              Opiniones de Familias Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-vet-navy tracking-tight">
              Lo que Dicen Quienes Confían en Nosotros
            </h2>
            <p className="text-sm text-vet-muted">
              Más de 2,500 tutores confían la vida de sus mascotas a nuestro hospital cada año.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <LazyScrollSection delay={50} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-vet-muted leading-relaxed italic">
                  "El Dr. Camilo salvó a Lucas tras un episodio agudo de gastritis e intoxicación. La atención
                  en urgencias fue impecable, y el resumen que me enviaron a través del sistema explicaba con
                  total claridad la dosis exacta del tratamiento."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-vet-border">
                <div className="w-9 h-9 rounded-full bg-vet-emerald text-white flex items-center justify-center font-bold text-xs">
                  CM
                </div>
                <div>
                  <strong className="text-xs text-vet-navy block">Carlos Mendoza</strong>
                  <span className="text-[11px] text-vet-muted">Tutor de Lucas (Golden Retriever)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 2 */}
            <LazyScrollSection delay={100} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-vet-muted leading-relaxed italic">
                  "Tengo dos gatas y la Dra. Andrea es maravillosa con la medicina felina. La clínica tiene un
                  área tranquila para evitar el estrés y el carné de vacunación en el celular con código QR nos
                  facilitó viajar sin papeles extraviados."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-vet-border">
                <div className="w-9 h-9 rounded-full bg-vet-emerald text-white flex items-center justify-center font-bold text-xs">
                  SR
                </div>
                <div>
                  <strong className="text-xs text-vet-navy block">Sofía Ramírez</strong>
                  <span className="text-[11px] text-vet-muted">Tutora de Luna y Mia (Siamesa y Persa)</span>
                </div>
              </div>
            </LazyScrollSection>

            {/* Review 3 */}
            <LazyScrollSection delay={150} className="p-6 rounded-[24px] border border-vet-border bg-vet-surface/50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-vet-muted leading-relaxed italic">
                  "Poder agendar la cita desde la página y recibir confirmación inmediata nos ahorró mucho
                  tiempo. Las instalaciones son de primer nivel, limpias y el personal de recepción es
                  sumamente cálido."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-vet-border">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  DA
                </div>
                <div>
                  <strong className="text-xs text-vet-navy block">Diego Álvarez</strong>
                  <span className="text-[11px] text-vet-muted">Tutor de Rocky (Bulldog Francés)</span>
                </div>
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-vet-surface/60 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
              Dudas Resueltas
            </span>
            <h2 className="text-3xl font-black text-vet-navy tracking-tight">
              Preguntas Frecuentes de Tutores
            </h2>
          </LazyScrollSection>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <LazyScrollSection key={idx} delay={idx * 50}>
                <div className="bg-vet-surface rounded-[20px] border border-vet-border overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-vet-navy hover:text-vet-navy transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-vet-navy" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-vet-muted" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-vet-muted leading-relaxed border-t border-slate-100 pt-3">
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
      <section id="contacto" className="py-20 bg-vet-surface/60 backdrop-blur-[1px] border-b border-vet-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <LazyScrollSection className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-vet-navy font-mono">
                Contacto & Ubicación
              </span>
              <h2 className="text-3xl font-black text-vet-navy tracking-tight">
                Estamos Listos para Atenderte Cuando Más lo Necesites
              </h2>
              <p className="text-sm text-vet-muted leading-relaxed">
                Nuestra clínica cuenta con estacionamiento privado para clientes, acceso adaptado para camillas
                y sala de espera climatizada.
              </p>

              <div className="space-y-4 text-xs text-vet-muted">
                <div className="flex items-start gap-3 p-3 bg-vet-surface rounded-xl border border-vet-border">
                  <MapPin className="w-5 h-5 text-vet-navy shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-vet-navy block font-semibold">Sede Principal:</strong>
                    <span>Carrera 45 # 128 - 22, Barrio Bella Suiza, Bogotá D.C., Colombia</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-vet-surface rounded-xl border border-vet-border">
                  <Clock className="w-5 h-5 text-vet-navy shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-vet-navy block font-semibold">Horarios de Atención:</strong>
                    <span>Consultas Programadas: Lunes a Sábado de 7:00 AM a 8:00 PM</span>
                    <span className="block font-bold text-rose-600 mt-0.5">
                      🚨 Urgencias & Hospitalización: 24 Horas al Día los 365 Días
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-vet-surface rounded-xl border border-vet-border">
                  <Phone className="w-5 h-5 text-vet-navy shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-vet-navy block font-semibold">Teléfonos y WhatsApp:</strong>
                    <span>Línea Directa Urgencias: +57 (300) 912-3456</span>
                    <span className="block">Recepción y Citas: +57 (601) 749-8020</span>
                  </div>
                </div>
              </div>
            </LazyScrollSection>

            {/* Visual Interactive Map / Location Card */}
            <LazyScrollSection delay={100} className="lg:col-span-7">
              <div className="rounded-[24px] border border-vet-border overflow-hidden bg-vet-surface h-96 relative flex items-center justify-center p-6 text-center">
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
                <div className="relative z-10 max-w-md bg-vet-surface/95 backdrop-blur-md rounded-[24px] p-6 border border-vet-border text-vet-navy space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-vet-ice text-vet-navy mx-auto flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-vet-navy">Hospital Clínico Veterinario VetSoft</h4>
                  <p className="text-xs text-vet-muted">
                    Fácil acceso vial por la Autopista Norte y Calle 127. Contamos con bahía de parqueo y
                    recepción de urgencias independiente.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Abrir en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => triggerProtected('/citas', onOpenLogin)}
                      className="px-4 py-2 bg-vet-emerald hover:bg-vet-emerald-hover text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Pedir Cita</span>
                    </button>
                  </div>
                </div>
              </div>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FINAL CLINICAL ERP / MEDICAL STAFF PROMO BANNER — Steep Accent Peach Card */}
      <section className="py-20 bg-vet-surface border-b border-vet-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-vet-ice text-vet-navy p-8 sm:p-12 text-center space-y-5">
            <span className="text-xs font-medium uppercase tracking-widest text-vet-navy font-mono">
              SISTEMA HOSPITALARIO VETSOFT
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-[44px] font-normal tracking-[-0.66px] text-vet-navy leading-[1.2]">
              ¿Eres Médico Veterinario o Parte del Equipo de la Clínica?
            </h2>
            <p className="text-[17px] text-vet-navy/85 max-w-xl mx-auto leading-relaxed">
              Ingresa a la plataforma integral para gestionar expedientes clínicos, registrar constantes
              vitales, dispensar inventario por lotes, facturar en POS y generar fichas médicas asistidas con IA.
            </p>

            <div className="pt-2">
              <button
                onClick={onEnterERP}
                className="px-7 py-3.5 bg-vet-emerald hover:bg-vet-emerald-hover text-white font-normal text-[16px] rounded-full inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Ingresar al Sistema de Gestión Médica ERP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP SLATE CONTRAST FOOTER */}
      <footer className="py-12 bg-brand-elevated text-slate-300 text-xs border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-action text-white flex items-center justify-center font-bold text-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Clínica Veterinaria VetSoft</span>
              <span className="text-slate-400 block text-[10px]">
                Impulsado por el Sistema de Gestión VETSOFT &amp; Gemini 3.8 Flash
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-300">
            <a href="#servicios" className="hover:text-white transition-colors">
              Servicios
            </a>
            <button
              type="button"
              onClick={() => triggerProtected('/citas', onOpenLogin)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Agendar Cita
            </button>
            <button
              type="button"
              onClick={() => triggerProtected('/carne-vacunacion', onOpenLogin)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Carné Digital
            </button>
            <a href="#equipo" className="hover:text-white transition-colors">
              Especialistas
            </a>
            <a href="#planes" className="hover:text-white transition-colors">
              Planes
            </a>
            <button onClick={onEnterERP} className="text-action-mint font-bold hover:underline cursor-pointer">
              Acceso ERP →
            </button>
          </div>

          <div className="text-center md:text-right text-slate-400">
            <span>© {new Date().getFullYear()} Clínica Veterinaria VetSoft · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

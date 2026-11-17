import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Configuración centralizada del fondo 3D de la Landing Page.
 * Modifica estos valores para ajustar cantidad, colores y velocidad de las figuras.
 */
export const LANDING_3D_CONFIG = {
  /** Cantidad total de figuras 3D orgánicas dispersas en la escena */
  shapeCount: 16,
  /** Cantidad de partículas ambientales flotantes */
  particleCount: 55,
  /** Colores de la paleta del sitio para los materiales y wireframe */
  palette: {
    primaryTint: '#5d2a1a', // Sienna Brown (Steep)
    warmAccent: '#fbe1d1', // Blush Peach (Steep)
    neutralLight: '#f2f2f3', // Mist Gray (Steep)
    wireframe: '#777b86', // Slate Gray (Steep)
    particle: '#5d2a1a',
  },
  /** Velocidades base de animación */
  rotationSpeed: 0.0022,
  floatSpeed: 0.55,
  floatAmplitude: 0.32,
  /** Sensibilidad al movimiento del cursor */
  cursorParallaxStrength: 0.55,
  cursorRepulsionRadius: 4.5,
  cursorRepulsionStrength: 1.25,
};

/** Verifica de forma segura si WebGL está disponible en el navegador */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Fondo 3D inmersivo en Three.js exclusivo para la Landing Page.
 * - Dispersa formas geométricas modernas (toroides, poliedros, esferas, nudos) de forma orgánica.
 * - Anima con rotación lenta, flotación suave y reacción al cursor (parallax + repulsión/inclinación).
 * - Pausa el bucle al ocultar la pestaña, respeta `prefers-reduced-motion` y ofrece fallback estático sin WebGL.
 */
export const BackgroundThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(() => !isWebGLAvailable());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || useFallback) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      // Fallback limpio si el contexto WebGL falla al inicializarse
      setUseFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    const fov = 45;
    const camZ = 15;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
    camera.position.set(0, 0, camZ);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Iluminación editorial suave para mantener el contenido principal legible
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.1);
    dirLight.position.set(6, 10, 10);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(LANDING_3D_CONFIG.palette.warmAccent, 1.5, 34);
    accentLight.position.set(-9, 5, 7);
    scene.add(accentLight);

    const clinicalLight = new THREE.PointLight(LANDING_3D_CONFIG.palette.primaryTint, 1.1, 34);
    clinicalLight.position.set(9, -5, 7);
    scene.add(clinicalLight);

    // Materiales translúcidos y sutiles para no competir con la tipografía
    const materials = [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.warmAccent),
        roughness: 0.45,
        metalness: 0.05,
        transparent: true,
        opacity: 0.42,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.neutralLight),
        roughness: 0.5,
        metalness: 0.06,
        transparent: true,
        opacity: 0.4,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.primaryTint),
        roughness: 0.4,
        metalness: 0.08,
        transparent: true,
        opacity: 0.18,
      }),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.wireframe),
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      }),
    ];

    // Catálogo de geometrías modernas (esferas, toroides, poliedros, nudos y cápsulas)
    const geometries = [
      new THREE.TorusGeometry(0.75, 0.2, 16, 44),
      new THREE.IcosahedronGeometry(0.68, 0),
      new THREE.SphereGeometry(0.55, 22, 22),
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.TorusKnotGeometry(0.52, 0.14, 64, 12),
      new THREE.DodecahedronGeometry(0.58, 0),
      new THREE.CapsuleGeometry(0.28, 0.65, 8, 16),
    ];

    interface FloatingShape {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      offset: THREE.Vector3;
      rotSpeed: { x: number; y: number; z: number };
      phase: number;
      speedFactor: number;
      baseScale: number;
      currentScale: number;
    }

    const shapes: FloatingShape[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Dispersión orgánica tipo espiral áurea con jitter

    for (let i = 0; i < LANDING_3D_CONFIG.shapeCount; i++) {
      const geo = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geo, mat);

      // Dispersión orgánica no rígida a lo ancho y alto de la escena
      const radiusNorm = Math.sqrt((i + 0.5) / LANDING_3D_CONFIG.shapeCount);
      const angle = i * goldenAngle + (Math.random() - 0.5) * 0.45;
      const spreadX = Math.cos(angle) * radiusNorm * 11.5 + (Math.random() - 0.5) * 1.4;
      const spreadY = Math.sin(angle) * radiusNorm * 6.4 + (Math.random() - 0.5) * 1.0;
      const depthZ = -2.0 - Math.random() * 6.5;

      const scale = 0.65 + Math.random() * 0.65;
      mesh.position.set(spreadX, spreadY, depthZ);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.scale.setScalar(scale);
      scene.add(mesh);

      shapes.push({
        mesh,
        basePos: new THREE.Vector3(spreadX, spreadY, depthZ),
        offset: new THREE.Vector3(0, 0, 0),
        rotSpeed: {
          x: (Math.random() > 0.5 ? 1 : -1) * (LANDING_3D_CONFIG.rotationSpeed * (0.6 + Math.random() * 0.9)),
          y: (Math.random() > 0.5 ? 1 : -1) * (LANDING_3D_CONFIG.rotationSpeed * (0.8 + Math.random() * 1.1)),
          z: (Math.random() - 0.5) * LANDING_3D_CONFIG.rotationSpeed * 0.5,
        },
        phase: Math.random() * Math.PI * 2,
        speedFactor: 0.75 + Math.random() * 0.55,
        baseScale: scale,
        currentScale: scale,
      });
    }

    // Partículas ambientales dispersas
    const pCount = LANDING_3D_CONFIG.particleCount;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 24;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 2] = -1.5 - Math.random() * 7.5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: LANDING_3D_CONFIG.palette.particle,
      size: 0.065,
      transparent: true,
      opacity: 0.22,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Estado del cursor y scroll
    let mouseNdcX = 0;
    let mouseNdcY = 0;
    let cursorActive = false;
    let scrollY = window.scrollY || 0;
    const cursorWorld = new THREE.Vector2(999, 999);

    const updateCursorWorld = () => {
      if (!cursorActive) return;
      const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      const halfW = halfH * (width / height);
      cursorWorld.set(mouseNdcX * halfW, mouseNdcY * halfH);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouseNdcX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdcY = -((e.clientY / window.innerHeight) * 2 - 1);
      cursorActive = true;
      updateCursorWorld();
    };

    const handleMouseLeave = () => {
      cursorActive = false;
      cursorWorld.set(999, 999);
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateCursorWorld();
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };

    const clock = new THREE.Clock();
    let frameId: number | null = null;

    const renderStaticFrame = () => {
      camera.position.set(0, 0, camZ);
      camera.lookAt(0, 0, -3);
      renderer.render(scene, camera);
    };

    const animate = () => {
      if (document.hidden || prefersReducedMotion) {
        frameId = null;
        return;
      }

      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      shapes.forEach((item) => {
        const floatT = t * LANDING_3D_CONFIG.floatSpeed * item.speedFactor + item.phase;
        const floatY = Math.sin(floatT) * LANDING_3D_CONFIG.floatAmplitude;
        const floatX = Math.cos(floatT * 0.7) * (LANDING_3D_CONFIG.floatAmplitude * 0.45);

        let targetOffX = 0;
        let targetOffY = 0;
        let targetScale = item.baseScale;
        let rotBoost = 1;

        if (cursorActive) {
          const dx = item.basePos.x + floatX - cursorWorld.x;
          const dy = item.basePos.y + floatY - cursorWorld.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = LANDING_3D_CONFIG.cursorRepulsionRadius;

          if (dist < radius && dist > 0.001) {
            const strength = 1 - dist / radius;
            targetOffX = (dx / dist) * strength * LANDING_3D_CONFIG.cursorRepulsionStrength;
            targetOffY = (dy / dist) * strength * LANDING_3D_CONFIG.cursorRepulsionStrength;
            targetScale = item.baseScale * (1 + strength * 0.2);
            rotBoost = 1 + strength * 2.8;
          }
        }

        item.offset.x += (targetOffX - item.offset.x) * 0.07;
        item.offset.y += (targetOffY - item.offset.y) * 0.07;
        item.currentScale += (targetScale - item.currentScale) * 0.09;

        item.mesh.position.x = item.basePos.x + floatX + item.offset.x;
        item.mesh.position.y = item.basePos.y + floatY + item.offset.y;
        item.mesh.scale.setScalar(item.currentScale);

        item.mesh.rotation.x += item.rotSpeed.x * rotBoost;
        item.mesh.rotation.y += item.rotSpeed.y * rotBoost;
        item.mesh.rotation.z += item.rotSpeed.z * rotBoost;
      });

      // Parallax suave de cámara con el cursor y scroll
      const targetCamX = mouseNdcX * LANDING_3D_CONFIG.cursorParallaxStrength;
      const targetCamY = mouseNdcY * (LANDING_3D_CONFIG.cursorParallaxStrength * 0.7) - (scrollY % 1800) * 0.0007;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, camera.position.y * 0.25, -3);

      particles.rotation.y = t * 0.02 + mouseNdcX * 0.06;
      particles.rotation.x = mouseNdcY * 0.04;

      renderer.render(scene, camera);
    };

    const startAnimation = () => {
      if (prefersReducedMotion) {
        renderStaticFrame();
        return;
      }
      if (!document.hidden && frameId === null) {
        clock.getDelta();
        animate();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      } else {
        startAnimation();
      }
    };

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        renderStaticFrame();
      } else {
        startAnimation();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionPreferenceChange);

    startAnimation();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, [useFallback]);

  // Fallback limpio cuando WebGL no está disponible
  if (useFallback) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-linear-to-br from-[#ffffff] via-[#fafafb] to-[#F0FDFA]/50"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Configuración centralizada del fondo 3D veterinario de la Landing Page.
 * Permite ajustar cantidad, colores y velocidad de las figuras.
 */
export const LANDING_3D_CONFIG = {
  /** Cantidad total de figuras 3D veterinarias dispersas en la escena */
  shapeCount: 16,
  /** Cantidad de partículas ambientales flotantes */
  particleCount: 45,
  /** Colores armónicos combinando Azul Cerúleo/Cielo y Verde Esmeralda Clínico */
  palette: {
    primaryTint: '#0284C7', // Azul Cerúleo Clínico
    deepCoffee: '#0D9488', // Verde Esmeralda Clínico
    softCoffee: '#34D399', // Verde Menta Suave
    softBlue: '#38BDF8', // Azul Cielo Luminoso
    wireframe: '#0D9488', // Wireframe Verde Esmeralda
    particle: '#0284C7', // Partículas Azul Cerúleo
  },
  /** Transparencia sutil para no interferir con la lectura del contenido */
  opacity: {
    solid: 0.2,
    accent: 0.24,
    wireframe: 0.14,
    particle: 0.18,
  },
  /** Velocidades base de animación */
  rotationSpeed: 0.002,
  floatSpeed: 0.5,
  floatAmplitude: 0.3,
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
 * Fondo 3D inmersivo veterinario en Three.js exclusivo para la Landing Page.
 * - Dispersa formas 3D veterinarias (huellas, huesitos, cruces clínicas, cápsulas,
 *   corazones y mini hélices ADN) de forma orgánica y muy transparente.
 * - Reacciona al movimiento del cursor (parallax + repulsión/inclinación suave).
 * - Pausa al ocultar la pestaña, respeta `prefers-reduced-motion` y ofrece fallback sin WebGL.
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

    // Iluminación editorial suave
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.05);
    dirLight.position.set(6, 10, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(LANDING_3D_CONFIG.palette.softBlue, 1.1, 34);
    blueLight.position.set(-9, 5, 7);
    scene.add(blueLight);

    const coffeeLight = new THREE.PointLight(LANDING_3D_CONFIG.palette.softCoffee, 1.1, 34);
    coffeeLight.position.set(9, -5, 7);
    scene.add(coffeeLight);

    // Materiales muy transparentes para que las figuras no compitan con las letras
    const materials = [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.softBlue),
        roughness: 0.42,
        metalness: 0.08,
        transparent: true,
        opacity: LANDING_3D_CONFIG.opacity.solid,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.deepCoffee),
        roughness: 0.44,
        metalness: 0.08,
        transparent: true,
        opacity: LANDING_3D_CONFIG.opacity.solid,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.softCoffee),
        roughness: 0.45,
        metalness: 0.06,
        transparent: true,
        opacity: LANDING_3D_CONFIG.opacity.accent,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.primaryTint),
        roughness: 0.4,
        metalness: 0.08,
        transparent: true,
        opacity: 0.16,
      }),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(LANDING_3D_CONFIG.palette.wireframe),
        wireframe: true,
        transparent: true,
        opacity: LANDING_3D_CONFIG.opacity.wireframe,
      }),
    ];

    // Geometrías compartidas para facilitar su limpieza (dispose)
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
      disposableGeometries.push(geo);
      return geo;
    };

    const pawPadGeo = trackGeo(new THREE.SphereGeometry(0.42, 18, 18));
    const pawToeGeo = trackGeo(new THREE.SphereGeometry(0.16, 14, 14));
    const crossVGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.96, 0.2));
    const crossHGeo = trackGeo(new THREE.BoxGeometry(0.96, 0.32, 0.2));
    const crossRingGeo = trackGeo(new THREE.TorusGeometry(0.72, 0.025, 10, 34));
    const capBodyGeo = trackGeo(new THREE.CylinderGeometry(0.2, 0.2, 0.38, 16));
    const capDomeGeo = trackGeo(new THREE.SphereGeometry(0.2, 16, 12));
    const boneShaftGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.78, 14));
    boneShaftGeo.rotateZ(Math.PI / 2);
    const boneKnobGeo = trackGeo(new THREE.SphereGeometry(0.17, 14, 14));
    const dnaNodeGeo = trackGeo(new THREE.SphereGeometry(0.085, 10, 10));
    const dnaRungGeo = trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8));
    dnaRungGeo.rotateZ(Math.PI / 2);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.25);
    heartShape.bezierCurveTo(0, 0.48, -0.35, 0.48, -0.35, 0.2);
    heartShape.bezierCurveTo(-0.35, -0.05, 0, -0.22, 0, -0.38);
    heartShape.bezierCurveTo(0, -0.22, 0.35, -0.05, 0.35, 0.2);
    heartShape.bezierCurveTo(0.35, 0.48, 0, 0.48, 0, 0.25);
    const heartGeo = trackGeo(
      new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.14,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 3,
      })
    );
    heartGeo.center();

    // Constructores de motivos 3D veterinarios
    const createPawGroup = (mat: THREE.Material) => {
      const group = new THREE.Group();
      const pad = new THREE.Mesh(pawPadGeo, mat);
      pad.scale.set(1.15, 0.92, 0.4);
      pad.position.set(0, -0.15, 0);
      group.add(pad);

      const offsets: [number, number][] = [
        [-0.46, 0.32],
        [-0.16, 0.52],
        [0.16, 0.52],
        [0.46, 0.32],
      ];
      offsets.forEach(([tx, ty]) => {
        const toe = new THREE.Mesh(pawToeGeo, mat);
        toe.scale.set(0.9, 1.1, 0.45);
        toe.position.set(tx, ty, 0);
        group.add(toe);
      });
      return group;
    };

    const createBoneGroup = (mat: THREE.Material) => {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(boneShaftGeo, mat));
      const knobs: [number, number][] = [
        [-0.4, 0.14],
        [-0.4, -0.14],
        [0.4, 0.14],
        [0.4, -0.14],
      ];
      knobs.forEach(([kx, ky]) => {
        const knob = new THREE.Mesh(boneKnobGeo, mat);
        knob.position.set(kx, ky, 0);
        group.add(knob);
      });
      group.rotation.z = Math.PI / 7;
      return group;
    };

    const createVetCrossGroup = (mat: THREE.Material, ringMat: THREE.Material) => {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(crossVGeo, mat));
      group.add(new THREE.Mesh(crossHGeo, mat));
      group.add(new THREE.Mesh(crossRingGeo, ringMat));
      return group;
    };

    const createCapsuleGroup = (matTop: THREE.Material, matBottom: THREE.Material) => {
      const group = new THREE.Group();
      const top = new THREE.Mesh(capBodyGeo, matTop);
      top.position.y = 0.19;
      const topDome = new THREE.Mesh(capDomeGeo, matTop);
      topDome.position.y = 0.38;

      const bottom = new THREE.Mesh(capBodyGeo, matBottom);
      bottom.position.y = -0.19;
      const bottomDome = new THREE.Mesh(capDomeGeo, matBottom);
      bottomDome.position.y = -0.38;

      group.add(top, topDome, bottom, bottomDome);
      group.rotation.z = Math.PI / 5;
      return group;
    };

    const createHeartGroup = (mat: THREE.Material) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(heartGeo, mat);
      mesh.scale.setScalar(1.25);
      group.add(mesh);
      return group;
    };

    const createMiniDnaGroup = (matA: THREE.Material, matB: THREE.Material, rungMat: THREE.Material) => {
      const group = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const y = (i - 2.5) * 0.28;
        const angle = i * 0.78;
        const x = Math.cos(angle) * 0.24;
        const z = Math.sin(angle) * 0.24;

        const a = new THREE.Mesh(dnaNodeGeo, matA);
        a.position.set(x, y, z);
        const b = new THREE.Mesh(dnaNodeGeo, matB);
        b.position.set(-x, y, -z);
        const rung = new THREE.Mesh(dnaRungGeo, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.y = -angle;
        group.add(a, b, rung);
      }
      return group;
    };

    const builders: Array<(idx: number) => THREE.Group> = [
      (idx) => createPawGroup(materials[idx % 4]),
      (idx) => createBoneGroup(materials[(idx + 1) % 4]),
      (idx) => createVetCrossGroup(materials[idx % 4], materials[4]),
      (idx) => createCapsuleGroup(materials[idx % 2], materials[(idx + 2) % 4]),
      (idx) => createHeartGroup(materials[(idx + 2) % 4]),
      (idx) => createMiniDnaGroup(materials[0], materials[1], materials[4]),
    ];

    interface FloatingShape {
      group: THREE.Group;
      normX: number; // Fracción normalizada fuera de la zona de lectura central
      normY: number;
      basePos: THREE.Vector3;
      offset: THREE.Vector3;
      rotSpeed: { x: number; y: number; z: number };
      phase: number;
      speedFactor: number;
      baseScale: number;
      responsiveScale: number;
      currentScale: number;
    }

    const shapes: FloatingShape[] = [];

    // Posicionamiento orgánico en el perímetro y márgenes laterales para no tapar las letras centrales
    for (let i = 0; i < LANDING_3D_CONFIG.shapeCount; i++) {
      const group = builders[i % builders.length](i);
      const isLeft = i % 2 === 0;
      const sideSign = isLeft ? -1 : 1;

      // Distribuir orgánicamente en los bordes laterales (76%-94% del semiancho) y esquinas superior/inferior
      const laneProgress = (Math.floor(i / 2) + 0.5) / Math.ceil(LANDING_3D_CONFIG.shapeCount / 2);
      const jitterX = (Math.random() - 0.5) * 0.08;
      const jitterY = (Math.random() - 0.5) * 0.14;
      const normX = sideSign * (0.78 + Math.random() * 0.15 + jitterX);
      const normY = (laneProgress * 2 - 1) * 0.88 + jitterY;
      const depthZ = -1.8 - Math.random() * 4.5;

      const scale = 0.65 + Math.random() * 0.4;
      group.rotation.set(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 0.4
      );
      scene.add(group);

      shapes.push({
        group,
        normX,
        normY,
        basePos: new THREE.Vector3(0, 0, depthZ),
        offset: new THREE.Vector3(0, 0, 0),
        rotSpeed: {
          x: (Math.random() > 0.5 ? 1 : -1) * (LANDING_3D_CONFIG.rotationSpeed * (0.5 + Math.random() * 0.8)),
          y: (Math.random() > 0.5 ? 1 : -1) * (LANDING_3D_CONFIG.rotationSpeed * (0.8 + Math.random() * 1.0)),
          z: (Math.random() - 0.5) * LANDING_3D_CONFIG.rotationSpeed * 0.45,
        },
        phase: Math.random() * Math.PI * 2,
        speedFactor: 0.75 + Math.random() * 0.55,
        baseScale: scale,
        responsiveScale: scale,
        currentScale: scale,
      });
    }

    // Partículas ambientales sutiles confinadas a los márgenes laterales
    const pCount = LANDING_3D_CONFIG.particleCount;
    const pPositions = new Float32Array(pCount * 3);
    const pNormX: number[] = [];
    const pNormY: number[] = [];
    for (let i = 0; i < pCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const nx = side * (0.74 + Math.random() * 0.23);
      const ny = (Math.random() - 0.5) * 1.85;
      pNormX.push(nx);
      pNormY.push(ny);
      pPositions[i * 3] = nx * 10;
      pPositions[i * 3 + 1] = ny * 5;
      pPositions[i * 3 + 2] = -1.5 - Math.random() * 5.5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: LANDING_3D_CONFIG.palette.particle,
      size: 0.06,
      transparent: true,
      opacity: LANDING_3D_CONFIG.opacity.particle,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const updatePerimeterLayout = () => {
      const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      const halfW = halfH * (width / height);
      const isNarrow = width < 1024;
      const isMobile = width < 640;

      shapes.forEach((item) => {
        const depthScale = (camZ - item.basePos.z) / camZ;
        // En pantallas estrechas empujar más al borde y reducir ligeramente la escala para despejar el texto
        const edgeBoost = isMobile ? 1.04 : isNarrow ? 1.02 : 1;
        const xClamped = Math.sign(item.normX) * Math.min(0.95, Math.abs(item.normX) * edgeBoost);
        item.basePos.x = xClamped * halfW * depthScale;
        item.basePos.y = item.normY * halfH * depthScale;
        item.responsiveScale = item.baseScale * (isMobile ? 0.52 : isNarrow ? 0.72 : 1);
        item.currentScale = item.responsiveScale;
        item.group.position.set(item.basePos.x, item.basePos.y, item.basePos.z);
        item.group.scale.setScalar(item.responsiveScale);
      });

      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pCount; i++) {
        posAttr.setX(i, pNormX[i] * halfW);
        posAttr.setY(i, pNormY[i] * halfH);
      }
      posAttr.needsUpdate = true;
    };

    updatePerimeterLayout();

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
      updatePerimeterLayout();
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
        const floatX = Math.cos(floatT * 0.7) * (LANDING_3D_CONFIG.floatAmplitude * 0.25);

        let targetOffX = 0;
        let targetOffY = 0;
        let targetScale = item.responsiveScale;
        let rotBoost = 1;

        if (cursorActive) {
          const dx = item.basePos.x + floatX - cursorWorld.x;
          const dy = item.basePos.y + floatY - cursorWorld.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = LANDING_3D_CONFIG.cursorRepulsionRadius;

          if (dist < radius && dist > 0.001) {
            const strength = 1 - dist / radius;
            // Empuje suave manteniendo la figura hacia el borde exterior, nunca hacia las letras centrales
            targetOffX = Math.sign(item.normX) * Math.abs(dx / dist) * strength * 0.75;
            targetOffY = (dy / dist) * strength * 0.85;
            targetScale = item.responsiveScale * (1 + strength * 0.18);
            rotBoost = 1 + strength * 2.8;
          }
        }

        item.offset.x += (targetOffX - item.offset.x) * 0.07;
        item.offset.y += (targetOffY - item.offset.y) * 0.07;
        item.currentScale += (targetScale - item.currentScale) * 0.09;

        item.group.position.x = item.basePos.x + floatX + item.offset.x;
        item.group.position.y = item.basePos.y + floatY + item.offset.y;
        item.group.scale.setScalar(item.currentScale);

        item.group.rotation.x += item.rotSpeed.x * rotBoost;
        item.group.rotation.y += item.rotSpeed.y * rotBoost;
        item.group.rotation.z += item.rotSpeed.z * rotBoost;
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
      disposableGeometries.forEach((g) => g.dispose());
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
        className="fixed inset-0 pointer-events-none z-0 bg-linear-to-br from-[#f0f9ff] via-[#ffffff] to-[#ecfdf5]/60"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-linear-to-br from-[#f0f9ff] via-[#ffffff] to-[#ecfdf5]/60"
    />
  );
};

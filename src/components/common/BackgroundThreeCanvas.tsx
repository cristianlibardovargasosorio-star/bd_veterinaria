import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fondo 3D ambiental veterinario en Three.js (WebGL) para todo el sitio.
 * Posiciona motivos 3D temáticos (huellas, cruz clínica, cápsula y hélice ADN)
 * exclusivamente en los márgenes laterales para mantener el centro tipográfico
 * completamente despejado y legible.
 */
export const BackgroundThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();

    const fov = 42;
    const camZ = 16;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
    camera.position.set(0, 0, camZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Iluminación editorial cálida y suave
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.1);
    dirLight.position.set(6, 10, 10);
    scene.add(dirLight);

    const peachLight = new THREE.PointLight('#fbe1d1', 1.8, 35);
    peachLight.position.set(-10, 4, 8);
    scene.add(peachLight);

    // Materiales Steep editoriales (suaves, sin sobrecargar)
    const matPeach = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbe1d1'),
      roughness: 0.45,
      metalness: 0.04,
      transparent: true,
      opacity: 0.62,
    });

    const matMist = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e6e6ea'),
      roughness: 0.55,
      metalness: 0.05,
      transparent: true,
      opacity: 0.58,
    });

    const matTerracottaSoft = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d9a78c'),
      roughness: 0.45,
      metalness: 0.05,
      transparent: true,
      opacity: 0.38,
    });

    const matSiennaWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#5d2a1a'),
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    // Constructores de motivos 3D veterinarios
    const createPawGroup = (material: THREE.Material) => {
      const group = new THREE.Group();
      const padGeo = new THREE.SphereGeometry(0.46, 20, 20);
      const pad = new THREE.Mesh(padGeo, material);
      pad.scale.set(1.15, 0.95, 0.42);
      pad.position.set(0, -0.18, 0);
      group.add(pad);

      const toeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const toeOffsets: [number, number][] = [
        [-0.52, 0.36],
        [-0.18, 0.58],
        [0.18, 0.58],
        [0.52, 0.36],
      ];
      toeOffsets.forEach(([tx, ty]) => {
        const toe = new THREE.Mesh(toeGeo, material);
        toe.scale.set(0.92, 1.12, 0.48);
        toe.position.set(tx, ty, 0);
        group.add(toe);
      });
      return group;
    };

    const createVetCrossGroup = (material: THREE.Material, wireMat: THREE.Material) => {
      const group = new THREE.Group();
      const vGeo = new THREE.BoxGeometry(0.38, 1.18, 0.24);
      const hGeo = new THREE.BoxGeometry(1.18, 0.38, 0.24);
      group.add(new THREE.Mesh(vGeo, material));
      group.add(new THREE.Mesh(hGeo, material));

      const ringGeo = new THREE.TorusGeometry(0.86, 0.028, 12, 42);
      group.add(new THREE.Mesh(ringGeo, wireMat));
      return group;
    };

    const createCapsuleGroup = (matTop: THREE.Material, matBottom: THREE.Material) => {
      const group = new THREE.Group();
      const halfGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.48, 20);
      const capGeo = new THREE.SphereGeometry(0.24, 20, 16);

      const top = new THREE.Mesh(halfGeo, matTop);
      top.position.y = 0.24;
      const topCap = new THREE.Mesh(capGeo, matTop);
      topCap.position.y = 0.48;

      const bottom = new THREE.Mesh(halfGeo, matBottom);
      bottom.position.y = -0.24;
      const bottomCap = new THREE.Mesh(capGeo, matBottom);
      bottomCap.position.y = -0.48;

      group.add(top, topCap, bottom, bottomCap);
      group.rotation.z = Math.PI / 5;
      return group;
    };

    const createMiniDnaGroup = (matA: THREE.Material, matB: THREE.Material, rungMat: THREE.Material) => {
      const group = new THREE.Group();
      const nodeGeo = new THREE.SphereGeometry(0.095, 12, 12);
      const rungGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.56, 8);
      rungGeo.rotateZ(Math.PI / 2);

      const steps = 7;
      for (let i = 0; i < steps; i++) {
        const y = (i - (steps - 1) / 2) * 0.32;
        const angle = i * 0.72;
        const x = Math.cos(angle) * 0.28;
        const z = Math.sin(angle) * 0.28;

        const a = new THREE.Mesh(nodeGeo, matA);
        a.position.set(x, y, z);
        const b = new THREE.Mesh(nodeGeo, matB);
        b.position.set(-x, y, -z);

        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.y = -angle;

        group.add(a, b, rung);
      }
      return group;
    };

    interface SideItem {
      group: THREE.Group;
      side: -1 | 1;
      edgeFactor: number; // Qué tan pegado al borde lateral (0.78 - 0.90 del semiancho visible)
      baseY: number;
      baseZ: number;
      speed: number;
      amp: number;
      rotSpeed: { x: number; y: number; z: number };
      baseScale: number;
    }

    const items: SideItem[] = [
      // Lado izquierdo (arriba, centro-bajo)
      {
        group: createPawGroup(matPeach),
        side: -1,
        edgeFactor: 0.84,
        baseY: 2.9,
        baseZ: -1.5,
        speed: 0.65,
        amp: 0.28,
        rotSpeed: { x: 0.0008, y: 0.0022, z: 0.0006 },
        baseScale: 0.95,
      },
      {
        group: createCapsuleGroup(matTerracottaSoft, matMist),
        side: -1,
        edgeFactor: 0.87,
        baseY: -0.2,
        baseZ: -2.2,
        speed: 0.75,
        amp: 0.24,
        rotSpeed: { x: 0.0018, y: 0.002, z: 0.001 },
        baseScale: 0.9,
      },
      {
        group: createVetCrossGroup(matMist, matSiennaWire),
        side: -1,
        edgeFactor: 0.82,
        baseY: -3.2,
        baseZ: -2.5,
        speed: 0.55,
        amp: 0.22,
        rotSpeed: { x: 0.0012, y: 0.0018, z: 0.0008 },
        baseScale: 0.82,
      },
      // Lado derecho (arriba, centro, abajo)
      {
        group: createVetCrossGroup(matPeach, matSiennaWire),
        side: 1,
        edgeFactor: 0.84,
        baseY: 3.0,
        baseZ: -1.8,
        speed: 0.6,
        amp: 0.26,
        rotSpeed: { x: 0.001, y: -0.002, z: 0.0007 },
        baseScale: 0.88,
      },
      {
        group: createMiniDnaGroup(matPeach, matTerracottaSoft, matMist),
        side: 1,
        edgeFactor: 0.88,
        baseY: -0.1,
        baseZ: -1.5,
        speed: 0.7,
        amp: 0.25,
        rotSpeed: { x: 0.0004, y: 0.0035, z: 0.0004 },
        baseScale: 0.95,
      },
      {
        group: createPawGroup(matMist),
        side: 1,
        edgeFactor: 0.83,
        baseY: -3.1,
        baseZ: -2.0,
        speed: 0.68,
        amp: 0.24,
        rotSpeed: { x: 0.001, y: -0.0022, z: 0.0005 },
        baseScale: 0.88,
      },
    ];

    items.forEach((item) => {
      scene.add(item.group);
    });

    // Partículas muy sutiles únicamente en los bordes laterales (nunca detrás del texto central)
    const particleCount = 36;
    const pPositions = new Float32Array(particleCount * 3);
    const pSides: (-1 | 1)[] = [];
    const pFactors: number[] = [];
    const pBaseY: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
      const factor = 0.72 + Math.random() * 0.24;
      const y = (Math.random() - 0.5) * 11;
      const z = -1 - Math.random() * 4;
      pSides.push(side);
      pFactors.push(factor);
      pBaseY.push(y);
      pPositions[i * 3] = side * 8 * factor;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = z;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#5d2a1a',
      size: 0.06,
      transparent: true,
      opacity: 0.22,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Calcular posiciones laterales responsivas para que nunca invadan el centro tipográfico
    const updateSideLayout = () => {
      const aspect = width / height;
      const halfVisibleHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      const halfVisibleWidth = halfVisibleHeight * aspect;
      const isNarrow = width < 1024;
      const isMobile = width < 640;

      items.forEach((item) => {
        // Escala proporcional según ancho de pantalla para evitar saturación
        const responsiveScale = isMobile ? 0.52 : isNarrow ? 0.72 : 1;
        item.group.scale.setScalar(item.baseScale * responsiveScale);

        // Empujar más hacia el borde en pantallas estrechas para respetar el área de lectura
        const edge = isMobile ? 0.94 : isNarrow ? 0.90 : item.edgeFactor;
        const depthScale = (camZ - item.baseZ) / camZ;
        item.group.position.x = item.side * halfVisibleWidth * edge * depthScale;
        item.group.position.y = item.baseY;
        item.group.position.z = item.baseZ;
      });

      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setX(i, pSides[i] * halfVisibleWidth * pFactors[i]);
      }
      posAttr.needsUpdate = true;

      // Reducir ligeramente opacidad en móviles para máxima legibilidad
      matPeach.opacity = isMobile ? 0.35 : 0.62;
      matMist.opacity = isMobile ? 0.32 : 0.58;
      matTerracottaSoft.opacity = isMobile ? 0.24 : 0.38;
      pMat.opacity = isMobile ? 0.12 : 0.22;
    };

    updateSideLayout();

    // Parallax suave con Mouse y Scroll
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY || 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
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
      updateSideLayout();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      items.forEach((item, idx) => {
        item.group.rotation.x += item.rotSpeed.x;
        item.group.rotation.y += item.rotSpeed.y;
        item.group.rotation.z += item.rotSpeed.z;
        item.group.position.y = item.baseY + Math.sin(t * item.speed + idx * 1.1) * item.amp;
      });

      // Parallax muy contenido para no mover los objetos hacia el centro
      const targetCamX = mouseX * 0.25;
      const targetCamY = -mouseY * 0.22 - (scrollY % 1200) * 0.0005;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, camera.position.y * 0.3, -2);

      particles.position.y = Math.sin(t * 0.35) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      pGeo.dispose();
      pMat.dispose();
      matPeach.dispose();
      matMist.dispose();
      matTerracottaSoft.dispose();
      matSiennaWire.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};

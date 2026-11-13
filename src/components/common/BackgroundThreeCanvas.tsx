import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fondo 3D veterinario en Three.js (WebGL) para todo el sitio.
 * Posiciona motivos 3D temáticos (huellas, cruces clínicas, cápsula y hélice ADN)
 * exclusivamente en los márgenes laterales para no cubrir el texto central,
 * con animación continua e interacción suave con el cursor.
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

    // Iluminación editorial suave
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.1);
    dirLight.position.set(6, 10, 10);
    scene.add(dirLight);

    const peachLight = new THREE.PointLight('#fbe1d1', 1.8, 35);
    peachLight.position.set(-10, 4, 8);
    scene.add(peachLight);

    const emeraldLight = new THREE.PointLight('#F0FDFA', 1.4, 35);
    emeraldLight.position.set(10, -4, 8);
    scene.add(emeraldLight);

    // Materiales suaves en armonía con la paleta del sitio
    const matPeach = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbe1d1'),
      roughness: 0.45,
      metalness: 0.04,
      transparent: true,
      opacity: 0.62,
    });

    const matMist = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'),
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
      color: new THREE.Color('#64748B'),
      wireframe: true,
      transparent: true,
      opacity: 0.16,
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
      edgeFactor: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      offset: THREE.Vector2;
      speed: number;
      amp: number;
      rotSpeed: { x: number; y: number; z: number };
      baseScale: number;
      responsiveScale: number;
      currentScale: number;
    }

    const items: SideItem[] = [
      // Lado izquierdo
      {
        group: createPawGroup(matPeach),
        side: -1,
        edgeFactor: 0.85,
        baseX: -8,
        baseY: 2.9,
        baseZ: -1.5,
        offset: new THREE.Vector2(0, 0),
        speed: 0.65,
        amp: 0.28,
        rotSpeed: { x: 0.0008, y: 0.0022, z: 0.0006 },
        baseScale: 0.95,
        responsiveScale: 0.95,
        currentScale: 0.95,
      },
      {
        group: createCapsuleGroup(matTerracottaSoft, matMist),
        side: -1,
        edgeFactor: 0.88,
        baseX: -8.5,
        baseY: -0.2,
        baseZ: -2.2,
        offset: new THREE.Vector2(0, 0),
        speed: 0.75,
        amp: 0.24,
        rotSpeed: { x: 0.0018, y: 0.002, z: 0.001 },
        baseScale: 0.9,
        responsiveScale: 0.9,
        currentScale: 0.9,
      },
      {
        group: createVetCrossGroup(matMist, matSiennaWire),
        side: -1,
        edgeFactor: 0.83,
        baseX: -8,
        baseY: -3.2,
        baseZ: -2.5,
        offset: new THREE.Vector2(0, 0),
        speed: 0.55,
        amp: 0.22,
        rotSpeed: { x: 0.0012, y: 0.0018, z: 0.0008 },
        baseScale: 0.82,
        responsiveScale: 0.82,
        currentScale: 0.82,
      },
      // Lado derecho
      {
        group: createVetCrossGroup(matPeach, matSiennaWire),
        side: 1,
        edgeFactor: 0.85,
        baseX: 8,
        baseY: 3.0,
        baseZ: -1.8,
        offset: new THREE.Vector2(0, 0),
        speed: 0.6,
        amp: 0.26,
        rotSpeed: { x: 0.001, y: -0.002, z: 0.0007 },
        baseScale: 0.88,
        responsiveScale: 0.88,
        currentScale: 0.88,
      },
      {
        group: createMiniDnaGroup(matPeach, matTerracottaSoft, matMist),
        side: 1,
        edgeFactor: 0.88,
        baseX: 8.5,
        baseY: -0.1,
        baseZ: -1.5,
        offset: new THREE.Vector2(0, 0),
        speed: 0.7,
        amp: 0.25,
        rotSpeed: { x: 0.0004, y: 0.0035, z: 0.0004 },
        baseScale: 0.95,
        responsiveScale: 0.95,
        currentScale: 0.95,
      },
      {
        group: createPawGroup(matMist),
        side: 1,
        edgeFactor: 0.84,
        baseX: 8,
        baseY: -3.1,
        baseZ: -2.0,
        offset: new THREE.Vector2(0, 0),
        speed: 0.68,
        amp: 0.24,
        rotSpeed: { x: 0.001, y: -0.0022, z: 0.0005 },
        baseScale: 0.88,
        responsiveScale: 0.88,
        currentScale: 0.88,
      },
    ];

    items.forEach((item) => {
      scene.add(item.group);
    });

    // Partículas sutiles únicamente en los bordes laterales
    const particleCount = 36;
    const pPositions = new Float32Array(particleCount * 3);
    const pSides: (-1 | 1)[] = [];
    const pFactors: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
      const factor = 0.76 + Math.random() * 0.2;
      const y = (Math.random() - 0.5) * 11;
      const z = -1 - Math.random() * 4;
      pSides.push(side);
      pFactors.push(factor);
      pPositions[i * 3] = side * 8 * factor;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = z;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#64748B',
      size: 0.055,
      transparent: true,
      opacity: 0.2,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const updateSideLayout = () => {
      const aspect = width / height;
      const halfVisibleHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      const halfVisibleWidth = halfVisibleHeight * aspect;
      const isNarrow = width < 1024;
      const isMobile = width < 640;

      items.forEach((item) => {
        const scaleFactor = isMobile ? 0.5 : isNarrow ? 0.72 : 1;
        item.responsiveScale = item.baseScale * scaleFactor;
        item.currentScale = item.responsiveScale;
        item.group.scale.setScalar(item.responsiveScale);

        const edge = isMobile ? 0.94 : isNarrow ? 0.9 : item.edgeFactor;
        const depthScale = (camZ - item.baseZ) / camZ;
        item.baseX = item.side * halfVisibleWidth * edge * depthScale;
        item.group.position.set(item.baseX, item.baseY, item.baseZ);
      });

      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setX(i, pSides[i] * halfVisibleWidth * pFactors[i]);
      }
      posAttr.needsUpdate = true;

      matPeach.opacity = isMobile ? 0.32 : 0.62;
      matMist.opacity = isMobile ? 0.3 : 0.58;
      matTerracottaSoft.opacity = isMobile ? 0.22 : 0.38;
      pMat.opacity = isMobile ? 0.1 : 0.2;
    };

    updateSideLayout();

    // Cursor interactivo + Parallax suave
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
      updateSideLayout();
      updateCursorWorld();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      items.forEach((item, idx) => {
        const floatY = Math.sin(t * item.speed + idx * 1.1) * item.amp;

        let targetOffX = 0;
        let targetOffY = 0;
        let targetScale = item.responsiveScale;
        let boostRot = 1;

        if (cursorActive) {
          const dx = item.baseX - cursorWorld.x;
          const dy = item.baseY + floatY - cursorWorld.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 4.2;

          if (dist < radius && dist > 0.001) {
            const strength = 1 - dist / radius;
            // Empuje suave hacia afuera del borde lateral para no invadir el centro
            targetOffX = item.side * Math.abs(dx / dist) * strength * 0.65;
            targetOffY = (dy / dist) * strength * 0.75;
            targetScale = item.responsiveScale * (1 + strength * 0.18);
            boostRot = 1 + strength * 3.0;
          }
        }

        item.offset.x += (targetOffX - item.offset.x) * 0.08;
        item.offset.y += (targetOffY - item.offset.y) * 0.08;
        item.currentScale += (targetScale - item.currentScale) * 0.1;

        item.group.position.x = item.baseX + item.offset.x;
        item.group.position.y = item.baseY + floatY + item.offset.y;
        item.group.scale.setScalar(item.currentScale);

        item.group.rotation.x += item.rotSpeed.x * boostRot;
        item.group.rotation.y += item.rotSpeed.y * boostRot;
        item.group.rotation.z += item.rotSpeed.z * boostRot;
      });

      const targetCamX = mouseNdcX * 0.22;
      const targetCamY = mouseNdcY * 0.2 - (scrollY % 1200) * 0.0005;
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
      window.removeEventListener('mouseleave', handleMouseLeave);
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

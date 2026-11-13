import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fondo 3D disperso en Three.js (WebGL) exclusivo para la Landing Page.
 * Renderiza motivos veterinarios dispersos (huellas, cruces clínicas, cápsulas,
 * hélices ADN y anillos orgánicos) con animación continua, parallax por scroll
 * y reacción física suave al movimiento del cursor.
 */
export const BackgroundThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();

    const fov = 45;
    const camZ = 15;
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

    // Iluminación editorial limpia
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.15);
    dirLight.position.set(6, 10, 10);
    scene.add(dirLight);

    const emeraldLight = new THREE.PointLight('#fbe1d1', 1.6, 32);
    emeraldLight.position.set(-8, 5, 6);
    scene.add(emeraldLight);

    const peachLight = new THREE.PointLight('#ffffff', 1.4, 32);
    peachLight.position.set(8, -4, 6);
    scene.add(peachLight);

    // Materiales en la paleta editorial Steep (Blush Peach, Mist Gray, Slate Gray & Sienna Brown)
    const matEmeraldSoft = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e6d3c7'),
      roughness: 0.45,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
    });

    const matPeachSoft = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbe1d1'),
      roughness: 0.45,
      metalness: 0.04,
      transparent: true,
      opacity: 0.52,
    });

    const matSlateMist = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e2e6'),
      roughness: 0.5,
      metalness: 0.06,
      transparent: true,
      opacity: 0.48,
    });

    const matWireSlate = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#777b86'),
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    const matWireEmerald = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#5d2a1a'),
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    // Constructores de motivos 3D veterinarios
    const createPawGroup = (material: THREE.Material) => {
      const group = new THREE.Group();
      const padGeo = new THREE.SphereGeometry(0.42, 18, 18);
      const pad = new THREE.Mesh(padGeo, material);
      pad.scale.set(1.15, 0.92, 0.4);
      pad.position.set(0, -0.16, 0);
      group.add(pad);

      const toeGeo = new THREE.SphereGeometry(0.16, 14, 14);
      const offsets: [number, number][] = [
        [-0.48, 0.32],
        [-0.17, 0.52],
        [0.17, 0.52],
        [0.48, 0.32],
      ];
      offsets.forEach(([tx, ty]) => {
        const toe = new THREE.Mesh(toeGeo, material);
        toe.scale.set(0.9, 1.1, 0.45);
        toe.position.set(tx, ty, 0);
        group.add(toe);
      });
      return group;
    };

    const createVetCrossGroup = (material: THREE.Material, ringMat: THREE.Material) => {
      const group = new THREE.Group();
      const vGeo = new THREE.BoxGeometry(0.32, 0.98, 0.2);
      const hGeo = new THREE.BoxGeometry(0.98, 0.32, 0.2);
      group.add(new THREE.Mesh(vGeo, material));
      group.add(new THREE.Mesh(hGeo, material));

      const ringGeo = new THREE.TorusGeometry(0.74, 0.025, 10, 36);
      group.add(new THREE.Mesh(ringGeo, ringMat));
      return group;
    };

    const createCapsuleGroup = (matTop: THREE.Material, matBottom: THREE.Material) => {
      const group = new THREE.Group();
      const halfGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 18);
      const capGeo = new THREE.SphereGeometry(0.2, 18, 14);

      const top = new THREE.Mesh(halfGeo, matTop);
      top.position.y = 0.2;
      const topCap = new THREE.Mesh(capGeo, matTop);
      topCap.position.y = 0.4;

      const bottom = new THREE.Mesh(halfGeo, matBottom);
      bottom.position.y = -0.2;
      const bottomCap = new THREE.Mesh(capGeo, matBottom);
      bottomCap.position.y = -0.4;

      group.add(top, topCap, bottom, bottomCap);
      group.rotation.z = Math.PI / 5;
      return group;
    };

    const createMiniDnaGroup = (matA: THREE.Material, matB: THREE.Material, rungMat: THREE.Material) => {
      const group = new THREE.Group();
      const nodeGeo = new THREE.SphereGeometry(0.085, 10, 10);
      const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8);
      rungGeo.rotateZ(Math.PI / 2);

      for (let i = 0; i < 6; i++) {
        const y = (i - 2.5) * 0.28;
        const angle = i * 0.78;
        const x = Math.cos(angle) * 0.24;
        const z = Math.sin(angle) * 0.24;

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

    const createOrbitalRingGroup = (ringMat: THREE.Material, coreMat: THREE.Material) => {
      const group = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.68, 0.03, 12, 42);
      const coreGeo = new THREE.IcosahedronGeometry(0.28, 0);
      group.add(new THREE.Mesh(ringGeo, ringMat));
      group.add(new THREE.Mesh(coreGeo, coreMat));
      return group;
    };

    interface ScatteredItem {
      group: THREE.Group;
      basePos: THREE.Vector3;
      offset: THREE.Vector3;
      speed: number;
      amp: number;
      rotSpeed: { x: number; y: number; z: number };
      baseScale: number;
      currentScale: number;
    }

    const items: ScatteredItem[] = [];

    const scatteredConfigs: Array<{
      group: THREE.Group;
      pos: [number, number, number];
      speed: number;
      amp: number;
      scale: number;
    }> = [
      { group: createPawGroup(matPeachSoft), pos: [-8.2, 3.8, -2.5], speed: 0.65, amp: 0.35, scale: 0.9 },
      { group: createVetCrossGroup(matEmeraldSoft, matWireEmerald), pos: [8.4, 3.4, -3.2], speed: 0.55, amp: 0.32, scale: 0.85 },
      { group: createCapsuleGroup(matEmeraldSoft, matSlateMist), pos: [-6.8, -0.8, -3.8], speed: 0.75, amp: 0.3, scale: 0.88 },
      { group: createMiniDnaGroup(matEmeraldSoft, matPeachSoft, matSlateMist), pos: [7.6, -0.4, -2.4], speed: 0.68, amp: 0.34, scale: 0.92 },
      { group: createOrbitalRingGroup(matWireSlate, matPeachSoft), pos: [-2.4, 4.4, -5.5], speed: 0.5, amp: 0.28, scale: 0.95 },
      { group: createPawGroup(matSlateMist), pos: [2.8, -4.1, -4.8], speed: 0.72, amp: 0.3, scale: 0.82 },
      { group: createVetCrossGroup(matPeachSoft, matWireSlate), pos: [-7.8, -3.9, -2.8], speed: 0.6, amp: 0.28, scale: 0.78 },
      { group: createCapsuleGroup(matPeachSoft, matEmeraldSoft), pos: [8.6, -3.5, -3.4], speed: 0.78, amp: 0.32, scale: 0.82 },
      { group: createOrbitalRingGroup(matWireEmerald, matSlateMist), pos: [0.6, 0.8, -6.8], speed: 0.48, amp: 0.25, scale: 0.9 },
      { group: createPawGroup(matEmeraldSoft), pos: [-3.8, -3.2, -5.8], speed: 0.64, amp: 0.26, scale: 0.72 },
    ];

    scatteredConfigs.forEach((cfg) => {
      cfg.group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      cfg.group.scale.setScalar(cfg.scale);
      scene.add(cfg.group);
      items.push({
        group: cfg.group,
        basePos: new THREE.Vector3(cfg.pos[0], cfg.pos[1], cfg.pos[2]),
        offset: new THREE.Vector3(0, 0, 0),
        speed: cfg.speed,
        amp: cfg.amp,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.004 + 0.001,
          y: (Math.random() - 0.5) * 0.005 + 0.002,
          z: (Math.random() - 0.5) * 0.002,
        },
        baseScale: cfg.scale,
        currentScale: cfg.scale,
      });
    });

    // Partículas dispersas que reaccionan suavemente al cursor
    const particleCount = 65;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 24;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 2] = -1 - Math.random() * 7;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#5d2a1a',
      size: 0.07,
      transparent: true,
      opacity: 0.22,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Estado del cursor en coordenadas normalizadas (-1 a 1) y mundo 3D
    let mouseNdcX = 0;
    let mouseNdcY = 0;
    let cursorActive = false;
    let scrollY = window.scrollY || 0;
    const cursorWorld = new THREE.Vector3(999, 999, 0);

    const updateCursorWorld = () => {
      if (!cursorActive) return;
      const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      const halfW = halfH * (width / height);
      cursorWorld.set(mouseNdcX * halfW, mouseNdcY * halfH, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseNdcX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdcY = -((e.clientY / window.innerHeight) * 2 - 1);
      cursorActive = true;
      updateCursorWorld();
    };

    const handleMouseLeave = () => {
      cursorActive = false;
      cursorWorld.set(999, 999, 0);
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
        // Flotación orgánica continua
        const floatY = Math.sin(t * item.speed + idx * 1.1) * item.amp;
        const floatX = Math.cos(t * item.speed * 0.7 + idx) * (item.amp * 0.4);

        // Interacción física con el cursor (repulsión suave + rotación + pulso de escala)
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        let targetScale = item.baseScale;
        let boostRot = 1;

        if (cursorActive) {
          const dx = item.basePos.x + floatX - cursorWorld.x;
          const dy = item.basePos.y + floatY - cursorWorld.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 4.8;

          if (dist < radius && dist > 0.001) {
            const strength = (1 - dist / radius);
            targetOffsetX = (dx / dist) * strength * 1.35;
            targetOffsetY = (dy / dist) * strength * 1.35;
            targetScale = item.baseScale * (1 + strength * 0.22);
            boostRot = 1 + strength * 3.2;
          }
        }

        item.offset.x += (targetOffsetX - item.offset.x) * 0.08;
        item.offset.y += (targetOffsetY - item.offset.y) * 0.08;
        item.currentScale += (targetScale - item.currentScale) * 0.1;

        item.group.position.x = item.basePos.x + floatX + item.offset.x;
        item.group.position.y = item.basePos.y + floatY + item.offset.y;
        item.group.scale.setScalar(item.currentScale);

        item.group.rotation.x += item.rotSpeed.x * boostRot;
        item.group.rotation.y += item.rotSpeed.y * boostRot;
        item.group.rotation.z += item.rotSpeed.z * boostRot;
      });

      // Parallax de cámara siguiendo suavemente el cursor y el scroll
      const targetCamX = mouseNdcX * 0.65;
      const targetCamY = mouseNdcY * 0.45 - (scrollY % 1600) * 0.0008;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, camera.position.y * 0.25, -3);

      particles.rotation.y = t * 0.025 + mouseNdcX * 0.08;
      particles.rotation.x = mouseNdcY * 0.05;

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
      matEmeraldSoft.dispose();
      matPeachSoft.dispose();
      matSlateMist.dispose();
      matWireSlate.dispose();
      matWireEmerald.dispose();
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


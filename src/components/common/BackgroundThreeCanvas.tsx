import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fondo 3D ambiental en Three.js (WebGL) con profundidad espacial,
 * malla topográfica ondulante y geometrías orgánicas flotantes
 * que reaccionan suavemente al scroll y al movimiento del cursor.
 */
export const BackgroundThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

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

    // Iluminación editorial cálida
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.2);
    dirLight.position.set(6, 10, 8);
    scene.add(dirLight);

    const peachLight = new THREE.PointLight('#fbe1d1', 2.2, 30);
    peachLight.position.set(-8, 4, 6);
    scene.add(peachLight);

    // 1. Malla Topográfica 3D Ondulante (da profundidad al fondo sin ensuciar el texto)
    const waveGeo = new THREE.PlaneGeometry(34, 22, 32, 22);
    const waveMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#d8d8dc'),
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.6;
    waveMesh.position.set(0, -4.2, -3);
    scene.add(waveMesh);

    const baseWavePos = waveGeo.attributes.position.array.slice() as Float32Array;

    // 2. Cuerpos Geométricos Flotantes en Profundidad (Blush Peach, Mist Gray & Sienna)
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    const matPeachSoft = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbe1d1'),
      roughness: 0.4,
      metalness: 0.05,
      transparent: true,
      opacity: 0.65,
    });

    const matMistSoft = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e8e8eb'),
      roughness: 0.5,
      metalness: 0.08,
      transparent: true,
      opacity: 0.6,
    });

    const matWireAccent = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#5d2a1a'),
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    interface FloatingBody {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      speed: number;
      rotSpeed: { x: number; y: number };
      amp: number;
    }

    const bodies: FloatingBody[] = [];

    const specs = [
      { geo: new THREE.TorusGeometry(1.6, 0.22, 16, 60), mat: matPeachSoft, pos: [-7.5, 3.2, -4], speed: 0.7, amp: 0.45 },
      { geo: new THREE.IcosahedronGeometry(1.3, 1), mat: matWireAccent, pos: [7.8, 2.8, -5], speed: 0.55, amp: 0.5 },
      { geo: new THREE.SphereGeometry(0.95, 24, 24), mat: matMistSoft, pos: [-6.2, -2.5, -2.5], speed: 0.85, amp: 0.35 },
      { geo: new THREE.TorusGeometry(1.1, 0.12, 16, 50), mat: matWireAccent, pos: [6.5, -2.2, -3], speed: 0.65, amp: 0.4 },
      { geo: new THREE.OctahedronGeometry(0.9, 0), mat: matPeachSoft, pos: [0.5, 4.5, -6], speed: 0.6, amp: 0.3 },
      { geo: new THREE.IcosahedronGeometry(0.75, 0), mat: matMistSoft, pos: [-1.8, -3.8, -4], speed: 0.9, amp: 0.38 },
    ];

    specs.forEach((s) => {
      const mesh = new THREE.Mesh(s.geo, s.mat);
      mesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
      floatingGroup.add(mesh);
      bodies.push({
        mesh,
        basePos: new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]),
        speed: s.speed,
        rotSpeed: { x: 0.002 + Math.random() * 0.003, y: 0.003 + Math.random() * 0.003 },
        amp: s.amp,
      });
    });

    // 3. Partículas Ambientales Sutiles
    const particleCount = 70;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 26;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#5d2a1a',
      size: 0.075,
      transparent: true,
      opacity: 0.28,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Parallax con Mouse y Scroll
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
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Animar malla topográfica
      const posAttr = waveGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3;
        const x = baseWavePos[ix];
        const y = baseWavePos[ix + 1];
        const zWave = Math.sin(x * 0.35 + t * 0.7) * 0.55 + Math.cos(y * 0.4 + t * 0.55) * 0.45;
        posAttr.setZ(i, zWave);
      }
      posAttr.needsUpdate = true;

      // Animar cuerpos flotantes
      bodies.forEach((b, idx) => {
        b.mesh.rotation.x += b.rotSpeed.x;
        b.mesh.rotation.y += b.rotSpeed.y;
        b.mesh.position.y = b.basePos.y + Math.sin(t * b.speed + idx) * b.amp;
      });

      // Parallax suave por mouse y scroll
      const targetCamX = mouseX * 0.7;
      const targetCamY = -mouseY * 0.45 - scrollY * 0.0018;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -scrollY * 0.0012, -2);

      particles.rotation.y = t * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      waveGeo.dispose();
      waveMat.dispose();
      pGeo.dispose();
      pMat.dispose();
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

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCcw, Activity, Cpu, Play, Pause } from 'lucide-react';

interface HeroThreeSceneProps {
  onOpenERP?: () => void;
}

export const HeroThreeScene: React.FC<HeroThreeSceneProps> = ({ onOpenERP }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [animMode, setAnimMode] = useState<'helice' | 'pulso' | 'orbita'>('helice');
  const [isPaused, setIsPaused] = useState(false);
  const [bpm, setBpm] = useState(88);

  // Refs to share state with requestAnimationFrame loop without re-creating scene
  const modeRef = useRef<'helice' | 'pulso' | 'orbita'>('helice');
  const pausedRef = useRef(false);
  const pulseBoostRef = useRef(0);

  useEffect(() => {
    modeRef.current = animMode;
  }, [animMode]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const triggerHeartbeatBoost = () => {
    pulseBoostRef.current = 1.6;
    setBpm((prev) => (prev > 110 ? 86 : prev + 12));
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // 1. SCENE, CAMERA & RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fafafb'); // Steep Fog White

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. LIGHTING (Warm editorial studio lighting)
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.8);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const warmRimLight = new THREE.PointLight('#fbe1d1', 2.4, 15);
    warmRimLight.position.set(-4, -2, 4);
    scene.add(warmRimLight);

    const siennaFillLight = new THREE.PointLight('#5d2a1a', 1.2, 12);
    siennaFillLight.position.set(3, -3, 3);
    scene.add(siennaFillLight);

    // 3. MAIN ROOT GROUP (Interactive rotation)
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // MATERIALS (Steep Palette: Ink Black #17191c, Blush Peach #fbe1d1, Sienna Brown #5d2a1a, Paper White #ffffff)
    const matInk = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#17191c'),
      roughness: 0.25,
      metalness: 0.15,
    });

    const matPeach = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbe1d1'),
      roughness: 0.3,
      metalness: 0.05,
    });

    const matSienna = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5d2a1a'),
      roughness: 0.35,
      metalness: 0.2,
    });

    const matWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#979799'),
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });

    // 4. CENTRAL CORE: Sculptural Veterinary Medical Cross + Bio-Core
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    // Rounded cross bars
    const barGeoV = new THREE.BoxGeometry(0.48, 1.55, 0.48);
    const barGeoH = new THREE.BoxGeometry(1.55, 0.48, 0.48);
    const crossV = new THREE.Mesh(barGeoV, matSienna);
    const crossH = new THREE.Mesh(barGeoH, matSienna);
    coreGroup.add(crossV, crossH);

    // Outer geodesic wireframe sphere around the cross
    const geoSphere = new THREE.IcosahedronGeometry(1.38, 1);
    const wireSphere = new THREE.Mesh(geoSphere, matWire);
    coreGroup.add(wireSphere);

    // 5. DOUBLE DNA HELIX & PAW BIO-NODES (22 rungs)
    const helixGroup = new THREE.Group();
    rootGroup.add(helixGroup);

    const nodeSpheres: {
      meshA: THREE.Mesh;
      meshB: THREE.Mesh;
      rung: THREE.Mesh;
      index: number;
      baseY: number;
      angle: number;
    }[] = [];

    const sphereGeo = new THREE.SphereGeometry(0.11, 20, 20);
    const totalNodes = 18;
    const heightSpan = 4.2;

    for (let i = 0; i < totalNodes; i++) {
      const t = i / (totalNodes - 1);
      const y = (t - 0.5) * heightSpan;
      const angle = t * Math.PI * 2.5;
      const radius = 1.65;

      const xA = Math.cos(angle) * radius;
      const zA = Math.sin(angle) * radius;
      const xB = Math.cos(angle + Math.PI) * radius;
      const zB = Math.sin(angle + Math.PI) * radius;

      const meshA = new THREE.Mesh(sphereGeo, i % 2 === 0 ? matInk : matPeach);
      meshA.position.set(xA, y, zA);

      const meshB = new THREE.Mesh(sphereGeo, i % 2 === 0 ? matPeach : matSienna);
      meshB.position.set(xB, y, zB);

      // Connecting rung cylinder
      const rungGeo = new THREE.CylinderGeometry(0.018, 0.018, radius * 2, 8);
      rungGeo.rotateZ(Math.PI / 2);
      const rung = new THREE.Mesh(
        rungGeo,
        new THREE.MeshBasicMaterial({ color: '#d5d5d7', transparent: true, opacity: 0.55 })
      );
      rung.position.set(0, y, 0);
      rung.rotation.y = -angle;

      helixGroup.add(meshA, meshB, rung);
      nodeSpheres.push({ meshA, meshB, rung, index: i, baseY: y, angle });
    }

    // 6. ORBITAL TELEMETRY RINGS
    const ringsGroup = new THREE.Group();
    rootGroup.add(ringsGroup);

    const ring1Geo = new THREE.TorusGeometry(2.25, 0.018, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, matInk);
    ring1.rotation.x = Math.PI / 2.6;
    ring1.rotation.y = 0.3;

    const ring2Geo = new THREE.TorusGeometry(2.55, 0.025, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, matPeach);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.z = 0.5;

    ringsGroup.add(ring1, ring2);

    // 7. FLOATING AMBIENT PARTICLES
    const particlesCount = 45;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: '#5d2a1a',
      size: 0.055,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 8. POINTER & DRAG INTERACTION
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotX = 0.15;
    let targetRotY = 0.35;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      pulseBoostRef.current = 1.25;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.012;
        targetRotX += dy * 0.012;
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        targetRotY += normX * 0.008;
        targetRotX = normY * 0.25;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.style.cursor = 'grab';
    domElem.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 9. RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 480;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. ANIMATION LOOP
    let clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;

      if (!pausedRef.current) {
        // Decay pulse boost smoothly
        if (pulseBoostRef.current > 0) {
          pulseBoostRef.current = Math.max(0, pulseBoostRef.current - 0.03);
        }

        // Smoothly interpolate root orientation
        targetRotY += currentMode === 'orbita' ? 0.018 : 0.006;
        rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;

        // Core heartbeat / breathing pulse
        const heartBeat =
          currentMode === 'pulso'
            ? 1 + Math.sin(elapsed * 5.5) * 0.14 + pulseBoostRef.current * 0.15
            : 1 + Math.sin(elapsed * 2.4) * 0.06 + pulseBoostRef.current * 0.12;
        coreGroup.scale.set(heartBeat, heartBeat, heartBeat);
        coreGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.2;
        wireSphere.rotation.y = -elapsed * 0.4;

        // Animate DNA Bio-nodes depending on selected mode
        nodeSpheres.forEach((item) => {
          const wave = Math.sin(elapsed * 2.2 + item.index * 0.45);
          const dynamicRadius =
            currentMode === 'pulso'
              ? 1.65 + wave * 0.32
              : currentMode === 'orbita'
              ? 1.65 + Math.cos(elapsed * 3 + item.index) * 0.18
              : 1.65;

          const currentAngle = item.angle + (currentMode === 'helice' ? elapsed * 0.35 : 0);

          item.meshA.position.x = Math.cos(currentAngle) * dynamicRadius;
          item.meshA.position.z = Math.sin(currentAngle) * dynamicRadius;
          item.meshA.position.y = item.baseY + wave * 0.08;

          item.meshB.position.x = Math.cos(currentAngle + Math.PI) * dynamicRadius;
          item.meshB.position.z = Math.sin(currentAngle + Math.PI) * dynamicRadius;
          item.meshB.position.y = item.baseY - wave * 0.08;

          item.rung.position.y = item.baseY;
          item.rung.rotation.y = -currentAngle;
          item.rung.scale.x = dynamicRadius / 1.65;
        });

        // Rings rotation
        ring1.rotation.z = elapsed * (currentMode === 'orbita' ? 0.9 : 0.35);
        ring2.rotation.y = -elapsed * (currentMode === 'orbita' ? 0.75 : 0.28);

        // Ambient particles gentle float
        particleSystem.rotation.y = elapsed * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="rounded-[20px] overflow-hidden bg-[#ffffff] p-3 steep-floating-artifact select-none">
      {/* Top Floating Telemetry Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-[#ececec]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5d2a1a] animate-ping" />
          <span className="text-xs font-medium text-[#17191c]">
            Bio-Escáner 3D · Three.js WebGL
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#fbe1d1] text-[#5d2a1a] font-medium">
            {bpm} LPM
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Reanudar animación 3D' : 'Pausar animación 3D'}
            className="p-1.5 rounded-full bg-[#f2f2f3] hover:bg-[#e5e5e7] text-[#17191c] transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Interactive 3D WebGL Canvas Container */}
      <div className="relative rounded-[14px] overflow-hidden bg-[#fafafb] mt-2">
        <div
          ref={mountRef}
          onClick={triggerHeartbeatBoost}
          className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing"
          title="Arrastra para rotar el modelo 3D o haz clic para enviar un pulso cardíaco"
        />

        {/* Floating Interactive Mode Pills inside 3D Viewport */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-[#ffffff]/90 backdrop-blur-md p-1 rounded-full shadow-xs pointer-events-auto">
            <button
              type="button"
              onClick={() => setAnimMode('helice')}
              className={`px-3 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                animMode === 'helice'
                  ? 'bg-[#17191c] text-[#ffffff]'
                  : 'text-[#777b86] hover:text-[#17191c]'
              }`}
            >
              ADN Hélice
            </button>
            <button
              type="button"
              onClick={() => setAnimMode('pulso')}
              className={`px-3 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                animMode === 'pulso'
                  ? 'bg-[#17191c] text-[#ffffff]'
                  : 'text-[#777b86] hover:text-[#17191c]'
              }`}
            >
              Pulso Vital
            </button>
            <button
              type="button"
              onClick={() => setAnimMode('orbita')}
              className={`px-3 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                animMode === 'orbita'
                  ? 'bg-[#17191c] text-[#ffffff]'
                  : 'text-[#777b86] hover:text-[#17191c]'
              }`}
            >
              Órbita IA
            </button>
          </div>

          <button
            type="button"
            onClick={triggerHeartbeatBoost}
            className="px-3 py-1 rounded-full bg-[#fbe1d1] text-[#5d2a1a] text-[11px] font-medium hover:opacity-90 transition-opacity pointer-events-auto cursor-pointer flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            <span>Impulso Cardíaco</span>
          </button>
        </div>
      </div>

      {/* Bottom Artifact Footer */}
      <div className="pt-3 pb-1 px-2 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-[#979799]">
            Interactúa arrastrando el cursor · Expediente EXP-2026-001 (Lucas)
          </div>
          <div className="text-xs font-medium text-[#17191c] mt-0.5">
            Simulación Biométrica & Genómica Veterinaria
          </div>
        </div>
        {onOpenERP && (
          <button
            type="button"
            onClick={onOpenERP}
            className="text-xs px-4 py-2 bg-[#17191c] text-[#ffffff] rounded-full font-normal hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            Abrir ERP →
          </button>
        )}
      </div>
    </div>
  );
};

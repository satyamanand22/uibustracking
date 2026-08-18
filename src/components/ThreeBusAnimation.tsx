import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBusAnimationProps {
  interactive?: boolean;
  speedMultiplier?: number;
  className?: string;
}

export const ThreeBusAnimation: React.FC<ThreeBusAnimationProps> = ({
  interactive = false,
  speedMultiplier = 1,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.15, y: -0.6 });
  const currentRotation = useRef({ x: 0.15, y: -0.6 });
  const speedRef = useRef(speedMultiplier);
  const interactiveRef = useRef(interactive);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x051424, 0.025);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 1.8, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x0e2842, 1.4);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    cyanKeyLight.position.set(5, 8, 4);
    scene.add(cyanKeyLight);

    const purpleFillLight = new THREE.DirectionalLight(0x3880ff, 1.2);
    purpleFillLight.position.set(-5, 4, -4);
    scene.add(purpleFillLight);

    // 3. Group for the Entire Bus Structure
    const busGroup = new THREE.Group();
    scene.add(busGroup);

    // --- MATERIALS ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c2136,
      metalness: 0.85,
      roughness: 0.25,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x061524,
      metalness: 0.9,
      roughness: 0.3,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a324d,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
    });

    const redGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00a3cc,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      roughness: 0.9,
    });

    // --- BUS CHASSIS ---
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.1, 4.2);
    const busBody = new THREE.Mesh(bodyGeo, bodyMat);
    busBody.position.y = 0.85;
    busGroup.add(busBody);

    // Aerodynamic front nose slope
    const noseGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 32, 1, false, 0, Math.PI);
    const busNose = new THREE.Mesh(noseGeo, bodyMat);
    busNose.rotation.z = Math.PI / 2;
    busNose.rotation.y = -Math.PI / 2;
    busNose.position.set(0, 0.85, 2.05);
    busGroup.add(busNose);

    // Roof equipment / battery bay
    const roofBayGeo = new THREE.BoxGeometry(1.3, 0.18, 3.2);
    const roofBay = new THREE.Mesh(roofBayGeo, roofMat);
    roofBay.position.set(0, 1.48, 0);
    busGroup.add(roofBay);

    // Rooftop AC and antenna units
    const acGeo = new THREE.BoxGeometry(0.9, 0.12, 0.8);
    const acUnit = new THREE.Mesh(acGeo, bodyMat);
    acUnit.position.set(0, 1.6, -0.6);
    busGroup.add(acUnit);

    // Rooftop Cyan LED Beacon
    const beaconGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const beacon = new THREE.Mesh(beaconGeo, cyanGlowMat);
    beacon.position.set(0, 1.62, 1.2);
    busGroup.add(beacon);

    // --- WINDOWS (Side & Front Windshield) ---
    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.4, 0.65);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.98, 2.11);
    windshield.rotation.x = -0.15;
    busGroup.add(windshield);

    // Side Windows (Left & Right)
    const sideWindowGeo = new THREE.PlaneGeometry(3.2, 0.5);
    const leftWindow = new THREE.Mesh(sideWindowGeo, glassMat);
    leftWindow.position.set(-0.805, 0.98, 0);
    leftWindow.rotation.y = -Math.PI / 2;
    busGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeo, glassMat);
    rightWindow.position.set(0.805, 0.98, 0);
    rightWindow.rotation.y = Math.PI / 2;
    busGroup.add(rightWindow);

    // Front Destination LED Display Strip
    const destGeo = new THREE.PlaneGeometry(1.1, 0.14);
    const destMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const destScreen = new THREE.Mesh(destGeo, destMat);
    destScreen.position.set(0, 1.34, 2.08);
    busGroup.add(destScreen);

    // --- LIGHTING ACCENTS ---
    // Neon side cyber-lines
    const sideStripGeo = new THREE.BoxGeometry(0.04, 0.04, 3.8);
    const leftStrip = new THREE.Mesh(sideStripGeo, cyanGlowMat);
    leftStrip.position.set(-0.81, 0.5, 0);
    busGroup.add(leftStrip);

    const rightStrip = new THREE.Mesh(sideStripGeo, cyanGlowMat);
    rightStrip.position.set(0.81, 0.5, 0);
    busGroup.add(rightStrip);

    // Twin Headlamps
    const lampGeo = new THREE.BoxGeometry(0.28, 0.08, 0.05);
    const leftLamp = new THREE.Mesh(lampGeo, cyanGlowMat);
    leftLamp.position.set(-0.52, 0.55, 2.11);
    busGroup.add(leftLamp);

    const rightLamp = new THREE.Mesh(lampGeo, cyanGlowMat);
    rightLamp.position.set(0.52, 0.55, 2.11);
    busGroup.add(rightLamp);

    // Taillights
    const tailGeo = new THREE.BoxGeometry(0.3, 0.08, 0.05);
    const leftTail = new THREE.Mesh(tailGeo, redGlowMat);
    leftTail.position.set(-0.52, 0.65, -2.11);
    busGroup.add(leftTail);

    const rightTail = new THREE.Mesh(tailGeo, redGlowMat);
    rightTail.position.set(0.52, 0.65, -2.11);
    busGroup.add(rightTail);

    // Light beam projectors (Cones forward)
    const beamGeo = new THREE.ConeGeometry(0.6, 4, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const leftBeam = new THREE.Mesh(beamGeo, beamMat);
    leftBeam.position.set(-0.52, 0.55, 4.0);
    leftBeam.rotation.x = Math.PI / 2;
    busGroup.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamGeo, beamMat);
    rightBeam.position.set(0.52, 0.55, 4.0);
    rightBeam.rotation.x = Math.PI / 2;
    busGroup.add(rightBeam);

    // --- WHEELS ---
    const wheelMeshes: THREE.Group[] = [];
    const wheelPositions = [
      { x: -0.78, y: 0.32, z: 1.3 },
      { x: 0.78, y: 0.32, z: 1.3 },
      { x: -0.78, y: 0.32, z: -1.2 },
      { x: 0.78, y: 0.32, z: -1.2 },
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      // Tire
      const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);

      // Rim
      const rimGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 20);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.y = Math.PI / 2;
      wheelGroup.add(rim);

      // Center Hub
      const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.24, 12);
      const hub = new THREE.Mesh(hubGeo, cyanGlowMat);
      hub.rotation.z = Math.PI / 2;
      wheelGroup.add(hub);

      busGroup.add(wheelGroup);
      wheelMeshes.push(wheelGroup);
    });

    // --- 4. INFINITE CYBER ROAD & GRID ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x00e5ff, 0x14344d);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Glowing Lane Matrix Stripes
    const roadLinesGroup = new THREE.Group();
    scene.add(roadLinesGroup);

    const laneGeo = new THREE.PlaneGeometry(0.12, 1.8);
    const laneMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
    });

    const roadDashes: THREE.Mesh[] = [];
    for (let i = -15; i <= 15; i += 3) {
      const dash = new THREE.Mesh(laneGeo, laneMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, i);
      roadLinesGroup.add(dash);
      roadDashes.push(dash);
    }

    // Outer Edge glowing track lines
    const trackGeo = new THREE.PlaneGeometry(0.06, 60);
    const leftTrack = new THREE.Mesh(trackGeo, laneMat);
    leftTrack.rotation.x = -Math.PI / 2;
    leftTrack.position.set(-2.2, 0.01, 0);
    scene.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeo, laneMat);
    rightTrack.rotation.x = -Math.PI / 2;
    rightTrack.position.set(2.2, 0.01, 0);
    scene.add(rightTrack);

    // --- 5. FLOATING TELEMETRY PARTICLES / DUST ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 24;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 6. MOUSE / TOUCH INTERACTION ---
    const handleMouseDown = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveRef.current || !isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x = Math.max(
        -0.2,
        Math.min(0.6, targetRotation.current.x + deltaY * 0.006)
      );

      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!interactiveRef.current || e.touches.length === 0) return;
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactiveRef.current || !isDraggingRef.current || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMousePos.current.x;
      const deltaY = e.touches[0].clientY - prevMousePos.current.y;

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x = Math.max(
        -0.2,
        Math.min(0.6, targetRotation.current.x + deltaY * 0.006)
      );

      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // --- 7. ANIMATION LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const currentSpeed = speedRef.current;

      // Road movement
      roadDashes.forEach((dash) => {
        dash.position.z -= 14 * currentSpeed * delta;
        if (dash.position.z < -15) {
          dash.position.z += 30;
        }
      });

      // Grid helper texture translation / movement illusion
      gridHelper.position.z = (gridHelper.position.z - 14 * currentSpeed * delta) % 2;

      // Wheel rotation
      wheelMeshes.forEach((w) => {
        w.rotation.x += 16 * currentSpeed * delta;
      });

      // Particles flow backward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 2; i < particleCount * 3; i += 3) {
        positions[i] -= 18 * currentSpeed * delta;
        if (positions[i] < -12) {
          positions[i] = 12;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Floating bus chassis physics (suspension bobbing & engine hum)
      const suspensionBob = Math.sin(elapsedTime * 8 * currentSpeed) * 0.02;
      busGroup.position.y = suspensionBob;

      // Rotation & camera angle
      if (interactiveRef.current) {
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
        busGroup.rotation.x = currentRotation.current.x;
        busGroup.rotation.y = currentRotation.current.y;
      } else {
        // Subtle autonomous drifting presentation
        const autoYaw = -0.55 + Math.sin(elapsedTime * 0.8) * 0.08;
        const autoPitch = 0.12 + Math.cos(elapsedTime * 0.6) * 0.03;
        busGroup.rotation.y = autoYaw;
        busGroup.rotation.x = autoPitch;
        busGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.015;
      }

      // Blinking beacon
      beacon.visible = Math.sin(elapsedTime * 6) > 0;

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. RESIZE OBSERVER ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing ${className}`}
      title={interactive ? 'Drag to rotate 3D transit unit' : '3D Telemetry Unit'}
    />
  );
};

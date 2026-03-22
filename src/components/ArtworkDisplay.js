import React, { useEffect, useRef, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import * as THREE from 'three';
import './ArtworkDisplay.css';

// ── Default parameter values — must match Controller defaults ────────
const DEFAULTS = {
  morphSpeed:  0.14,
  morphDepth:  2.1,
  morphPhase:  0,
  slowSpin:    0.001,
  discRadius:  1.8,
  colorR:      0.80,
  colorG:      0.70,
  colorB:      0.60,
  triggerSeed: false,
  seed:        0,
};

function ArtworkDisplay() {
  const canvasRef   = useRef(null);
  const paramsRef   = useRef({ ...DEFAULTS }); // live values — never triggers re-render
  const sceneRef    = useRef(null);
  const discMeshRef = useRef(null);
  const discGeoRef  = useRef(null);
  const origPosRef  = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const clockRef    = useRef(null);
  const animIdRef   = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Firebase listener — writes directly to ref, never to state ──────
  // This is the key fix vs the original code:
  // Original used setState → triggered useEffect re-run → killed animation loop
  // This version: Firebase writes to paramsRef.current, animation loop reads it next frame
  useEffect(() => {
    const artworkRef = ref(database, 'artwork');

    const unsubscribe = onValue(artworkRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      setIsConnected(true);

      // Merge incoming values — animation loop picks them up within one frame (~16ms)
      Object.assign(paramsRef.current, data);

      // Live-update material color without rebuilding the scene
      if (discMeshRef.current) {
        discMeshRef.current.material.color.setRGB(
          paramsRef.current.colorR,
          paramsRef.current.colorG,
          paramsRef.current.colorB
        );
      }

      // New seed trigger — rebuild disc geometry with fresh random phase
      if (data.triggerSeed && data.seed) {
        rebuildDisc();
        set(ref(database, 'artwork/triggerSeed'), false); // reset flag
      }
    }, () => setIsConnected(false));

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Three.js — runs exactly once ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, true);
    renderer.physicallyCorrectLights = true;
    rendererRef.current = renderer;

    // Scene + camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.z = 10;
    cameraRef.current = camera;
    clockRef.current = new THREE.Clock();

    // Sky gradient (deep navy → near-black)
    const skyGeo = new THREE.PlaneGeometry(80, 80, 1, 32);
    const skyColors = [];
    const skyPos = skyGeo.attributes.position;
    for (let i = 0; i < skyPos.count; i++) {
      const t  = Math.max(0, Math.min(1, (skyPos.getY(i) + 40) / 80));
      const tc = t * t * t;
      skyColors.push(0.0002 + tc * 0.003, 0.0003 + tc * 0.050, 0.0008 + tc * 0.185);
    }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyColors, 3));
    const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    sky.position.z = -9;
    scene.add(sky);

    // Initial disc
    buildDiscIntoScene(scene, paramsRef.current);

    // ── Animation loop — reads paramsRef.current every frame ─────────
    function animate() {
      animIdRef.current = requestAnimationFrame(animate);
      const p    = paramsRef.current;
      const t    = clockRef.current.getElapsedTime();
      const wave = Math.sin(t * p.morphSpeed + (p.morphPhase || 0));

      if (discGeoRef.current && origPosRef.current) {
        const pos  = discGeoRef.current.attributes.position;
        const orig = origPosRef.current;
        const R    = p.discRadius;
        for (let i = 0; i < pos.count; i++) {
          const ox = orig[i * 3];
          const oy = orig[i * 3 + 1];
          const nr = Math.sqrt(ox * ox + oy * oy) / R;
          pos.setZ(i, p.morphDepth * wave * Math.max(0, 1 - nr * nr));
        }
        pos.needsUpdate = true;
        discGeoRef.current.computeVertexNormals();
      }

      if (discMeshRef.current) {
        discMeshRef.current.rotation.z += p.slowSpin;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const W2 = window.innerWidth;
      const H2 = window.innerHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2, true);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build disc into scene ─────────────────────────────────────────────
  function buildDiscIntoScene(scene, p) {
    // Remove previous disc + lights (sky is always children[0])
    while (scene.children.length > 1) {
      scene.remove(scene.children[scene.children.length - 1]);
    }

    const discGeo = new THREE.CircleGeometry(p.discRadius, 160);
    discGeoRef.current  = discGeo;
    origPosRef.current  = Float32Array.from(discGeo.attributes.position.array);

    const disc = new THREE.Mesh(
      discGeo,
      new THREE.MeshStandardMaterial({
        color:     new THREE.Color(p.colorR, p.colorG, p.colorB),
        roughness: 0.82,
        metalness: 0.0,
        side:      THREE.DoubleSide,
      })
    );
    discMeshRef.current = disc;
    scene.add(disc);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.06));

    const key = new THREE.DirectionalLight(new THREE.Color(1.0, 0.92, 0.78), 3.8);
    key.position.set(-4, 5, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(new THREE.Color(0.28, 0.42, 0.80), 0.45);
    fill.position.set(4, -3, 3);
    scene.add(fill);
  }

  // ── Rebuild disc on NEW SEED ──────────────────────────────────────────
  function rebuildDisc() {
    const scene = sceneRef.current;
    if (!scene) return;
    paramsRef.current.morphPhase = Math.random() * Math.PI * 2;
    buildDiscIntoScene(scene, paramsRef.current);
    if (clockRef.current) clockRef.current.start();
  }

  return (
    <div className="artwork-display">
      <canvas ref={canvasRef} />
      <div className="status">
        {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>
      <div className="qr-code">
        <QRCodeSVG
          value={`${window.location.origin}/controller`}
          size={120}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
        <p>Scan to Control</p>
      </div>
    </div>
  );
}

export default ArtworkDisplay;

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { BuildingParams } from '../types/building';
import { generateBuilding } from '../utils/buildingGenerator';

interface Props {
  params: BuildingParams;
  onSceneReady?: (scene: THREE.Scene) => void;
}

export default function BuildingViewer({ params, onSceneReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    frameId: number;
    building: THREE.Group | null;
  } | null>(null);

  // ── Init Three.js once ───────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 80, 200);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(60, 50, 60);
    camera.lookAt(0, 20, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff8e7, 1.2);
    sun.position.set(30, 80, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8ab4d8, 0.4);
    fill.position.set(-30, 10, -30);
    scene.add(fill);

    // Ground grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x333355, 0x222244);
    scene.add(gridHelper);

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshLambertMaterial({ color: 0x11111f }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 20, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 300;

    // Render loop
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    stateRef.current = { renderer, scene, camera, controls, frameId, building: null };

    // Resize handler
    function onResize() {
      if (!mount || !stateRef.current) return;
      const w2 = mount.clientWidth;
      const h2 = mount.clientHeight;
      stateRef.current.camera.aspect = w2 / h2;
      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(w2, h2);
    }
    window.addEventListener('resize', onResize);

    if (onSceneReady) onSceneReady(scene);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild building whenever params change ──────────────────────────────
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    // Remove old building
    if (state.building) {
      state.scene.remove(state.building);
      state.building.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry.dispose();
        }
      });
    }

    const building = generateBuilding(params);
    building.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).castShadow = true;
        (obj as THREE.Mesh).receiveShadow = true;
      }
    });
    state.scene.add(building);
    state.building = building;

    // Reframe camera
    const totalHeight = params.floors * params.floorHeight;
    const span = Math.max(params.width, params.depth, totalHeight) * 1.8;
    state.camera.position.set(span, span * 0.7, span);
    state.controls.target.set(0, totalHeight / 2, 0);
    state.controls.update();
  }, [params]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

import * as THREE from 'three';
import type { BuildingParams } from '../types/building';

/** Returns a single THREE.Group representing the full building. */
export function generateBuilding(params: BuildingParams): THREE.Group {
  const group = new THREE.Group();

  const totalHeight = params.floors * params.floorHeight;

  // --- Materials ---
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xd4c5a9 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
  const windowMat = new THREE.MeshLambertMaterial({ color: 0x6ab4e8, transparent: true, opacity: 0.75 });
  const antennaMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const balconyMat = new THREE.MeshLambertMaterial({ color: 0xccbbaa });

  // ── 1. Tower body ──────────────────────────────────────────────────────────
  if (params.buildingStyle === 'rectangular') {
    addBox(group, params.width, totalHeight, params.depth, 0, totalHeight / 2, 0, wallMat);
  } else if (params.buildingStyle === 'stepped') {
    buildStepped(group, params, totalHeight, wallMat);
  } else {
    // tapered
    buildTapered(group, params, totalHeight, wallMat);
  }

  // ── 2. Windows ────────────────────────────────────────────────────────────
  if (params.windowStyle !== 'none') {
    addWindows(group, params, totalHeight, windowMat);
  }

  // ── 3. Roof ───────────────────────────────────────────────────────────────
  addRoof(group, params, totalHeight, roofMat);

  // ── 4. Antenna ────────────────────────────────────────────────────────────
  if (params.hasAntenna) {
    const roofTop = getRoofTop(params, totalHeight);
    const r = 0.15;
    addCylinder(group, r, r, params.antennaHeight, 0, roofTop + params.antennaHeight / 2, 0, antennaMat);
    // small ball at top
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), antennaMat);
    sphere.position.set(0, roofTop + params.antennaHeight, 0);
    group.add(sphere);
  }

  // ── 5. Balconies ─────────────────────────────────────────────────────────
  if (params.hasBalcony) {
    addBalconies(group, params, totalHeight, balconyMat);
  }

  return group;
}

// ─── Helper geometry builders ─────────────────────────────────────────────────

function addBox(
  group: THREE.Group,
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  mat: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function addCylinder(
  group: THREE.Group,
  rTop: number, rBot: number, h: number,
  x: number, y: number, z: number,
  mat: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 16), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

// ─── Stepped building ────────────────────────────────────────────────────────

function buildStepped(
  group: THREE.Group,
  params: BuildingParams,
  _totalHeight: number,
  mat: THREE.Material,
) {
  const steps = Math.min(params.stepsCount, params.floors);
  const floorsPerStep = Math.floor(params.floors / steps);
  let currentY = 0;

  for (let i = 0; i < steps; i++) {
    const ratio = 1 - (i / steps) * 0.55;
    const w = params.width * ratio;
    const d = params.depth * ratio;
    const stepFloors = i === steps - 1 ? params.floors - floorsPerStep * (steps - 1) : floorsPerStep;
    const h = stepFloors * params.floorHeight;
    addBox(group, w, h, d, 0, currentY + h / 2, 0, mat);
    currentY += h;
  }
}

// ─── Tapered building ────────────────────────────────────────────────────────

function buildTapered(
  group: THREE.Group,
  params: BuildingParams,
  totalHeight: number,
  mat: THREE.Material,
) {
  const steps = 10; // smooth taper with many thin slices
  const sliceH = totalHeight / steps;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const ratio = 1 - t * 0.6;
    const w = params.width * ratio;
    const d = params.depth * ratio;
    addBox(group, w, sliceH, d, 0, i * sliceH + sliceH / 2, 0, mat);
  }
}

// ─── Windows ─────────────────────────────────────────────────────────────────

function addWindows(
  group: THREE.Group,
  params: BuildingParams,
  _totalHeight: number,
  mat: THREE.Material,
) {
  const winW = 0.8;
  const winH = 1.2;
  const winDepth = 0.05;
  const sparse = params.windowStyle === 'sparse';

  // columns per face
  const colsX = Math.max(1, Math.floor(params.width / 3));
  const colsZ = Math.max(1, Math.floor(params.depth / 3));
  const rows = params.floors;

  const faces = [
    { axis: 'z', sign: 1,  dim: params.width,  cols: colsX, faceDim: params.depth / 2 + 0.06 },
    { axis: 'z', sign: -1, dim: params.width,  cols: colsX, faceDim: params.depth / 2 + 0.06 },
    { axis: 'x', sign: 1,  dim: params.depth,  cols: colsZ, faceDim: params.width / 2 + 0.06 },
    { axis: 'x', sign: -1, dim: params.depth,  cols: colsZ, faceDim: params.width / 2 + 0.06 },
  ];

  for (const face of faces) {
    for (let row = 0; row < rows; row++) {
      if (sparse && row % 2 !== 0) continue;
      const y = row * params.floorHeight + params.floorHeight * 0.5;
      for (let col = 0; col < face.cols; col++) {
        if (sparse && col % 2 !== 0) continue;
        const span = face.dim / face.cols;
        const offset = -face.dim / 2 + span * (col + 0.5);
        const geo = new THREE.BoxGeometry(
          face.axis === 'x' ? winDepth : winW,
          winH,
          face.axis === 'z' ? winDepth : winW,
        );
        const mesh = new THREE.Mesh(geo, mat);
        if (face.axis === 'z') {
          mesh.position.set(offset, y, face.sign * face.faceDim);
        } else {
          mesh.position.set(face.sign * face.faceDim, y, offset);
        }
        group.add(mesh);
      }
    }
  }
}

// ─── Roof ─────────────────────────────────────────────────────────────────────

function getRoofTop(params: BuildingParams, totalHeight: number): number {
  if (params.roofStyle === 'flat') return totalHeight;
  return totalHeight + params.roofHeight;
}

function addRoof(
  group: THREE.Group,
  params: BuildingParams,
  totalHeight: number,
  mat: THREE.Material,
) {
  const w = params.width;
  const d = params.depth;
  const rh = params.roofHeight;

  switch (params.roofStyle) {
    case 'flat': {
      // thin parapet / coping
      addBox(group, w + 0.2, 0.3, d + 0.2, 0, totalHeight + 0.15, 0, mat);
      break;
    }
    case 'pitched': {
      const roofMesh = buildPitchedRoof(w, d, rh);
      roofMesh.material = mat;
      roofMesh.position.set(0, totalHeight, 0);
      group.add(roofMesh);
      break;
    }
    case 'dome': {
      const r = Math.min(w, d) / 2;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      mesh.position.set(0, totalHeight, 0);
      group.add(mesh);
      break;
    }
    case 'pyramid': {
      const geo = new THREE.CylinderGeometry(0, Math.min(w, d) / 2, rh, 4, 1);
      geo.rotateY(Math.PI / 4);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, totalHeight + rh / 2, 0);
      group.add(mesh);
      break;
    }
  }
}

function buildPitchedRoof(w: number, d: number, h: number): THREE.Mesh {
  // A pitched (ridge) roof: two sloping rectangular faces + two triangular gable ends.
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2, 0);
  shape.lineTo(d / 2, 0);
  shape.lineTo(0, h);
  shape.lineTo(-d / 2, 0);

  const extSettings: THREE.ExtrudeGeometryOptions = {
    depth: w,
    bevelEnabled: false,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extSettings);
  geo.rotateX(Math.PI / 2);
  geo.translate(-w / 2, 0, d / 2);

  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x8b7355 }));
}

// ─── Balconies ────────────────────────────────────────────────────────────────

function addBalconies(
  group: THREE.Group,
  params: BuildingParams,
  _totalHeight: number,
  mat: THREE.Material,
) {
  const bDepth = 0.8;
  const bH = 0.15;

  // Add a balcony slab every other floor on the front & back faces
  for (let floor = 1; floor < params.floors; floor += 2) {
    const y = floor * params.floorHeight;
    // Front face
    addBox(group, params.width * 0.8, bH, bDepth, 0, y, params.depth / 2 + bDepth / 2, mat);
    // Back face
    addBox(group, params.width * 0.8, bH, bDepth, 0, y, -(params.depth / 2 + bDepth / 2), mat);
  }
}

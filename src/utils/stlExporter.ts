import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

/**
 * Exports the given THREE.Object3D as a binary STL file and triggers a browser
 * download.
 */
export function exportSTL(object: THREE.Object3D, filename = 'building.stl'): void {
  const exporter = new STLExporter();
  // parse() with binary:true returns an ArrayBuffer (cast needed due to overload typing)
  const stlBuffer = exporter.parse(object, { binary: true }) as unknown as ArrayBuffer;

  const blob = new Blob([stlBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

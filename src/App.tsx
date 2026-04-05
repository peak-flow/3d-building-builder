import { useRef, useState } from 'react';
import * as THREE from 'three';
import BuildingViewer from './components/BuildingViewer';
import ControlPanel from './components/ControlPanel';
import type { BuildingParams } from './types/building';
import { DEFAULT_PARAMS, randomParams } from './types/building';
import { exportSTL } from './utils/stlExporter';
import './App.css';

function App() {
  const [params, setParams] = useState<BuildingParams>(DEFAULT_PARAMS);
  const sceneRef = useRef<THREE.Scene | null>(null);

  function handleRandomize() {
    setParams(randomParams());
  }

  function handleExport() {
    if (!sceneRef.current) return;
    // Find the building group (first Group child)
    const building = sceneRef.current.children.find(
      (c) => c instanceof THREE.Group,
    );
    if (building) {
      exportSTL(building, `building_seed${params.seed}.stl`);
    }
  }

  return (
    <div className="app-layout">
      <ControlPanel
        params={params}
        onChange={setParams}
        onRandomize={handleRandomize}
        onExport={handleExport}
      />
      <main className="viewer-area">
        <BuildingViewer
          params={params}
          onSceneReady={(scene) => { sceneRef.current = scene; }}
        />
      </main>
    </div>
  );
}

export default App;

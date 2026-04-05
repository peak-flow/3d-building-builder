import type { BuildingParams, RoofStyle, BuildingStyle, WindowStyle } from '../types/building';
import { MAX_SEED } from '../types/building';

interface Props {
  params: BuildingParams;
  onChange: (params: BuildingParams) => void;
  onRandomize: () => void;
  onExport: () => void;
}

function SliderRow({
  label, value, min, max, step, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="slider-row">
      <label>
        <span className="label-text">{label}</span>
        <span className="label-value">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function SelectRow<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="select-row">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckRow({
  label, value, onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="check-row">
      <label>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}

export default function ControlPanel({ params, onChange, onRandomize, onExport }: Props) {
  function set<K extends keyof BuildingParams>(key: K, value: BuildingParams[K]) {
    onChange({ ...params, [key]: value });
  }

  return (
    <aside className="control-panel">
      <h2>🏙️ Building Builder</h2>

      <section>
        <h3>Dimensions</h3>
        <SliderRow label="Width (m)" value={params.width} min={4} max={40} step={0.5} onChange={(v) => set('width', v)} />
        <SliderRow label="Depth (m)" value={params.depth} min={4} max={40} step={0.5} onChange={(v) => set('depth', v)} />
        <SliderRow label="Floors" value={params.floors} min={1} max={30} step={1} onChange={(v) => set('floors', v)} />
        <SliderRow label="Floor height (m)" value={params.floorHeight} min={2.5} max={5} step={0.25} onChange={(v) => set('floorHeight', v)} />
      </section>

      <section>
        <h3>Shape</h3>
        <SelectRow<BuildingStyle>
          label="Style"
          value={params.buildingStyle}
          options={['rectangular', 'stepped', 'tapered']}
          onChange={(v) => set('buildingStyle', v)}
        />
        {(params.buildingStyle === 'stepped' || params.buildingStyle === 'tapered') && (
          <SliderRow label="Step tiers" value={params.stepsCount} min={2} max={6} step={1} onChange={(v) => set('stepsCount', v)} />
        )}
      </section>

      <section>
        <h3>Roof</h3>
        <SelectRow<RoofStyle>
          label="Roof style"
          value={params.roofStyle}
          options={['flat', 'pitched', 'dome', 'pyramid']}
          onChange={(v) => set('roofStyle', v)}
        />
        {params.roofStyle !== 'flat' && (
          <SliderRow label="Roof height (m)" value={params.roofHeight} min={1} max={10} step={0.5} onChange={(v) => set('roofHeight', v)} />
        )}
      </section>

      <section>
        <h3>Details</h3>
        <SelectRow<WindowStyle>
          label="Windows"
          value={params.windowStyle}
          options={['none', 'grid', 'sparse']}
          onChange={(v) => set('windowStyle', v)}
        />
        <CheckRow label="Antenna / spire" value={params.hasAntenna} onChange={(v) => set('hasAntenna', v)} />
        {params.hasAntenna && (
          <SliderRow label="Antenna height (m)" value={params.antennaHeight} min={2} max={20} step={0.5} onChange={(v) => set('antennaHeight', v)} />
        )}
        <CheckRow label="Balconies" value={params.hasBalcony} onChange={(v) => set('hasBalcony', v)} />
      </section>

      <section className="seed-section">
        <h3>Seed</h3>
        <div className="seed-row">
          <input
            type="number"
            value={params.seed}
            min={0}
            max={MAX_SEED}
            onChange={(e) => set('seed', parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </section>

      <div className="actions">
        <button className="btn btn-randomize" onClick={onRandomize}>
          🎲 Randomize
        </button>
        <button className="btn btn-export" onClick={onExport}>
          ⬇️ Export STL
        </button>
      </div>

      <p className="hint">Drag to orbit · Scroll to zoom · Right-drag to pan</p>
    </aside>
  );
}

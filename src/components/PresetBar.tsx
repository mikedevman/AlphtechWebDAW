import React from 'react';
import { Sliders, Download, Check } from 'lucide-react';
import { FACTORY_PRESETS, exportPresetFile } from '../dsp/presets';
import type { PreampPreset } from '../dsp/presets';

interface PresetBarProps {
  currentPresetId: string;
  currentPreset: PreampPreset;
  onSelectPreset: (preset: PreampPreset) => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  currentPresetId,
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div className="bg-daw-panel border border-daw-border rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Preset List */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mr-2">
          <Sliders className="w-4 h-4 text-daw-accent" />
          <span>FACTORY TONES:</span>
        </div>

        {FACTORY_PRESETS.map((p) => {
          const isActive = currentPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              title={p.description}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-daw-accent text-black font-bold border-daw-accent shadow-tube-glow'
                  : 'bg-daw-darkest text-slate-300 border-daw-border hover:border-slate-500 hover:text-white'
              }`}
            >
              {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Export Button for Desktop DAW / Plugin */}
      <div>
        <button
          onClick={() => exportPresetFile(currentPreset)}
          title="Download preset JSON to import into desktop DAWs"
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Export Preset for DAW (.alphtechpreset)
        </button>
      </div>
    </div>
  );
};

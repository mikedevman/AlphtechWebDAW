import type { TubeMode } from './TubeShaper';

export interface PreampPreset {
  id: string;
  name: string;
  description: string;
  mode: TubeMode;
  drive: number;      // 1.0 - 30.0
  trimDb: number;     // -12 to +18 dB
  bassDb: number;     // -12 to +12 dB
  midDb: number;      // -12 to +12 dB
  trebleDb: number;   // -12 to +12 dB
  masterDb: number;   // -30 to +6 dB
}

export const FACTORY_PRESETS: PreampPreset[] = [
  {
    id: 'clean-twin',
    name: 'Clean Studio Twin',
    description: 'Sparkling clean tube tone with warm low-end and glassy highs.',
    mode: 'warm',
    drive: 2.2,
    trimDb: 0,
    bassDb: 2.0,
    midDb: -1.0,
    trebleDb: 3.0,
    masterDb: 0
  },
  {
    id: 'british-crunch',
    name: 'British Tube Crunch',
    description: 'Classic 70s tube overdrive with responsive touch dynamics.',
    mode: 'crunch',
    drive: 7.5,
    trimDb: 2.0,
    bassDb: 1.5,
    midDb: 2.5,
    trebleDb: 1.5,
    masterDb: -1.0
  },
  {
    id: 'lead-solo',
    name: 'High-Gain Lead',
    description: 'Sustained, harmonic-rich tube saturation with punchy midrange.',
    mode: 'lead',
    drive: 15.0,
    trimDb: 4.0,
    bassDb: 3.0,
    midDb: 4.0,
    trebleDb: 2.0,
    masterDb: -2.5
  },
  {
    id: 'heavy-scoop',
    name: 'Modern Heavy Scoop',
    description: 'Aggressive tight distortion with boosted lows and scooped mids.',
    mode: 'lead',
    drive: 22.0,
    trimDb: 5.0,
    bassDb: 4.5,
    midDb: -2.5,
    trebleDb: 4.0,
    masterDb: -3.0
  },
  {
    id: 'direct-bypass',
    name: 'Dry DI (Bypass)',
    description: 'Pure transparent instrument signal without tube coloring.',
    mode: 'bypass',
    drive: 1.0,
    trimDb: 0,
    bassDb: 0,
    midDb: 0,
    trebleDb: 0,
    masterDb: 0
  }
];

export function exportPresetFile(preset: PreampPreset) {
  const payload = {
    app: 'AlphtechWebDAW',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    preset
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.alphtechpreset`;
  a.click();
  URL.revokeObjectURL(url);
}

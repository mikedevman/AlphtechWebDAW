import React from 'react';
import { Flame, Sliders, Zap, Check } from 'lucide-react';
import { Knob } from './Knob';
import type { TubeMode } from '../dsp/TubeShaper';

interface ProChannelProps {
  tubeMode: TubeMode;
  drive: number;
  trimDb: number;
  bassDb: number;
  midDb: number;
  trebleDb: number;
  pan: number; // -100 to +100
  onModeChange: (mode: TubeMode) => void;
  onDriveChange: (val: number) => void;
  onTrimChange: (val: number) => void;
  onBassChange: (val: number) => void;
  onMidChange: (val: number) => void;
  onTrebleChange: (val: number) => void;
  onPanChange: (val: number) => void;
}

export const ProChannel: React.FC<ProChannelProps> = ({
  tubeMode,
  drive,
  trimDb,
  bassDb,
  midDb,
  trebleDb,
  pan,
  onModeChange,
  onDriveChange,
  onTrimChange,
  onBassChange,
  onMidChange,
  onTrebleChange,
  onPanChange,
}) => {
  const tubeGlow = Math.min(1.0, 0.2 + (drive / 30.0) * 0.8);

  // Calculate EQ Curve points for interactive visualizer
  // We approximate the 3-band response curve across 100 points
  const points: string[] = [];
  const width = 240;
  const height = 70;
  const midY = height / 2;

  for (let i = 0; i <= width; i += 4) {
    const normX = i / width; // 0 to 1
    // Approximate log frequency response
    // Low shelf around normX 0.15
    const bassFactor = Math.exp(-Math.pow((normX - 0.05) / 0.15, 2));
    // Mid bell around normX 0.50
    const midFactor = Math.exp(-Math.pow((normX - 0.5) / 0.18, 2));
    // High shelf around normX 0.85
    const trebleFactor = Math.exp(-Math.pow((normX - 0.95) / 0.25, 2));

    const totalDb = (bassDb * bassFactor) + (midDb * midFactor) + (trebleDb * trebleFactor);
    // Scale dB (-12 to +12 dB) to pixels (+- 25px)
    const y = midY - (totalDb / 12) * 25;
    points.push(`${i},${Math.max(4, Math.min(height - 4, y))}`);
  }
  const svgPath = `M 0,${midY} L ${points.join(' ')} L ${width},${midY}`;

  return (
    <div className="w-full lg:w-80 bg-sonar-panel border border-sonar-panelBorder rounded-lg overflow-hidden shadow-xl flex flex-col select-none">
      {/* ProChannel Title Bar */}
      <div className="bg-[#14171f] px-3 py-2 border-b border-sonar-panelBorder flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-sonar-accent" />
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
            PRO<span className="text-sonar-accent font-normal">CHANNEL</span>
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-sonar-bg px-1.5 py-0.5 rounded border border-sonar-panelBorder">
          TRACK 1 INSERT
        </span>
      </div>

      <div className="p-3 space-y-3.5 overflow-y-auto">
        {/* Module 1: Alphtech Tube Saturation Preamp */}
        <div className="bg-sonar-bg rounded-lg border border-sonar-panelBorder p-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-sonar-panelBorder pb-1.5 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-sonar-amber" />
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                Tube Saturation
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-sonar-amber animate-pulse" />
              <span className="text-[9px] font-mono text-sonar-amber font-semibold">12AX7</span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-4 gap-1 mb-3 bg-[#111319] p-1 rounded border border-sonar-panelBorder text-[10px] font-mono text-center">
            {(['warm', 'crunch', 'lead', 'bypass'] as TubeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`py-1 rounded uppercase font-bold transition-all ${
                  tubeMode === mode
                    ? 'bg-sonar-amber text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Controls with Glowing Valve */}
          <div className="flex items-center justify-around gap-2">
            <Knob
              label="Trim"
              value={trimDb}
              min={-12}
              max={18}
              unit="dB"
              defaultValue={0}
              glowColor="#38bdf8"
              onChange={onTrimChange}
            />

            {/* Valve Graphic */}
            <div className="flex flex-col items-center">
              <div
                className="w-11 h-20 rounded-t-full bg-gradient-to-b from-[#241f19] via-[#161411] to-[#0c0d10] border border-amber-900/60 shadow-lg flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  boxShadow: `0 0 ${tubeGlow * 20}px rgba(245, 158, 11, ${tubeGlow * 0.6})`,
                }}
              >
                <div
                  className="w-1.5 h-12 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: `rgb(255, ${Math.floor(160 + tubeGlow * 80)}, 20)`,
                    boxShadow: `0 0 10px rgba(245, 158, 11, ${tubeGlow})`,
                    opacity: tubeMode === 'bypass' ? 0.15 : tubeGlow,
                  }}
                />
              </div>
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">TRIODE</span>
            </div>

            <Knob
              label="Drive"
              value={drive}
              min={1.0}
              max={30.0}
              step={0.5}
              defaultValue={7.5}
              glowColor="#f59e0b"
              onChange={onDriveChange}
            />
          </div>
        </div>

        {/* Module 2: QuadCurve Equalizer */}
        <div className="bg-sonar-bg rounded-lg border border-sonar-panelBorder p-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-sonar-panelBorder pb-1.5 mb-2">
            <div className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sonar-accent" />
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                QuadCurve EQ
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">3-BAND ACTIVE</span>
          </div>

          {/* Real-time Response Curve Display */}
          <div className="bg-[#0b0d12] rounded border border-sonar-panelBorder p-1 mb-2.5 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14 block">
              {/* Zero line */}
              <line x1="0" y1={midY} x2={width} y2={midY} stroke="#1f2633" strokeDasharray="3 3" />
              {/* Filter curve path */}
              <path
                d={svgPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))' }}
              />
            </svg>
            <div className="flex justify-between text-[8px] font-mono text-slate-400 px-1">
              <span>80Hz</span>
              <span>1kHz</span>
              <span>8kHz</span>
            </div>
          </div>

          {/* EQ Knobs */}
          <div className="flex items-center justify-around gap-1">
            <Knob
              label="Low"
              value={bassDb}
              min={-12}
              max={12}
              unit="dB"
              defaultValue={0}
              glowColor="#10b981"
              onChange={onBassChange}
            />
            <Knob
              label="Mid"
              value={midDb}
              min={-12}
              max={12}
              unit="dB"
              defaultValue={0}
              glowColor="#facc15"
              onChange={onMidChange}
            />
            <Knob
              label="High"
              value={trebleDb}
              min={-12}
              max={12}
              unit="dB"
              defaultValue={0}
              glowColor="#38bdf8"
              onChange={onTrebleChange}
            />
          </div>
        </div>

        {/* Module 3: Pan & Routing */}
        <div className="bg-sonar-bg rounded-lg border border-sonar-panelBorder p-3 shadow-inner flex items-center justify-around">
          <Knob
            label="Pan"
            value={pan}
            min={-100}
            max={100}
            step={1}
            defaultValue={0}
            unit="%"
            glowColor="#a855f7"
            onChange={onPanChange}
          />
          <div className="flex flex-col text-[10px] font-mono space-y-1 text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3 h-3 text-sonar-accent" />
              Insert Post-EQ
            </span>
            <span>Bus: Master Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

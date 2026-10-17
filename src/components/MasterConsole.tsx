import React, { useRef, useEffect, useState } from 'react';
import { Activity, BarChart2, Volume2, AlertTriangle, Download, Sliders, Check } from 'lucide-react';
import type { MeterLevels } from '../dsp/DawAudioEngine';
import { FACTORY_PRESETS, exportPresetFile } from '../dsp/presets';
import type { PreampPreset } from '../dsp/presets';

interface MasterConsoleProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  masterDb: number;
  meterLevels: MeterLevels;
  currentPresetId: string;
  currentPreset: PreampPreset;
  onMasterDbChange: (db: number) => void;
  onSelectPreset: (preset: PreampPreset) => void;
}

export const MasterConsole: React.FC<MasterConsoleProps> = ({
  analyser,
  isPlaying,
  masterDb,
  meterLevels,
  currentPresetId,
  currentPreset,
  onMasterDbChange,
  onSelectPreset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'oscilloscope' | 'spectrum'>('oscilloscope');

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark Sonar console background
      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, width, height);

      // Fine grid
      ctx.strokeStyle = '#161922';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (!analyser || !isPlaying) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animId = requestAnimationFrame(render);
        return;
      }

      if (viewMode === 'oscilloscope') {
        const buffer = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buffer);

        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#38bdf8'; // Sonar Cyan
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        const sliceWidth = width / buffer.length;
        let x = 0;

        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i];
          const y = (v * height) / 2 + height / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.7, '#facc15');
          gradient.addColorStop(1, '#ef4444');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [analyser, isPlaying, viewMode]);

  const peakPct = Math.min(100, Math.max(0, ((meterLevels.peakDb + 60) / 60) * 100));
  const rmsPct = Math.min(100, Math.max(0, ((meterLevels.rmsDb + 60) / 60) * 100));

  return (
    <div className="bg-sonar-panel border border-sonar-panelBorder rounded-lg p-3 shadow-xl select-none">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-sonar-panelBorder gap-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-sonar-accent" />
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
            CONSOLE BUS <span className="text-slate-400 font-normal">/ MASTER MONITORING</span>
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-sonar-bg p-1 rounded border border-sonar-panelBorder text-xs">
          <button
            onClick={() => setViewMode('oscilloscope')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-all ${
              viewMode === 'oscilloscope'
                ? 'bg-sonar-accent text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3 h-3" /> Waveform
          </button>
          <button
            onClick={() => setViewMode('spectrum')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-all ${
              viewMode === 'spectrum'
                ? 'bg-sonar-accent text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" /> FFT Spectrum
          </button>
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3 items-center">
        {/* Real-time Oscilloscope / Spectrum Screen (7 cols) */}
        <div className="lg:col-span-7 bg-[#090b0e] rounded border border-sonar-panelBorder p-1 overflow-hidden shadow-inner">
          <canvas ref={canvasRef} width={640} height={140} className="w-full h-32 block rounded" />
        </div>

        {/* Master Meter & Fader Section (5 cols) */}
        <div className="lg:col-span-5 bg-sonar-bg p-3 rounded border border-sonar-panelBorder flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-around gap-4">
            {/* LED Ladder Meter (Cakewalk Style) */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                dBFS Ladder
              </span>

              <div className="flex items-end gap-1.5 h-24 bg-[#0a0c10] px-2 py-1 rounded border border-[#1e2330]">
                {/* Peak Meter */}
                <div className="w-2.5 h-full bg-[#151922] rounded-sm relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-sonar-ledGreen via-sonar-ledYellow to-sonar-ledRed transition-all duration-75"
                    style={{ height: `${peakPct}%` }}
                  />
                </div>
                {/* RMS Meter */}
                <div className="w-2.5 h-full bg-[#151922] rounded-sm relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-sonar-ledGreen/70 transition-all duration-100"
                    style={{ height: `${rmsPct}%` }}
                  />
                </div>
              </div>

              {/* dB Readout & Clip LED */}
              <div className="flex items-center gap-1 font-mono text-[9px]">
                {meterLevels.isClipping && (
                  <AlertTriangle className="w-2.5 h-2.5 text-sonar-ledRed animate-bounce" />
                )}
                <span className={meterLevels.isClipping ? 'text-sonar-ledRed font-bold' : 'text-slate-300'}>
                  {meterLevels.peakDb > -60 ? `${meterLevels.peakDb.toFixed(1)} dB` : '-INF'}
                </span>
              </div>
            </div>

            {/* Master Fader */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                Master Fader
              </span>

              <div className="h-24 flex items-center justify-center">
                <input
                  type="range"
                  min="-30"
                  max="6"
                  step="0.5"
                  value={masterDb}
                  onChange={(e) => onMasterDbChange(parseFloat(e.target.value))}
                  className="w-20 -rotate-90 origin-center cursor-pointer accent-sonar-accent"
                />
              </div>

              <span className="font-mono text-[10px] font-bold text-slate-200 bg-[#161a24] px-1.5 py-0.5 rounded border border-[#232938]">
                {masterDb > 0 ? `+${masterDb}` : masterDb} dB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Quick Rack & Export Bar */}
      <div className="mt-3 pt-2.5 border-t border-sonar-panelBorder flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Sliders className="w-3 h-3 text-sonar-accent" />
            PRESETS:
          </span>

          {FACTORY_PRESETS.map((p) => {
            const isActive = currentPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 border ${
                  isActive
                    ? 'bg-sonar-accent text-black border-sonar-accent shadow-sonar-glow'
                    : 'bg-sonar-bg text-slate-300 border-sonar-panelBorder hover:text-white hover:border-slate-500'
                }`}
              >
                {isActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                {p.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => exportPresetFile(currentPreset)}
          title="Export current preamp configuration as .alphtechpreset"
          className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#1e2a3b] hover:bg-[#25364d] text-sonar-accent border border-sonar-accent/40 flex items-center gap-1 transition-all active:scale-95"
        >
          <Download className="w-3 h-3" />
          Export Preset (.alphtechpreset)
        </button>
      </div>
    </div>
  );
};

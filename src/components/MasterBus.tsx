import React, { useRef, useEffect, useState } from 'react';
import { Activity, BarChart2, Volume2, AlertTriangle } from 'lucide-react';
import type { MeterLevels } from '../dsp/DawAudioEngine';

interface MasterBusProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  masterDb: number;
  meterLevels: MeterLevels;
  onMasterDbChange: (db: number) => void;
}

export const MasterBus: React.FC<MasterBusProps> = ({
  analyser,
  isPlaying,
  masterDb,
  meterLevels,
  onMasterDbChange,
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

      // Dark background with subtle grid lines
      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#181d26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 25) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (!analyser || !isPlaying) {
        // Draw flat baseline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
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

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ff8400';
        ctx.shadowColor = 'rgba(255, 132, 0, 0.7)';
        ctx.shadowBlur = 10;

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
        ctx.shadowBlur = 0; // reset
      } else {
        // Spectrum FFT
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#00e676');
          gradient.addColorStop(0.7, '#ffea00');
          gradient.addColorStop(1, '#ff1744');

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

  // Convert dBFS to percentage for meters (-60dB to 0dB => 0% to 100%)
  const peakPct = Math.min(100, Math.max(0, ((meterLevels.peakDb + 60) / 60) * 100));
  const rmsPct = Math.min(100, Math.max(0, ((meterLevels.rmsDb + 60) / 60) * 100));

  return (
    <div className="bg-daw-panel border border-daw-border rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-daw-border gap-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-daw-accent" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Master Monitoring Bus & Oscilloscope
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-daw-darkest p-1 rounded border border-daw-border text-xs">
          <button
            onClick={() => setViewMode('oscilloscope')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-all ${
              viewMode === 'oscilloscope'
                ? 'bg-daw-accent text-black font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Waveform
          </button>
          <button
            onClick={() => setViewMode('spectrum')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-all ${
              viewMode === 'spectrum'
                ? 'bg-daw-accent text-black font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Harmonics FFT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4 items-center">
        {/* Real-Time Canvas Screen (8 cols) */}
        <div className="md:col-span-8 bg-black rounded-lg border border-daw-border overflow-hidden shadow-inner p-1">
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            className="w-full h-40 block rounded"
          />
        </div>

        {/* Meters & Master Fader (4 cols) */}
        <div className="md:col-span-4 bg-daw-darkest p-3 rounded-lg border border-daw-border flex items-center justify-around gap-3">
          {/* Stereo Peak / RMS Meter */}
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              dBFS Meter
            </span>

            <div className="flex items-end gap-2 h-28 bg-[#0c0e12] px-2 py-1 rounded border border-[#1e2430]">
              {/* Peak Bar */}
              <div className="w-3 h-full bg-[#161a22] rounded-sm relative overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-gradient-to-t from-daw-ledGreen via-daw-ledYellow to-daw-ledRed transition-all duration-75"
                  style={{ height: `${peakPct}%` }}
                />
              </div>

              {/* RMS Bar */}
              <div className="w-3 h-full bg-[#161a22] rounded-sm relative overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full bg-daw-ledGreen/70 transition-all duration-100"
                  style={{ height: `${rmsPct}%` }}
                />
              </div>
            </div>

            {/* Readout */}
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {meterLevels.isClipping && (
                <AlertTriangle className="w-3 h-3 text-daw-ledRed animate-bounce" />
              )}
              <span className={meterLevels.isClipping ? 'text-daw-ledRed font-bold' : 'text-slate-300'}>
                {meterLevels.peakDb > -60 ? `${meterLevels.peakDb.toFixed(1)} dB` : '-INF'}
              </span>
            </div>
          </div>

          {/* Master Output Level Fader */}
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Master Fader
            </span>

            <div className="h-28 flex items-center justify-center">
              <input
                type="range"
                min="-30"
                max="6"
                step="0.5"
                value={masterDb}
                onChange={(e) => onMasterDbChange(parseFloat(e.target.value))}
                className="w-24 -rotate-90 origin-center cursor-pointer accent-daw-accent"
              />
            </div>

            <span className="font-mono text-xs text-slate-200 bg-[#161a22] px-2 py-0.5 rounded border border-[#232a38]">
              {masterDb > 0 ? `+${masterDb}` : masterDb} dB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

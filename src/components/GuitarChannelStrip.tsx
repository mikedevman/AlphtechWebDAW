import React, { useRef } from 'react';
import { Mic, Music, Upload, Flame, VolumeX, Disc3 } from 'lucide-react';
import { Knob } from './Knob';
import type { TubeMode } from '../dsp/TubeShaper';
import type { InputSourceType } from '../dsp/DawAudioEngine';

interface GuitarChannelStripProps {
  inputSource: InputSourceType;
  tubeMode: TubeMode;
  drive: number;
  trimDb: number;
  bassDb: number;
  midDb: number;
  trebleDb: number;
  channelVol: number;
  isMuted: boolean;
  isSolo: boolean;
  isArmed: boolean;
  onSourceChange: (source: InputSourceType) => void;
  onFileUpload: (file: File) => void;
  onModeChange: (mode: TubeMode) => void;
  onDriveChange: (val: number) => void;
  onTrimChange: (val: number) => void;
  onBassChange: (val: number) => void;
  onMidChange: (val: number) => void;
  onTrebleChange: (val: number) => void;
  onChannelVolChange: (val: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onArmToggle: () => void;
}

export const GuitarChannelStrip: React.FC<GuitarChannelStripProps> = ({
  inputSource,
  tubeMode,
  drive,
  trimDb,
  bassDb,
  midDb,
  trebleDb,
  channelVol,
  isMuted,
  isSolo,
  isArmed,
  onSourceChange,
  onFileUpload,
  onModeChange,
  onDriveChange,
  onTrimChange,
  onBassChange,
  onMidChange,
  onTrebleChange,
  onChannelVolChange,
  onMuteToggle,
  onSoloToggle,
  onArmToggle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Tube visual intensity (0.2 to 1.0 based on drive)
  const tubeGlowIntensity = Math.min(1.0, 0.2 + (drive / 30.0) * 0.8);

  return (
    <div className="bg-daw-panel border border-daw-border rounded-xl shadow-xl overflow-hidden">
      {/* Track Header & Routing Bar */}
      <div className="bg-daw-track px-4 py-3 border-b border-daw-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-daw-accent font-bold uppercase tracking-wider">
              Track 01
            </span>
            <span className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
              <Disc3 className="w-4 h-4 text-daw-accent" />
              GUITAR DI CHANNEL
            </span>
          </div>

          {/* Track States: Arm / Solo / Mute */}
          <div className="flex items-center space-x-1.5 ml-2">
            <button
              onClick={onArmToggle}
              title="Record Arm Track"
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                isArmed
                  ? 'bg-daw-ledRed text-white shadow-[0_0_8px_rgba(255,23,68,0.7)]'
                  : 'bg-daw-darkest text-slate-500 hover:text-slate-300'
              }`}
            >
              REC
            </button>
            <button
              onClick={onSoloToggle}
              title="Solo Track"
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                isSolo
                  ? 'bg-daw-ledYellow text-black shadow-[0_0_8px_rgba(255,234,0,0.7)]'
                  : 'bg-daw-darkest text-slate-500 hover:text-slate-300'
              }`}
            >
              S
            </button>
            <button
              onClick={onMuteToggle}
              title="Mute Track"
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                isMuted
                  ? 'bg-daw-ledRed/80 text-white shadow-sm'
                  : 'bg-daw-darkest text-slate-500 hover:text-slate-300'
              }`}
            >
              M
            </button>
          </div>
        </div>

        {/* Audio I/O Source Selector */}
        <div className="flex items-center space-x-2 bg-daw-darkest px-2.5 py-1.5 rounded-lg border border-daw-border">
          <span className="text-[11px] font-semibold text-slate-400">I/O Source:</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSourceChange('di-stem')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                inputSource === 'di-stem'
                  ? 'bg-daw-accent text-black font-semibold shadow-tube-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Guitar DI Stem
            </button>

            <button
              onClick={() => onSourceChange('hardware-interface')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                inputSource === 'hardware-interface'
                  ? 'bg-daw-accent text-black font-semibold shadow-tube-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              USB / Interface In
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                inputSource === 'audio-file'
                  ? 'bg-daw-accent text-black font-semibold shadow-tube-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Import File
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Main DSP Channel Strip Body */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Preamp Insert (Section 1) */}
        <div className="lg:col-span-6 bg-daw-darkest/70 p-4 rounded-xl border border-daw-border/70 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-daw-border/50 pb-2">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-daw-accent animate-pulse" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Alphtech 12AX7 Tube Preamp Stage
              </span>
            </div>

            {/* Mode Selectors */}
            <div className="flex items-center gap-1 bg-[#161a22] p-1 rounded border border-[#2a3240]">
              {(['warm', 'crunch', 'lead', 'bypass'] as TubeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onModeChange(mode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    tubeMode === mode
                      ? 'bg-daw-accent text-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Preamp Controls & Vacuum Tube Graphic */}
          <div className="flex items-center justify-around gap-4 py-2">
            {/* Input Trim */}
            <Knob
              label="Trim Gain"
              value={trimDb}
              min={-12}
              max={18}
              unit="dB"
              defaultValue={0}
              glowColor="#38bdf8"
              onChange={onTrimChange}
            />

            {/* Center Animated Vacuum Tube Filament */}
            <div className="flex flex-col items-center">
              <div
                className="relative w-16 h-28 rounded-t-full bg-gradient-to-b from-[#2a241e] via-[#1a1714] to-[#111114] border border-[#4a3e32] shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: `0 0 ${tubeGlowIntensity * 30}px rgba(255, 132, 0, ${tubeGlowIntensity * 0.7})`,
                }}
              >
                {/* Tube Top Dome Reflection */}
                <div className="absolute top-2 w-8 h-2 rounded-full bg-amber-100/20 blur-[1px]" />

                {/* Glowing Filament Wire */}
                <div
                  className="w-2 h-16 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: `rgb(255, ${Math.floor(140 + tubeGlowIntensity * 90)}, 0)`,
                    boxShadow: `0 0 16px rgba(255, 132, 0, ${tubeGlowIntensity})`,
                    opacity: tubeMode === 'bypass' ? 0.15 : tubeGlowIntensity,
                  }}
                />

                {/* Tube Anode Plates */}
                <div className="absolute inset-x-2 bottom-3 h-8 border border-amber-900/40 rounded bg-black/40" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">12AX7 Valve</span>
            </div>

            {/* Overdrive Saturation Knob */}
            <Knob
              label="Preamp Drive"
              value={drive}
              min={1.0}
              max={30.0}
              step={0.5}
              defaultValue={7.5}
              glowColor="#ff8400"
              onChange={onDriveChange}
            />
          </div>
        </div>

        {/* 3-Band Tone Stack (Section 2) */}
        <div className="lg:col-span-4 bg-daw-darkest/70 p-4 rounded-xl border border-daw-border/70 flex flex-col justify-between space-y-4">
          <div className="border-b border-daw-border/50 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3-Band Tone Stack (EQ)
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            <Knob
              label="Bass"
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
              glowColor="#eab308"
              onChange={onMidChange}
            />
            <Knob
              label="Treble"
              value={trebleDb}
              min={-12}
              max={12}
              unit="dB"
              defaultValue={0}
              glowColor="#ec4899"
              onChange={onTrebleChange}
            />
          </div>
        </div>

        {/* Channel Output Fader (Section 3) */}
        <div className="lg:col-span-2 bg-daw-darkest/70 p-4 rounded-xl border border-daw-border/70 flex flex-col items-center justify-between space-y-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Channel Vol
          </span>

          <div className="flex flex-col items-center h-28 justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : channelVol}
              onChange={(e) => onChannelVolChange(parseFloat(e.target.value))}
              className="w-24 -rotate-90 origin-center cursor-pointer accent-daw-accent"
            />
          </div>

          <div className="text-center font-mono text-xs text-slate-300">
            {isMuted ? (
              <span className="text-daw-ledRed flex items-center gap-1 justify-center">
                <VolumeX className="w-3 h-3" /> MUTED
              </span>
            ) : (
              `${Math.round(channelVol * 100)}%`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

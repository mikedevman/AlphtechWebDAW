import React from 'react';
import { Play, Square, Circle, Repeat, Activity, Radio } from 'lucide-react';

interface TransportBarProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  isEngineActive: boolean;
  bpm?: number;
  timeDisplay: string;
  onPlay: () => void;
  onStop: () => void;
  onRecordToggle: () => void;
  onLoopToggle: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  isRecording,
  isLooping,
  isEngineActive,
  bpm = 110,
  timeDisplay,
  onPlay,
  onStop,
  onRecordToggle,
  onLoopToggle,
}) => {
  return (
    <header className="bg-daw-panel border-b border-daw-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none shadow-md">
      {/* Brand & Lineage */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-daw-accent to-amber-700 flex items-center justify-center font-black text-black text-lg shadow-tube-glow">
          A
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-wider text-slate-100 text-sm">
              ALPHTECH<span className="text-daw-accent">WEB</span>DAW
            </span>
            <span className="text-[10px] font-mono bg-daw-border text-daw-accent px-1.5 py-0.5 rounded font-semibold">
              v1.0 Baseline
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Guitar Audio I/O & Tube Preamp Workstation</p>
        </div>
      </div>

      {/* Center Transport Controls */}
      <div className="flex items-center space-x-2 bg-daw-darkest px-3 py-1.5 rounded-lg border border-daw-border shadow-inner">
        {/* Record Arm Button */}
        <button
          onClick={onRecordToggle}
          title="Toggle Recording Arm"
          className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-daw-ledRed text-white shadow-[0_0_12px_rgba(255,23,68,0.8)] animate-pulse'
              : 'bg-[#1e2430] text-slate-400 hover:text-daw-ledRed hover:bg-[#283040]'
          }`}
        >
          <Circle className={`w-4 h-4 ${isRecording ? 'fill-current' : ''}`} />
        </button>

        {/* Play Button */}
        <button
          onClick={onPlay}
          title="Play Transport"
          className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-daw-ledGreen text-black shadow-led-glow font-bold'
              : 'bg-[#1e2430] text-slate-300 hover:text-daw-ledGreen hover:bg-[#283040]'
          }`}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          title="Stop Transport"
          className="w-9 h-9 rounded bg-[#1e2430] text-slate-400 hover:text-slate-100 hover:bg-[#283040] flex items-center justify-center transition-all"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Loop Toggle */}
        <button
          onClick={onLoopToggle}
          title="Loop Playback"
          className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
            isLooping
              ? 'bg-daw-accent text-black font-bold shadow-tube-glow'
              : 'bg-[#1e2430] text-slate-400 hover:text-slate-100 hover:bg-[#283040]'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Timecode & Counter */}
        <div className="h-7 w-[1px] bg-daw-border mx-1" />
        <div className="font-mono text-xs px-2 py-1 bg-black/50 rounded border border-daw-border/60 text-daw-accent font-bold tracking-widest min-w-[90px] text-center">
          {timeDisplay}
        </div>

        {/* Tempo / BPM */}
        <div className="flex items-center space-x-1 px-2 py-1 font-mono text-xs text-slate-300 bg-black/40 rounded border border-daw-border/50">
          <Activity className="w-3.5 h-3.5 text-daw-muted" />
          <span className="font-bold">{bpm}</span>
          <span className="text-[10px] text-slate-500">BPM</span>
        </div>
      </div>

      {/* Audio Engine Hardware Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-daw-darkest px-2.5 py-1 rounded border border-daw-border text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 ${isEngineActive ? 'text-daw-ledGreen animate-pulse' : 'text-slate-600'}`} />
          <span className="text-slate-400 text-[11px]">DSP Core:</span>
          <span className={isEngineActive ? 'text-daw-ledGreen font-semibold' : 'text-slate-500'}>
            {isEngineActive ? '48kHz • 24-bit' : 'IDLE'}
          </span>
        </div>
      </div>
    </header>
  );
};

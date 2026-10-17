import React from 'react';
import {
  Play,
  Square,
  Circle,
  Repeat,
  RotateCcw,
  Power,
  Sliders,
  Volume2,
  Clock,
  Layers
} from 'lucide-react';

interface SonarControlBarProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  isEngineActive: boolean;
  bpm: number;
  timecode: string;
  measureBeatTick: string;
  onPlay: () => void;
  onStop: () => void;
  onRewind: () => void;
  onRecordToggle: () => void;
  onLoopToggle: () => void;
  onEngineToggle: () => void;
}

export const SonarControlBar: React.FC<SonarControlBarProps> = ({
  isPlaying,
  isRecording,
  isLooping,
  isEngineActive,
  bpm,
  timecode,
  measureBeatTick,
  onPlay,
  onStop,
  onRewind,
  onRecordToggle,
  onLoopToggle,
  onEngineToggle,
}) => {
  return (
    <div className="bg-sonar-panel border-b border-sonar-panelBorder select-none shadow-md">
      {/* Top Application Menu Strip (Sonar Skylight Style) */}
      <div className="bg-[#14171f] px-3 py-1 flex items-center justify-between border-b border-sonar-borderSubtle text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-bold tracking-wider text-slate-100">
            <span className="w-4 h-4 rounded bg-sonar-accent text-black flex items-center justify-center text-[10px] font-black">
              S
            </span>
            <span>SONAR<span className="text-sonar-accent font-normal">WEB</span></span>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer">File</span>
            <span className="hover:text-slate-200 cursor-pointer">Edit</span>
            <span className="hover:text-slate-200 cursor-pointer">Views</span>
            <span className="hover:text-slate-200 cursor-pointer">Insert</span>
            <span className="hover:text-slate-200 cursor-pointer">Transport</span>
            <span className="hover:text-slate-200 cursor-pointer">ProChannel</span>
            <span className="hover:text-slate-200 cursor-pointer">Audio I/O</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-sonar-accent" />
            Project: GuitarDI_Session.cwb
          </span>
        </div>
      </div>

      {/* Main Control Bar Modules */}
      <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Module 1: Transport Module */}
        <div className="flex items-center space-x-1 bg-sonar-bg p-1 rounded-md border border-sonar-panelBorder shadow-btn-active">
          {/* Rewind */}
          <button
            onClick={onRewind}
            title="Rewind to Start (W)"
            className="w-8 h-8 rounded bg-sonar-panel hover:bg-sonar-panelLight text-slate-300 flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Stop */}
          <button
            onClick={onStop}
            title="Stop (Space)"
            className="w-8 h-8 rounded bg-sonar-panel hover:bg-sonar-panelLight text-slate-300 flex items-center justify-center transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Play */}
          <button
            onClick={onPlay}
            title="Play (Space)"
            className={`w-9 h-8 rounded flex items-center justify-center transition-all font-bold ${
              isPlaying
                ? 'bg-sonar-ledGreen text-black shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                : 'bg-sonar-panel hover:bg-sonar-panelLight text-slate-200 hover:text-sonar-ledGreen'
            }`}
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>

          {/* Record */}
          <button
            onClick={onRecordToggle}
            title="Record (R)"
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-sonar-ledRed text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-sonar-panel hover:bg-sonar-panelLight text-slate-400 hover:text-sonar-ledRed'
            }`}
          >
            <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-current' : ''}`} />
          </button>

          {/* Loop */}
          <button
            onClick={onLoopToggle}
            title="Loop Mode (L)"
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              isLooping
                ? 'bg-sonar-accent text-black font-bold shadow-sonar-glow'
                : 'bg-sonar-panel hover:bg-sonar-panelLight text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Sonar Position & Time Display Module */}
        <div className="flex items-center space-x-2 bg-sonar-bg px-3 py-1.5 rounded-md border border-sonar-panelBorder shadow-btn-active">
          {/* Measure : Beat : Tick */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">
              M : B : T
            </span>
            <div className="font-mono text-sm font-black tracking-widest text-sonar-accent bg-[#0c0e13] px-2 py-0.5 rounded border border-[#212633]">
              {measureBeatTick}
            </div>
          </div>

          <div className="h-7 w-[1px] bg-sonar-panelBorder mx-1" />

          {/* Timecode (SMPTE) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Time
            </span>
            <div className="font-mono text-xs font-bold tracking-wider text-slate-300 bg-[#0c0e13] px-2 py-0.5 rounded border border-[#212633]">
              {timecode}
            </div>
          </div>
        </div>

        {/* Module 3: Tempo & Meter Module */}
        <div className="flex items-center space-x-3 bg-sonar-bg px-3 py-1.5 rounded-md border border-sonar-panelBorder shadow-btn-active">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
              TEMPO
            </span>
            <div className="flex items-baseline space-x-1 font-mono text-xs font-bold text-slate-200">
              <Sliders className="w-3 h-3 text-sonar-accent inline mr-0.5" />
              <span>{bpm.toFixed(1)}</span>
              <span className="text-[9px] text-slate-400">BPM</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-sonar-panelBorder" />

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
              METER
            </span>
            <span className="font-mono text-xs font-bold text-slate-200">4 / 4</span>
          </div>
        </div>

        {/* Module 4: Audio Engine Performance & Dropouts */}
        <div className="flex items-center space-x-2 bg-sonar-bg px-3 py-1.5 rounded-md border border-sonar-panelBorder shadow-btn-active text-xs font-mono">
          <button
            onClick={onEngineToggle}
            title="Audio Engine On / Off"
            className={`p-1.5 rounded transition-all ${
              isEngineActive
                ? 'bg-sonar-ledGreen/20 text-sonar-ledGreen border border-sonar-ledGreen/40 shadow-sm'
                : 'bg-sonar-panel text-slate-500'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[10px]">
              <span className="text-slate-400">AUDIO:</span>
              <span className={isEngineActive ? 'text-sonar-ledGreen font-bold' : 'text-slate-500'}>
                {isEngineActive ? '48.0kHz' : 'STOPPED'}
              </span>
            </div>
            <div className="text-[9px] text-slate-400">
              Buff: 256 • Lat: 5.3ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

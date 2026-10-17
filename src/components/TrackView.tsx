import React, { useRef } from 'react';
import {
  Mic,
  Music,
  Upload,
  VolumeX,
  Volume2,
  Radio,
  Disc3,
  SlidersHorizontal,
} from 'lucide-react';
import type { InputSourceType } from '../dsp/DawAudioEngine';

interface TrackViewProps {
  inputSource: InputSourceType;
  channelVol: number;
  isMuted: boolean;
  isSolo: boolean;
  isArmed: boolean;
  isInputEcho: boolean;
  isPlaying: boolean;
  playheadPosition: number; // 0% to 100%
  onSourceChange: (source: InputSourceType) => void;
  onFileUpload: (file: File) => void;
  onChannelVolChange: (val: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onArmToggle: () => void;
  onInputEchoToggle: () => void;
}

export const TrackView: React.FC<TrackViewProps> = ({
  inputSource,
  channelVol,
  isMuted,
  isSolo,
  isArmed,
  isInputEcho,
  isPlaying,
  playheadPosition,
  onSourceChange,
  onFileUpload,
  onChannelVolChange,
  onMuteToggle,
  onSoloToggle,
  onArmToggle,
  onInputEchoToggle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 bg-sonar-panel border border-sonar-panelBorder rounded-lg overflow-hidden shadow-xl flex flex-col select-none">
      {/* Track View Top Toolbar */}
      <div className="bg-[#14171f] px-3 py-2 border-b border-sonar-panelBorder flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-sonar-accent" />
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
            TRACK VIEW <span className="text-slate-400 font-normal">/ CLIPS PANE</span>
          </span>
        </div>

        {/* Input Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-sonar-bg px-2.5 py-1 rounded border border-sonar-panelBorder text-xs">
          <span className="text-[11px] font-mono text-slate-400">INPUT:</span>
          <select
            value={inputSource}
            onChange={(e) => onSourceChange(e.target.value as InputSourceType)}
            className="bg-transparent text-sonar-accent font-semibold text-xs focus:outline-none cursor-pointer"
          >
            <option value="di-stem" className="bg-sonar-panel text-slate-200">
              Clean Guitar DI Loop (Virtual 48kHz Stem)
            </option>
            <option value="hardware-interface" className="bg-sonar-panel text-slate-200">
              Audio Interface / USB Guitar In (Hardware)
            </option>
            <option value="audio-file" className="bg-sonar-panel text-slate-200">
              Import Audio File (.wav / .mp3)
            </option>
          </select>

          {inputSource === 'audio-file' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-0.5 rounded bg-sonar-accent text-black font-bold text-[10px] flex items-center gap-1 hover:bg-sky-300"
            >
              <Upload className="w-3 h-3" /> Browse...
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Main Track View Area (Header + Timeline) */}
      <div className="flex-1 flex flex-col bg-sonar-trackBg overflow-hidden">
        {/* Timeline Measure Ruler */}
        <div className="flex border-b border-sonar-panelBorder bg-[#111319]">
          {/* Track Header Spacer */}
          <div className="w-72 sm:w-80 border-r border-sonar-panelBorder px-3 py-1 text-[10px] font-mono text-slate-400 uppercase">
            Track Properties
          </div>
          {/* Measures Ruler Bar */}
          <div className="flex-1 flex text-[10px] font-mono text-slate-400 py-1 px-2 relative overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
              <div key={bar} className="flex-1 border-l border-sonar-panelBorder/70 pl-1">
                {bar}
              </div>
            ))}
          </div>
        </div>

        {/* Track 01 Row */}
        <div className="flex border-b border-sonar-panelBorder min-h-[140px] bg-sonar-trackBg hover:bg-[#181b24] transition-colors relative">
          {/* Left Track Strip (Cakewalk Track Header) */}
          <div className="w-72 sm:w-80 bg-sonar-trackHeader border-r border-sonar-panelBorder p-3 flex flex-col justify-between shrink-0 shadow-sm">
            {/* Track Name & Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-7 rounded-sm bg-sonar-accent" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Track 01</span>
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    <Disc3 className="w-3.5 h-3.5 text-sonar-accent" />
                    Guitar DI In
                  </span>
                </div>
              </div>

              {/* Sonar Track Buttons: R, M, S, D (Input Echo) */}
              <div className="flex items-center space-x-1">
                {/* [R] Arm */}
                <button
                  onClick={onArmToggle}
                  title="Arm for Recording (R)"
                  className={`w-6 h-6 rounded text-[10px] font-mono font-black transition-all ${
                    isArmed
                      ? 'bg-sonar-ledRed text-white shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                      : 'bg-sonar-panel text-slate-500 hover:text-slate-300'
                  }`}
                >
                  R
                </button>

                {/* [M] Mute */}
                <button
                  onClick={onMuteToggle}
                  title="Mute Track (M)"
                  className={`w-6 h-6 rounded text-[10px] font-mono font-black transition-all ${
                    isMuted
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-sonar-panel text-slate-500 hover:text-slate-300'
                  }`}
                >
                  M
                </button>

                {/* [S] Solo */}
                <button
                  onClick={onSoloToggle}
                  title="Solo Track (S)"
                  className={`w-6 h-6 rounded text-[10px] font-mono font-black transition-all ${
                    isSolo
                      ? 'bg-sonar-ledYellow text-black shadow-[0_0_6px_rgba(250,204,21,0.8)]'
                      : 'bg-sonar-panel text-slate-500 hover:text-slate-300'
                  }`}
                >
                  S
                </button>

                {/* [D] Input Echo / Direct Monitoring (Cakewalk Sonar Signature) */}
                <button
                  onClick={onInputEchoToggle}
                  title="Input Echo / Live Plugin Monitoring (D)"
                  className={`w-6 h-6 rounded text-[10px] font-mono font-black transition-all ${
                    isInputEcho
                      ? 'bg-sonar-echoOrange text-black shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                      : 'bg-sonar-panel text-slate-500 hover:text-slate-300'
                  }`}
                >
                  D
                </button>
              </div>
            </div>

            {/* Fader & Input Readout */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>VOL: {isMuted ? 'MUTED' : `${Math.round(channelVol * 100)}%`}</span>
                <span className="text-sonar-accent font-semibold">
                  {inputSource === 'hardware-interface' ? 'HW: 48kHz' : 'DI STEM'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : channelVol}
                onChange={(e) => onChannelVolChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-sonar-panel rounded-lg cursor-pointer accent-sonar-accent"
              />
            </div>
          </div>

          {/* Right Clip Timeline (Waveform Display & Playhead) */}
          <div className="flex-1 relative flex items-center p-3 overflow-hidden">
            {/* Grid vertical lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <div key={b} className="flex-1 border-l border-sonar-gridLine/50" />
              ))}
            </div>

            {/* Audio Clip Box */}
            <div className="w-[85%] h-24 bg-gradient-to-r from-[#1a2433] to-[#16202c] border border-sonar-accent/40 rounded-md p-2 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 z-10">
                <span className="font-bold flex items-center gap-1 text-sonar-accent">
                  <Music className="w-3 h-3" />
                  {inputSource === 'hardware-interface'
                    ? 'Live_Audio_Interface_Guitar.wav'
                    : 'Clean_Guitar_DI_Loop.wav'}
                </span>
                <span className="text-slate-400">48kHz • 24-bit Stereo</span>
              </div>

              {/* Stylized Audio Waveform Graphic */}
              <div className="h-14 flex items-center justify-between gap-1 opacity-75">
                {Array.from({ length: 48 }).map((_, idx) => {
                  // Generate an authentic looking audio envelope
                  const envelope = Math.sin((idx / 48) * Math.PI) * 0.9;
                  const randomVar = 0.3 + 0.7 * Math.abs(Math.cos(idx * 0.7));
                  const barH = Math.max(10, Math.floor(envelope * randomVar * 48));
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-sonar-accent/80 rounded-full"
                      style={{ height: `${barH}px` }}
                    />
                  );
                })}
              </div>

              <div className="text-[9px] font-mono text-slate-400 z-10">
                Takes: 1/1 • Length: 00:06.000
              </div>
            </div>

            {/* Moving Playhead Scrubber */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-sonar-ledRed shadow-[0_0_8px_rgba(239,68,68,1)] z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${playheadPosition}%` }}
            >
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-sonar-ledRed -ml-[3px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

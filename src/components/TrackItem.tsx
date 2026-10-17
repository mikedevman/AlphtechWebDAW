import React, { useState } from 'react';
import {
  Mic,
  Music,
  Power,
  Plus,
  Volume2,
  Trash2,
  Headphones,
  Sliders,
  Flame,
} from 'lucide-react';
import type { TrackData, InputSourceType } from '../dsp/DawAudioEngine';

interface TrackItemProps {
  track: TrackData;
  isSelected: boolean;
  onSelectTrack: () => void;
  onUpdateTrack: (updated: Partial<TrackData>) => void;
  onRemoveTrack: () => void;
  onOpenAmpPlugin: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isSelected,
  onSelectTrack,
  onUpdateTrack,
  onRemoveTrack,
  onOpenAmpPlugin,
}) => {
  const [isFxMenuOpen, setIsFxMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(track.name);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      onUpdateTrack({ name: nameInput.trim() });
    } else {
      setNameInput(track.name);
    }
  };

  // Convert track meter dB (-60 to 6) to percentage (0% to 100%)
  const meterPct = Math.min(100, Math.max(0, ((track.meterDb + 60) / 66) * 100));

  return (
    <div
      onClick={onSelectTrack}
      className={`h-28 border-b border-[#2d323e] flex items-stretch transition-colors select-none ${
        isSelected ? 'bg-[#2a2e39]' : 'bg-[#1f222a] hover:bg-[#252932]'
      }`}
    >
      {/* 1. Track Identification & IO Controls (Left) */}
      <div className="w-56 p-2.5 flex flex-col justify-between border-r border-[#2d323e] shrink-0">
        {/* Top: Track Number & Name Box */}
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-slate-400 w-3 text-right">
            {track.number}
          </span>

          {/* Waveform mini icon */}
          <div className="w-3.5 h-3.5 text-slate-400 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M2 5h2v6H2V5zm3-2h2v10H5V3zm3-2h2v14H8V1zm3 4h2v6h-2V5z" />
            </svg>
          </div>

          {/* Track Name Header Box (Orange background when selected, matching user image!) */}
          <div className="flex-1 relative">
            {isEditingName ? (
              <input
                type="text"
                value={nameInput}
                autoFocus
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                className="w-full text-xs font-bold px-2 py-0.5 rounded bg-black text-white outline-none border border-[#ff7700]"
              />
            ) : (
              <div
                onDoubleClick={() => setIsEditingName(true)}
                title="Double click to rename"
                className={`text-xs font-bold px-2 py-0.5 rounded truncate cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#ff8400] text-black shadow-sm'
                    : 'bg-[#2d313d] text-slate-200 hover:bg-[#353a47]'
                }`}
              >
                {track.name}
              </div>
            )}
          </div>

          {/* Delete Track button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTrack();
            }}
            title="Remove Track"
            className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom: Routing Dropdowns (Clips, Input, Output) */}
        <div className="space-y-1 text-[11px] font-mono">
          {/* Input Selector Dropdown */}
          <div className="flex items-center bg-[#15171e] rounded px-1.5 py-0.5 border border-[#2b303c]">
            <span className="text-slate-500 mr-1 text-[10px] font-bold">I:</span>
            <select
              value={track.inputSource}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateTrack({ inputSource: e.target.value as InputSourceType })}
              className="bg-transparent text-slate-300 text-[10px] font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="none" className="bg-[#15171e] text-slate-400">
                None
              </option>
              <option value="di-stem" className="bg-[#15171e] text-[#ff8400]">
                Clean Guitar DI Loop
              </option>
              <option value="hardware-interface" className="bg-[#15171e] text-sky-400">
                USB Interface / Guitar In
              </option>
              <option value="audio-file" className="bg-[#15171e] text-emerald-400">
                Audio File
              </option>
            </select>
          </div>

          {/* Output Selector */}
          <div className="flex items-center bg-[#15171e] rounded px-1.5 py-0.5 border border-[#2b303c]">
            <span className="text-slate-500 mr-1 text-[10px] font-bold">O:</span>
            <span className="text-slate-300 text-[10px] font-semibold">Master</span>
          </div>
        </div>
      </div>

      {/* 2. Track State Buttons: M, S, Arm, Echo (Center) */}
      <div className="w-24 p-2 flex flex-col justify-center border-r border-[#2d323e] shrink-0">
        <div className="grid grid-cols-4 gap-1">
          {/* [M] Mute */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateTrack({ isMuted: !track.isMuted });
            }}
            title="Mute"
            className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center transition-all ${
              track.isMuted
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'bg-[#15171e] text-slate-400 hover:text-slate-200'
            }`}
          >
            M
          </button>

          {/* [S] Solo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateTrack({ isSolo: !track.isSolo });
            }}
            title="Solo"
            className={`w-5 h-5 rounded text-[10px] font-mono font-black flex items-center justify-center transition-all ${
              track.isSolo
                ? 'bg-[#eab308] text-black shadow-sm'
                : 'bg-[#15171e] text-slate-400 hover:text-slate-200'
            }`}
          >
            S
          </button>

          {/* [Arm] Record */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateTrack({ isArmed: !track.isArmed });
            }}
            title="Arm for Recording"
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
              track.isArmed
                ? 'bg-[#ef4444] text-white shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                : 'bg-[#15171e] text-slate-400 hover:text-[#ef4444]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
          </button>

          {/* [Echo] Direct Monitoring */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateTrack({ isInputEcho: !track.isInputEcho });
            }}
            title="Input Echo / Live Monitoring"
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
              track.isInputEcho
                ? 'bg-[#f97316] text-black shadow-[0_0_6px_rgba(249,115,22,0.7)]'
                : 'bg-[#15171e] text-slate-400 hover:text-[#f97316]'
            }`}
          >
            <Headphones className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 3. FX Plugin Rack Module (Right of buttons, matching reference image!) */}
      <div className="w-48 p-2 flex flex-col justify-between border-r border-[#2d323e] shrink-0 bg-[#171920]">
        <div className="flex items-center justify-between pb-1 border-b border-[#262a34]">
          <div className="flex items-center space-x-1.5">
            {/* Orange FX Power Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (track.hasAmpPlugin) {
                  onUpdateTrack({
                    ampSettings: {
                      ...track.ampSettings,
                      enabled: !track.ampSettings.enabled,
                    },
                  });
                }
              }}
              title="Toggle Track FX"
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                track.hasAmpPlugin && track.ampSettings.enabled
                  ? 'bg-[#ff7700] text-black shadow-[0_0_6px_rgba(255,119,0,0.6)]'
                  : 'bg-[#252932] text-slate-500'
              }`}
            >
              <Power className="w-2.5 h-2.5" />
            </button>
            <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider">
              FX
            </span>
          </div>

          {/* Add Plugin '+' Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFxMenuOpen(!isFxMenuOpen);
              }}
              title="Insert Plugin..."
              className="w-4 h-4 rounded bg-[#252934] hover:bg-[#ff7700] hover:text-black text-slate-300 flex items-center justify-center transition-colors font-bold text-xs"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>

            {/* Plugin Dropdown Menu */}
            {isFxMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-5 w-44 bg-[#12141a] border border-[#373e4f] rounded-lg shadow-2xl py-1 z-30 text-xs font-sans animate-in fade-in zoom-in-95"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase border-b border-[#252934]">
                  Insert Audio FX:
                </div>
                <button
                  onClick={() => {
                    onUpdateTrack({ hasAmpPlugin: true });
                    setIsFxMenuOpen(false);
                    onOpenAmpPlugin();
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#ff7700] hover:text-black flex items-center gap-1.5 text-slate-200 font-medium transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-[#ff7700] group-hover:text-black" />
                  Alphtech Guitar Amp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Plugin Slot Container Box (Matches dark rectangular slot in image) */}
        <div className="flex-1 bg-[#0d0e12] rounded border border-[#232732] p-1 flex items-center justify-center mt-1">
          {track.hasAmpPlugin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAmpPlugin();
              }}
              title="Click to open Guitar Amp controls"
              className="w-full h-full rounded px-2 py-1 bg-gradient-to-r from-[#202530] to-[#171a22] border border-[#3b4457] hover:border-[#ff7700] text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-1.5 truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    track.ampSettings.enabled ? 'bg-[#ff7700] animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold text-slate-200 truncate group-hover:text-[#ff7700]">
                  Alphtech Tube Amp
                </span>
              </div>
              <Sliders className="w-3 h-3 text-slate-400 group-hover:text-[#ff7700] shrink-0" />
            </button>
          ) : (
            <span className="text-[9px] font-mono text-slate-600">No FX Inserted</span>
          )}
        </div>
      </div>

      {/* 4. Vertical dB Meter Column (Rightmost section of track header, matching image!) */}
      <div className="w-10 bg-[#161820] border-r border-[#2d323e] p-1 flex items-center justify-between shrink-0 font-mono text-[8px] text-slate-500 select-none">
        {/* Scale Numbers */}
        <div className="flex flex-col justify-between h-full py-0.5 leading-none">
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>27</span>
          <span>36</span>
          <span>46</span>
          <span>54</span>
        </div>

        {/* Active Meter LED Bar */}
        <div className="w-2 h-full bg-[#0a0b0e] rounded-sm relative overflow-hidden flex flex-col justify-end border border-[#252a36]">
          <div
            className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
            style={{ height: `${meterPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

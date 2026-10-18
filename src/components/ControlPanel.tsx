import React from 'react';
import { Play, Square, Circle, Repeat, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  timeDisplay: string;
  totalTimeDisplay?: string;
  onPlay: () => void;
  onStop: () => void;
  onRewind: () => void;
  onRecordToggle: () => void;
  onLoopToggle: () => void;
  onAddTrack: () => void;
  onRemoveSelectedTrack: () => void;
  selectedTrackName?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  isRecording,
  isLooping,
  timeDisplay,
  totalTimeDisplay = '00:00:00',
  onPlay,
  onStop,
  onRewind,
  onRecordToggle,
  onLoopToggle,
  onAddTrack,
  onRemoveSelectedTrack,
  selectedTrackName,
}) => {
  return (
    <div className="bg-[#181a20] border-b border-[#2a2e38] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none shadow-md">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded bg-[#ff7700] text-black font-black flex items-center justify-center text-sm shadow-[0_0_12px_rgba(255,119,0,0.5)]">
          A
        </div>
        <div>
          <h1 className="font-extrabold tracking-wider text-slate-100 text-sm">
            Alphtech<span className="text-[#ff7700]">WebDAW</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Digital Audio Workstation</p>
        </div>
      </div>

      {/* Basic Working Transport Controls */}
      <div className="flex items-center space-x-1.5 bg-[#101217] p-1.5 rounded-lg border border-[#2a2e38] shadow-inner">
        <button
          onClick={onRewind}
          title="Rewind to Start"
          className="w-8 h-8 rounded bg-[#1e222b] hover:bg-[#282d38] text-slate-300 flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onStop}
          title="Stop"
          className="w-8 h-8 rounded bg-[#1e222b] hover:bg-[#282d38] text-slate-300 flex items-center justify-center transition-all"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          onClick={onPlay}
          title="Play"
          className={`w-9 h-8 rounded flex items-center justify-center transition-all font-bold ${
            isPlaying
              ? 'bg-[#00e676] text-black shadow-[0_0_12px_rgba(0,230,118,0.7)]'
              : 'bg-[#1e222b] hover:bg-[#282d38] text-slate-200 hover:text-[#00e676]'
          }`}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        <button
          onClick={onRecordToggle}
          title="Record"
          className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-[#ff1744] text-white shadow-[0_0_10px_rgba(255,23,68,0.8)] animate-pulse'
              : 'bg-[#1e222b] hover:bg-[#282d38] text-slate-400 hover:text-[#ff1744]'
          }`}
        >
          <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={onLoopToggle}
          title="Loop Toggle"
          className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
            isLooping
              ? 'bg-[#ff7700] text-black font-bold shadow-[0_0_10px_rgba(255,119,0,0.5)]'
              : 'bg-[#1e222b] hover:bg-[#282d38] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>

        {/* Position & Timecode Display */}
        <div className="h-6 w-[1px] bg-[#2a2e38] mx-1.5" />

        <div className="flex items-center space-x-1.5 font-mono text-xs px-2.5 py-1 bg-[#0a0b0e] rounded border border-[#232730]">
          <span className="text-[#ff7700] font-bold">{timeDisplay}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 font-medium">{totalTimeDisplay}</span>
        </div>
      </div>

      {/* Track Actions: Add / Remove Track */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onAddTrack}
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#ff7700] hover:bg-[#ff8800] text-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Track
        </button>

        <button
          onClick={onRemoveSelectedTrack}
          title={selectedTrackName ? `Delete ${selectedTrackName}` : 'Delete Track'}
          className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#262a34] hover:bg-[#341b1f] hover:text-[#ff5252] text-slate-300 border border-[#353a47] flex items-center gap-1 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
};

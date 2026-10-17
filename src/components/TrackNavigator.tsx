import React from 'react';
import type { TrackData } from '../dsp/DawAudioEngine';
import { Compass, Music } from 'lucide-react';

interface TrackNavigatorProps {
  tracks: TrackData[];
  selectedTrackId: string;
  playheadPosition: number; // 0 to 100%
  onSelectTrack: (trackId: string) => void;
}

export const TrackNavigator: React.FC<TrackNavigatorProps> = ({
  tracks,
  selectedTrackId,
  playheadPosition,
  onSelectTrack,
}) => {
  return (
    <div className="bg-[#121419] border-b border-[#252932] px-3 py-1.5 flex items-center gap-3 select-none">
      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
        <Compass className="w-3.5 h-3.5 text-[#ff7700]" />
        <span>Track Navigator:</span>
      </div>

      {/* Mini Track Navigation Strip */}
      <div className="flex-1 bg-[#0b0c10] border border-[#222630] rounded h-8 relative flex items-center overflow-x-auto px-1 gap-1.5">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`h-6 px-2.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 border ${
                isSelected
                  ? 'bg-[#ff7700] text-black border-[#ff8800] shadow-[0_0_8px_rgba(255,119,0,0.6)]'
                  : 'bg-[#181b22] text-slate-400 border-[#282d38] hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              <span>{track.number}</span>
              <span className="truncate max-w-[90px]">{track.name}</span>
              {track.hasAmpPlugin && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Amp Inserted" />
              )}
            </button>
          );
        })}

        {/* Global Playhead Line across navigator */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-[#ff1744] pointer-events-none transition-all duration-75"
          style={{ left: `${Math.min(99, Math.max(1, playheadPosition))}%` }}
        />
      </div>
    </div>
  );
};

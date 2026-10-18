import React from 'react';
import type { TrackData } from '../dsp/DawAudioEngine';
import { Music } from 'lucide-react';

interface TrackTimelineProps {
  tracks: TrackData[];
  selectedTrackId: string;
  playheadPosition: number; // 0 to 100%
  onSeek: (percent: number) => void;
}

export const TrackTimeline: React.FC<TrackTimelineProps> = ({
  tracks,
  selectedTrackId,
  playheadPosition,
  onSeek,
}) => {
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(pct);
  };

  return (
    <div className="flex-1 bg-[#12141a] flex flex-col overflow-x-auto select-none relative">
      {/* Measure Ruler Bar (Header) - Matching Cakewalk Sonar style */}
      <div
        onClick={handleTimelineClick}
        className="h-7 bg-[#1c1f26] border-b border-[#374151] flex cursor-pointer relative shrink-0 select-none overflow-hidden"
      >
        {/* Ruler measures */}
        <div className="flex-1 flex relative h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
            <div key={bar} className="flex-1 relative h-full border-b border-[#94a3b8]/70">
              {/* Major Measure Tick (Beat 1) */}
              <div className="absolute left-0 bottom-0 w-[1px] h-3.5 bg-[#cbd5e1]" />

              {/* Measure Number in Blue */}
              <span className="absolute left-1 top-0.5 text-[11px] font-mono font-medium text-[#38bdf8] leading-none">
                {bar}
              </span>

              {/* Sub-beat 2 tick */}
              <div className="absolute left-[25%] bottom-0 w-[1px] h-1.5 bg-[#94a3b8]" />

              {/* Sub-beat 3 tick */}
              <div className="absolute left-[50%] bottom-0 w-[1px] h-2 bg-[#94a3b8]" />

              {/* Sub-beat 4 tick */}
              <div className="absolute left-[75%] bottom-0 w-[1px] h-1.5 bg-[#94a3b8]" />
            </div>
          ))}
          {/* Final end tick */}
          <div className="w-[1px] h-3.5 bg-[#cbd5e1] absolute right-0 bottom-0" />
        </div>
      </div>

      {/* Track Lanes Rows */}
      <div onClick={handleTimelineClick} className="flex-1 flex flex-col relative cursor-pointer">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;

          return (
            <div
              key={track.id}
              className={`h-28 border-b border-[#252932] relative flex items-center px-2 transition-colors ${
                isSelected ? 'bg-[#1a1e27]/50' : 'hover:bg-[#161820]'
              }`}
            >
              {/* Vertical Measure Grid Lines aligned with major ticks */}
              <div className="absolute inset-0 flex pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                  <div key={b} className="flex-1 border-l border-[#262c3a]" />
                ))}
              </div>

              {/* Clip Box - Only shown when audio clip is loaded/recorded */}
              {track.audioClip && (
                <div className="w-[85%] h-20 bg-gradient-to-r from-[#1c2330] via-[#161d28] to-[#121620] border border-[#ff7700]/40 rounded p-2 flex flex-col justify-between shadow-md relative overflow-hidden z-10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="font-bold text-[#ff8400] flex items-center gap-1 truncate">
                      <Music className="w-3 h-3" />
                      {track.audioClip.name}
                    </span>
                    <span className="text-slate-500 text-[9px]">48kHz 24-bit</span>
                  </div>

                  {/* Stylized Audio Waveform Graphic */}
                  <div className="h-10 flex items-center justify-between gap-1 opacity-80">
                    {Array.from({ length: 48 }).map((_, idx) => {
                      const envelope = Math.sin((idx / 48) * Math.PI) * 0.9;
                      const randomVar = 0.3 + 0.7 * Math.abs(Math.cos(idx * 0.8));
                      const barH = Math.max(6, Math.floor(envelope * randomVar * 36));
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-[#ff7700]/70 rounded-full"
                          style={{ height: `${barH}px` }}
                        />
                      );
                    })}
                  </div>

                  <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                    <span>
                      Length: 00:0{Math.min(9, Math.round(track.audioClip.duration))}.000
                    </span>
                    {track.hasAmpPlugin && (
                      <span className="text-emerald-400 font-semibold">Amp DSP Active</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Global Moving Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#ff1744] shadow-[0_0_8px_rgba(255,23,68,1)] z-20 pointer-events-none transition-all duration-75"
          style={{ left: `${Math.min(99.5, Math.max(0.2, playheadPosition))}%` }}
        >
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#ff1744] -ml-[3px]" />
        </div>
      </div>
    </div>
  );
};

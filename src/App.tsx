import { useState, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { TrackItem } from './components/TrackItem';
import { TrackTimeline } from './components/TrackTimeline';
import { GuitarAmpPlugin } from './components/GuitarAmpPlugin';
import { DawAudioEngine } from './dsp/DawAudioEngine';
import type { TrackData, TrackAmpSettings } from './dsp/DawAudioEngine';

const DEFAULT_AMP_SETTINGS: TrackAmpSettings = {
  enabled: true,
  mode: 'crunch',
  drive: 8.5,
  trimDb: 2.0,
  bassDb: 1.5,
  midDb: 2.0,
  trebleDb: 2.0,
  masterDb: 0,
};

const INITIAL_TRACKS: TrackData[] = [
  {
    id: 'track-1',
    number: 1,
    name: 'Track 1',
    inputSource: 'audio-input',
    outputBus: 'Master',
    isMuted: false,
    isSolo: false,
    isArmed: true,
    isInputEcho: true,
    volume: 0.85,
    hasAmpPlugin: true,
    ampSettings: { ...DEFAULT_AMP_SETTINGS },
    meterDb: -60,
  },
  {
    id: 'track-2',
    number: 2,
    name: 'Track 2',
    inputSource: 'audio-input',
    outputBus: 'Master',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isInputEcho: false,
    volume: 0.85,
    hasAmpPlugin: false,
    ampSettings: { ...DEFAULT_AMP_SETTINGS, enabled: false },
    meterDb: -60,
  },
  {
    id: 'track-3',
    number: 3,
    name: 'Track 3',
    inputSource: 'audio-input',
    outputBus: 'Master',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isInputEcho: false,
    volume: 0.85,
    hasAmpPlugin: false,
    ampSettings: { ...DEFAULT_AMP_SETTINGS, enabled: false },
    meterDb: -60,
  },
  {
    id: 'track-4',
    number: 4,
    name: 'Track 4',
    inputSource: 'audio-input',
    outputBus: 'Master',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isInputEcho: false,
    volume: 0.85,
    hasAmpPlugin: false,
    ampSettings: { ...DEFAULT_AMP_SETTINGS, enabled: false },
    meterDb: -60,
  },
];

export function App() {
  const engine = useRef(DawAudioEngine.getInstance()).current;

  // Track State
  const [tracks, setTracks] = useState<TrackData[]>(INITIAL_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('track-1');
  const [activePluginTrackId, setActivePluginTrackId] = useState<string | null>(null);

  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [timecode, setTimecode] = useState('00:00:00.00');
  const [measureBeatTick, setMeasureBeatTick] = useState('001:01:000');
  const [playheadPos, setPlayheadPos] = useState(0);

  const startTimeRef = useRef(0);
  const loopDuration = 6.0;

  // Real-time Audio Polling & Playhead animation
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // Update per-track meters
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          meterDb: engine.isPlaying ? engine.getTrackMeterDb(t.id) : -60,
        }))
      );

      if (engine.isPlaying) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const currentLoopSec = elapsed % loopDuration;

        // Playhead position percentage across timeline (0 to 85% matches audio clip)
        setPlayheadPos((currentLoopSec / loopDuration) * 85);

        // SMPTE Timecode
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const ms = Math.floor((elapsed * 100) % 100);
        setTimecode(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
        );

        // 110 BPM Measure : Beat : Tick
        const beatsTotal = elapsed * (110 / 60);
        const measure = Math.floor(beatsTotal / 4) + 1;
        const beat = (Math.floor(beatsTotal) % 4) + 1;
        const tickVal = Math.floor((beatsTotal % 1) * 960);
        setMeasureBeatTick(
          `${String(measure).padStart(3, '0')}:${String(beat).padStart(2, '0')}:${String(tickVal).padStart(3, '0')}`
        );
      } else {
        setPlayheadPos(0);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Synchronize audio engine when tracks change
  useEffect(() => {
    tracks.forEach((track) => {
      engine.registerTrack(track);
      engine.updateTrackDsp(track);
    });
  }, [tracks, engine]);

  // Transport Handlers
  const handlePlay = async () => {
    try {
      await engine.play(tracks);
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error('Play error:', err);
    }
  };

  const handleStop = () => {
    engine.stopPlayback();
    setIsPlaying(false);
    setTimecode('00:00:00.00');
    setMeasureBeatTick('001:01:000');
    setPlayheadPos(0);
  };

  const handleRewind = () => {
    handleStop();
    startTimeRef.current = Date.now();
  };

  // Track Management: Add Track
  const handleAddTrack = () => {
    const nextNumber = tracks.length > 0 ? Math.max(...tracks.map((t) => t.number)) + 1 : 1;
    const newTrack: TrackData = {
      id: `track-${Date.now()}`,
      number: nextNumber,
      name: `Track ${nextNumber}`,
      inputSource: 'audio-input',
      outputBus: 'Master',
      isMuted: false,
      isSolo: false,
      isArmed: false,
      isInputEcho: false,
      volume: 0.85,
      hasAmpPlugin: false,
      ampSettings: { ...DEFAULT_AMP_SETTINGS, enabled: false },
      meterDb: -60,
    };
    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  // Track Management: Remove Selected Track
  const handleRemoveTrack = (trackIdToRemove?: string) => {
    const targetId = trackIdToRemove || selectedTrackId;
    if (tracks.length <= 1) {
      alert('Project must have at least one track.');
      return;
    }
    engine.unregisterTrack(targetId);
    setTracks((prev) => {
      const remaining = prev.filter((t) => t.id !== targetId);
      if (selectedTrackId === targetId) {
        setSelectedTrackId(remaining[0]?.id || '');
      }
      return remaining;
    });
  };

  // Update specific track data
  const handleUpdateTrack = (trackId: string, updated: Partial<TrackData>) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const nextTrack = { ...t, ...updated };
          engine.updateTrackDsp(nextTrack);
          return nextTrack;
        }
        return t;
      })
    );
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const activePluginTrack = tracks.find((t) => t.id === activePluginTrackId);

  return (
    <div className="h-screen flex flex-col bg-[#14161c] text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. Top Control Panel (Basic working controls) */}
      <ControlPanel
        isPlaying={isPlaying}
        isRecording={isRecording}
        isLooping={isLooping}
        timecode={timecode}
        measureBeatTick={measureBeatTick}
        onPlay={handlePlay}
        onStop={handleStop}
        onRewind={handleRewind}
        onRecordToggle={() => setIsRecording(!isRecording)}
        onLoopToggle={() => {
          const next = !isLooping;
          setIsLooping(next);
          engine.isLooping = next;
        }}
        onAddTrack={handleAddTrack}
        onRemoveSelectedTrack={() => handleRemoveTrack()}
        selectedTrackName={selectedTrack?.name}
      />

      {/* 2. Main Workspace: Track List on Left, Track Views / Timeline on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track List (Left Pane) */}
        <div className="w-[33rem] flex flex-col overflow-y-auto border-r border-[#2d323e] bg-[#1a1c24] shrink-0">
          {tracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              isSelected={track.id === selectedTrackId}
              onSelectTrack={() => setSelectedTrackId(track.id)}
              onUpdateTrack={(updated) => handleUpdateTrack(track.id, updated)}
              onRemoveTrack={() => handleRemoveTrack(track.id)}
              onOpenAmpPlugin={() => setActivePluginTrackId(track.id)}
              onFileUpload={async (file) => {
                await engine.initAudio();
                if (engine.ctx) {
                  const arrayBuffer = await file.arrayBuffer();
                  const decoded = await engine.ctx.decodeAudioData(arrayBuffer);
                  engine.userFileBuffers.set(track.id, decoded);
                  handleUpdateTrack(track.id, { inputSource: 'audio-file' });
                }
              }}
            />
          ))}
        </div>

        {/* Track Views / Clips Timeline (Right Pane) */}
        <TrackTimeline
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          playheadPosition={playheadPos}
          onSeek={(pct) => {
            // Reposition playhead
            setPlayheadPos(pct);
          }}
        />
      </div>

      {/* 4. Guitar Amp Plugin Window (Opens when clicked from a track's FX rack) */}
      {activePluginTrack && (
        <GuitarAmpPlugin
          track={activePluginTrack}
          onClose={() => setActivePluginTrackId(null)}
          onUpdateSettings={(settings) =>
            handleUpdateTrack(activePluginTrack.id, { ampSettings: settings })
          }
          onRemovePlugin={() => {
            handleUpdateTrack(activePluginTrack.id, { hasAmpPlugin: false });
            setActivePluginTrackId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;

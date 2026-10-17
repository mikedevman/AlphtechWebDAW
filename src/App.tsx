import { useState, useEffect, useRef } from 'react';
import { SonarControlBar } from './components/SonarControlBar';
import { ProChannel } from './components/ProChannel';
import { TrackView } from './components/TrackView';
import { MasterConsole } from './components/MasterConsole';
import { DawAudioEngine } from './dsp/DawAudioEngine';
import type { InputSourceType, MeterLevels } from './dsp/DawAudioEngine';
import type { TubeMode } from './dsp/TubeShaper';
import { FACTORY_PRESETS } from './dsp/presets';
import type { PreampPreset } from './dsp/presets';

export function App() {
  const engine = useRef(DawAudioEngine.getInstance()).current;

  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [timecode, setTimecode] = useState('00:00:00.00');
  const [measureBeatTick, setMeasureBeatTick] = useState('001:01:000');
  const [playheadPos, setPlayheadPos] = useState(0);

  // Track & DSP State
  const [inputSource, setInputSource] = useState<InputSourceType>('di-stem');
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [isArmed, setIsArmed] = useState(true);
  const [isInputEcho, setIsInputEcho] = useState(true);
  const [channelVol, setChannelVol] = useState(0.85);
  const [pan, setPan] = useState(0);

  // ProChannel DSP State
  const [tubeMode, setTubeMode] = useState<TubeMode>('crunch');
  const [drive, setDrive] = useState(7.5);
  const [trimDb, setTrimDb] = useState(2.0);
  const [bassDb, setBassDb] = useState(1.5);
  const [midDb, setMidDb] = useState(2.5);
  const [trebleDb, setTrebleDb] = useState(1.5);
  const [masterDb, setMasterDb] = useState(-1.0);

  // Presets & Metering
  const [currentPresetId, setCurrentPresetId] = useState('british-crunch');
  const [meterLevels, setMeterLevels] = useState<MeterLevels>({
    peakDb: -60,
    rmsDb: -60,
    isClipping: false,
  });

  const startTimeRef = useRef(0);
  const loopDuration = 6.0; // 6-second guitar loop

  // Audio Engine polling loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (engine.ctx && engine.ctx.state === 'running') {
        setIsEngineActive(true);
      } else {
        setIsEngineActive(false);
      }

      setMeterLevels(engine.getMeterLevels());

      if (engine.isPlaying) {
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const currentLoopSec = elapsedSec % loopDuration;

        // Playhead percentage across grid (0% to 100%)
        setPlayheadPos((currentLoopSec / loopDuration) * 85); // 85% matches clip width

        // Timecode: HH:MM:SS.ms
        const mins = Math.floor(elapsedSec / 60);
        const secs = Math.floor(elapsedSec % 60);
        const ms = Math.floor((elapsedSec * 100) % 100);
        setTimecode(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
        );

        // Calculate Measures, Beats, Ticks at 110 BPM (approx 2.18s per 4/4 measure)
        const beatsTotal = (elapsedSec * (110 / 60));
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

  // Transport Handlers
  const handlePlay = async () => {
    try {
      await engine.play();
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error('Play failed:', err);
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

  const handleEngineToggle = async () => {
    if (!engine.ctx) {
      await engine.initAudio();
      setIsEngineActive(true);
    } else if (engine.ctx.state === 'running') {
      await engine.ctx.suspend();
      setIsEngineActive(false);
    } else {
      await engine.ctx.resume();
      setIsEngineActive(true);
    }
  };

  const handleSourceChange = async (source: InputSourceType) => {
    try {
      await engine.setInputSource(source);
      setInputSource(source);
      if (source === 'hardware-interface') {
        setIsPlaying(true);
        startTimeRef.current = Date.now();
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      alert('Could not access audio interface/microphone. Please check browser permissions.');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await engine.loadUserAudioFile(file);
      setInputSource('audio-file');
      await handlePlay();
    } catch {
      alert('Failed to load audio file. Please use a standard WAV or MP3.');
    }
  };

  const handleSelectPreset = (p: PreampPreset) => {
    setCurrentPresetId(p.id);
    setTubeMode(p.mode);
    setDrive(p.drive);
    setTrimDb(p.trimDb);
    setBassDb(p.bassDb);
    setMidDb(p.midDb);
    setTrebleDb(p.trebleDb);
    setMasterDb(p.masterDb);

    engine.setDrive(p.drive, p.mode);
    engine.setTrimDb(p.trimDb);
    engine.setBassDb(p.bassDb);
    engine.setMidDb(p.midDb);
    engine.setTrebleDb(p.trebleDb);
    engine.setMasterDb(p.masterDb);
  };

  const currentPresetObject: PreampPreset = {
    id: currentPresetId,
    name: FACTORY_PRESETS.find((p) => p.id === currentPresetId)?.name || 'Custom Tone',
    description: 'Custom user tone setting.',
    mode: tubeMode,
    drive,
    trimDb,
    bassDb,
    midDb,
    trebleDb,
    masterDb,
  };

  return (
    <div className="min-h-screen bg-sonar-bg text-slate-100 flex flex-col justify-between select-none">
      {/* Cakewalk Sonar Control Bar (Top) */}
      <SonarControlBar
        isPlaying={isPlaying}
        isRecording={isRecording}
        isLooping={isLooping}
        isEngineActive={isEngineActive}
        bpm={110}
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
        onEngineToggle={handleEngineToggle}
      />

      {/* Main Workspace (Skylight View: ProChannel on Left + Track View on Right) */}
      <main className="p-3 space-y-3 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col lg:flex-row gap-3">
          {/* Left Pane: Inspector / ProChannel */}
          <ProChannel
            tubeMode={tubeMode}
            drive={drive}
            trimDb={trimDb}
            bassDb={bassDb}
            midDb={midDb}
            trebleDb={trebleDb}
            pan={pan}
            onModeChange={(m) => {
              setTubeMode(m);
              engine.setDrive(drive, m);
              setCurrentPresetId('custom');
            }}
            onDriveChange={(d) => {
              setDrive(d);
              engine.setDrive(d, tubeMode);
              setCurrentPresetId('custom');
            }}
            onTrimChange={(t) => {
              setTrimDb(t);
              engine.setTrimDb(t);
              setCurrentPresetId('custom');
            }}
            onBassChange={(b) => {
              setBassDb(b);
              engine.setBassDb(b);
              setCurrentPresetId('custom');
            }}
            onMidChange={(m) => {
              setMidDb(m);
              engine.setMidDb(m);
              setCurrentPresetId('custom');
            }}
            onTrebleChange={(tr) => {
              setTrebleDb(tr);
              engine.setTrebleDb(tr);
              setCurrentPresetId('custom');
            }}
            onPanChange={setPan}
          />

          {/* Right Pane: Track View & Clips Grid */}
          <TrackView
            inputSource={inputSource}
            channelVol={channelVol}
            isMuted={isMuted}
            isSolo={isSolo}
            isArmed={isArmed}
            isInputEcho={isInputEcho}
            isPlaying={isPlaying}
            playheadPosition={playheadPos}
            onSourceChange={handleSourceChange}
            onFileUpload={handleFileUpload}
            onChannelVolChange={(v) => {
              setChannelVol(v);
              engine.setChannelVolume(v);
            }}
            onMuteToggle={() => {
              const next = !isMuted;
              setIsMuted(next);
              engine.setMute(next);
            }}
            onSoloToggle={() => setIsSolo(!isSolo)}
            onArmToggle={() => setIsArmed(!isArmed)}
            onInputEchoToggle={() => setIsInputEcho(!isInputEcho)}
          />
        </div>

        {/* Bottom Pane: Master Console Bus & Spectrum Analyzer */}
        <MasterConsole
          analyser={engine.analyser}
          isPlaying={isPlaying}
          masterDb={masterDb}
          meterLevels={meterLevels}
          currentPresetId={currentPresetId}
          currentPreset={currentPresetObject}
          onMasterDbChange={(db) => {
            setMasterDb(db);
            engine.setMasterDb(db);
          }}
          onSelectPreset={handleSelectPreset}
        />
      </main>

      {/* Professional DAW Status Bar (Bottom) */}
      <footer className="bg-[#0f1117] border-t border-sonar-panelBorder px-3 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-bold">SONAR WEB v1.0</span>
          <span>•</span>
          <span>Core: Web Audio Engine (48.0 kHz 32-bit Float)</span>
          <span>•</span>
          <span className="text-sonar-accent">ASIO Emulation Active</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Buffer: 256 samples</span>
          <span>•</span>
          <span>Latency: ~5.3 ms</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

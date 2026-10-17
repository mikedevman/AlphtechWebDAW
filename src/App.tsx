import { useState, useEffect, useRef } from 'react';
import { TransportBar } from './components/TransportBar';
import { GuitarChannelStrip } from './components/GuitarChannelStrip';
import { MasterBus } from './components/MasterBus';
import { PresetBar } from './components/PresetBar';
import { DawAudioEngine } from './dsp/DawAudioEngine';
import type { InputSourceType, MeterLevels } from './dsp/DawAudioEngine';
import type { TubeMode } from './dsp/TubeShaper';
import { FACTORY_PRESETS } from './dsp/presets';
import type { PreampPreset } from './dsp/presets';
import { ShieldCheck, Cloud, Cpu, Info } from 'lucide-react';

export function App() {
  const engine = useRef(DawAudioEngine.getInstance()).current;

  // DAW State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [inputSource, setInputSource] = useState<InputSourceType>('di-stem');
  const [timeDisplay, setTimeDisplay] = useState('00:00:00.00');

  // DSP Track State
  const [tubeMode, setTubeMode] = useState<TubeMode>('crunch');
  const [drive, setDrive] = useState(7.5);
  const [trimDb, setTrimDb] = useState(2.0);
  const [bassDb, setBassDb] = useState(1.5);
  const [midDb, setMidDb] = useState(2.5);
  const [trebleDb, setTrebleDb] = useState(1.5);
  const [channelVol, setChannelVol] = useState(0.85);
  const [masterDb, setMasterDb] = useState(-1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [isArmed, setIsArmed] = useState(true);

  // Preset State
  const [currentPresetId, setCurrentPresetId] = useState('british-crunch');

  // Metering State
  const [meterLevels, setMeterLevels] = useState<MeterLevels>({
    peakDb: -60,
    rmsDb: -60,
    isClipping: false,
  });

  // Track playback time counter
  const startTimeRef = useRef(0);

  // Metering & Timer polling loop
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
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const ms = Math.floor((elapsed * 100) % 100);
        setTimeDisplay(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
        );
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Handlers
  const handlePlay = async () => {
    try {
      await engine.play();
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  const handleStop = () => {
    engine.stopPlayback();
    setIsPlaying(false);
    setTimeDisplay('00:00:00.00');
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
      alert('Could not access microphone/audio interface. Please check browser permissions.');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await engine.loadUserAudioFile(file);
      setInputSource('audio-file');
      await handlePlay();
    } catch (err) {
      alert('Failed to decode audio file. Please try a valid MP3 or WAV file.');
    }
  };

  const handleDriveChange = (val: number) => {
    setDrive(val);
    engine.setDrive(val, tubeMode);
    setCurrentPresetId('custom');
  };

  const handleModeChange = (mode: TubeMode) => {
    setTubeMode(mode);
    engine.setDrive(drive, mode);
    setCurrentPresetId('custom');
  };

  const handleTrimChange = (val: number) => {
    setTrimDb(val);
    engine.setTrimDb(val);
    setCurrentPresetId('custom');
  };

  const handleBassChange = (val: number) => {
    setBassDb(val);
    engine.setBassDb(val);
    setCurrentPresetId('custom');
  };

  const handleMidChange = (val: number) => {
    setMidDb(val);
    engine.setMidDb(val);
    setCurrentPresetId('custom');
  };

  const handleTrebleChange = (val: number) => {
    setTrebleDb(val);
    engine.setTrebleDb(val);
    setCurrentPresetId('custom');
  };

  const handleChannelVolChange = (val: number) => {
    setChannelVol(val);
    engine.setChannelVolume(val);
  };

  const handleMasterDbChange = (val: number) => {
    setMasterDb(val);
    engine.setMasterDb(val);
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    engine.setMute(next);
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
    description: 'Custom user calibrated guitar preamp profile.',
    mode: tubeMode,
    drive,
    trimDb,
    bassDb,
    midDb,
    trebleDb,
    masterDb,
  };

  return (
    <div className="min-h-screen bg-daw-darkest text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Transport Navigation Bar */}
      <TransportBar
        isPlaying={isPlaying}
        isRecording={isRecording}
        isLooping={isLooping}
        isEngineActive={isEngineActive}
        bpm={110}
        timeDisplay={timeDisplay}
        onPlay={handlePlay}
        onStop={handleStop}
        onRecordToggle={() => setIsRecording(!isRecording)}
        onLoopToggle={() => {
          const next = !isLooping;
          setIsLooping(next);
          engine.isLooping = next;
        }}
      />

      {/* Main Workspace DAW Workstation */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Quick Intro / Status Banner */}
        <div className="bg-gradient-to-r from-daw-panel to-daw-track p-4 rounded-xl border border-daw-border flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-daw-accent/10 border border-daw-accent/30 text-daw-accent">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                AlphtechWebDAW Guitar I/O & Preamp Baseline
              </h2>
              <p className="text-xs text-slate-400">
                Browser-native Web Audio workstation featuring 12AX7 vacuum tube overdrive simulation and 3-band EQ.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center gap-1.5 bg-daw-darkest px-3 py-1.5 rounded-lg border border-daw-border text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Azure App Service Host
            </span>
            <span className="flex items-center gap-1.5 bg-daw-darkest px-3 py-1.5 rounded-lg border border-daw-border text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              SWE40006 Task 3.1
            </span>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <PresetBar
          currentPresetId={currentPresetId}
          currentPreset={currentPresetObject}
          onSelectPreset={handleSelectPreset}
        />

        {/* Track 1: Guitar Channel Strip */}
        <GuitarChannelStrip
          inputSource={inputSource}
          tubeMode={tubeMode}
          drive={drive}
          trimDb={trimDb}
          bassDb={bassDb}
          midDb={midDb}
          trebleDb={trebleDb}
          channelVol={channelVol}
          isMuted={isMuted}
          isSolo={isSolo}
          isArmed={isArmed}
          onSourceChange={handleSourceChange}
          onFileUpload={handleFileUpload}
          onModeChange={handleModeChange}
          onDriveChange={handleDriveChange}
          onTrimChange={handleTrimChange}
          onBassChange={handleBassChange}
          onMidChange={handleMidChange}
          onTrebleChange={handleTrebleChange}
          onChannelVolChange={handleChannelVolChange}
          onMuteToggle={handleMuteToggle}
          onSoloToggle={() => setIsSolo(!isSolo)}
          onArmToggle={() => setIsArmed(!isArmed)}
        />

        {/* Master Bus & Visualizer */}
        <MasterBus
          analyser={engine.analyser}
          isPlaying={isPlaying}
          masterDb={masterDb}
          meterLevels={meterLevels}
          onMasterDbChange={handleMasterDbChange}
        />
      </main>

      {/* Professional Footer */}
      <footer className="bg-daw-panel border-t border-daw-border px-4 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-daw-accent" />
            <span>
              <strong>AlphtechWebDAW</strong> • Architecture lineage from <em>AlphtechDSP 2.0</em> (C++ Win32 Desktop App)
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Student ID: 105559691</span>
            <span>Unit: SWE40006 Software Deployment and Evolution</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

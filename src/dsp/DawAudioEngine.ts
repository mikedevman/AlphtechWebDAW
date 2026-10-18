import { TubeShaper } from './TubeShaper';
import type { TubeMode } from './TubeShaper';
import { GuitarSynth } from './GuitarSynth';

export type InputSourceType = 'audio-input' | 'audio-file';

export interface TrackAmpSettings {
  enabled: boolean;
  mode: TubeMode;
  drive: number;
  trimDb: number;
  bassDb: number;
  midDb: number;
  trebleDb: number;
  masterDb: number;
}

export interface TrackData {
  id: string;
  number: number;
  name: string;
  inputSource: InputSourceType;
  outputBus: string;
  isMuted: boolean;
  isSolo: boolean;
  isArmed: boolean;
  isInputEcho: boolean;
  volume: number;
  hasAmpPlugin: boolean;
  ampSettings: TrackAmpSettings;
  meterDb: number;
  audioClip?: {
    name: string;
    duration: number;
  };
}

export class DawAudioEngine {
  private static instance: DawAudioEngine | null = null;
  public ctx: AudioContext | null = null;

  // Master Nodes
  public masterGain: GainNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;

  // Track Audio Graph Nodes mapping: trackId -> Nodes
  private trackNodes: Map<
    string,
    {
      sourceNode: AudioBufferSourceNode | MediaStreamAudioSourceNode | null;
      inputTrim: GainNode;
      waveShaper: WaveShaperNode;
      bassFilter: BiquadFilterNode;
      midFilter: BiquadFilterNode;
      trebleFilter: BiquadFilterNode;
      trackGain: GainNode;
      analyser: AnalyserNode;
    }
  > = new Map();

  // Audio assets & streams
  public diBuffer: AudioBuffer | null = null;
  public userFileBuffers: Map<string, AudioBuffer> = new Map();
  private hardwareStream: MediaStream | null = null;

  public isPlaying: boolean = false;
  public isLooping: boolean = true;

  private constructor() {}

  public static getInstance(): DawAudioEngine {
    if (!DawAudioEngine.instance) {
      DawAudioEngine.instance = new DawAudioEngine();
    }
    return DawAudioEngine.instance;
  }

  public async initAudio(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive', sampleRate: 48000 });

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;

    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // Pre-generate clean guitar stem
    this.diBuffer = GuitarSynth.generateGuitarLoop(this.ctx);
  }

  public registerTrack(track: TrackData): void {
    if (!this.ctx) return;
    if (this.trackNodes.has(track.id)) return;

    const inputTrim = this.ctx.createGain();
    const waveShaper = this.ctx.createWaveShaper();
    waveShaper.oversample = '4x';

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 100;

    const midFilter = this.ctx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1.0;

    const trebleFilter = this.ctx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 3500;

    const trackGain = this.ctx.createGain();
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;

    // Connect Track Chain:
    // inputTrim -> waveShaper -> bass -> mid -> treble -> trackGain -> analyser -> masterGain
    inputTrim.connect(waveShaper);
    waveShaper.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(trackGain);
    trackGain.connect(analyser);
    if (this.masterGain) {
      analyser.connect(this.masterGain);
    }

    this.trackNodes.set(track.id, {
      sourceNode: null,
      inputTrim,
      waveShaper,
      bassFilter,
      midFilter,
      trebleFilter,
      trackGain,
      analyser,
    });

    this.updateTrackDsp(track);
  }

  public unregisterTrack(trackId: string): void {
    const nodes = this.trackNodes.get(trackId);
    if (nodes) {
      if (nodes.sourceNode && nodes.sourceNode instanceof AudioBufferSourceNode) {
        try {
          nodes.sourceNode.stop();
          nodes.sourceNode.disconnect();
        } catch {}
      }
      nodes.trackGain.disconnect();
      nodes.analyser.disconnect();
      this.trackNodes.delete(trackId);
    }
  }

  public updateTrackDsp(track: TrackData): void {
    const nodes = this.trackNodes.get(track.id);
    if (!nodes || !this.ctx) return;

    // Volume & Mute
    const vol = track.isMuted ? 0 : track.volume;
    nodes.trackGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.01);

    if (track.hasAmpPlugin && track.ampSettings.enabled) {
      const amp = track.ampSettings;
      // Trim
      const trimGain = Math.pow(10, amp.trimDb / 20);
      nodes.inputTrim.gain.setTargetAtTime(trimGain, this.ctx.currentTime, 0.01);

      // Waveshaper curve
      nodes.waveShaper.curve = TubeShaper.generateCurve(amp.drive, amp.mode);

      // EQ
      nodes.bassFilter.gain.setTargetAtTime(amp.bassDb, this.ctx.currentTime, 0.01);
      nodes.midFilter.gain.setTargetAtTime(amp.midDb, this.ctx.currentTime, 0.01);
      nodes.trebleFilter.gain.setTargetAtTime(amp.trebleDb, this.ctx.currentTime, 0.01);
    } else {
      // Bypass amp
      nodes.inputTrim.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.01);
      nodes.waveShaper.curve = TubeShaper.generateCurve(1.0, 'bypass');
      nodes.bassFilter.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
      nodes.midFilter.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
      nodes.trebleFilter.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
    }
  }

  public async setTrackHardwareInput(track: TrackData): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;
    const nodes = this.trackNodes.get(track.id);
    if (!nodes) return;

    if (!this.hardwareStream) {
      this.hardwareStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0,
        },
      });
    }

    const micSource = this.ctx.createMediaStreamSource(this.hardwareStream);
    micSource.connect(nodes.inputTrim);
    nodes.sourceNode = micSource;
  }

  public async play(tracks: TrackData[]): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;

    this.stopPlayback();

    const hasSolo = tracks.some((t) => t.isSolo);

    for (const track of tracks) {
      this.registerTrack(track);
      const nodes = this.trackNodes.get(track.id);
      if (!nodes) continue;

      // Check solo/mute eligibility
      if (track.isMuted || (hasSolo && !track.isSolo)) {
        nodes.trackGain.gain.value = 0;
      } else {
        nodes.trackGain.gain.value = track.volume;
      }

      if (track.inputSource === 'audio-input') {
        if (!nodes.sourceNode && track.isInputEcho) {
          try {
            await this.setTrackHardwareInput(track);
          } catch {
            // Fallback to guitar loop if microphone not granted
            if (this.diBuffer) {
              const source = this.ctx.createBufferSource();
              source.buffer = this.diBuffer;
              source.loop = this.isLooping;
              source.connect(nodes.inputTrim);
              source.start(0);
              nodes.sourceNode = source;
            }
          }
        } else if (!nodes.sourceNode && this.diBuffer) {
          const source = this.ctx.createBufferSource();
          source.buffer = this.diBuffer;
          source.loop = this.isLooping;
          source.connect(nodes.inputTrim);
          source.start(0);
          nodes.sourceNode = source;
        }
      } else if (track.inputSource === 'audio-file') {
        const buffer = this.userFileBuffers.get(track.id) || this.diBuffer;
        if (buffer) {
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.loop = this.isLooping;
          source.connect(nodes.inputTrim);
          source.start(0);
          nodes.sourceNode = source;
        }
      }
    }

    this.isPlaying = true;
  }

  public stopPlayback(): void {
    this.trackNodes.forEach((nodes) => {
      if (nodes.sourceNode && nodes.sourceNode instanceof AudioBufferSourceNode) {
        try {
          nodes.sourceNode.stop();
          nodes.sourceNode.disconnect();
        } catch {}
        nodes.sourceNode = null;
      }
    });
    this.isPlaying = false;
  }

  public getTrackMeterDb(trackId: string): number {
    const nodes = this.trackNodes.get(trackId);
    if (!nodes || !this.isPlaying) return -60;

    const data = new Float32Array(nodes.analyser.fftSize);
    nodes.analyser.getFloatTimeDomainData(data);

    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const val = Math.abs(data[i]);
      if (val > peak) peak = val;
    }

    return peak > 0.001 ? Math.max(-60, Math.min(6, 20 * Math.log10(peak))) : -60;
  }
}

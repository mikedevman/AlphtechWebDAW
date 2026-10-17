import { TubeShaper } from './TubeShaper';
import type { TubeMode } from './TubeShaper';
import { GuitarSynth } from './GuitarSynth';

export type InputSourceType = 'di-stem' | 'hardware-interface' | 'audio-file';

export interface MeterLevels {
  peakDb: number;
  rmsDb: number;
  isClipping: boolean;
}

export class DawAudioEngine {
  private static instance: DawAudioEngine | null = null;

  public ctx: AudioContext | null = null;

  // Nodes
  private inputTrimGain: GainNode | null = null;
  private waveShaper: WaveShaperNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private channelGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  // Audio Sources
  private currentSourceNode: AudioBufferSourceNode | MediaStreamAudioSourceNode | null = null;
  private hardwareStream: MediaStream | null = null;
  private diBuffer: AudioBuffer | null = null;
  private userFileBuffer: AudioBuffer | null = null;

  // Transport & State
  public inputSource: InputSourceType = 'di-stem';
  public isPlaying: boolean = false;
  public isRecording: boolean = false;
  public isLooping: boolean = true;
  public isMuted: boolean = false;
  public isSolo: boolean = false;
  public isArmed: boolean = true;

  // DSP Params
  private driveValue: number = 7.5;
  private currentMode: TubeMode = 'crunch';

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

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive', sampleRate: 48000 });

    // Initialize Nodes
    this.inputTrimGain = this.ctx.createGain();
    this.waveShaper = this.ctx.createWaveShaper();
    this.waveShaper.oversample = '4x';

    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 100;

    this.midFilter = this.ctx.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1.0;

    this.trebleFilter = this.ctx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3500;

    this.channelGain = this.ctx.createGain();
    this.masterGain = this.ctx.createGain();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect DSP Chain
    this.inputTrimGain.connect(this.waveShaper);
    this.waveShaper.connect(this.bassFilter);
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.channelGain);
    this.channelGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Initial DSP curve
    this.setDrive(this.driveValue, this.currentMode);

    // Pre-generate Guitar DI Stem
    this.diBuffer = GuitarSynth.generateGuitarLoop(this.ctx);
  }

  public async setInputSource(source: InputSourceType): Promise<void> {
    this.stopPlayback();
    this.inputSource = source;

    if (source === 'hardware-interface') {
      await this.initAudio();
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported in this browser');
        }
        this.hardwareStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            latency: 0,
            channelCount: 1
          }
        });

        if (this.ctx && this.inputTrimGain) {
          const micSource = this.ctx.createMediaStreamSource(this.hardwareStream);
          micSource.connect(this.inputTrimGain);
          this.currentSourceNode = micSource;
          this.isPlaying = true;
        }
      } catch (err) {
        console.error('Failed to open audio interface input:', err);
        this.inputSource = 'di-stem';
        throw err;
      }
    } else {
      // Disconnect hardware stream if active
      if (this.hardwareStream) {
        this.hardwareStream.getTracks().forEach(track => track.stop());
        this.hardwareStream = null;
      }
    }
  }

  public async loadUserAudioFile(file: File): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;
    const arrayBuffer = await file.arrayBuffer();
    this.userFileBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.inputSource = 'audio-file';
    this.stopPlayback();
  }

  public async play(): Promise<void> {
    await this.initAudio();
    if (!this.ctx || !this.inputTrimGain) return;

    if (this.inputSource === 'hardware-interface') {
      this.isPlaying = true;
      return;
    }

    this.stopPlayback();

    const targetBuffer = this.inputSource === 'audio-file' ? this.userFileBuffer : this.diBuffer;
    if (!targetBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = targetBuffer;
    source.loop = this.isLooping;
    source.connect(this.inputTrimGain);
    source.start(0);

    source.onended = () => {
      if (!source.loop) {
        this.isPlaying = false;
      }
    };

    this.currentSourceNode = source;
    this.isPlaying = true;
  }

  public stopPlayback(): void {
    if (this.currentSourceNode && this.currentSourceNode instanceof AudioBufferSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // Ignored if already stopped
      }
      this.currentSourceNode = null;
    }
    this.isPlaying = false;
  }

  // DSP Parameter controls
  public setTrimDb(db: number): void {
    if (!this.ctx || !this.inputTrimGain) return;
    const gain = Math.pow(10, db / 20);
    this.inputTrimGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.01);
  }

  public setDrive(drive: number, mode: TubeMode = this.currentMode): void {
    this.driveValue = drive;
    this.currentMode = mode;
    if (!this.waveShaper) return;
    this.waveShaper.curve = TubeShaper.generateCurve(drive, mode);
  }

  public setBassDb(db: number): void {
    if (!this.ctx || !this.bassFilter) return;
    this.bassFilter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.01);
  }

  public setMidDb(db: number): void {
    if (!this.ctx || !this.midFilter) return;
    this.midFilter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.01);
  }

  public setTrebleDb(db: number): void {
    if (!this.ctx || !this.trebleFilter) return;
    this.trebleFilter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.01);
  }

  public setChannelVolume(vol: number): void {
    if (!this.ctx || !this.channelGain) return;
    const effectiveVol = this.isMuted ? 0 : vol;
    this.channelGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.01);
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
    this.setChannelVolume(mute ? 0 : 1.0);
  }

  public setMasterDb(db: number): void {
    if (!this.ctx || !this.masterGain) return;
    const gain = db <= -40 ? 0 : Math.pow(10, db / 20);
    this.masterGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.01);
  }

  /**
   * Reads real-time peak and RMS audio levels from the AnalyserNode
   */
  public getMeterLevels(): MeterLevels {
    if (!this.analyser || !this.isPlaying) {
      return { peakDb: -60, rmsDb: -60, isClipping: false };
    }

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    let peak = 0;

    for (let i = 0; i < buffer.length; i++) {
      const val = Math.abs(buffer[i]);
      if (val > peak) peak = val;
      sumSquares += val * val;
    }

    const rms = Math.sqrt(sumSquares / buffer.length);
    const peakDb = peak > 0.0001 ? 20 * Math.log10(peak) : -60;
    const rmsDb = rms > 0.0001 ? 20 * Math.log10(rms) : -60;

    return {
      peakDb: Math.max(-60, Math.min(6, peakDb)),
      rmsDb: Math.max(-60, Math.min(6, rmsDb)),
      isClipping: peakDb >= -0.1
    };
  }
}

/**
 * AlphtechWebDAW - Clean Guitar DI Stem Generator
 * Synthesizes an authentic dry guitar DI audio buffer using Karplus-Strong string modeling.
 * Allows instant auditioning of the preamp DSP without requiring physical guitar hardware.
 */

export class GuitarSynth {
  /**
   * Generates a stereo dry guitar DI loop (approx 6 seconds, 110 BPM, arpeggiated chords)
   */
  public static generateGuitarLoop(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const duration = 6.0; // 6 seconds loop
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    // Chord progression: Em7 -> Cmaj7 -> G -> D
    // MIDI note frequencies
    const noteToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

    const chords = [
      // Em7: E2 (40), B2 (47), E3 (52), G3 (55), D4 (62)
      { time: 0.0, notes: [40, 47, 52, 55, 62] },
      // Cmaj7: C3 (48), G3 (55), C4 (60), E4 (64), B4 (71)
      { time: 1.5, notes: [48, 55, 60, 64, 71] },
      // G: G2 (43), D3 (50), G3 (55), B3 (59), D4 (62)
      { time: 3.0, notes: [43, 50, 55, 59, 62] },
      // Dadd9: D3 (50), A3 (57), D4 (62), F#4 (66), E5 (76)
      { time: 4.5, notes: [50, 57, 62, 66, 76] },
    ];

    // Render string plucks using Karplus-Strong algorithm
    for (const chord of chords) {
      chord.notes.forEach((midi, index) => {
        // Slight strum delay per string (15ms between strings)
        const strumOffset = chord.time + index * 0.035;
        const startSample = Math.floor(strumOffset * sampleRate);
        const freq = noteToFreq(midi);
        const delayLength = Math.max(2, Math.floor(sampleRate / freq));

        // Delay buffer for Karplus-Strong string filter
        const delayBuffer = new Float32Array(delayLength);

        // Noise burst excitation (pick attack)
        for (let i = 0; i < delayLength; i++) {
          delayBuffer[i] = (Math.random() * 2 - 1) * 0.75;
        }

        // Lowpass damping factor (clean electric guitar sustain)
        const damping = 0.992;
        let lastOutput = 0;
        let readIndex = 0;

        // Render string sound over 2.0 seconds
        const noteSamples = Math.min(Math.floor(2.2 * sampleRate), totalSamples - startSample);
        for (let n = 0; n < noteSamples; n++) {
          const targetIndex = startSample + n;
          if (targetIndex >= totalSamples) break;

          // Averaging lowpass filter in feedback loop
          const currentSample = delayBuffer[readIndex];
          const newSample = ((currentSample + lastOutput) * 0.5) * damping;
          lastOutput = newSample;
          delayBuffer[readIndex] = newSample;

          readIndex = (readIndex + 1) % delayLength;

          // Slight stereo spread based on string pitch
          const pan = (index / (chord.notes.length - 1) - 0.5) * 0.3; // -0.15 to +0.15
          leftChannel[targetIndex] += newSample * (0.5 - pan) * 0.45;
          rightChannel[targetIndex] += newSample * (0.5 + pan) * 0.45;
        }
      });
    }

    // Normalize audio to avoid clipping
    let maxAmp = 0;
    for (let i = 0; i < totalSamples; i++) {
      maxAmp = Math.max(maxAmp, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
    }
    if (maxAmp > 0) {
      const normFactor = 0.85 / maxAmp;
      for (let i = 0; i < totalSamples; i++) {
        leftChannel[i] *= normFactor;
        rightChannel[i] *= normFactor;
      }
    }

    return buffer;
  }
}

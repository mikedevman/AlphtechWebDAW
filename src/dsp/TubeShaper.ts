/**
 * AlphtechWebDAW - Preamp Tube Emulation Shaper
 * Implements non-linear transfer curves modeling 12AX7 vacuum tube triode stages.
 */

export type TubeMode = 'warm' | 'crunch' | 'lead' | 'bypass';

export class TubeShaper {
  /**
   * Generates a Float32Array transfer curve for a Web Audio WaveShaperNode.
   * @param drive Normalized drive amount (1.0 to 30.0)
   * @param mode Saturation profile
   */
  public static generateCurve(drive: number, mode: TubeMode = 'warm'): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);

    if (mode === 'bypass' || drive <= 1.0) {
      // Linear passthrough
      for (let i = 0; i < samples; ++i) {
        curve[i] = (i * 2) / samples - 1;
      }
      return curve;
    }

    // Normalized drive scaling
    const k = Math.max(1, drive);

    for (let i = 0; i < samples; ++i) {
      // Input x from -1.0 to +1.0
      const x = (i * 2) / samples - 1;

      switch (mode) {
        case 'warm': {
          // Asymmetric tube soft-clipping with gentle compression
          // Triode tubes clip more softly on positive peaks than negative peaks
          const bias = 0.15;
          const biasedX = x + bias;
          const sat = Math.tanh(k * 0.45 * biasedX) - Math.tanh(k * 0.45 * bias);
          curve[i] = Math.max(-1.0, Math.min(1.0, sat * 1.15));
          break;
        }

        case 'crunch': {
          // Symmetrical hyperbolic tangent saturation (edge of breakup / classic rock)
          curve[i] = Math.tanh(k * 0.7 * x);
          break;
        }

        case 'lead': {
          // Cascaded high-gain saturation (lead solo sustained clipping)
          const absX = Math.abs(x);
          const sign = Math.sign(x);
          if (absX < 0.33) {
            curve[i] = 2 * x;
          } else if (absX < 0.66) {
            curve[i] = sign * (3 - Math.pow(2 - 3 * absX, 2)) / 3;
          } else {
            curve[i] = sign;
          }
          // Mix with tanh for smooth musical response
          curve[i] = 0.5 * curve[i] + 0.5 * Math.tanh(k * x);
          break;
        }

        default:
          curve[i] = Math.tanh(k * 0.5 * x);
          break;
      }
    }

    return curve;
  }
}

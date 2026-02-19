import { countSignificantDigits, roundToSignificantDigits } from './significant-digits.js';

export interface ScaleOptions {
  preserveSignificantDigits?: boolean;
  minSignificantDigits?: number;
  maxSignificantDigits?: number;
}

export function scaleNumber(
  value: number,
  ratio: number,
  options: ScaleOptions = {}
): number {
  const {
    preserveSignificantDigits = true,
    minSignificantDigits = 1,
    maxSignificantDigits = 15
  } = options;
  
  const scaled = value * ratio;
  
  if (!preserveSignificantDigits) {
    return scaled;
  }
  
  const originalSigDigits = countSignificantDigits(value);
  const targetSigDigits = Math.max(
    minSignificantDigits,
    Math.min(maxSignificantDigits, originalSigDigits)
  );
  
  return roundToSignificantDigits(scaled, targetSigDigits);
}

export function scaleNumberInverse(
  value: number,
  ratio: number,
  options: ScaleOptions = {}
): number {
  return scaleNumber(value, 1 / ratio, options);
}

import { roundToSignificantDigits, roundToHalfSignificantDigits } from './significant-digits.js';

export type ScaleProgression = 'linear' | 'exponential' | 'friendly';
export type ScaleRounding = 'none' | 'significant' | 'half' | 'friendly';

export interface GenerateScaleOptions {
  progression?: ScaleProgression;
  rounding?: ScaleRounding;
  significantDigits?: number;
  steps?: number;
  includeStart?: boolean;
  includeEnd?: boolean;
}

function roundToFriendlyNumber(value: number): number {
  if (value === 0) return 0;
  
  const absValue = Math.abs(value);
  const magnitude = Math.floor(Math.log10(absValue));
  const normalized = absValue / Math.pow(10, magnitude);
  
  let friendly: number;
  if (normalized <= 1) friendly = 1;
  else if (normalized <= 2) friendly = 2;
  else if (normalized <= 2.5) friendly = 2.5;
  else if (normalized <= 5) friendly = 5;
  else friendly = 10;
  
  const result = friendly * Math.pow(10, magnitude);
  return value < 0 ? -result : result;
}

function applyRounding(
  value: number,
  rounding: ScaleRounding,
  significantDigits: number
): number {
  switch (rounding) {
    case 'none':
      return value;
    case 'significant':
      return roundToSignificantDigits(value, significantDigits);
    case 'half':
      return roundToHalfSignificantDigits(value, significantDigits);
    case 'friendly':
      return roundToFriendlyNumber(value);
    default:
      return value;
  }
}

export function generateScale(
  start: number,
  end: number,
  options: GenerateScaleOptions = {}
): number[] {
  const {
    progression = 'friendly',
    rounding = 'friendly',
    significantDigits = 2,
    steps = 10,
    includeStart = true,
    includeEnd = true
  } = options;
  
  if (start >= end) {
    throw new Error('Start must be less than end');
  }
  
  const scale: number[] = [];
  
  if (progression === 'linear') {
    const step = (end - start) / (steps + 1);
    
    if (includeStart) {
      scale.push(applyRounding(start, rounding, significantDigits));
    }
    
    for (let i = 1; i <= steps; i++) {
      const value = start + step * i;
      scale.push(applyRounding(value, rounding, significantDigits));
    }
    
    if (includeEnd) {
      scale.push(applyRounding(end, rounding, significantDigits));
    }
  } else if (progression === 'exponential') {
    const logStart = Math.log10(start);
    const logEnd = Math.log10(end);
    const logStep = (logEnd - logStart) / (steps + 1);
    
    if (includeStart) {
      scale.push(applyRounding(start, rounding, significantDigits));
    }
    
    for (let i = 1; i <= steps; i++) {
      const value = Math.pow(10, logStart + logStep * i);
      scale.push(applyRounding(value, rounding, significantDigits));
    }
    
    if (includeEnd) {
      scale.push(applyRounding(end, rounding, significantDigits));
    }
  } else {
    const logStart = Math.log10(start);
    const logEnd = Math.log10(end);
    const range = logEnd - logStart;
    
    if (includeStart) {
      scale.push(roundToFriendlyNumber(start));
    }
    
    let current = start;
    const friendlyMultipliers = [2, 2.5, 2, 2.5, 2];
    let multiplierIndex = 0;
    
    while (current < end) {
      const magnitude = Math.floor(Math.log10(current));
      const normalized = current / Math.pow(10, magnitude);
      
      let nextMultiplier: number;
      if (normalized < 1.5) {
        nextMultiplier = 2;
      } else if (normalized < 2.25) {
        nextMultiplier = 2.5;
      } else if (normalized < 4) {
        nextMultiplier = 2;
      } else if (normalized < 7.5) {
        nextMultiplier = 2;
      } else {
        nextMultiplier = 2;
      }
      
      current = roundToFriendlyNumber(current * nextMultiplier);
      
      if (current < end) {
        scale.push(current);
      } else if (includeEnd) {
        scale.push(roundToFriendlyNumber(end));
      }
    }
  }
  
  return [...new Set(scale)].sort((a, b) => a - b);
}

export function generateScaleFromBaseline(
  baseline: number,
  count: number,
  options: Omit<GenerateScaleOptions, 'steps'> = {}
): number[] {
  const {
    progression = 'friendly',
    rounding = 'friendly',
    significantDigits = 2
  } = options;
  
  const scale: number[] = [applyRounding(baseline, rounding, significantDigits)];
  
  if (progression === 'linear') {
    for (let i = 1; i < count; i++) {
      const value = baseline * (i + 1);
      scale.push(applyRounding(value, rounding, significantDigits));
    }
  } else if (progression === 'exponential') {
    for (let i = 1; i < count; i++) {
      const value = baseline * Math.pow(10, i);
      scale.push(applyRounding(value, rounding, significantDigits));
    }
  } else {
    let current = baseline;
    const multipliers = [2, 2.5, 2];
    let multiplierIndex = 0;
    
    for (let i = 1; i < count; i++) {
      current = current * multipliers[multiplierIndex % multipliers.length];
      scale.push(applyRounding(current, rounding, significantDigits));
      multiplierIndex++;
    }
  }
  
  return scale;
}

import { describe, it, expect } from 'vitest';
import {
  countSignificantDigits,
  roundToSignificantDigits,
  roundToHalfSignificantDigits,
  toSignificantDigits
} from './significant-digits';

describe('countSignificantDigits', () => {
  it('should count significant digits correctly', () => {
    expect(countSignificantDigits(1000)).toBe(1);
    expect(countSignificantDigits(1200)).toBe(2);
    expect(countSignificantDigits(1234)).toBe(4);
    expect(countSignificantDigits(0.00012)).toBe(2);
    expect(countSignificantDigits(0.001234)).toBe(4);
    expect(countSignificantDigits(123.45)).toBe(5);
  });

  it('should handle edge cases', () => {
    expect(countSignificantDigits(0)).toBe(0);
    expect(countSignificantDigits(-1234)).toBe(4);
    expect(countSignificantDigits(Infinity)).toBe(0);
    expect(countSignificantDigits(-Infinity)).toBe(0);
  });
});

describe('roundToSignificantDigits', () => {
  it('should round to specified significant digits', () => {
    expect(roundToSignificantDigits(1234, 2)).toBe(1200);
    expect(roundToSignificantDigits(1234, 1)).toBe(1000);
    expect(roundToSignificantDigits(1234, 3)).toBe(1230);
    expect(roundToSignificantDigits(0.001234, 2)).toBe(0.0012);
  });

  it('should handle edge cases', () => {
    expect(roundToSignificantDigits(0, 2)).toBe(0);
    expect(roundToSignificantDigits(1234, 0)).toBe(1234);
    expect(roundToSignificantDigits(-1234, 2)).toBe(-1200);
  });
});

describe('roundToHalfSignificantDigits', () => {
  it('should round to half significant digits (0 or 5)', () => {
    expect(roundToHalfSignificantDigits(1321, 1)).toBe(1500);
    expect(roundToHalfSignificantDigits(1234, 2)).toBe(1250);
    expect(roundToHalfSignificantDigits(1750, 2)).toBe(1750);
  });
});

describe('toSignificantDigits', () => {
  it('should use full mode by default', () => {
    expect(toSignificantDigits(1234, 2)).toBe(1200);
  });

  it('should support half mode', () => {
    expect(toSignificantDigits(1321, 1, { mode: 'half' })).toBe(1500);
  });
});

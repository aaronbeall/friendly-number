import { describe, it, expect } from 'vitest';
import { generateScale, generateScaleFromBaseline } from './scales';

describe('generateScale', () => {
  it('should generate friendly scale', () => {
    const scale = generateScale(100, 1_000_000);
    expect(scale[0]).toBe(100);
    expect(scale[scale.length - 1]).toBe(1_000_000);
    expect(scale.length).toBeGreaterThan(5);
    expect(scale).toContain(1000);
  });

  it('should generate linear scale', () => {
    const scale = generateScale(0, 100, { progression: 'linear', steps: 10, rounding: 'none' });
    expect(scale.length).toBe(12);
    expect(scale[0]).toBe(0);
    expect(scale[scale.length - 1]).toBe(100);
    // Should have evenly spaced values
    expect(scale[1]).toBeCloseTo(9.09, 1);
    expect(scale[5]).toBeCloseTo(45.45, 1);
  });

  it('should generate exponential scale', () => {
    const scale = generateScale(1, 1000, { progression: 'exponential', steps: 2 });
    expect(scale[0]).toBe(1);
    expect(scale[scale.length - 1]).toBe(1000);
  });

  it('should respect includeStart and includeEnd options', () => {
    const scale = generateScale(100, 1000, {
      includeStart: false,
      includeEnd: false,
      steps: 3
    });
    expect(scale[0]).not.toBe(100);
    expect(scale[scale.length - 1]).not.toBe(1000);
  });

  it('should apply different rounding modes', () => {
    // With 2 steps between 100 and 1000: [100, 400, 700, 1000]
    // With significantDigits: 1, middle values should round: [100, 400, 700, 1000] -> [100, 400, 700, 1000]
    // Actually they're the same because 400 and 700 already have 1 sig digit in their magnitude
    // Let's use a range where rounding makes a difference
    const scaleNone2 = generateScale(123, 987, { rounding: 'none', progression: 'linear', steps: 2 });
    const scaleSig2 = generateScale(123, 987, { rounding: 'significant', significantDigits: 1, progression: 'linear', steps: 2 });
    expect(scaleNone2).not.toEqual(scaleSig2);
  });

  it('should throw error if start >= end', () => {
    expect(() => generateScale(100, 100)).toThrow();
    expect(() => generateScale(100, 50)).toThrow();
  });
});

describe('generateScaleFromBaseline', () => {
  it('should generate scale from baseline with friendly progression', () => {
    const scale = generateScaleFromBaseline(100, 5);
    expect(scale[0]).toBe(100);
    expect(scale.length).toBe(5);
  });

  it('should generate linear scale from baseline', () => {
    const scale = generateScaleFromBaseline(10, 5, { progression: 'linear', rounding: 'none' });
    expect(scale).toEqual([10, 20, 30, 40, 50]);
  });

  it('should generate exponential scale from baseline', () => {
    const scale = generateScaleFromBaseline(1, 4, { progression: 'exponential' });
    expect(scale[0]).toBe(1);
    expect(scale[1]).toBe(10);
    expect(scale[2]).toBe(100);
    expect(scale[3]).toBe(1000);
  });
});

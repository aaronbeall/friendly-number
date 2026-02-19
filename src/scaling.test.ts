import { describe, it, expect } from 'vitest';
import { scaleNumber, scaleNumberInverse } from './scaling';

describe('scaleNumber', () => {
  it('should scale numbers with preserved significant digits', () => {
    const result = scaleNumber(7, 365.25);
    expect(result).toBeCloseTo(2600, -2);
  });

  it('should handle pounds to ounces conversion', () => {
    const result = scaleNumber(2.5, 16);
    expect(result).toBe(40);
  });

  it('should preserve significant digits intelligently', () => {
    const result = scaleNumber(100, 1.5, { preserveSignificantDigits: true });
    expect(result).toBe(150);
  });

  it('should respect min/max significant digits', () => {
    const result = scaleNumber(123.456, 2, {
      preserveSignificantDigits: true,
      minSignificantDigits: 2,
      maxSignificantDigits: 3
    });
    expect(result).toBeCloseTo(247, -1);
  });

  it('should work without preservation', () => {
    const result = scaleNumber(7, 365.25, { preserveSignificantDigits: false });
    expect(result).toBe(7 * 365.25);
  });
});

describe('scaleNumberInverse', () => {
  it('should scale inversely', () => {
    const result = scaleNumberInverse(40, 16);
    expect(result).toBe(2.5);
  });
});

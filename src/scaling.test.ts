import { describe, it, expect } from 'vitest';
import { scaleNumber, scaleNumberInverse } from './scaling';

describe('scaleNumber', () => {
  it('should scale numbers with preserved significant digits', () => {
    const result = scaleNumber(7, 365.25);
    // 7 has 1 sig digit, so 2556.75 rounds to 1 sig digit → 3000
    expect(result).toBe(3000);
  });

  it('should handle pounds to ounces conversion', () => {
    const result = scaleNumber(2.5, 16);
    expect(result).toBe(40);
  });

  it('should preserve significant digits intelligently', () => {
    const result = scaleNumber(100, 1.5, { preserveSignificantDigits: true });
    // 100 has 1 sig digit (1e+2), so 150 rounds to 1 sig digit → 200
    expect(result).toBe(200);
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
    // 40 has 1 sig digit (4e+1), so 2.5 rounds to 1 sig digit → 3
    expect(result).toBe(3);
  });
});

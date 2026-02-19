import { describe, it, expect } from 'vitest';
import { formatFriendlyNumber } from './formatting';

describe('formatFriendlyNumber', () => {
  describe('basic formatting', () => {
    it('should format numbers with default options (auto decimals)', () => {
      expect(formatFriendlyNumber(1234.56)).toBe('1,235');
      expect(formatFriendlyNumber(12.34)).toBe('12.3');
    });

    it('should format with significant digits', () => {
      const result = formatFriendlyNumber(1234.56, { significantDigits: 2 });
      expect(result).toBe('1,200');
    });

    it('should use auto decimals by default', () => {
      expect(formatFriendlyNumber(1234)).toBe('1,234');
      expect(formatFriendlyNumber(12.34)).toBe('12.3');
      expect(formatFriendlyNumber(1.234)).toBe('1.23');
    });

    it('should support fixed decimals', () => {
      expect(formatFriendlyNumber(1234.5678, { decimals: 2 })).toBe('1,234.57');
      expect(formatFriendlyNumber(1234, { decimals: 2 })).toBe('1,234.00');
    });

    it('should support min/max decimals', () => {
      expect(formatFriendlyNumber(1234.5, { decimals: { min: 0, max: 2 } })).toBe('1,234.5');
      expect(formatFriendlyNumber(1234.567, { decimals: { min: 0, max: 2 } })).toBe('1,234.57');
    });
  });

  describe('compact notation', () => {
    it('should format with compact notation (short)', () => {
      const result = formatFriendlyNumber(1234567, { display: 'short' });
      expect(result).toMatch(/1(\.\d)?M/);
    });

    it('should support long compact display', () => {
      const result = formatFriendlyNumber(1234567, { display: 'long' });
      expect(result).toContain('million');
    });
  });

  describe('sign display', () => {
    it('should not show sign by default', () => {
      expect(formatFriendlyNumber(42)).toBe('42');
    });

    it('should show sign when enabled', () => {
      expect(formatFriendlyNumber(42, { sign: true })).toMatch(/\+42/);
      expect(formatFriendlyNumber(-42, { sign: true })).toMatch(/-42/);
      expect(formatFriendlyNumber(0, { sign: true })).toBe('0');
    });
  });

  describe('currency', () => {
    it('should format currency with default display (symbol)', () => {
      const result = formatFriendlyNumber(1234.56, { currency: 'USD' });
      expect(result).toMatch(/\$1,234\.56/);
    });

    it('should format currency with auto decimals', () => {
      const result = formatFriendlyNumber(1234, { currency: 'USD' });
      expect(result).toMatch(/\$1,234/);
    });

    it('should format compact currency', () => {
      const result = formatFriendlyNumber(1234567, { currency: 'USD', display: 'short' });
      expect(result).toMatch(/\$1(\.\d)?M/);
    });

    it('should support different currency displays', () => {
      expect(formatFriendlyNumber(1234, { currency: 'USD', code: true })).toContain('USD');
      expect(formatFriendlyNumber(1234567, { currency: 'USD', display: 'long' })).toContain('dollar');
    });

    it('should support accounting format', () => {
      const result = formatFriendlyNumber(-1234, { currency: 'USD', accounting: true });
      expect(result).toMatch(/\(.*1,234.*\)/);
    });
  });

  describe('units', () => {
    it('should format with units', () => {
      const result = formatFriendlyNumber(50, { unit: 'kilometer-per-hour' });
      expect(result).toContain('50');
      expect(result).toMatch(/km\/h|kph/i);
    });

    it('should support different unit displays', () => {
      const result = formatFriendlyNumber(50, { unit: 'kilometer-per-hour', display: 'long' });
      expect(result).toContain('50');
    });
  });

  describe('percent', () => {
    it('should format as percent', () => {
      const result = formatFriendlyNumber(0.1234, { percent: true });
      expect(result).toContain('12');
      expect(result).toContain('%');
    });

    it('should format percent with fixed decimals', () => {
      const result = formatFriendlyNumber(0.1234, { percent: true, decimals: 1 });
      expect(result).toMatch(/12\.3\s*%/);
    });
  });

  describe('ranges', () => {
    it('should format number ranges', () => {
      const result = formatFriendlyNumber([100, 200]);
      expect(result).toContain('100');
      expect(result).toContain('200');
    });

    it('should format ranges with significant digits', () => {
      const result = formatFriendlyNumber([1234, 5678], { significantDigits: 2 });
      expect(result).toContain('1,200');
      expect(result).toContain('5,700');
    });

    it('should format ranges with compact notation', () => {
      const result = formatFriendlyNumber([1000000, 5000000], { display: 'short' });
      expect(result).toMatch(/1M/);
      expect(result).toMatch(/5M/);
    });

    it('should format currency ranges', () => {
      const result = formatFriendlyNumber([100, 200], { currency: 'USD' });
      expect(result).toMatch(/\$100/);
      expect(result).toMatch(/\$200/);
    });

    it('should format ranges with auto decimals', () => {
      const result = formatFriendlyNumber([1234, 5678]);
      expect(result).toContain('1,234');
      expect(result).toContain('5,678');
    });
  });

  describe('custom format', () => {
    it('should allow passing custom Intl.NumberFormatOptions', () => {
      const result = formatFriendlyNumber(1234.5678, {
        format: {
          style: 'decimal',
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        }
      });
      expect(result).toBe('1,234.568');
    });

    it('should merge custom format with other options', () => {
      const result = formatFriendlyNumber(1234567, {
        display: 'short',
        format: {
          notation: 'scientific'
        }
      });
      expect(result).toContain('E');
    });
  });
});

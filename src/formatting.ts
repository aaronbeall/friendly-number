import { roundToSignificantDigits } from './significant-digits.js';

/**
 * Display style for formatting numbers.
 *
 * For plain numbers (no currency/unit/percent), 'short' and 'long' enable compact notation.
 * For very small numbers (0 < |n| < 1), 'short' uses scientific notation.
 * For currency/unit, they also enable compact notation with appropriate display styles.
 *
 * @example
 * // Plain numbers (no currency/unit/percent)
 * display: 'standard' → "1,234"
 * display: 'short'    → "1.2K" (compact notation, short display)
 * display: 'long'     → "1.2 thousand" (compact notation, long display)
 *
 * // Small numbers (0 < |n| < 1)
 * display: 'standard' → "0.00012"
 * display: 'short'    → "1.2E-4" (scientific notation)
 *
 * // With currency
 * currency: 'USD', display: 'standard' → "$1,234.00" (symbol)
 * currency: 'USD', display: 'short'    → "$1.2K" (compact, narrow symbol)
 * currency: 'USD', display: 'long'     → "1.2 million US dollars" (compact, name)
 * currency: 'USD', code: true          → "1,234.00 USD" (currency code)
 *
 * // With currency + accounting
 * currency: 'USD', accounting: true, display: 'standard' → "($1,234.00)" (for negative)
 * currency: 'USD', accounting: true, display: 'short'    → "($1.2K)" (for negative, compact)
 *
 * // With unit
 * unit: 'kilometer-per-hour', display: 'standard' → "50 km/h"
 * unit: 'kilometer-per-hour', display: 'short'    → "50K km/h" (compact notation)
 * unit: 'kilometer-per-hour', display: 'long'     → "50 thousand kilometers per hour" (compact notation)
 *
 * // With percent
 * percent: true, display: 'standard' → "12%"
 * percent: true, display: 'short'    → "12%" (compact notation if large enough)
 * percent: true, display: 'long'     → "12%" (compact notation if large enough)
 */
export type DisplayStyle = 'standard' | 'short' | 'long';

export interface FriendlyNumberOptions {
  /** Locale string(s) for formatting (default: 'en-US') */
  locale?: string | string[];

  /** Display style: 'standard' (1,234), 'short' (1.2K), 'long' (1.2 thousand). See `DisplayStyle` for details. */
  display?: DisplayStyle;

  /** Show sign for positive/negative numbers (true = exceptZero, false = auto) */
  sign?: boolean;

  /** Currency code (e.g., 'USD', 'EUR') */
  currency?: string;

  /** Show currency code instead of symbol (e.g., "USD" instead of "$") - only applies to currency */
  code?: boolean;

  /** Use accounting format for negative currency (e.g., "($1,234)" instead of "-$1,234") */
  accounting?: boolean;

  /** Unit identifier (e.g., 'kilometer-per-hour', 'celsius') */
  unit?: string;

  /** Format as percentage (multiplies by 100 and adds %) */
  percent?: boolean;

  /** Round to specified number of significant digits before formatting (e.g `1234.5678` with `significantDigits: 2` → `1,200` */
  significantDigits?: number;

  /** Decimal control: 'auto' (intelligent based on magnitude), number (fixed), or { min, max } */
  decimals?: 'auto' | number | { min?: number; max?: number };

  /** Custom Intl.NumberFormatOptions for full control - overrides other options */
  format?: Intl.NumberFormatOptions;
}

function getIntelligentMaxDecimals(value: number, compact: boolean): number {
  const absValue = Math.abs(value);

  if (compact) {
    if (absValue >= 1000) return 2;
    if (absValue >= 100) return 1;
    if (absValue >= 10) return 1;
    return 2;
  }

  if (absValue >= 1000) return 0;
  if (absValue >= 100) return 0;
  if (absValue >= 10) return 1;
  if (absValue >= 1) return 2;
  if (absValue >= 0.01) return 3;
  return 4;
}

function resolveDisplayOptions(
  display: DisplayStyle | undefined,
  currency: string | undefined,
  unit: string | undefined,
  code: boolean,
  accounting: boolean,
  value?: number
): {
  notation: 'standard' | 'compact' | 'scientific';
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  unitDisplay?: 'short' | 'long' | 'narrow';
  compactDisplay?: 'short' | 'long';
  currencySign?: 'standard' | 'accounting';
} {
  const result: ReturnType<typeof resolveDisplayOptions> = {
    notation: 'standard'
  };

  // For plain numbers (no currency/unit), 'short' and 'long' enable compact notation
  // For currency/unit, 'short' and 'long' also enable compact notation
  const isCompact = display === 'short' || display === 'long';
  if (isCompact) {
    // Use scientific notation for very small numbers with 'short' display
    if (display === 'short' && value !== undefined && !currency && !unit) {
      const absValue = Math.abs(value);
      if (absValue > 0 && absValue < 1) {
        result.notation = 'scientific';
      } else {
        result.notation = 'compact';
        result.compactDisplay = 'short';
      }
    } else {
      result.notation = 'compact';
      result.compactDisplay = display === 'long' ? 'long' : 'short';
    }
  }

  if (currency) {
    if (accounting) {
      result.currencySign = 'accounting';
    }

    // If code option is enabled, use currency code regardless of display
    if (code) {
      result.currencyDisplay = 'code';
    } else {
      switch (display) {
        case 'standard':
          result.currencyDisplay = 'symbol';
          break;
        case 'short':
          result.currencyDisplay = 'narrowSymbol';
          break;
        case 'long':
          result.currencyDisplay = 'name';
          break;
        default:
          result.currencyDisplay = 'symbol';
      }
    }
  } else if (unit) {
    switch (display) {
      case 'short':
      case 'standard':
        result.unitDisplay = 'short';
        break;
      case 'long':
        result.unitDisplay = 'long';
        break;
      default:
        result.unitDisplay = 'short';
    }
  }

  return result;
}

export function formatFriendlyNumber(
  value: number | [number, number],
  options: FriendlyNumberOptions = {}
): string {
  const {
    locale = 'en-US',
    display,
    sign = false,
    currency,
    code = false,
    accounting = false,
    unit,
    percent = false,
    significantDigits,
    decimals = 'auto',
    format,
  } = options;

  const isRange = Array.isArray(value);
  const singleValue = isRange ? value[0] : value;

  // Start with custom format if provided, otherwise build from scratch
  const formatOptions: Intl.NumberFormatOptions = format ? { ...format } : {};

  // Resolve display options (includes notation)
  const displayOptions = resolveDisplayOptions(display, currency, unit, code, accounting, singleValue);
  const isCompact = displayOptions.notation === 'compact';

  // Set notation
  if (!format?.notation) {
    formatOptions.notation = displayOptions.notation;
  }

  // Set sign display
  if (!format?.signDisplay) {
    formatOptions.signDisplay = sign ? 'exceptZero' : 'auto';
  }

  // Set style (currency, unit, percent, or decimal)
  if (!format?.style) {
    if (currency) {
      formatOptions.style = 'currency';
      formatOptions.currency = currency;
    } else if (unit) {
      formatOptions.style = 'unit';
      formatOptions.unit = unit;
    } else if (percent) {
      formatOptions.style = 'percent';
    }
  }

  // Apply display options
  if (displayOptions.currencyDisplay && !format?.currencyDisplay) {
    formatOptions.currencyDisplay = displayOptions.currencyDisplay;
  }
  if (displayOptions.currencySign && !format?.currencySign) {
    formatOptions.currencySign = displayOptions.currencySign;
  }
  if (displayOptions.unitDisplay && !format?.unitDisplay) {
    formatOptions.unitDisplay = displayOptions.unitDisplay;
  }
  if (displayOptions.compactDisplay && !format?.compactDisplay) {
    formatOptions.compactDisplay = displayOptions.compactDisplay;
  }

  // Process range
  if (isRange) {
    const [start, end] = value;
    let processedStart = start;
    let processedEnd = end;

    // Apply significant digits rounding
    if (significantDigits !== undefined && significantDigits > 0) {
      processedStart = roundToSignificantDigits(start, significantDigits);
      processedEnd = roundToSignificantDigits(end, significantDigits);
    }

    // Apply decimal options
    if (decimals === 'auto') {
      const maxDecimalsStart = getIntelligentMaxDecimals(processedStart, isCompact);
      const maxDecimalsEnd = getIntelligentMaxDecimals(processedEnd, isCompact);
      formatOptions.maximumFractionDigits = Math.max(maxDecimalsStart, maxDecimalsEnd);
      formatOptions.minimumFractionDigits = 0;
    } else if (typeof decimals === 'number') {
      formatOptions.minimumFractionDigits = decimals;
      formatOptions.maximumFractionDigits = decimals;
    } else if (typeof decimals === 'object') {
      if (decimals.min !== undefined) {
        formatOptions.minimumFractionDigits = decimals.min;
      }
      if (decimals.max !== undefined) {
        formatOptions.maximumFractionDigits = decimals.max;
      }
    }

    const formatter = new Intl.NumberFormat(locale, formatOptions);

    if ('formatRange' in formatter && typeof formatter.formatRange === 'function') {
      return formatter.formatRange(processedStart, processedEnd);
    }

    return `${formatter.format(processedStart)} – ${formatter.format(processedEnd)}`;
  } else {
    // Process single value
    let processedValue = value;

    // Apply significant digits rounding
    if (significantDigits !== undefined && significantDigits > 0) {
      processedValue = roundToSignificantDigits(value, significantDigits);
    }

    // Apply decimal options
    if (decimals === 'auto') {
      const maxDecimals = getIntelligentMaxDecimals(processedValue, isCompact);
      formatOptions.maximumFractionDigits = maxDecimals;
      formatOptions.minimumFractionDigits = 0;
    } else if (typeof decimals === 'number') {
      formatOptions.minimumFractionDigits = decimals;
      formatOptions.maximumFractionDigits = decimals;
    } else if (typeof decimals === 'object') {
      if (decimals.min !== undefined) {
        formatOptions.minimumFractionDigits = decimals.min;
      }
      if (decimals.max !== undefined) {
        formatOptions.maximumFractionDigits = decimals.max;
      }
    }

    const formatter = new Intl.NumberFormat(locale, formatOptions);
    return formatter.format(processedValue);
  }
}

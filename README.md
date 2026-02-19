# friendly-numbers

A TypeScript library that makes number formatting effortless with intelligent defaults. Built on `Intl.NumberFormat`, it provides automatic decimal handling, unified formatting options, and tools for generating human-friendly number scales—perfect for UIs, charts, and data visualization.

## What It Does

This library provides a convenience layer over `Intl.NumberFormat` with opinionated defaults for common use cases:

**Automatic decimal adjustment** based on number magnitude:
```typescript
formatFriendlyNumber(1234.56);  // "1,235" (0 decimals)
formatFriendlyNumber(12.34);    // "12.3"  (1 decimal)
formatFriendlyNumber(1.234);    // "1.23" (2 decimals)
```

**Simplified API** - single `display` option instead of multiple Intl options:
```typescript
formatFriendlyNumber(1234567, { currency: 'USD', display: 'short' }); // "$1.23M"

// Equivalent Intl.NumberFormat:
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  compactDisplay: 'short',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 2
}).format(1234567);
```

**Scientific notation** for very small numbers with compact display:
```typescript
formatFriendlyNumber(0.00012, { display: 'short' }); // "1.2E-4"
```

**Significant digit preservation** when scaling numbers:
```typescript
scaleNumber(7, 365.25);  // 3000 (preserves 1 sig digit from 7)
scaleNumber(2.5, 16);    // 40 (preserves 2 sig digits from 2.5)
```

**Human-friendly scale generation** for charts and axes:
```typescript
generateScale(100, 1_000_000);
// [100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, ...]
```

## Installation

```bash
npm install friendly-numbers
```

## Quick Start

```typescript
import {
  countSignificantDigits,
  roundToSignificantDigits,
  formatFriendlyNumber,
  scaleNumber,
  generateScale
} from 'friendly-numbers';

// Count significant digits
countSignificantDigits(1000);      // 1
countSignificantDigits(1200);      // 2
countSignificantDigits(0.00012);   // 2

// Round to significant digits
roundToSignificantDigits(1234, 2); // 1200

// Format numbers (auto decimals by default)
formatFriendlyNumber(1234.56);    // "1,235"
formatFriendlyNumber(1234567, { display: 'short' }); // "1.2M"
formatFriendlyNumber(1234.56, { currency: 'USD' }); // "$1,234.56"
formatFriendlyNumber([100, 200]); // "100–200" (range)
formatFriendlyNumber(0.1234, { percent: true }); // "12%"

// Scale with precision preservation
scaleNumber(7, 365.25); // ~2600 (days to years, preserving sig digits)

// Generate friendly scales
generateScale(100, 1_000_000);
// [100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000]
```

## API Reference

### Significant Digits

#### `countSignificantDigits(value: number): number`

Counts the number of significant digits in a number.

```typescript
countSignificantDigits(1000);    // 1
countSignificantDigits(1200);    // 2
countSignificantDigits(1234);    // 4
countSignificantDigits(0.00012); // 2
```

#### `roundToSignificantDigits(value: number, significantDigits: number): number`

Rounds a number to the specified number of significant digits.

```typescript
roundToSignificantDigits(1234, 2); // 1200
roundToSignificantDigits(1234, 1); // 1000
roundToSignificantDigits(0.001234, 2); // 0.0012
```

#### `roundToHalfSignificantDigits(value: number, significantDigits: number): number`

Rounds to significant digits with "half" rounding (rounds to 0 or 5).

```typescript
roundToHalfSignificantDigits(1321, 1); // 1500
roundToHalfSignificantDigits(1234, 2); // 1200
```

#### `toSignificantDigits(value: number, significantDigits: number, options?: SignificantDigitsOptions): number`

Flexible rounding with mode selection.

```typescript
toSignificantDigits(1234, 2);                    // 1200 (full mode)
toSignificantDigits(1321, 1, { mode: 'half' }); // 1500 (half mode)
```

### Number Scaling

#### `scaleNumber(value: number, ratio: number, options?: ScaleOptions): number`

Scales a number by a ratio while intelligently preserving significant digits.

```typescript
// Convert days to years
scaleNumber(7, 365.25); // ~2600

// Convert pounds to ounces
scaleNumber(2.5, 16); // 40

// Custom options
scaleNumber(100, 1.5, {
  preserveSignificantDigits: true,
  minSignificantDigits: 2,
  maxSignificantDigits: 4
});
```

**Options:**
- `preserveSignificantDigits` (default: `true`): Preserve significant digits during scaling
- `minSignificantDigits` (default: `1`): Minimum significant digits to preserve
- `maxSignificantDigits` (default: `15`): Maximum significant digits to preserve

#### `scaleNumberInverse(value: number, ratio: number, options?: ScaleOptions): number`

Scales a number by the inverse of a ratio.

```typescript
scaleNumberInverse(40, 16); // 2.5 (ounces to pounds)
```

### Formatting

#### `formatFriendlyNumber(value: number | [number, number], options?: FriendlyNumberOptions): string`

A single, intuitive function for formatting numbers and ranges with sensible defaults and automatic intelligent decimal handling.

```typescript
// Basic formatting (auto decimals by default)
formatFriendlyNumber(1234.56);  // "1,235"
formatFriendlyNumber(12.34);    // "12.3"
formatFriendlyNumber(1.234);    // "1.23"

// Compact notation (K, M, B, etc.)
formatFriendlyNumber(1234567, { display: 'short' });   // "1.2M"
formatFriendlyNumber(1234567, { display: 'long' }); // "1.2 million"

// Scientific notation for very small numbers (0 < |n| < 1)
formatFriendlyNumber(0.00012, { display: 'short' }); // "1.2E-4"
formatFriendlyNumber(0.00012, { display: 'standard' }); // "0.00012"

// Currency
formatFriendlyNumber(1234.56, { currency: 'USD' }); // "$1,234.56"
formatFriendlyNumber(1234567, { currency: 'USD', display: 'short' }); // "$1.2M"
formatFriendlyNumber(1234, { currency: 'USD', code: true }); // "1,234.00 USD"
formatFriendlyNumber(-1234, { currency: 'USD', accounting: true }); // "($1,234.00)"

// Sign display
formatFriendlyNumber(42, { sign: true });  // "+42"
formatFriendlyNumber(-42, { sign: true }); // "-42"
formatFriendlyNumber(0, { sign: true });   // "0"

// Units
formatFriendlyNumber(50, { unit: 'kilometer-per-hour' }); // "50 km/h"
formatFriendlyNumber(50, { unit: 'kilometer-per-hour', display: 'long' }); // "50 kilometers per hour"

// Percent
formatFriendlyNumber(0.1234, { percent: true }); // "12%"
formatFriendlyNumber(0.1234, { percent: true, decimals: 1 }); // "12.3%"

// Significant digits
formatFriendlyNumber(1234.56, { significantDigits: 2 }); // "1,200"

// Decimal control
formatFriendlyNumber(1234.5678, { decimals: 2 });  // "1,234.57" (fixed)
formatFriendlyNumber(1234.5, { decimals: { min: 0, max: 2 } }); // "1,234.5"
formatFriendlyNumber(1234, { decimals: 'auto' }); // "1,234" (intelligent, default)

// Ranges (uses Intl.NumberFormat.formatRange)
formatFriendlyNumber([100, 200]);                           // "100–200"
formatFriendlyNumber([1234, 5678], { significantDigits: 2 }); // "1,200–5,700"
formatFriendlyNumber([100, 200], { currency: 'USD' });      // "$100.00–$200.00"
formatFriendlyNumber([1000000, 5000000], { display: 'short' }); // "1M–5M"

// Custom format (full control)
formatFriendlyNumber(1234.5678, {
  format: {
    style: 'decimal',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }
}); // "1,234.568"
```

**Options:**
- `locale`: Locale string(s) for formatting (default: `'en-US'`)
- `display`: Unified display style - `'standard' | 'short' | 'long'`
  - `'standard'`: Standard notation (1,234) - for currency: symbol ($)
  - `'short'`: Compact notation with short display (1.2M), scientific notation for very small numbers (1.2E-4) - for currency: narrow symbol ($), for units: short (km/h)
  - `'long'`: Compact notation with long display (1.2 million) - for currency: full name (US dollars), for units: long (kilometers per hour)
- `sign`: Show sign for positive/negative numbers - `boolean` (default: `false`, `true` = exceptZero)
- `currency`: Currency code (e.g., `'USD'`, `'EUR'`)
- `code`: Show currency code instead of symbol - `boolean` (default: `false`, only applies to currency)
- `accounting`: Use accounting format for negative currency - `boolean` (default: `false`)
- `unit`: Unit identifier (e.g., `'kilometer-per-hour'`, `'celsius'`)
- `percent`: Format as percentage - `boolean` (default: `false`)
- `significantDigits`: Round to significant digits before formatting - `number`
- `decimals`: Decimal control - `'auto' | number | { min?: number; max?: number }` (default: `'auto'`)
  - `'auto'`: Intelligent decimals based on magnitude
  - `number`: Fixed decimal places
  - `{ min, max }`: Min/max decimal places
- `format`: Custom `Intl.NumberFormatOptions` for full control

### Scale Generation

#### `generateScale(start: number, end: number, options?: GenerateScaleOptions): number[]`

Generate a scale of numbers between start and end with various progression modes.

```typescript
// Friendly progression (default)
generateScale(100, 1_000_000);
// [100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000]

// Linear progression
generateScale(0, 100, { progression: 'linear', steps: 10 });
// [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

// Exponential progression
generateScale(1, 1000, { progression: 'exponential', steps: 3 });
// [1, 10, 100, 1000]
```

**Options:**
- `progression`: `'linear' | 'exponential' | 'friendly'` (default: `'friendly'`)
- `rounding`: `'none' | 'significant' | 'half' | 'friendly'` (default: `'friendly'`)
- `significantDigits`: Number of significant digits for rounding (default: `2`)
- `steps`: Number of intermediate steps (default: `10`)
- `includeStart`: Include start value (default: `true`)
- `includeEnd`: Include end value (default: `true`)

#### `generateScaleFromBaseline(baseline: number, count: number, options?: GenerateScaleOptions): number[]`

Generate a scale starting from a baseline value.

```typescript
// Friendly progression
generateScaleFromBaseline(100, 5);
// [100, 200, 500, 1000, 2000]

// Linear progression
generateScaleFromBaseline(10, 5, { progression: 'linear' });
// [10, 20, 30, 40, 50]

// Exponential progression
generateScaleFromBaseline(1, 4, { progression: 'exponential' });
// [1, 10, 100, 1000]
```

## Use Cases

### UI Number Display

```typescript
import { formatFriendlyNumber } from 'friendly-numbers';

// Display large numbers compactly
const followers = formatFriendlyNumber(1234567, { display: 'short' }); // "1.2M"

// Show deltas with signs
const change = formatFriendlyNumber(42.5, { sign: true }); // "+42.5"

// Currency with auto decimals
const price = formatFriendlyNumber(1299, { currency: 'USD' }); // "$1,299"

// Percentages
const conversionRate = formatFriendlyNumber(0.1234, { percent: true, decimals: 1 }); // "12.3%"
```

### Unit Conversions

```typescript
import { scaleNumber } from 'friendly-numbers';

// Days to weeks (preserving appropriate precision)
const weeks = scaleNumber(7, 1/7); // 1

// Pounds to ounces
const ounces = scaleNumber(2.5, 16); // 40

// Meters to kilometers
const km = scaleNumber(1500, 0.001); // 1.5
```

### Chart Axes & Scales

```typescript
import { generateScale, formatFriendlyNumber } from 'friendly-numbers';

// Generate friendly tick marks
const ticks = generateScale(0, 1_000_000);
// [0, 100, 200, 500, 1000, 2000, 5000, 10000, ...]

// Format for display
const labels = ticks.map(t => formatFriendlyNumber(t, { display: 'short' }));
// ["0", "100", "200", "500", "1K", "2K", "5K", "10K", ...]
```

### Data Rounding

```typescript
import { roundToSignificantDigits } from 'friendly-numbers';

// Clean up noisy data
const cleanValue = roundToSignificantDigits(1234.56789, 3); // 1230
```

## TypeScript Support

This library is written in TypeScript and includes full type definitions.

```typescript
import type {
  FriendlyNumberOptions,
  ScaleOptions,
  GenerateScaleOptions,
  SignificantDigitsOptions
} from 'friendly-numbers';
```

## Browser Support

This library uses `Intl.NumberFormat`, which is supported in all modern browsers. For older browsers, you may need a polyfill.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

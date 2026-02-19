export function countSignificantDigits(value: number): number {
  if (!isFinite(value) || value === 0) return 0;
  
  const absValue = Math.abs(value);
  const str = absValue.toExponential();
  const [mantissa] = str.split('e');
  const digits = mantissa.replace('.', '').replace('-', '');
  
  let count = 0;
  let foundNonZero = false;
  
  for (const digit of digits) {
    if (digit !== '0') {
      foundNonZero = true;
    }
    if (foundNonZero) {
      count++;
    }
  }
  
  return count;
}

export function roundToSignificantDigits(value: number, significantDigits: number): number {
  if (!isFinite(value) || value === 0 || significantDigits <= 0) return value;
  
  const absValue = Math.abs(value);
  const magnitude = Math.floor(Math.log10(absValue));
  const scale = Math.pow(10, magnitude - significantDigits + 1);
  
  return Math.round(value / scale) * scale;
}

export function roundToHalfSignificantDigits(value: number, significantDigits: number): number {
  if (!isFinite(value) || value === 0 || significantDigits <= 0) return value;
  
  const absValue = Math.abs(value);
  const magnitude = Math.floor(Math.log10(absValue));
  const scale = Math.pow(10, magnitude - significantDigits + 1);
  
  const normalized = value / scale;
  const rounded = Math.round(normalized * 2) / 2;
  
  return rounded * scale;
}

export interface SignificantDigitsOptions {
  mode?: 'full' | 'half';
}

export function toSignificantDigits(
  value: number,
  significantDigits: number,
  options: SignificantDigitsOptions = {}
): number {
  const { mode = 'full' } = options;
  
  if (mode === 'half') {
    return roundToHalfSignificantDigits(value, significantDigits);
  }
  
  return roundToSignificantDigits(value, significantDigits);
}

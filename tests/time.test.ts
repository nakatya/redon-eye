import { describe, expect, it } from 'vitest';
import { formatElapsed } from '../src/logic/time';

describe('formatElapsed', () => {
  it('formats seconds', () => {
    expect(formatElapsed(0)).toBe('0:00.0');
    expect(formatElapsed(65.45)).toBe('1:05.4');
    expect(formatElapsed(125)).toBe('2:05.0');
  });
  it('handles invalid input', () => {
    expect(formatElapsed(-3)).toBe('0:00.0');
    expect(formatElapsed(NaN)).toBe('0:00.0');
  });
});

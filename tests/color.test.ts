import { describe, expect, it } from 'vitest';
import { shade } from '../src/logic/color';

describe('shade', () => {
  it('v=0.5 は元の色のまま', () => {
    expect(shade(0x27251f, 0.5, 0.22)).toEqual([0x27, 0x25, 0x1f]);
  });
  it('v=1 で明るく v=0 で暗くなる', () => {
    expect(shade(0x27251f, 1, 0.22)[0]).toBeGreaterThan(0x27);
    expect(shade(0x27251f, 0, 0.22)[0]).toBeLessThan(0x27);
  });
  it('戻り値は整数', () => {
    expect(shade(0x27251f, 0.37, 0.22).every(Number.isInteger)).toBe(true);
  });
});

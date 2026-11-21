import { describe, expect, it } from 'vitest';
import { darknessAt } from '../src/logic/vision';

describe('darknessAt', () => {
  it('中心は見える', () => expect(darknessAt(0, 160)).toBe(0));
  it('半径以遠は真っ暗', () => {
    expect(darknessAt(160, 160)).toBe(1);
    expect(darknessAt(500, 160)).toBe(1);
  });
  it('縁は単調になだらかに暗くなる', () => {
    let prev = 0;
    for (let d = 0; d <= 160; d += 4) {
      const v = darknessAt(d, 160);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    const mid = darknessAt(110, 160);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
  it('半径が0以下なら真っ暗', () => expect(darknessAt(0, 0)).toBe(1));
});

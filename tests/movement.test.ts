import { describe, expect, it } from 'vitest';
import { DEFAULT_MOVEMENT, moveWithin, pupilOffset, stepVelocity } from '../src/logic/movement';

const zero = { x: 0, y: 0 };

describe('stepVelocity', () => {
  it('入力方向に加速する', () => {
    const v = stepVelocity(zero, { x: 1, y: 0 }, 0.1);
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBe(0);
  });

  it('入力がなければ減衰して0に近づく(急停止はしない)', () => {
    let v = { x: 200, y: 0 };
    const first = stepVelocity(v, zero, 1 / 60);
    expect(first.x).toBeGreaterThan(150);
    for (let i = 0; i < 60 * 10; i++) v = stepVelocity(v, zero, 1 / 60);
    expect(Math.abs(v.x)).toBeLessThan(0.1);
  });

  it('入力 0.5 の加速は入力 1 の半分(アナログ入力)', () => {
    const full = stepVelocity(zero, { x: 1, y: 0 }, 0.1);
    const half = stepVelocity(zero, { x: 0.5, y: 0 }, 0.1);
    expect(half.x).toBeCloseTo(full.x / 2);
  });

  it('斜め (1,1) は正規化され、軸方向 1 と同じ加速になる', () => {
    const axis = stepVelocity(zero, { x: 1, y: 0 }, 0.1);
    const diag = stepVelocity(zero, { x: 1, y: 1 }, 0.1);
    expect(Math.hypot(diag.x, diag.y)).toBeCloseTo(axis.x);
    expect(diag.x).toBeCloseTo(diag.y);
  });

  it('入力 0 では加速しない', () => {
    expect(stepVelocity(zero, zero, 0.1)).toEqual(zero);
  });

  it('最大速度を超えない(斜めでも)', () => {
    let v = zero;
    for (let i = 0; i < 600; i++) v = stepVelocity(v, { x: 1, y: 1 }, 1 / 60);
    expect(Math.hypot(v.x, v.y)).toBeLessThanOrEqual(DEFAULT_MOVEMENT.maxSpeed + 1e-9);
  });
});

describe('moveWithin', () => {
  it('ステージ外に出ず、壁方向の速度が0になる', () => {
    const r = moveWithin({ x: 99, y: 50 }, { x: 100, y: 0 }, 1, { width: 100, height: 100 });
    expect(r.pos.x).toBe(100);
    expect(r.vel.x).toBe(0);
  });
});

describe('pupilOffset', () => {
  it('進行方向を向く', () => {
    const o = pupilOffset({ x: 0, y: -100 }, 200);
    expect(o.y).toBeLessThan(0);
    expect(o.x).toBeCloseTo(0);
  });
  it('停止中は中央', () => {
    expect(pupilOffset(zero, 200)).toEqual(zero);
  });
});

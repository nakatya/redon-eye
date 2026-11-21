import { describe, expect, it } from 'vitest';
import { DEFAULT_MOVEMENT, moveWithin, stepVelocity } from '../src/logic/movement';
import { DEFAULT_POINTER, pointerInput } from '../src/logic/pointer';

const o = { x: 0, y: 0 };

describe('pointerInput', () => {
  it('ポインタの方向を向く', () => {
    const v = pointerInput(o, { x: 0, y: 300 });
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
  });
  it('遠いと最大(長さ1)', () => {
    const v = pointerInput(o, { x: 1000, y: 0 });
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1);
  });
  it('近づくほど弱くなる', () => {
    const far = pointerInput(o, { x: 100, y: 0 }).x;
    const near = pointerInput(o, { x: 30, y: 0 }).x;
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(far);
  });
  it('デッドゾーン内は0', () => {
    expect(pointerInput(o, { x: DEFAULT_POINTER.deadZone, y: 0 })).toEqual(o);
  });
  it('長さは常に1以下', () => {
    const v = pointerInput(o, { x: 50, y: 0 }, { x: -220, y: 0 });
    expect(Math.hypot(v.x, v.y)).toBeLessThanOrEqual(1 + 1e-9);
  });
  it('ポインタ位置に着いて静かに止まる(振動しない)', () => {
    let pos = { x: 0, y: 0 };
    let vel = { x: 0, y: 0 };
    const target = { x: 400, y: 0 };
    const dt = 1 / 60;
    let signChanges = 0;
    let prevSign = 1;
    for (let i = 0; i < 60 * 15; i++) {
      vel = stepVelocity(vel, pointerInput(pos, target, vel), dt, DEFAULT_MOVEMENT);
      pos = moveWithin(pos, vel, dt, { width: 5000, height: 5000 }).pos;
      const s = Math.sign(target.x - pos.x) || prevSign;
      if (s !== prevSign) signChanges++;
      prevSign = s;
    }
    expect(Math.abs(pos.x - target.x)).toBeLessThan(DEFAULT_POINTER.deadZone * 3);
    expect(Math.abs(vel.x)).toBeLessThan(5);
    expect(signChanges).toBeLessThanOrEqual(1);
  });
});

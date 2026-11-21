import { describe, expect, it } from 'vitest';
import { DEFAULT_MOVEMENT } from '../src/logic/movement';
import { SHADE_CHASE_SPEED, SHADE_WANDER_SPEED, clampToStage, isInVision, placeShades, shadeVelocity } from '../src/logic/shade';

const eye = { x: 0, y: 0 };
describe('shade', () => {
  it('視界の内外を判定する', () => {
    expect(isInVision(eye, { x: 100, y: 0 }, 160)).toBe(true);
    expect(isInVision(eye, { x: 200, y: 0 }, 160)).toBe(false);
  });
  it('視界内では目に近寄り、目より遅い', () => {
    const v = shadeVelocity({ x: 100, y: 0 }, eye, 160, 0);
    expect(v.x).toBeLessThan(0);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(SHADE_CHASE_SPEED);
    expect(SHADE_CHASE_SPEED).toBeLessThan(DEFAULT_MOVEMENT.maxSpeed);
  });
  it('視界外では徘徊する', () => {
    const v = shadeVelocity({ x: 500, y: 0 }, eye, 160, Math.PI / 2);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(SHADE_WANDER_SPEED);
  });
  it('ステージ内に収める', () => {
    expect(clampToStage({ x: -5, y: 9999 }, { width: 100, height: 100 }, 10)).toEqual({ x: 10, y: 90 });
  });
  it('開始地点から離して配置する', () => {
    let s = 1;
    const rng = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const ps = placeShades(4, { width: 2880, height: 1620 }, { x: 1440, y: 810 }, rng);
    expect(ps).toHaveLength(4);
    for (const p of ps) expect(Math.hypot(p.x - 1440, p.y - 810)).toBeGreaterThanOrEqual(400);
  });
});

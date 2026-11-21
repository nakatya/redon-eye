import { describe, expect, it } from 'vitest';
import { INVINCIBLE_MS, MAX_HEALTH, applyHit, blinkVisible, hitsShade, initialHealth, isDead, tickHealth } from '../src/logic/health';

describe('health', () => {
  it('触れると 1 減り無敵になる', () => {
    const s = applyHit(initialHealth());
    expect(s.hp).toBe(MAX_HEALTH - 1);
    expect(s.invincibleMs).toBe(INVINCIBLE_MS);
  });
  it('無敵中は重ねてダメージを受けない', () => {
    const s = applyHit(initialHealth());
    expect(applyHit(s)).toBe(s);
    expect(applyHit(tickHealth(s, 1999)).hp).toBe(MAX_HEALTH - 1);
  });
  it('2 秒たつと再びダメージを受ける', () => {
    expect(applyHit(tickHealth(applyHit(initialHealth()), 2000)).hp).toBe(MAX_HEALTH - 2);
  });
  it('体力 0 で死亡し、それ以上減らない', () => {
    let s = initialHealth();
    for (let i = 0; i < 5; i++) s = tickHealth(applyHit(s), INVINCIBLE_MS);
    expect(s.hp).toBe(0);
    expect(isDead(s)).toBe(true);
  });
  it('当たり判定', () => {
    expect(hitsShade({ x: 0, y: 0 }, { x: 30, y: 0 }, 34)).toBe(true);
    expect(hitsShade({ x: 0, y: 0 }, { x: 100, y: 0 }, 34)).toBe(false);
  });
  it('点滅', () => {
    expect(blinkVisible(0)).toBe(true);
    expect(blinkVisible(1850)).toBe(true);
    expect(blinkVisible(1950)).toBe(false);
  });
});

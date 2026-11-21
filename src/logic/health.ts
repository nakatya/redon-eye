import type { Vec } from './motes';
import { touches } from './motes';

export const MAX_HEALTH = 3;
export const INVINCIBLE_MS = 2000;
export const EYE_HIT_RADIUS = 20;

export interface HealthState {
  hp: number;
  /** 無敵の残り時間(ms) */
  invincibleMs: number;
}

export const initialHealth = (): HealthState => ({ hp: MAX_HEALTH, invincibleMs: 0 });

export const isInvincible = (s: HealthState): boolean => s.invincibleMs > 0;
export const isDead = (s: HealthState): boolean => s.hp <= 0;

/** 時間経過で無敵時間を減らす */
export function tickHealth(s: HealthState, dtMs: number): HealthState {
  return { ...s, invincibleMs: Math.max(0, s.invincibleMs - dtMs) };
}

/** 影に触れたときのダメージ。無敵中・死亡後は変化しない。 */
export function applyHit(s: HealthState): HealthState {
  if (isInvincible(s) || isDead(s)) return s;
  return { hp: s.hp - 1, invincibleMs: INVINCIBLE_MS };
}

/** 目が影に触れているか */
export function hitsShade(eye: Vec, shade: Vec, shadeRadius: number): boolean {
  return touches(eye, EYE_HIT_RADIUS, shade, shadeRadius);
}

/** 無敵中の点滅: 表示するか */
export function blinkVisible(invincibleMs: number): boolean {
  return invincibleMs <= 0 || Math.floor(invincibleMs / 100) % 2 === 0;
}

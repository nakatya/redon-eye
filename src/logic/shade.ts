import type { Size, Vec } from './motes';

export const SHADE_COUNT = 4;
export const SHADE_RADIUS = 34;
export const SHADE_WANDER_SPEED = 35;
/** 目(220)より遅い */
export const SHADE_CHASE_SPEED = 90;

/** 影が目の視界内(半径 visionRadius)にいるか */
export function isInVision(eye: Vec, shade: Vec, visionRadius: number): boolean {
  return Math.hypot(eye.x - shade.x, eye.y - shade.y) < visionRadius;
}

/** 視界内なら目へ、そうでなければ徘徊方向へ進む速度ベクトルを返す */
export function shadeVelocity(shade: Vec, eye: Vec, visionRadius: number, wanderAngle: number): Vec {
  if (isInVision(eye, shade, visionRadius)) {
    const dx = eye.x - shade.x;
    const dy = eye.y - shade.y;
    const d = Math.hypot(dx, dy) || 1;
    return { x: (dx / d) * SHADE_CHASE_SPEED, y: (dy / d) * SHADE_CHASE_SPEED };
  }
  return { x: Math.cos(wanderAngle) * SHADE_WANDER_SPEED, y: Math.sin(wanderAngle) * SHADE_WANDER_SPEED };
}

/** ステージ内に収める */
export function clampToStage(p: Vec, world: Size, margin = SHADE_RADIUS): Vec {
  return {
    x: Math.min(world.width - margin, Math.max(margin, p.x)),
    y: Math.min(world.height - margin, Math.max(margin, p.y)),
  };
}

/** 開始地点から minDist 以上離して count 体を配置する */
export function placeShades(count: number, world: Size, start: Vec, rng: () => number, minDist = 400): Vec[] {
  const out: Vec[] = [];
  let tries = 0;
  while (out.length < count && tries++ < 20000) {
    const p = { x: 100 + rng() * (world.width - 200), y: 100 + rng() * (world.height - 200) };
    if (Math.hypot(p.x - start.x, p.y - start.y) >= minDist) out.push(p);
  }
  return out;
}

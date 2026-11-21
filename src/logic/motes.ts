import { DEFAULT_VISION_RADIUS } from './vision';

export interface Vec { x: number; y: number }
export interface Size { width: number; height: number }

export const MOTE_COUNT = 12;
export const MOTE_GOAL = 8;
export const MOTE_RADIUS = 6;
export const EYE_PICKUP_RADIUS = 28;
export const EXIT_RADIUS = 44;
export const VISION_GAIN_PER_MOTE = 12;
export const VISION_MAX_RADIUS = 260;

/** 互いや開始地点から minDist 以上離し、壁から margin 以上内側に count 個を配置する。rng は 0〜1 を返す関数。 */
export function placeMotes(
  count: number,
  world: Size,
  start: Vec,
  rng: () => number,
  opts: { minDist?: number; startDist?: number; margin?: number } = {},
): Vec[] {
  const { minDist = 200, startDist = 300, margin = 80 } = opts;
  const out: Vec[] = [];
  let tries = 0;
  while (out.length < count && tries++ < 20000) {
    const p = {
      x: margin + rng() * (world.width - 2 * margin),
      y: margin + rng() * (world.height - 2 * margin),
    };
    if (Math.hypot(p.x - start.x, p.y - start.y) < startDist) continue;
    if (out.some((q) => Math.hypot(p.x - q.x, p.y - q.y) < minDist)) continue;
    out.push(p);
  }
  return out;
}

/** 円同士が触れているか */
export function touches(a: Vec, ra: number, b: Vec, rb: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= ra + rb;
}

/** 目が触れている粒の添字一覧(取得済みは除外) */
export function collectedIndices(eye: Vec, motes: Vec[], taken: ReadonlySet<number>): number[] {
  const res: number[] = [];
  motes.forEach((m, i) => {
    if (!taken.has(i) && touches(eye, EYE_PICKUP_RADIUS, m, MOTE_RADIUS)) res.push(i);
  });
  return res;
}

/** 取得数に応じた視界半径(上限あり) */
export function visionRadiusFor(collected: number): number {
  return Math.min(VISION_MAX_RADIUS, DEFAULT_VISION_RADIUS + Math.max(0, collected) * VISION_GAIN_PER_MOTE);
}

export function isExitOpen(collected: number): boolean {
  return collected >= MOTE_GOAL;
}

export function reachedExit(eye: Vec, exit: Vec): boolean {
  return touches(eye, EYE_PICKUP_RADIUS, exit, EXIT_RADIUS);
}

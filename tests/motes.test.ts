import { describe, expect, it } from 'vitest';
import {
  MOTE_GOAL, VISION_MAX_RADIUS, collectedIndices, exitAlphaFor, placeExit, isExitOpen, placeMotes, reachedExit, visionRadiusFor,
} from '../src/logic/motes';

const world = { width: 2880, height: 1620 };
const start = { x: 1440, y: 810 };
function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

describe('placeMotes', () => {
  it('指定数を範囲内・間隔を保って配置する', () => {
    const ps = placeMotes(12, world, start, lcg(1));
    expect(ps).toHaveLength(12);
    for (const [i, p] of ps.entries()) {
      expect(p.x).toBeGreaterThanOrEqual(80);
      expect(p.x).toBeLessThanOrEqual(world.width - 80);
      expect(p.y).toBeGreaterThanOrEqual(80);
      expect(p.y).toBeLessThanOrEqual(world.height - 80);
      expect(Math.hypot(p.x - start.x, p.y - start.y)).toBeGreaterThanOrEqual(300);
      for (const q of ps.slice(i + 1)) expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThanOrEqual(200);
    }
  });
  it('置けない場合は無限ループせず可能な数で終わる', () => {
    const ps = placeMotes(50, { width: 400, height: 400 }, { x: 0, y: 0 }, lcg(2));
    expect(ps.length).toBeLessThan(50);
  });
});

describe('collectedIndices', () => {
  const motes = [{ x: 100, y: 100 }, { x: 500, y: 500 }];
  it('触れた粒だけ返す', () => expect(collectedIndices({ x: 110, y: 100 }, motes, new Set())).toEqual([0]));
  it('取得済みは除外', () => expect(collectedIndices({ x: 110, y: 100 }, motes, new Set([0]))).toEqual([]));
  it('遠いと取れない', () => expect(collectedIndices({ x: 300, y: 300 }, motes, new Set())).toEqual([]));
});

describe('視界と出口', () => {
  it('粒を取るほど広がり、上限で止まる', () => {
    expect(visionRadiusFor(1)).toBeGreaterThan(visionRadiusFor(0));
    expect(visionRadiusFor(1000)).toBe(VISION_MAX_RADIUS);
  });
  it('目標数で出口が開く', () => {
    expect(isExitOpen(MOTE_GOAL - 1)).toBe(false);
    expect(isExitOpen(MOTE_GOAL)).toBe(true);
  });
  it('出口への到達判定', () => {
    expect(reachedExit({ x: 0, y: 0 }, { x: 30, y: 0 })).toBe(true);
    expect(reachedExit({ x: 0, y: 0 }, { x: 200, y: 0 })).toBe(false);
  });
});

describe('placeExit', () => {
  it('目から 600px 以上離れた範囲内に置く', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const p = placeExit(world, start, lcg(seed));
      expect(Math.hypot(p.x - start.x, p.y - start.y)).toBeGreaterThanOrEqual(600);
      expect(p.x).toBeGreaterThanOrEqual(80);
      expect(p.x).toBeLessThanOrEqual(world.width - 80);
      expect(p.y).toBeGreaterThanOrEqual(80);
      expect(p.y).toBeLessThanOrEqual(world.height - 80);
    }
  });
  it('置けない狭さでも、目から最も遠い隅に置く(目の近くにならない)', () => {
    const small = { width: 500, height: 500 };
    const eye = { x: 100, y: 100 };
    expect(placeExit(small, eye, lcg(3))).toEqual({ x: 420, y: 420 });
  });
});

describe('exitAlphaFor', () => {
  it('遠くは 0.15〜0.25', () => {
    for (const pulse of [-1, 0, 1]) {
      const a = exitAlphaFor(1000, pulse);
      expect(a).toBeGreaterThanOrEqual(0.15 - 1e-9);
      expect(a).toBeLessThanOrEqual(0.25 + 1e-9);
    }
  });
  it('近づくほど濃い', () => expect(exitAlphaFor(60, 0)).toBeGreaterThan(exitAlphaFor(500, 0)));
});

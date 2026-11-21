/** 視界の外縁の柔らかさ(半径に対する、減衰が始まる位置の割合) */
export const VISION_INNER_RATIO = 0.45;

export const DEFAULT_VISION_RADIUS = 160;

/**
 * 目からの距離 dist における闇の濃さ(0=完全に見える, 1=真っ暗)。
 * 半径 radius × VISION_INNER_RATIO までは明るく、radius でちょうど真っ暗になる。
 */
export function darknessAt(dist: number, radius: number): number {
  if (radius <= 0) return 1;
  const inner = radius * VISION_INNER_RATIO;
  if (dist <= inner) return 0;
  if (dist >= radius) return 1;
  const t = (dist - inner) / (radius - inner);
  return t * t * (3 - 2 * t); // smoothstep
}

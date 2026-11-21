import { DEFAULT_MOVEMENT, type Vec2 } from './movement';

export interface PointerParams {
  /** この距離(px)以内は入力なし */
  deadZone: number;
  /** この距離(px)以上で入力が最大。間は滑らかに減衰する */
  slowRadius: number;
  /** 現在速度を打ち消す強さ。行き過ぎて振動しないためのブレーキ */
  brake: number;
}

export const DEFAULT_POINTER: PointerParams = {
  deadZone: 6,
  slowRadius: 160,
  brake: 1.2,
};

/** ポインタ(ワールド座標)へ向かう入力ベクトル(長さ0..1)。近いほど弱く、デッドゾーン内は0 */
export function pointerInput(
  eye: Vec2,
  target: Vec2,
  vel: Vec2 = { x: 0, y: 0 },
  p: PointerParams = DEFAULT_POINTER,
): Vec2 {
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= p.deadZone) return { x: 0, y: 0 };
  const t = Math.min(1, (dist - p.deadZone) / Math.max(1e-6, p.slowRadius - p.deadZone));
  const strength = t * t * (3 - 2 * t); // smoothstep
  // 近づくほど速度を打ち消す方向の入力を足す(近距離ほど強くかかる)
  const b = (p.brake * (1 - t)) / DEFAULT_MOVEMENT.maxSpeed;
  let x = (dx / dist) * strength - vel.x * b;
  let y = (dy / dist) * strength - vel.y * b;
  const len = Math.hypot(x, y);
  if (len > 1) { x /= len; y /= len; }
  return { x, y };
}

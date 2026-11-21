export interface Vec2 {
  x: number;
  y: number;
}

export interface MovementParams {
  /** 加速度 (px/s^2) */
  acceleration: number;
  /** 入力がないときの減衰率 (1/s)。大きいほど早く止まる */
  damping: number;
  /** 最大速度 (px/s) */
  maxSpeed: number;
}

export const DEFAULT_MOVEMENT: MovementParams = {
  acceleration: 600,
  damping: 1.6,
  maxSpeed: 220,
};

/** 速度ベクトルの大きさを max 以下に制限する */
export function clampSpeed(v: Vec2, max: number): Vec2 {
  const len = Math.hypot(v.x, v.y);
  if (len <= max || len === 0) return { x: v.x, y: v.y };
  const k = max / len;
  return { x: v.x * k, y: v.y * k };
}

/** 入力方向(各軸 -1..1)から速度を1ステップ進める。斜めでも加速が速くならないよう正規化する */
export function stepVelocity(
  v: Vec2,
  input: Vec2,
  dt: number,
  p: MovementParams = DEFAULT_MOVEMENT,
): Vec2 {
  const ilen = Math.hypot(input.x, input.y);
  const dx = ilen > 0 ? input.x / ilen : 0;
  const dy = ilen > 0 ? input.y / ilen : 0;
  // 指数的な減衰(フレームレートに依存しない)
  const decay = Math.exp(-p.damping * dt);
  const next = {
    x: v.x * decay + dx * p.acceleration * dt,
    y: v.y * decay + dy * p.acceleration * dt,
  };
  return clampSpeed(next, p.maxSpeed);
}

/** 位置を範囲内に収める。壁に当たった軸の速度は0にする */
export function moveWithin(
  pos: Vec2,
  vel: Vec2,
  dt: number,
  bounds: { width: number; height: number },
  margin = 0,
): { pos: Vec2; vel: Vec2 } {
  let x = pos.x + vel.x * dt;
  let y = pos.y + vel.y * dt;
  let vx = vel.x;
  let vy = vel.y;
  if (x < margin) { x = margin; vx = 0; }
  if (x > bounds.width - margin) { x = bounds.width - margin; vx = 0; }
  if (y < margin) { y = margin; vy = 0; }
  if (y > bounds.height - margin) { y = bounds.height - margin; vy = 0; }
  return { pos: { x, y }, vel: { x: vx, y: vy } };
}

/** 瞳のずれ(-1..1の範囲の円内)。速度が小さいときは中央に戻る */
export function pupilOffset(v: Vec2, maxSpeed: number): Vec2 {
  if (maxSpeed <= 0) return { x: 0, y: 0 };
  const len = Math.hypot(v.x, v.y);
  if (len < 1e-6) return { x: 0, y: 0 };
  const m = Math.min(1, len / maxSpeed);
  return { x: (v.x / len) * m, y: (v.y / len) * m };
}

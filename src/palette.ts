/** 色の定数。モノクロ(暖かいグレー)の範囲に収める。 */
export const COLOR = {
  /** 闇 */
  dark: 0x0b0b0b,
  /** 照らされた地面(闇より一段明るい暖かいグレー) */
  ground: 0x27251f,
  /** 紙色 */
  paper: 0xd8d2c4,
  /** 目印などの中間グレー */
  mid: 0x6b6b6b,
  /** 補助テキストのグレー */
  dim: 0x8a8578,
} as const;

export const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

export const CSS = {
  dark: hex(COLOR.dark),
  ground: hex(COLOR.ground),
  paper: hex(COLOR.paper),
  dim: hex(COLOR.dim),
} as const;

/** 色 c を濃淡 v(0.5 が基準、0..1)で明暗にずらした RGB を返す */
export function shade(c: number, v: number, amount: number): [number, number, number] {
  const k = 1 + (v - 0.5) * 2 * amount;
  return [((c >> 16) & 255) * k, ((c >> 8) & 255) * k, (c & 255) * k];
}

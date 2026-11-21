/** 色 c を濃淡 v(0.5 が基準、0..1)で明暗にずらした整数 RGB を返す */
export function shade(c: number, v: number, amount: number): [number, number, number] {
  const k = 1 + (v - 0.5) * 2 * amount;
  const ch = (x: number): number => Math.round(x * k);
  return [ch((c >> 16) & 255), ch((c >> 8) & 255), ch(c & 255)];
}

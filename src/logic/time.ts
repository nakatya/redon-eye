/** 経過秒を m:ss.s 形式にする(負数・非有限値は 0 扱い) */
export function formatElapsed(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const tenths = Math.floor(s * 10);
  const m = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  return `${m}:${rest.toFixed(1).padStart(4, '0')}`;
}

/** 18_420 → "18.4K", 1_240_000 → "1.2M" */
export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

/** 24180 → "24,180" */
export function withThousands(n: number): string {
  return n.toLocaleString("en-US");
}

/** minutes → "2h 08m" */
export function clockFrom(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

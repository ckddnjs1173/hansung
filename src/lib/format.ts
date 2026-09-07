export function formatNumber(value: unknown) { return Number(value ?? 0).toLocaleString("ko-KR"); }
export function formatWon(value: unknown) { return `${formatNumber(value)}원`; }
export function display(value: unknown, fallback = "-") { const text=String(value ?? "").trim(); return text || fallback; }

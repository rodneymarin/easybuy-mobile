interface StoreColorEntry {
  light: string;
  dark: string;
}

export const STORE_COLORS: StoreColorEntry[] = [
  { light: '#D4D4D8', dark: '#6B7280' },
  { light: '#99F6E4', dark: '#0D9488' },
  { light: '#86EFAC', dark: '#059669' },
  { light: '#93C5FD', dark: '#2563EB' },
  { light: '#C4B5FD', dark: '#7C3AED' },
  { light: '#F9A8D4', dark: '#BE185D' },
  { light: '#FCA5A5', dark: '#DC2626' },
  { light: '#FDBA74', dark: '#EA580C' },
  { light: '#FDE047', dark: '#CA8A04' },
] as const;

export type StoreColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function getStoreColor(index: number, isDark: boolean): string {
  const entry = STORE_COLORS[index];
  if (!entry) return isDark ? STORE_COLORS[0].dark : STORE_COLORS[0].light;
  return isDark ? entry.dark : entry.light;
}

export function hexToRgba(hex: string, alpha: number): string {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(c => c + c).join('');
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function shadeColor(hex: string, ratio: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = ratio > 0 ? 255 : 0;
  const abs = Math.abs(ratio);
  const nr = Math.round(r + (mix - r) * abs);
  const ng = Math.round(g + (mix - g) * abs);
  const nb = Math.round(b + (mix - b) * abs);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

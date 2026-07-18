import type { CSSProperties } from 'react';

// JRA/netkeibaの枠番標準色（帽色）: 1白 2黒 3赤 4青 5黄 6緑 7橙 8桃
const WAKU_COLORS: Record<number, CSSProperties> = {
  1: { backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #999' },
  2: { backgroundColor: '#1a1a1a', color: '#ffffff' },
  3: { backgroundColor: '#e0302f', color: '#ffffff' },
  4: { backgroundColor: '#1f6fd6', color: '#ffffff' },
  5: { backgroundColor: '#f4d500', color: '#1a1a1a' },
  6: { backgroundColor: '#1f9e4c', color: '#ffffff' },
  7: { backgroundColor: '#f2891d', color: '#1a1a1a' },
  8: { backgroundColor: '#f177b0', color: '#1a1a1a' },
};

// 上位人気の強調色: 1番人気=金 2番人気=銀 3番人気=銅、4番人気以降は無着色
const POPULARITY_COLORS: Record<number, CSSProperties> = {
  1: { backgroundColor: '#f4c430', color: '#1a1a1a' },
  2: { backgroundColor: '#c0c0c0', color: '#1a1a1a' },
  3: { backgroundColor: '#cd7f32', color: '#ffffff' },
};

function parseLeadingInt(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = value.match(/\d+/);
  return m ? Number(m[0]) : null;
}

export function wakuStyle(waku: string | null | undefined): CSSProperties | undefined {
  const n = parseLeadingInt(waku);
  if (n === null) return undefined;
  const c = WAKU_COLORS[n];
  return c ? { ...c, textAlign: 'center' } : undefined;
}

export function popularityStyle(popularity: string | null | undefined): CSSProperties | undefined {
  const n = parseLeadingInt(popularity);
  if (n === null) return undefined;
  const c = POPULARITY_COLORS[n];
  return c ? { ...c, textAlign: 'center' } : undefined;
}

// 予想印の慣用色: 本命=赤 対抗=青 単穴=緑 連下=黄土 消し=グレー
const MARK_CLASSES: Record<string, string> = {
  '◎': 'mark-honmei',
  '○': 'mark-taikou',
  '▲': 'mark-tananna',
  '△': 'mark-renka',
  '✕': 'mark-keshi',
};

export function markClass(mark: string | null | undefined): string {
  if (!mark) return '';
  return MARK_CLASSES[mark] ?? '';
}

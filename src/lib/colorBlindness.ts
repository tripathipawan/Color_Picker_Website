import { hexToRgb, rgbToHex } from './colors';

type Matrix = [number, number, number, number, number, number, number, number, number];

const matrices: Record<string, Matrix> = {
  protanopia:    [0.567, 0.433, 0,     0.558, 0.442, 0,     0,     0.242, 0.758],
  deuteranopia:  [0.625, 0.375, 0,     0.7,   0.3,   0,     0,     0.3,   0.7],
  tritanopia:    [0.95,  0.05,  0,     0,     0.433, 0.567, 0,     0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

export type CVDType = keyof typeof matrices;

export const cvdTypes: { key: CVDType; label: string; description: string }[] = [
  { key: 'protanopia', label: 'Protanopia', description: 'Red-blind (~1% of males)' },
  { key: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind (~1% of males)' },
  { key: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind (very rare)' },
  { key: 'achromatopsia', label: 'Achromatopsia', description: 'Total color blindness' },
];

export function simulateCVD(hex: string, type: CVDType): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const m = matrices[type];
  const r = Math.min(255, Math.max(0, Math.round(m[0] * rgb.r + m[1] * rgb.g + m[2] * rgb.b)));
  const g = Math.min(255, Math.max(0, Math.round(m[3] * rgb.r + m[4] * rgb.g + m[5] * rgb.b)));
  const b = Math.min(255, Math.max(0, Math.round(m[6] * rgb.r + m[7] * rgb.g + m[8] * rgb.b)));
  return rgbToHex(r, g, b);
}

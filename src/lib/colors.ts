// Color utility functions

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getTints(hex: string, steps = 9): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const result: string[] = [];
  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    result.push(rgbToHex(
      Math.round(rgb.r + (255 - rgb.r) * factor),
      Math.round(rgb.g + (255 - rgb.g) * factor),
      Math.round(rgb.b + (255 - rgb.b) * factor)
    ));
  }
  return result;
}

export function getShades(hex: string, steps = 9): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const result: string[] = [];
  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    result.push(rgbToHex(
      Math.round(rgb.r * (1 - factor)),
      Math.round(rgb.g * (1 - factor)),
      Math.round(rgb.b * (1 - factor))
    ));
  }
  return result;
}

export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const comp = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
  return rgbToHex(comp.r, comp.g, comp.b);
}

export function getAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [-30, 30].map(offset => {
    const c = hslToRgb((hsl.h + offset + 360) % 360, hsl.s, hsl.l);
    return rgbToHex(c.r, c.g, c.b);
  });
}

export function getTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [120, 240].map(offset => {
    const c = hslToRgb((hsl.h + offset) % 360, hsl.s, hsl.l);
    return rgbToHex(c.r, c.g, c.b);
  });
}

export function getSplitComplementary(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return [150, 210].map(offset => {
    const c = hslToRgb((hsl.h + offset) % 360, hsl.s, hsl.l);
    return rgbToHex(c.r, c.g, c.b);
  });
}

// Approximate color name
const COLOR_NAMES: Record<string, string> = {
  '#FF0000': 'Red', '#FF6B6B': 'Coral Red', '#FF4500': 'Orange Red',
  '#FFA07A': 'Light Salmon', '#FFD700': 'Gold', '#FF8C00': 'Dark Orange',
  '#FFDDE1': 'Misty Rose', '#EE9CA7': 'Shimmering Blush', '#FFECD2': 'Papaya Whip',
  '#FCB69F': 'Peach', '#00FF41': 'Neon Green', '#FF00FF': 'Magenta',
  '#00FFFF': 'Cyan', '#FFFF00': 'Yellow', '#0077B6': 'Star Command Blue',
  '#00B4D8': 'Pacific Cyan', '#90E0EF': 'Light Blue', '#CAF0F8': 'Light Cyan',
  '#1B4332': 'Dark Green', '#2D6A4F': 'Amazon', '#52B788': 'Ocean Green',
  '#B7E4C7': 'Celadon', '#000000': 'Black', '#FFFFFF': 'White',
  '#808080': 'Gray', '#C0C0C0': 'Silver', '#800080': 'Purple',
  '#008080': 'Teal', '#000080': 'Navy', '#FFC0CB': 'Pink',
};

export function getColorName(hex: string): string {
  const upper = hex.toUpperCase();
  if (COLOR_NAMES[upper]) return COLOR_NAMES[upper];
  
  const rgb = hexToRgb(upper);
  if (!rgb) return 'Unknown';
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  if (hsl.s < 10) {
    if (hsl.l < 15) return 'Black';
    if (hsl.l < 40) return 'Dark Gray';
    if (hsl.l < 60) return 'Gray';
    if (hsl.l < 85) return 'Light Gray';
    return 'White';
  }
  
  const hueNames: [number, string][] = [
    [15, 'Red'], [45, 'Orange'], [65, 'Yellow'], [150, 'Green'],
    [210, 'Cyan'], [260, 'Blue'], [300, 'Purple'], [340, 'Pink'], [360, 'Red'],
  ];
  
  let name = 'Color';
  for (const [hue, n] of hueNames) {
    if (hsl.h <= hue) { name = n; break; }
  }
  
  if (hsl.l < 30) return `Dark ${name}`;
  if (hsl.l > 70) return `Light ${name}`;
  if (hsl.s > 80) return `Vivid ${name}`;
  return name;
}

// Extract dominant colors from image using median cut
export function extractColors(imageData: ImageData, colorCount = 5): string[] {
  const pixels: number[][] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
  }
  
  const buckets = medianCut(pixels, colorCount);
  return buckets.map(bucket => {
    const avg = bucket.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
      [0, 0, 0]
    ).map(v => Math.round(v / bucket.length));
    return rgbToHex(avg[0], avg[1], avg[2]);
  });
}

function medianCut(pixels: number[][], depth: number): number[][][] {
  if (depth === 1 || pixels.length === 0) return [pixels];
  
  const ranges = [0, 1, 2].map(ch => {
    const values = pixels.map(p => p[ch]);
    return Math.max(...values) - Math.min(...values);
  });
  
  const channel = ranges.indexOf(Math.max(...ranges));
  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);
  
  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

// Universal color parser — supports hex, rgb, rgba, hsl, hsla, named colors
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './colors';

const NAMED_COLORS: Record<string, string> = {
  red: '#FF0000', green: '#008000', blue: '#0000FF', white: '#FFFFFF', black: '#000000',
  yellow: '#FFFF00', cyan: '#00FFFF', magenta: '#FF00FF', orange: '#FFA500', pink: '#FFC0CB',
  purple: '#800080', teal: '#008080', navy: '#000080', maroon: '#800000', olive: '#808000',
  lime: '#00FF00', aqua: '#00FFFF', silver: '#C0C0C0', gray: '#808080', grey: '#808080',
  coral: '#FF7F50', salmon: '#FA8072', tomato: '#FF6347', gold: '#FFD700', indigo: '#4B0082',
  violet: '#EE82EE', turquoise: '#40E0D0', chocolate: '#D2691E', crimson: '#DC143C',
  orchid: '#DA70D6', plum: '#DDA0DD', khaki: '#F0E68C', lavender: '#E6E6FA',
  beige: '#F5F5DC', ivory: '#FFFFF0', mintcream: '#F5FFFA', honeydew: '#F0FFF0',
  azure: '#F0FFFF', aliceblue: '#F0F8FF', ghostwhite: '#F8F8FF', snow: '#FFFAFA',
  seashell: '#FFF5EE', linen: '#FAF0E6', wheat: '#F5DEB3', tan: '#D2B48C',
  peru: '#CD853F', sienna: '#A0522D', saddlebrown: '#8B4513', firebrick: '#B22222',
  darkred: '#8B0000', darkgreen: '#006400', darkblue: '#00008B', darkcyan: '#008B8B',
  darkmagenta: '#8B008B', darkorange: '#FF8C00', darkviolet: '#9400D3',
  deeppink: '#FF1493', deepskyblue: '#00BFFF', dodgerblue: '#1E90FF',
  forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC',
  hotpink: '#FF69B4', indianred: '#CD5C5C', lawngreen: '#7CFC00',
  lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080',
  lightcyan: '#E0FFFF', lightgreen: '#90EE90', lightpink: '#FFB6C1',
  lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA',
  lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', limegreen: '#32CD32',
  mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3',
  mediumpurple: '#9370DB', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE',
  mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585',
  midnightblue: '#191970', mistyrose: '#FFE4E1', moccasin: '#FFE4B5',
  navajowhite: '#FFDEAD', oldlace: '#FDF5E6', olivedrab: '#6B8E23',
  orangered: '#FF4500', palegoldenrod: '#EEE8AA', palegreen: '#98FB98',
  paleturquoise: '#AFEEEE', palevioletred: '#DB7093', papayawhip: '#FFEFD5',
  peachpuff: '#FFDAB9', powderblue: '#B0E0E6', rosybrown: '#BC8F8F',
  royalblue: '#4169E1', sandybrown: '#F4A460', seagreen: '#2E8B57',
  skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090',
  springgreen: '#00FF7F', steelblue: '#4682B4', thistle: '#D8BFD8',
  yellowgreen: '#9ACD32',
};

export interface ParsedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number;
  l: number;
  format: 'hex' | 'hex8' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named' | 'unknown';
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function parseColor(input: string): ParsedColor | null {
  const str = input.trim().toLowerCase();

  // Named color
  if (NAMED_COLORS[str]) {
    const rgb = hexToRgb(NAMED_COLORS[str]);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex: NAMED_COLORS[str], ...rgb, a: 1, ...hsl, format: 'named' };
  }

  // Hex (3, 4, 6, 8 digit)
  const hexMatch = str.match(/^#?([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    let a = 1;
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 4) { a = parseInt(h[3]+h[3], 16)/255; h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
    if (h.length === 8) { a = parseInt(h.slice(6), 16)/255; h = h.slice(0, 6); }
    if (h.length === 6) {
      const hex = `#${h.toUpperCase()}`;
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return { hex, ...rgb, a, ...hsl, format: a < 1 ? 'hex8' : 'hex' };
    }
  }

  // rgb(r, g, b) or rgb(r g b)
  const rgbMatch = str.match(/^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/);
  if (rgbMatch) {
    const r = clamp(parseInt(rgbMatch[1]), 0, 255);
    const g = clamp(parseInt(rgbMatch[2]), 0, 255);
    const b = clamp(parseInt(rgbMatch[3]), 0, 255);
    let a = 1;
    if (rgbMatch[4]) {
      a = rgbMatch[4].endsWith('%') ? parseFloat(rgbMatch[4]) / 100 : parseFloat(rgbMatch[4]);
      a = clamp(a, 0, 1);
    }
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    return { hex, r, g, b, a, ...hsl, format: a < 1 ? 'rgba' : 'rgb' };
  }

  // hsl(h, s%, l%) or hsl(h s% l%)
  const hslMatch = str.match(/^hsla?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/);
  if (hslMatch) {
    const h = ((parseFloat(hslMatch[1]) % 360) + 360) % 360;
    const s = clamp(parseFloat(hslMatch[2]), 0, 100);
    const l = clamp(parseFloat(hslMatch[3]), 0, 100);
    let a = 1;
    if (hslMatch[4]) {
      a = hslMatch[4].endsWith('%') ? parseFloat(hslMatch[4]) / 100 : parseFloat(hslMatch[4]);
      a = clamp(a, 0, 1);
    }
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hex, ...rgb, a, h: Math.round(h), s: Math.round(s), l: Math.round(l), format: a < 1 ? 'hsla' : 'hsl' };
  }

  return null;
}

export function formatColor(parsed: ParsedColor, format: string): string {
  switch (format) {
    case 'hex': return parsed.hex;
    case 'hex8': return `${parsed.hex}${Math.round(parsed.a * 255).toString(16).padStart(2, '0').toUpperCase()}`;
    case 'rgb': return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
    case 'rgba': return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`;
    case 'hsl': return `hsl(${parsed.h}, ${parsed.s}%, ${parsed.l}%)`;
    case 'hsla': return `hsla(${parsed.h}, ${parsed.s}%, ${parsed.l}%, ${parsed.a})`;
    default: return parsed.hex;
  }
}

export const COLOR_FORMATS = ['hex', 'hex8', 'rgb', 'rgba', 'hsl', 'hsla'] as const;

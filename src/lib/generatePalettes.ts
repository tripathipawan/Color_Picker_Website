import { hslToRgb, rgbToHex } from './colors';
import type { Palette, PaletteTag } from './palettes';

function hslHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(((h % 360) + 360) % 360, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l)));
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PALETTE_ADJECTIVES = [
  'Gentle', 'Vivid', 'Soft', 'Bold', 'Dreamy', 'Mystic', 'Radiant', 'Calm',
  'Fiery', 'Icy', 'Dusty', 'Lush', 'Hazy', 'Bright', 'Muted', 'Deep',
  'Airy', 'Rich', 'Crisp', 'Smoky', 'Silky', 'Fresh', 'Warm', 'Cool',
  'Electric', 'Faded', 'Glowing', 'Subtle', 'Royal', 'Wild', 'Serene', 'Moody',
];

const PALETTE_NOUNS = [
  'Dawn', 'Dusk', 'Bloom', 'Wave', 'Flame', 'Frost', 'Mist', 'Shadow',
  'Coral', 'Sky', 'Stone', 'Leaf', 'Petal', 'Storm', 'Glow', 'Ember',
  'Tide', 'Breeze', 'Spark', 'Horizon', 'Canyon', 'Oasis', 'Meadow', 'Eclipse',
  'Nebula', 'Prism', 'Crystal', 'Velvet', 'Marble', 'Twilight', 'Solstice', 'Mirage',
];

function tagFromHSL(h: number, s: number, l: number, rand: () => number): PaletteTag[] {
  const tags: PaletteTag[] = [];

  if (l > 70 && s < 50) tags.push('Pastel');
  if (l < 30) tags.push('Dark');
  if (s > 85 && l > 40 && l < 70) tags.push('Neon');
  if (h >= 0 && h < 60) tags.push('Warm');
  if (h >= 180 && h < 300) tags.push('Cool');
  if (s < 30 && l > 40 && l < 70) tags.push('Vintage');
  if (h >= 80 && h < 170 && s > 30) tags.push('Nature');
  if (s < 15) tags.push('Minimal');
  if (h >= 180 && h < 230 && s > 40) tags.push('Ocean');
  if (h >= 0 && h < 45 && s > 60 && l > 50) tags.push('Sunset');
  if (h >= 100 && h < 160 && l < 50) tags.push('Forest');
  if (s > 60 && l > 60) tags.push('Candy');
  if (h >= 20 && h < 50 && s > 30 && s < 70 && l < 60) tags.push('Earth');
  if (s < 8) tags.push('Monochrome');

  // New tags
  if (h >= 0 && h < 40 && s > 50 && s < 80 && l > 40) tags.push('Retro');
  if ((h >= 270 || h < 30) && s > 70 && l < 50) tags.push('Cyberpunk');
  if (h >= 20 && h < 60 && s > 20 && s < 60 && l > 30 && l < 60) tags.push('Earthy');
  if (s < 30 && l > 20 && l < 50) tags.push('Gothic');
  if (h >= 200 && h < 280 && s > 40 && l > 60) tags.push('Aurora');
  if (h >= 30 && h < 60 && s > 30 && l > 60) tags.push('Desert');
  if (h >= 180 && h < 220 && s < 40 && l > 70) tags.push('Arctic');
  if (h >= 80 && h < 180 && s > 50 && l > 50) tags.push('Tropical');
  if (l > 75 && s > 30 && s < 70) tags.push('Pastel Rainbow');
  if (h >= 200 && h < 240 && s > 30 && s < 70 && l > 30 && l < 60) tags.push('Corporate');
  if (s > 30 && s < 60 && l > 40 && l < 70) tags.push('Bohemian');
  if ((h >= 270 || h < 20) && s > 60 && l > 40 && l < 70) tags.push('Synthwave');
  if (s > 20 && s < 50 && l > 20 && l < 45) tags.push('Luxury');

  // Pick up to 3 unique tags
  const unique = [...new Set(tags)];
  if (unique.length === 0) return ['Minimal'];
  // Shuffle and take 2-3
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return unique.slice(0, Math.min(3, unique.length));
}

function analogous(baseH: number, s: number, l: number, rand: () => number): string[] {
  const spread = 15 + rand() * 25;
  return Array.from({ length: 5 }, (_, i) => {
    const offset = (i - 2) * spread;
    const ls = l + (rand() - 0.5) * 20;
    return hslHex(baseH + offset, s + (rand() - 0.5) * 15, ls);
  });
}

function complementary(baseH: number, s: number, l: number, rand: () => number): string[] {
  const comp = baseH + 180;
  return [
    hslHex(baseH, s, l),
    hslHex(baseH, s - 10, l + 15),
    hslHex(baseH + 15, s, l - 10),
    hslHex(comp, s, l),
    hslHex(comp, s - 10, l + 10 + rand() * 10),
  ];
}

function triadic(baseH: number, s: number, l: number, rand: () => number): string[] {
  return [
    hslHex(baseH, s, l),
    hslHex(baseH, s - 15, l + 20),
    hslHex(baseH + 120, s, l + (rand() - 0.5) * 15),
    hslHex(baseH + 240, s, l),
    hslHex(baseH + 240, s - 10, l + 15),
  ];
}

function splitComp(baseH: number, s: number, l: number, rand: () => number): string[] {
  return [
    hslHex(baseH, s, l),
    hslHex(baseH, s, l + 20),
    hslHex(baseH + 150, s - 10, l + (rand() - 0.5) * 10),
    hslHex(baseH + 210, s, l),
    hslHex(baseH + 210, s - 15, l + 15),
  ];
}

function monochromatic(baseH: number, s: number, _l: number, rand: () => number): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    const l = 15 + i * 17 + (rand() - 0.5) * 8;
    const sv = s + (rand() - 0.5) * 15;
    return hslHex(baseH, sv, l);
  });
}

function tetradic(baseH: number, s: number, l: number, rand: () => number): string[] {
  return [
    hslHex(baseH, s, l),
    hslHex(baseH + 90, s - 10, l + 10),
    hslHex(baseH + 180, s, l - 5 + rand() * 10),
    hslHex(baseH + 270, s - 5, l + 15),
    hslHex(baseH + 45, s - 15, l + 20),
  ];
}

const generators = [analogous, complementary, triadic, splitComp, monochromatic, tetradic];

let globalId = 1000;

export function generatePalettes(count: number = 2000): Palette[] {
  const palettes: Palette[] = [];
  const rand = seededRandom(42);

  for (let i = 0; i < count; i++) {
    const baseH = rand() * 360;
    const baseS = 30 + rand() * 60;
    const baseL = 25 + rand() * 50;
    const gen = generators[Math.floor(rand() * generators.length)];
    const colors = gen(baseH, baseS, baseL, rand);
    const tags = tagFromHSL(baseH, baseS, baseL, rand);
    const likes = Math.floor(rand() * 800);
    const age = Math.floor(rand() * 90 * 24 * 60 * 60 * 1000);

    const adj = PALETTE_ADJECTIVES[Math.floor(rand() * PALETTE_ADJECTIVES.length)];
    const noun = PALETTE_NOUNS[Math.floor(rand() * PALETTE_NOUNS.length)];
    const name = `${adj} ${noun}`;

    palettes.push({
      id: `gen-${++globalId}`,
      name,
      colors,
      tags,
      likes,
      createdAt: Date.now() - age,
    });
  }

  return palettes;
}

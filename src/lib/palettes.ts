export type PaletteTag = 
  | 'Pastel' | 'Dark' | 'Neon' | 'Warm' | 'Cool' | 'Vintage' | 'Nature' | 'Minimal' 
  | 'Ocean' | 'Sunset' | 'Forest' | 'Candy' | 'Earth' | 'Monochrome'
  | 'Retro' | 'Cyberpunk' | 'Earthy' | 'Luxury' | 'Aurora' | 'Desert' | 'Arctic' 
  | 'Tropical' | 'Gothic' | 'Pastel Rainbow' | 'Corporate' | 'Bohemian' | 'Synthwave';

export const ALL_TAGS: PaletteTag[] = [
  'Pastel', 'Dark', 'Neon', 'Warm', 'Cool', 'Vintage', 'Nature', 'Minimal',
  'Ocean', 'Sunset', 'Forest', 'Candy', 'Earth', 'Monochrome',
  'Retro', 'Cyberpunk', 'Earthy', 'Luxury', 'Aurora', 'Desert', 'Arctic',
  'Tropical', 'Gothic', 'Pastel Rainbow', 'Corporate', 'Bohemian', 'Synthwave',
];

export const TAG_EMOJIS: Record<PaletteTag, string> = {
  Pastel: '🎀', Dark: '🖤', Neon: '⚡', Warm: '🔥', Cool: '❄️', Vintage: '📷',
  Nature: '🌿', Minimal: '◻️', Ocean: '🌊', Sunset: '🌅', Forest: '🌲', Candy: '🍬',
  Earth: '🌍', Monochrome: '⬛', Retro: '🌆', Cyberpunk: '🤖', Earthy: '🏜️',
  Luxury: '💎', Aurora: '🌌', Desert: '🏜️', Arctic: '🧊', Tropical: '🌴',
  Gothic: '🦇', 'Pastel Rainbow': '🌈', Corporate: '💼', Bohemian: '🪶', Synthwave: '🎧',
};

export interface Palette {
  id: string;
  name: string;
  colors: string[];
  tags: PaletteTag[];
  likes: number;
  createdAt: number;
}

let idCounter = 0;
const makePalette = (name: string, colors: string[], tags: PaletteTag[], likes: number): Palette => ({
  id: `palette-${++idCounter}`,
  name,
  colors,
  tags,
  likes,
  createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
});

const handPicked: Palette[] = [
  makePalette('Rose Petal', ['#FFDDE1', '#EE9CA7', '#FFECD2', '#FCB69F', '#FFF1E6'], ['Pastel', 'Warm'], 234),
  makePalette('Deep Ocean', ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'], ['Ocean', 'Cool'], 412),
  makePalette('Enchanted Forest', ['#1B4332', '#2D6A4F', '#52B788', '#B7E4C7', '#D8F3DC'], ['Forest', 'Nature'], 189),
  makePalette('Blazing Sunset', ['#FF6B6B', '#FFA07A', '#FFD700', '#FF8C00', '#FF4500'], ['Sunset', 'Warm'], 567),
  makePalette('Electric Dreams', ['#00FF41', '#FF00FF', '#00FFFF', '#FFFF00', '#FF0080'], ['Neon', 'Cyberpunk'], 345),
  makePalette('Midnight Edge', ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#D90429'], ['Dark', 'Minimal'], 298),
  makePalette('Silver Mist', ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD'], ['Minimal', 'Monochrome'], 156),
  makePalette('Mediterranean', ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'], ['Nature', 'Warm'], 723),
  makePalette('Sahara Dunes', ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'], ['Earth', 'Desert'], 201),
  makePalette('Cotton Candy', ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF'], ['Pastel', 'Candy'], 489),
  makePalette('Crimson Night', ['#03071E', '#370617', '#6A040F', '#9D0208', '#DC2F02'], ['Dark', 'Gothic'], 167),
  makePalette('Royal Purple', ['#10002B', '#240046', '#3C096C', '#5A189A', '#7B2CBF'], ['Dark', 'Luxury'], 312),
  makePalette('Spring Meadow', ['#D9ED92', '#B5E48C', '#99D98C', '#76C893', '#52B69A'], ['Nature', 'Cool'], 278),
  makePalette('Neon Flux', ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'], ['Neon', 'Synthwave'], 534),
  makePalette('Peach Blossom', ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A'], ['Pastel', 'Warm'], 345),
  makePalette('Coral Reef', ['#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6'], ['Ocean', 'Nature'], 456),
  makePalette('Terracotta', ['#582F0E', '#7F4F24', '#936639', '#A68A64', '#B6AD90'], ['Earth', 'Earthy'], 123),
  makePalette('Rainbow Burst', ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'], ['Candy', 'Pastel Rainbow'], 678),
  makePalette('Warm Sand', ['#F0EAD6', '#DDB892', '#B08968', '#7F5539', '#9C6644'], ['Earth', 'Warm'], 234),
  makePalette('Linen Dreams', ['#EDEDE9', '#D6CCC2', '#F5EBE0', '#E3D5CA', '#D5BDAF'], ['Minimal', 'Vintage'], 189),
  makePalette('Navy Depths', ['#0D1B2A', '#1B2838', '#274C77', '#6096BA', '#A3CEF1'], ['Dark', 'Ocean'], 367),
  makePalette('Bubblegum', ['#FFE5EC', '#FFC2D1', '#FFB3C6', '#FF8FAB', '#FB6F92'], ['Pastel', 'Candy'], 423),
  makePalette('Amethyst', ['#7400B8', '#6930C3', '#5E60CE', '#5390D9', '#4EA8DE'], ['Cool', 'Luxury'], 289),
  makePalette('Vintage Spice', ['#335C67', '#FFF3B0', '#E09F3E', '#9E2A2B', '#540B0E'], ['Vintage', 'Retro'], 345),
  makePalette('Cloud Nine', ['#EAE4E9', '#FFF1E6', '#FDE2E4', '#FAD2E1', '#E2ECE9'], ['Pastel', 'Minimal'], 267),
  makePalette('Citrus Pop', ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F'], ['Warm', 'Sunset'], 512),
  makePalette('Botanical', ['#2C6E49', '#4C956C', '#FEFEE3', '#FFC9B9', '#D68C45'], ['Nature', 'Bohemian'], 198),
  makePalette('Dark Velvet', ['#320A28', '#511730', '#8E443D', '#CB9173', '#E8DCCA'], ['Vintage', 'Gothic'], 145),
  makePalette('Sherbet', ['#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'], ['Pastel', 'Pastel Rainbow'], 534),
  makePalette('Charcoal', ['#212529', '#343A40', '#495057', '#6C757D', '#868E96'], ['Dark', 'Monochrome'], 178),
  makePalette('Cyber Grid', ['#0D0221', '#0F084B', '#26408B', '#A6CFD5', '#C2E7D9'], ['Cyberpunk', 'Dark'], 356),
  makePalette('Arctic Frost', ['#D6E5E3', '#C9E4E7', '#A8D8EA', '#8EC6D5', '#6BB7C7'], ['Arctic', 'Cool'], 234),
  makePalette('Tropical Breeze', ['#FF6F61', '#FFB347', '#87CEEB', '#00CED1', '#2E8B57'], ['Tropical', 'Warm'], 445),
  makePalette('Gold Rush', ['#B8860B', '#DAA520', '#FFD700', '#FFF8DC', '#F5F5DC'], ['Luxury', 'Warm'], 389),
  makePalette('Aurora Borealis', ['#00FF87', '#60EFFF', '#9B59B6', '#E74C3C', '#F1C40F'], ['Aurora', 'Neon'], 567),
  makePalette('Corporate Blue', ['#003366', '#336699', '#6699CC', '#99CCFF', '#CCE5FF'], ['Corporate', 'Cool'], 234),
  makePalette('Bohemian Rhapsody', ['#8B4513', '#CD853F', '#DEB887', '#F5DEB3', '#FFF8DC'], ['Bohemian', 'Earthy'], 312),
  makePalette('Synthwave Sunset', ['#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'], ['Synthwave', 'Neon'], 478),
];

import { generatePalettes } from './generatePalettes';
const generated = generatePalettes(2000);
export const seedPalettes: Palette[] = [...handPicked, ...generated];

export const BASOTHO_LUXURY_COLORS = {
  obsidian: '#080807',
  charcoal: '#171714',
  slate: '#252522',
  deepChocolate: '#321A12',
  walnut: '#4A2B1C',
  sandstone: '#B78B5B',
  warmSand: '#D1AF7A',
  bone: '#E9E0CE',
  ivory: '#F4EAD7',
  antiqueGold: '#A98545',
  goldHighlight: '#C7A864',
  ember: '#9B4B2D',
  mist: '#8C9090',
} as const;

export const SF_COLORS = {
  black: BASOTHO_LUXURY_COLORS.obsidian,
  midnight: BASOTHO_LUXURY_COLORS.charcoal,
  chocolate: BASOTHO_LUXURY_COLORS.deepChocolate,
  brownRaised: BASOTHO_LUXURY_COLORS.walnut,
  caramel: BASOTHO_LUXURY_COLORS.sandstone,
  heritageGold: BASOTHO_LUXURY_COLORS.antiqueGold,
  cream: BASOTHO_LUXURY_COLORS.bone,
  white: BASOTHO_LUXURY_COLORS.ivory,
  textMuted: BASOTHO_LUXURY_COLORS.mist,
  digitalViolet: BASOTHO_LUXURY_COLORS.goldHighlight,
  success: BASOTHO_LUXURY_COLORS.antiqueGold,
  danger: BASOTHO_LUXURY_COLORS.ember,
};

export const COLOR_SWATCHES = [
  { name: 'Obsidian', hex: BASOTHO_LUXURY_COLORS.obsidian, variable: '–obsidian', role: 'Deepest ground, Player 01 polished stone core' },
  { name: 'Charcoal', hex: BASOTHO_LUXURY_COLORS.charcoal, variable: '–charcoal', role: 'Carved board slab, soft dark reflections' },
  { name: 'Slate', hex: BASOTHO_LUXURY_COLORS.slate, variable: '–slate', role: 'Mineral slab edge, recessed node wells' },
  { name: 'Deep Chocolate', hex: BASOTHO_LUXURY_COLORS.deepChocolate, variable: '–deep-chocolate', role: 'Fire-darkened stone, smoked menu panels' },
  { name: 'Walnut', hex: BASOTHO_LUXURY_COLORS.walnut, variable: '–walnut', role: 'Aged wood frames, contact shadows, warmth' },
  { name: 'Sandstone', hex: BASOTHO_LUXURY_COLORS.sandstone, variable: '–sandstone', role: 'Lesotho cliff stone, Player 02 carving shade' },
  { name: 'Warm Sand', hex: BASOTHO_LUXURY_COLORS.warmSand, variable: '–warm-sand', role: 'Engraved channel lines, subtle node highlights' },
  { name: 'Bone', hex: BASOTHO_LUXURY_COLORS.bone, variable: '–bone', role: 'High-clarity primary typography, Player 02 token' },
  { name: 'Ivory', hex: BASOTHO_LUXURY_COLORS.ivory, variable: '–ivory', role: 'Player 02 polished stone highlights, crisp labels' },
  { name: 'Antique Gold', hex: BASOTHO_LUXURY_COLORS.antiqueGold, variable: '–antique-gold', role: 'Prestige accent, mill inlay, fine engravings' },
  { name: 'Gold Highlight', hex: BASOTHO_LUXURY_COLORS.goldHighlight, variable: '–gold-highlight', role: 'Active mill illumination pulse, specular rim' },
  { name: 'Ember', hex: BASOTHO_LUXURY_COLORS.ember, variable: '–ember', role: 'Quiet capturable cow indicator, firelight warmth' },
  { name: 'Mist', hex: BASOTHO_LUXURY_COLORS.mist, variable: '–mist', role: 'Maloti mountain fog, subtle secondary dividers' },
];

export const SF_TOKEN_METRICS = COLOR_SWATCHES;




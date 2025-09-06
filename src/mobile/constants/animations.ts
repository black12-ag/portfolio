// Animation constants for professional portfolio
export const ANIMATION_DURATIONS = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  extraSlow: 1.2,
} as const;

export const ANIMATION_EASINGS = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  professional: [0.4, 0, 0.2, 1],
} as const;

export const PARTICLE_CONFIG = {
  count: 50,
  colors: ['#3B82F6', '#8B5CF6', '#06D6A0', '#F59E0B'],
  size: { min: 2, max: 6 },
  speed: { min: 0.5, max: 2 },
  opacity: { min: 0.3, max: 0.8 },
} as const;

export const GRADIENT_COLORS = {
  primary: ['#3B82F6', '#8B5CF6'],
  secondary: ['#06D6A0', '#3B82F6'],
  accent: ['#F59E0B', '#EF4444'],
  professional: ['#1F2937', '#374151'],
} as const;

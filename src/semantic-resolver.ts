// Resolves a raw design value (e.g. "8px", "1rem", "50%") to its semantic name
// in the parlance glossary value registry. Pure logic, no Supabase client.
// Mirrors the preset seed in platform/supabase/migrations/018.

import type { GlossaryValueTypeSlug } from './glossary-values';

export type UnitType = GlossaryValueTypeSlug;
export type SpacingSystem = '4px' | '8px';

export interface ResolveResult {
  semantic: string;
  isPreset: boolean;
}

export interface PresetEntry {
  type: UnitType;
  slug: string;
  rawValue: number;
  unit: string;
}

// ── Baked-in preset table ────────────────────────────────────────────────
// Mirrors migration 018. Numeric only; semantic types (role, state, …) have
// no raw_value and are not resolvable from a value string.

const SPACING_PRESETS: ReadonlyArray<[number, string]> = [
  [0, 'spacing-0'], [2, 'spacing-2'], [4, 'spacing-4'], [6, 'spacing-6'],
  [8, 'spacing-8'], [10, 'spacing-10'], [12, 'spacing-12'], [16, 'spacing-16'],
  [20, 'spacing-20'], [24, 'spacing-24'], [32, 'spacing-32'], [40, 'spacing-40'],
  [48, 'spacing-48'], [64, 'spacing-64'], [80, 'spacing-80'], [96, 'spacing-96'],
  [128, 'spacing-128'],
];

const SIZING_PRESETS: ReadonlyArray<[number, string]> = [
  [2, 'sizing-2'], [4, 'sizing-4'], [8, 'sizing-8'], [12, 'sizing-12'],
  [16, 'sizing-16'], [20, 'sizing-20'], [24, 'sizing-24'], [32, 'sizing-32'],
  [40, 'sizing-40'], [48, 'sizing-48'], [64, 'sizing-64'], [80, 'sizing-80'],
  [96, 'sizing-96'], [128, 'sizing-128'],
];

const RADIUS_PRESETS: ReadonlyArray<[number, string]> = [
  [0, 'radius-0'], [2, 'radius-2'], [4, 'radius-4'], [6, 'radius-6'],
  [8, 'radius-8'], [10, 'radius-10'], [12, 'radius-12'], [16, 'radius-16'],
  [24, 'radius-24'], [9999, 'radius-9999'],
];

const BORDER_PRESETS: ReadonlyArray<[number, string]> = [
  [0, 'border-0'], [1, 'border-1'], [2, 'border-2'], [4, 'border-4'],
  [6, 'border-6'], [8, 'border-8'],
];

const OPACITY_PRESETS: ReadonlyArray<[number, string]> = [
  [0, 'opacity-0'], [5, 'opacity-5'], [10, 'opacity-10'], [20, 'opacity-20'],
  [30, 'opacity-30'], [40, 'opacity-40'], [50, 'opacity-50'], [60, 'opacity-60'],
  [70, 'opacity-70'], [80, 'opacity-80'], [90, 'opacity-90'], [95, 'opacity-95'],
  [100, 'opacity-100'],
];

const MOTION_PRESETS: ReadonlyArray<[number, string]> = [
  [0, 'motion-0'], [100, 'motion-100'], [150, 'motion-150'], [200, 'motion-200'],
  [300, 'motion-300'], [500, 'motion-500'], [700, 'motion-700'], [1000, 'motion-1000'],
];

const BREAKPOINT_PRESETS: ReadonlyArray<[number, string]> = [
  [640, 'breakpoint-sm'], [768, 'breakpoint-md'], [1024, 'breakpoint-lg'],
  [1280, 'breakpoint-xl'], [1536, 'breakpoint-2xl'],
];

// Typography seeds — Tailwind text scale. Not in migration 018 yet; bake in
// so the resolver covers font-size lookups without DB state.
const TYPOGRAPHY_PRESETS: ReadonlyArray<[number, string]> = [
  [12, 'text-xs'], [14, 'text-sm'], [16, 'text-base'], [18, 'text-lg'],
  [20, 'text-xl'], [24, 'text-2xl'], [30, 'text-3xl'], [36, 'text-4xl'],
  [48, 'text-5xl'], [60, 'text-6xl'], [72, 'text-7xl'], [96, 'text-8xl'],
  [128, 'text-9xl'],
];

// ── Value parsing ────────────────────────────────────────────────────────

interface ParsedValue {
  amount: number;
  unit: 'px' | '%' | 'ms' | 'none';
}

function parseValue(raw: string): ParsedValue | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (cleaned === '') return null;

  const pxMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (pxMatch) return { amount: parseFloat(pxMatch[1]), unit: 'px' };

  const remMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (remMatch) return { amount: parseFloat(remMatch[1]) * 16, unit: 'px' };

  const emMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)em$/);
  if (emMatch) return { amount: parseFloat(emMatch[1]) * 16, unit: 'px' };

  const msMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)ms$/);
  if (msMatch) return { amount: parseFloat(msMatch[1]), unit: 'ms' };

  const sMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)s$/);
  if (sMatch) return { amount: parseFloat(sMatch[1]) * 1000, unit: 'ms' };

  const pctMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (pctMatch) return { amount: parseFloat(pctMatch[1]), unit: '%' };

  // Bare number — opacity (0-1 or 0-100) and unitless values.
  const numMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)$/);
  if (numMatch) return { amount: parseFloat(numMatch[1]), unit: 'none' };

  return null;
}

function presetTableFor(type: UnitType): ReadonlyArray<[number, string]> | null {
  switch (type) {
    case 'spacing':    return SPACING_PRESETS;
    case 'sizing':     return SIZING_PRESETS;
    case 'radius':     return RADIUS_PRESETS;
    case 'border':     return BORDER_PRESETS;
    case 'opacity':    return OPACITY_PRESETS;
    case 'motion':     return MOTION_PRESETS;
    case 'breakpoint': return BREAKPOINT_PRESETS;
    case 'typography': return TYPOGRAPHY_PRESETS;
    default:           return null;
  }
}

function normalizeOpacity(parsed: ParsedValue): number | null {
  // Opacity accepts: 0..1 (CSS), 0..100 (percent or integer), '0.5', '50%'.
  if (parsed.unit === '%') return parsed.amount;
  if (parsed.unit === 'none') {
    if (parsed.amount >= 0 && parsed.amount <= 1) return parsed.amount * 100;
    if (parsed.amount >= 0 && parsed.amount <= 100) return parsed.amount;
  }
  return null;
}

// ── Hash for custom values ───────────────────────────────────────────────
// FNV-1a 32-bit. Stable across runs; not for security. 6-char base36 suffix.

function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).padStart(7, '0').slice(0, 6);
}

// ── Resolver ─────────────────────────────────────────────────────────────

export function resolveSemanticName(
  value: string,
  unitType: UnitType,
  system?: SpacingSystem,
): ResolveResult {
  const parsed = parseValue(value);
  if (parsed === null) {
    return { semantic: `custom-${shortHash(`${unitType}:${value}`)}`, isPreset: false };
  }

  const presets = presetTableFor(unitType);
  if (presets === null) {
    return { semantic: `custom-${shortHash(`${unitType}:${value}`)}`, isPreset: false };
  }

  // Pick the value to match against the preset table.
  let needle: number | null;
  if (unitType === 'opacity') {
    needle = normalizeOpacity(parsed);
  } else if (unitType === 'motion') {
    needle = parsed.unit === 'ms' ? parsed.amount : null;
  } else {
    // px-domain types
    needle = parsed.unit === 'px' || parsed.unit === 'none' ? parsed.amount : null;
  }

  if (needle === null) {
    return { semantic: `custom-${shortHash(`${unitType}:${value}`)}`, isPreset: false };
  }

  for (const [rawValue, slug] of presets) {
    if (Math.abs(rawValue - needle) < 0.01) {
      // Respect the spacing system if it's been declared. Migration 018 mixes
      // 4-step and 8-step intervals; both pass under either system, so the
      // filter is effectively a sanity check rather than a hard constraint.
      if (system === '8px' && needle % 8 !== 0 && needle !== 0) {
        continue;
      }
      if (system === '4px' && needle % 4 !== 0 && needle !== 0) {
        continue;
      }
      return { semantic: slug, isPreset: true };
    }
  }

  return {
    semantic: `custom-${shortHash(`${unitType}:${parsed.amount}${parsed.unit}`)}`,
    isPreset: false,
  };
}

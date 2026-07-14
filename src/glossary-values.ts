// Shared types for the parlance glossary value registry.
// Authored alongside platform/supabase/migrations/016-018.

export type GlossaryValueKind = 'numeric' | 'semantic';

export type GlossaryValueStatus = 'draft' | 'active' | 'deprecated';

export type GlossaryValueOrigin = 'preset' | 'custom';

export type GlossaryValueFramework =
  | 'raw'
  | 'css'
  | 'tailwind'
  | 'figma'
  | 'react'
  | 'swiftui'
  | 'compose';

export const GLOSSARY_VALUE_FRAMEWORK_ORDER: readonly GlossaryValueFramework[] = [
  'raw',
  'css',
  'tailwind',
  'figma',
  'react',
  'swiftui',
  'compose',
];

export type GlossaryValueTypeSlug =
  | 'spacing'
  | 'sizing'
  | 'radius'
  | 'border'
  | 'opacity'
  | 'motion'
  | 'breakpoint'
  | 'colour'
  | 'typography'
  | 'shadow'
  | 'state'
  | 'role'
  | 'anatomy'
  | 'interaction'
  | 'accessibility-concept';

export interface GlossaryValueType {
  slug: GlossaryValueTypeSlug;
  label: string;
  description: string;
  kind: GlossaryValueKind;
  display_order: number;
  created_at: string;
}

export interface GlossaryValueAlias {
  id: string;
  value_id: string;
  alias: string;
  created_at: string;
}

export interface GlossaryValueTranslation {
  id: string;
  value_id: string;
  framework: GlossaryValueFramework;
  value: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlossaryValue {
  id: string;
  value_type: GlossaryValueTypeSlug;
  slug: string;
  name: string;
  description: string | null;
  raw_value: number | null;
  unit: string | null;
  status: GlossaryValueStatus;
  origin: GlossaryValueOrigin;
  version: number;
  previous_version_id: string | null;
  created_by: string | null;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlossaryValueListItem extends GlossaryValue {
  aliases: string[];
}

export interface GlossaryValueDetail extends GlossaryValueListItem {
  translations: GlossaryValueTranslation[];
}

export interface GlossaryValueTypeListResponse {
  data: GlossaryValueType[];
  meta: { total: number };
}

export interface GlossaryValueListResponse {
  data: GlossaryValueListItem[];
  meta: { total: number; type: GlossaryValueTypeSlug; status: GlossaryValueStatus };
}

export interface GlossaryValueDetailResponse {
  data: GlossaryValueDetail;
}

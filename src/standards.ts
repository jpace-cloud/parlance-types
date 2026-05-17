// Shared types for the parlance standards registry.
// Authored alongside platform/supabase/migrations/020-021.

export type StandardsSeverity = 'blocker' | 'warning' | 'info';

export type StandardsScope = 'visual' | 'behavioural' | 'code' | 'content';

export type StandardsStatus = 'draft' | 'active' | 'deprecated';

export type StandardsOrigin = 'preset' | 'custom';

// Inline literal in interfaces below to avoid colliding with platform/src/types
// which already exports its own WcagLevel. A future cleanup may consolidate.

export interface StandardsSpec {
  slug: string;
  name: string;
  description: string;
  authoritative_url: string;
  display_order: number;
  created_at: string;
}

export interface StandardsDefinition {
  id: string;
  spec_slug: string;
  slug: string;
  name: string;
  statement: string;
  spec_ref: string;
  severity: StandardsSeverity;
  scope: StandardsScope;
  wcag_level: 'A' | 'AA' | 'AAA' | null;
  validator_id: string | null;
  status: StandardsStatus;
  origin: StandardsOrigin;
  version: number;
  previous_version_id: string | null;
  account_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StandardsDefinitionAlias {
  id: string;
  definition_id: string;
  alias: string;
  created_at: string;
}

export interface StandardsDefinitionListItem extends StandardsDefinition {
  aliases: string[];
}

export type StandardsDefinitionDetail = StandardsDefinitionListItem;

export interface StandardsSpecListResponse {
  data: StandardsSpec[];
  meta: { total: number };
}

export interface StandardsDefinitionListResponse {
  data: StandardsDefinitionListItem[];
  meta: { total: number; spec: string; status: StandardsStatus };
}

export interface StandardsDefinitionDetailResponse {
  data: StandardsDefinitionDetail;
}

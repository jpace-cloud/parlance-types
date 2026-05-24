import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSemanticName } from './semantic-resolver';

test('spacing: 8px on the 8px system resolves to spacing-8', () => {
  const r = resolveSemanticName('8px', 'spacing', '8px');
  assert.deepEqual(r, { semantic: 'spacing-8', isPreset: true });
});

test('spacing: 1rem (16px) resolves to spacing-16', () => {
  const r = resolveSemanticName('1rem', 'spacing');
  assert.deepEqual(r, { semantic: 'spacing-16', isPreset: true });
});

test('spacing: 0 always resolves to spacing-0 regardless of system', () => {
  assert.deepEqual(resolveSemanticName('0', 'spacing', '4px'), { semantic: 'spacing-0', isPreset: true });
  assert.deepEqual(resolveSemanticName('0px', 'spacing', '8px'), { semantic: 'spacing-0', isPreset: true });
});

test('spacing: 7px between presets resolves to custom-<hash>', () => {
  const r = resolveSemanticName('7px', 'spacing', '8px');
  assert.equal(r.isPreset, false);
  assert.match(r.semantic, /^custom-[0-9a-z]{6}$/);
});

test('spacing: same value always produces the same custom hash', () => {
  const a = resolveSemanticName('7px', 'spacing');
  const b = resolveSemanticName('7px', 'spacing');
  assert.equal(a.semantic, b.semantic);
});

test('spacing: 8px under 4px system also resolves to spacing-8 (8 is a multiple of 4)', () => {
  const r = resolveSemanticName('8px', 'spacing', '4px');
  assert.deepEqual(r, { semantic: 'spacing-8', isPreset: true });
});

test('radius: pill (9999px) resolves to radius-9999', () => {
  const r = resolveSemanticName('9999px', 'radius');
  assert.deepEqual(r, { semantic: 'radius-9999', isPreset: true });
});

test('opacity: 50% resolves to opacity-50', () => {
  const r = resolveSemanticName('50%', 'opacity');
  assert.deepEqual(r, { semantic: 'opacity-50', isPreset: true });
});

test('opacity: 0.5 (CSS form) resolves to opacity-50', () => {
  const r = resolveSemanticName('0.5', 'opacity');
  assert.deepEqual(r, { semantic: 'opacity-50', isPreset: true });
});

test('opacity: 100 resolves to opacity-100', () => {
  const r = resolveSemanticName('100', 'opacity');
  assert.deepEqual(r, { semantic: 'opacity-100', isPreset: true });
});

test('opacity: 0 resolves to opacity-0', () => {
  const r = resolveSemanticName('0', 'opacity');
  assert.deepEqual(r, { semantic: 'opacity-0', isPreset: true });
});

test('motion: 300ms resolves to motion-300', () => {
  const r = resolveSemanticName('300ms', 'motion');
  assert.deepEqual(r, { semantic: 'motion-300', isPreset: true });
});

test('motion: 0.5s converts to 500ms and resolves to motion-500', () => {
  const r = resolveSemanticName('0.5s', 'motion');
  assert.deepEqual(r, { semantic: 'motion-500', isPreset: true });
});

test('typography: 16px resolves to text-base', () => {
  const r = resolveSemanticName('16px', 'typography');
  assert.deepEqual(r, { semantic: 'text-base', isPreset: true });
});

test('typography: 1rem also resolves to text-base', () => {
  const r = resolveSemanticName('1rem', 'typography');
  assert.deepEqual(r, { semantic: 'text-base', isPreset: true });
});

test('breakpoint: 768px resolves to breakpoint-md', () => {
  const r = resolveSemanticName('768px', 'breakpoint');
  assert.deepEqual(r, { semantic: 'breakpoint-md', isPreset: true });
});

test('border: 1px resolves to border-1', () => {
  const r = resolveSemanticName('1px', 'border');
  assert.deepEqual(r, { semantic: 'border-1', isPreset: true });
});

test('negative value parses but does not match a preset', () => {
  const r = resolveSemanticName('-4px', 'spacing');
  assert.equal(r.isPreset, false);
  assert.match(r.semantic, /^custom-[0-9a-z]{6}$/);
});

test('unparseable input returns a custom hash and isPreset false', () => {
  const r = resolveSemanticName('garbage', 'spacing');
  assert.equal(r.isPreset, false);
  assert.match(r.semantic, /^custom-[0-9a-z]{6}$/);
});

test('semantic unit types (role, state, ...) are not resolvable from a value string', () => {
  const r = resolveSemanticName('primary-action', 'role');
  assert.equal(r.isPreset, false);
  assert.match(r.semantic, /^custom-[0-9a-z]{6}$/);
});

test('opacity rejects values outside 0..100 / 0..1 range', () => {
  const r = resolveSemanticName('200', 'opacity');
  assert.equal(r.isPreset, false);
});

test('motion: bare number (no unit) does not match — motion needs ms or s', () => {
  const r = resolveSemanticName('300', 'motion');
  assert.equal(r.isPreset, false);
});

test('hash differs between unit types for the same input', () => {
  const a = resolveSemanticName('7px', 'spacing');
  const b = resolveSemanticName('7px', 'sizing');
  assert.notEqual(a.semantic, b.semantic);
});

test('whitespace is tolerated', () => {
  const r = resolveSemanticName('  16px  ', 'spacing');
  assert.deepEqual(r, { semantic: 'spacing-16', isPreset: true });
});

test('rem to px conversion is exact at common values', () => {
  assert.deepEqual(resolveSemanticName('0.5rem', 'spacing'), { semantic: 'spacing-8', isPreset: true });
  assert.deepEqual(resolveSemanticName('1.5rem', 'spacing'), { semantic: 'spacing-24', isPreset: true });
  assert.deepEqual(resolveSemanticName('2rem', 'spacing'), { semantic: 'spacing-32', isPreset: true });
});

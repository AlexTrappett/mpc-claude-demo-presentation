import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED = {
  '1': '#00f0ff', '2': '#ff00aa', '3': '#0080ff', '4': '#ffaa00',
  'Q': '#00f0ff', 'W': '#ffaa00', 'E': '#ff00aa', 'R': '#00f0ff',
  'A': '#ff00aa', 'S': '#00f0ff', 'D': '#ffaa00', 'F': '#0080ff',
  'Z': '#ff00aa', 'X': '#0080ff', 'C': '#ff00aa', 'V': '#ffaa00',
};

describe('per-pad neon color variables', () => {
  let css;

  beforeAll(() => {
    css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');
  });

  test('defines :root block', () => {
    expect(/:root\s*\{[\s\S]*?\}/.test(css)).toBe(true);
  });

  for (const [key, hex] of Object.entries(EXPECTED)) {
    test(`--color-${key} equals ${hex}`, () => {
      const re = new RegExp(`--color-${key}\\s*:\\s*${hex.replace('#', '#?')}\\s*;`, 'i');
      expect(re.test(css)).toBe(true);
    });
  }
});

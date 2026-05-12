import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('pressed-state styling', () => {
  let css;
  beforeAll(() => {
    css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');
  });

  test('.pad.pad-pressed fills with pad color', () => {
    const block = css.match(/\.pad\.pad-pressed\s*\{[^}]*\}/);
    expect(block).toBeTruthy();
    expect(block[0]).toMatch(/background\s*:\s*var\(--pad-color\)/);
    expect(block[0]).toMatch(/border-color\s*:\s*var\(--pad-color\)/);
  });

  test('.pad.pad-pressed has intense halo box-shadow', () => {
    const block = css.match(/\.pad\.pad-pressed\s*\{[^}]*\}/)[0];
    const shadow = block.match(/box-shadow\s*:[^;]+;/);
    expect(shadow).toBeTruthy();
    const padColorHits = (shadow[0].match(/var\(--pad-color\)/g) || []).length;
    expect(padColorHits).toBeGreaterThanOrEqual(2);
  });

  test('.pad.pad-pressed scales down slightly', () => {
    const block = css.match(/\.pad\.pad-pressed\s*\{[^}]*\}/)[0];
    expect(block).toMatch(/transform\s*:\s*scale\(0\.9[0-9]\)/);
  });

  test('base .pad transition includes a ~250ms fade for box-shadow/background', () => {
    const block = css.match(/\.pad\s*\{[^}]*\}/)[0];
    expect(block).toMatch(/transition[^;]*250ms/);
    expect(block).toMatch(/transition[^;]*(box-shadow|background)/);
  });
});

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('base CSS styling', () => {
  let css;
  beforeAll(() => {
    css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');
  });

  test('global reset for margin, padding, and box-sizing', () => {
    expect(/\*\s*\{[^}]*margin\s*:\s*0/.test(css)).toBe(true);
    expect(/\*\s*\{[^}]*padding\s*:\s*0/.test(css)).toBe(true);
    expect(/\*\s*\{[^}]*box-sizing\s*:\s*border-box/.test(css)).toBe(true);
  });

  test('body uses Orbitron and dark background', () => {
    const body = css.match(/body\s*\{[^}]*\}/);
    expect(body).toBeTruthy();
    expect(body[0]).toMatch(/font-family[^;]*Orbitron/i);
    expect(body[0]).toMatch(/background[^;]*#0a0a0f/i);
    expect(body[0]).toMatch(/min-height\s*:\s*100vh/);
  });

  test('chassis has dark background and rounded corners', () => {
    const chassis = css.match(/\.chassis\s*\{[^}]*\}/);
    expect(chassis).toBeTruthy();
    expect(chassis[0]).toMatch(/background/);
    expect(chassis[0]).toMatch(/border-radius/);
    expect(chassis[0]).toMatch(/padding/);
  });

  test('pad-grid is a 4-column CSS grid sized with vmin', () => {
    const grid = css.match(/\.pad-grid\s*\{[^}]*\}/);
    expect(grid).toBeTruthy();
    expect(grid[0]).toMatch(/display\s*:\s*grid/);
    expect(grid[0]).toMatch(/grid-template-columns\s*:\s*repeat\(4/);
    expect(grid[0]).toMatch(/vmin/);
  });

  test('.pad has resting border + dim glow box-shadow keyed to --pad-color', () => {
    const pad = css.match(/\.pad\s*\{[^}]*\}/);
    expect(pad).toBeTruthy();
    expect(pad[0]).toMatch(/border[^;]*var\(--pad-color/);
    expect(pad[0]).toMatch(/box-shadow[^;]*var\(--pad-color/);
    expect(pad[0]).toMatch(/border-radius/);
    expect(pad[0]).toMatch(/transition/);
  });

  test('each pad data-key sets --pad-color to its --color-KEY', () => {
    const keys = ['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V'];
    for (const key of keys) {
      const re = new RegExp(`\\.pad\\[data-key="${key}"\\]\\s*\\{[^}]*--pad-color\\s*:\\s*var\\(--color-${key}\\)`);
      expect(re.test(css)).toBe(true);
    }
  });
});

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('legend styling', () => {
  let css;
  beforeAll(() => {
    css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');
  });

  test('.legend block centers the legend content', () => {
    const block = css.match(/\.legend\s*\{[^}]*\}/);
    expect(block).toBeTruthy();
    expect(block[0]).toMatch(/text-align\s*:\s*center/);
  });

  test('.legend-hint is muted small text', () => {
    const block = css.match(/\.legend-hint\s*\{[^}]*\}/);
    expect(block).toBeTruthy();
    expect(block[0]).toMatch(/font-size/);
    expect(block[0]).toMatch(/color/);
  });

  test('.keymap is a 4-column grid', () => {
    const block = css.match(/\.keymap\s*\{[^}]*\}/);
    expect(block).toBeTruthy();
    expect(block[0]).toMatch(/display\s*:\s*grid/);
    expect(block[0]).toMatch(/grid-template-columns\s*:\s*repeat\(4/);
  });

  test('.keycap is styled like a small key with border-radius and shadow', () => {
    const block = css.match(/\.keycap\s*\{[^}]*\}/);
    expect(block).toBeTruthy();
    expect(block[0]).toMatch(/background/);
    expect(block[0]).toMatch(/border/);
    expect(block[0]).toMatch(/border-radius/);
    expect(block[0]).toMatch(/box-shadow/);
    expect(block[0]).toMatch(/text-align\s*:\s*center/);
  });
});

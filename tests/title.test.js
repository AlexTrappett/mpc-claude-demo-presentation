import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('title styling (cyan neon glow)', () => {
  let css;
  beforeAll(() => {
    css = readFileSync(resolve(__dirname, '../style.css'), 'utf8');
  });

  test('.title block exists', () => {
    expect(/\.title\s*\{[^}]*\}/.test(css)).toBe(true);
  });

  test('.title uses Orbitron, large vmin font, letter-spacing, centered', () => {
    const block = css.match(/\.title\s*\{[^}]*\}/)[0];
    expect(block).toMatch(/font-family[^;]*Orbitron/i);
    expect(block).toMatch(/font-size[^;]*vmin/);
    expect(block).toMatch(/letter-spacing/);
    expect(block).toMatch(/text-align\s*:\s*center/);
  });

  test('.title has layered cyan text-shadow glow', () => {
    const block = css.match(/\.title\s*\{[^}]*\}/)[0];
    expect(block).toMatch(/text-shadow/);
    const shadows = block.match(/text-shadow\s*:[^;]+;/)[0];
    const cyanHits = (shadows.match(/#00[bcdef0-9]{0,1}[bcdef0-9]?ff/gi) || []).length;
    expect(cyanHits).toBeGreaterThanOrEqual(3);
  });

  test('.title runs a flicker animation', () => {
    const block = css.match(/\.title\s*\{[^}]*\}/)[0];
    expect(block).toMatch(/animation[^;]*flicker/);
    expect(css).toMatch(/@keyframes\s+flicker\s*\{/);
  });
});

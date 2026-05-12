import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

globalThis.__SKIP_AUTO_INIT__ = true;
const mod = await import('../script.js');

function mountPage() {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  document.body.innerHTML = bodyMatch[1];
}

describe('keyboard handling', () => {
  let teardown;

  beforeEach(() => {
    mountPage();
    for (const k of Object.keys(mod.audioCache)) delete mod.audioCache[k];
    mod.preloadAudio();
    teardown = mod.initInput();
  });

  afterEach(() => {
    if (typeof teardown === 'function') teardown();
  });

  test('keydown on a mapped key adds pad-pressed to the matching pad', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    const pad = document.querySelector('[data-key="Q"]');
    expect(pad.classList.contains('pad-pressed')).toBe(true);
  });

  test('keyup on a mapped key removes pad-pressed', () => {
    const pad = document.querySelector('[data-key="A"]');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('OS key-repeat (event.repeat=true) is ignored', () => {
    const pad = document.querySelector('[data-key="1"]');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    pad.classList.remove('pad-pressed');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', repeat: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('unmapped key produces no error and no DOM change', () => {
    expect(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    }).not.toThrow();
    expect(document.querySelectorAll('.pad-pressed').length).toBe(0);
  });

  test('window blur clears any held pad-pressed state', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(document.querySelectorAll('.pad-pressed').length).toBe(2);
    window.dispatchEvent(new Event('blur'));
    expect(document.querySelectorAll('.pad-pressed').length).toBe(0);
  });

  test('mapped keydown triggers a sound play', () => {
    const cached = mod.audioCache['W'];
    const playSpy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(cached, 'cloneNode').mockImplementation(() => ({ play: playSpy }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    expect(playSpy).toHaveBeenCalled();
  });
});

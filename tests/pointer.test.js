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

describe('mouse and touch handling', () => {
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

  test('mousedown on a pad adds pad-pressed and plays its sound', () => {
    const pad = document.querySelector('[data-key="3"]');
    const playSpy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(mod.audioCache['3'], 'cloneNode').mockImplementation(() => ({ play: playSpy }));
    pad.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    expect(playSpy).toHaveBeenCalled();
  });

  test('mouseup removes pad-pressed', () => {
    const pad = document.querySelector('[data-key="F"]');
    pad.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    pad.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('mouseleave releases held state', () => {
    const pad = document.querySelector('[data-key="V"]');
    pad.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    pad.dispatchEvent(new MouseEvent('mouseleave'));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('touchstart adds pad-pressed and plays sound', () => {
    const pad = document.querySelector('[data-key="E"]');
    const playSpy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(mod.audioCache['E'], 'cloneNode').mockImplementation(() => ({ play: playSpy }));
    pad.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    expect(playSpy).toHaveBeenCalled();
  });

  test('touchend removes pad-pressed', () => {
    const pad = document.querySelector('[data-key="2"]');
    pad.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    pad.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });
});

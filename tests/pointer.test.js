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
  let createBufferSource;

  beforeEach(() => {
    mountPage();
    mod._resetAudioForTests();

    createBufferSource = vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn() }));
    vi.stubGlobal('AudioContext', vi.fn(() => ({
      decodeAudioData: vi.fn(),
      createBufferSource,
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      destination: {},
      state: 'running',
      currentTime: 0,
      resume: vi.fn().mockResolvedValue(undefined),
    })));

    for (const k of mod.PAD_KEYS) mod.audioBuffers[k] = { __seed: k, duration: 1 };
    teardown = mod.initInput();
  });

  afterEach(() => {
    if (typeof teardown === 'function') teardown();
    vi.unstubAllGlobals();
  });

  test('mousedown on a pad adds pad-pressed and plays its sound', () => {
    const pad = document.querySelector('[data-key="3"]');
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValueOnce(source);
    pad.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    expect(source.start).toHaveBeenCalled();
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
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValueOnce(source);
    pad.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    expect(source.start).toHaveBeenCalled();
  });

  test('touchend removes pad-pressed', () => {
    const pad = document.querySelector('[data-key="2"]');
    pad.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    pad.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });
});
